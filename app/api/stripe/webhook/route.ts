import {
  getProfileByCustomerId,
  getProfileByUserId,
  updateProfileByCustomerId,
  updateProfileByUserId,
} from "@/db/actions/profiles";
import { configFile } from "@/lib/config";
import { findCheckoutSession } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
  typescript: true,
});
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  console.log("[STRIPE/WEBHOOK] POST request received");

  const rawBody = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!webhookSecret || !stripe || !signature) {
    return new NextResponse(
      JSON.stringify({ error: "Webhook | Stripe | Signature not configure, check secrets." }),
      { status: 500 }
    );
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error(`⚠️  Webhook signature verification failed.`, err);
    return new NextResponse(
      JSON.stringify({ error: "Signature failed, maybe the webhook secret is incorrect." }),
      { status: 400 }
    );
  }

  console.log(`[STRIPE/WEBHOOK] Event received: ${event.type}`);
  const eventType = event.type;

  try {
    switch (eventType) {
      // ! Case: Checkout Session Completed - Handles successful payment checkouts
      case "checkout.session.completed":
        console.log("[STRIPE/WEBHOOK] Checkout session completed:", event.data.object);
        const stripeCSC: Stripe.Checkout.Session = event.data.object;
        const session = await findCheckoutSession(stripeCSC.id);

        // Get the userId from the client_reference_id
        const userId = stripeCSC.client_reference_id;
        if (!userId) {
          console.error("[STRIPE/WEBHOOK] No client_reference_id found in session");
          return new NextResponse(JSON.stringify({ error: "No client reference ID" }), {
            status: 400,
          });
        }

        const priceIdCSC = session?.line_items?.data[0]?.price
          ? session.line_items.data[0].price.id
          : null;

        const customerId = session?.customer;
        const pricingCSC = configFile.pricing.find((p) => p.priceId === priceIdCSC);

        if (!priceIdCSC || !pricingCSC) {
          console.error("[STRIPE/WEBHOOK] Unknown price ID:", priceIdCSC);
          return new NextResponse(JSON.stringify({ error: "Unknown price ID" }), {
            status: 400,
          });
        }

        const profileCSC = await getProfileByUserId(userId);

        if (!profileCSC) {
          console.error(`[STRIPE/WEBHOOK] No profile found for user ID: ${userId}`);
          return new NextResponse(JSON.stringify({ error: "User profile not found" }), {
            status: 404,
          });
        }

        switch (pricingCSC.mode) {
          case "payment":
            // ! Updating profile for one-time payment - adding OTP credits
            await updateProfileByUserId(userId, {
              customerId: customerId as string,
              priceId: priceIdCSC,
              lastOtpDate: new Date(),
              otpCredits: (profileCSC.otpCredits || 0) + (pricingCSC.otpCredits || 0),
            });
            break;
          case "subscription":
            // ! Updating profile for new subscription - setting up subscription details
            await updateProfileByUserId(userId, {
              customerId: customerId as string,
              priceId: priceIdCSC,
              hasSub: true,
              initialSubDate: new Date(),
              subCredits: pricingCSC.subCredits || 0,
            });
            break;
        }
        console.log("[STRIPE/WEBHOOK] User profile updated successfully");
        break;

      // ! Case: Customer Subscription Updated - Handles subscription changes
      case "customer.subscription.updated":
        console.log("[STRIPE/WEBHOOK] Subscription updated:", event.data.object);
        const stripeCSU: Stripe.Subscription = event.data.object;
        const subscriptionCSU = await stripe.subscriptions.retrieve(stripeCSU.id);

        const customerIdCSU = stripeCSU.customer as string;

        const profileCSU = await getProfileByCustomerId(customerIdCSU);

        if (!profileCSU) {
          console.error(`[STRIPE/WEBHOOK] No profile found with customer ID: ${customerIdCSU}`);
          return new NextResponse(JSON.stringify({ error: "Customer profile not found" }), {
            status: 404,
          });
        }

        // ! Updating profile with subscription cancellation status
        await updateProfileByCustomerId(customerIdCSU, {
          cancelNextMonth: subscriptionCSU.cancel_at_period_end,
        });
        console.log("[STRIPE/WEBHOOK] User profile updated successfully");
        break;

      // ! Case: Customer Subscription Deleted - Handles subscription terminations
      case "customer.subscription.deleted":
        console.log("[STRIPE/WEBHOOK] Subscription deleted:", event.data.object);
        const stripeCSUDeleted: Stripe.Subscription = event.data.object;

        const customerIdCSUDeleted = stripeCSUDeleted.customer as string;

        const profileCSUDeleted = await getProfileByCustomerId(customerIdCSUDeleted);

        if (!profileCSUDeleted) {
          console.error(
            `[STRIPE/WEBHOOK] No profile found with customer ID: ${customerIdCSUDeleted}`
          );
          return new NextResponse(JSON.stringify({ error: "Customer profile not found" }), {
            status: 404,
          });
        }

        // ! Updating profile to remove subscription details
        await updateProfileByCustomerId(customerIdCSUDeleted, {
          subCredits: 0,
          hasSub: false,
          cancelNextMonth: false,
        });
        console.log("[STRIPE/WEBHOOK] User profile updated successfully");
        break;

      // ! Case: Invoice Paid - Handles successful invoice payments
      case "invoice.paid":
        console.log("[STRIPE/WEBHOOK] Invoice paid:", event.data.object);
        const stripeIP: Stripe.Invoice = event.data.object;
        const priceIdIP = stripeIP.lines.data[0].pricing?.price_details?.price;
        const pricingIP = configFile.pricing.find((p) => p.priceId === priceIdIP);

        if (!pricingIP || !priceIdIP) {
          console.error("[STRIPE/WEBHOOK] Unknown price ID:", priceIdIP);
          return new NextResponse(JSON.stringify({ error: "Unknown price ID" }), {
            status: 400,
          });
        }

        const customerIdIP = stripeIP.customer as string;

        const profileIP = await getProfileByCustomerId(customerIdIP);

        if (!profileIP) {
          console.error(`[STRIPE/WEBHOOK] No profile found with customer ID: ${customerIdIP}`);
          return new NextResponse(JSON.stringify({ error: "Customer profile not found" }), {
            status: 404,
          });
        }

        switch (pricingIP.mode) {
          case "payment":
            // ! Updating profile for one-time payment invoice - adding OTP credits
            await updateProfileByCustomerId(customerIdIP, {
              priceId: priceIdIP,
              lastOtpDate: new Date(),
              otpCredits: (profileIP.otpCredits || 0) + (pricingIP.otpCredits || 0),
            });
            break;
          case "subscription":
            // ! Updating profile for subscription invoice - refreshing subscription details
            await updateProfileByCustomerId(customerIdIP, {
              priceId: priceIdIP,
              hasSub: true,
              initialSubDate: new Date(),
              subCredits: pricingIP.subCredits || 0,
            });
            break;
        }
        console.log("[STRIPE/WEBHOOK] User profile updated successfully");
        break;

      default:
        console.log("[STRIPE/WEBHOOK] Unhandled event type:", eventType);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`[STRIPE/WEBHOOK] Error processing event: ${eventType}`, error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new NextResponse(
      JSON.stringify({ error: "Error processing webhook", details: errorMessage }),
      { status: 500 }
    );
  }
}
