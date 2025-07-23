import { getOrCreateProfile } from "@/db/actions/profiles";
import { configFile } from "@/lib/config";
import { createCheckout } from "@/lib/stripe";
import { tryCatch } from "@/lib/utils";
import { stackServerApp } from "@/stack";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  console.log("[STRIPE/CHECKOUT] POST request received");
  const body = await request.json();
  const { priceId, successUrl, cancelUrl, quantity } = body;
  const user = await stackServerApp.getUser();

  if (!user) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const pricing = configFile.pricing.find((p) => p.priceId === priceId);

  if (!pricing || !successUrl || !cancelUrl) {
    return new NextResponse(JSON.stringify({ error: "Invalid params" }), { status: 400 });
  }

  // Get or create profile to access customerId
  const profile = await getOrCreateProfile(user);

  // Check if user already has an active subscription
  if (profile.hasSub && pricing.mode === "subscription") {
    return new NextResponse(
      JSON.stringify({
        error: "Subscription already exists",
        message: "You already have an active subscription",
      }),
      { status: 409 }
    );
  }

  const { data: stripeSessionUrl, error } = await tryCatch(
    createCheckout({
      priceId,
      successUrl,
      cancelUrl,
      mode: pricing.mode as "payment" | "subscription",
      quantity,
      clientReferenceId: user.id,
      user: {
        email: user.primaryEmail || undefined,
        customerId: profile.customerId || undefined,
      },
    })
  );

  if (error) {
    console.error("[STRIPE/CHECKOUT] Error creating checkout session:", error);
    return new NextResponse(
      JSON.stringify({
        error: "Failed to create checkout session",
        message: error.message || "An error occurred",
      }),
      { status: 500 }
    );
  }

  console.log("[STRIPE/CHECKOUT] Checkout session created successfully:", stripeSessionUrl);
  return NextResponse.json({ stripeSessionUrl });
}
