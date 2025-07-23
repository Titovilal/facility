import { getOrCreateProfile } from "@/db/actions/profiles";
import { createCustomerPortal } from "@/lib/stripe";
import { tryCatch } from "@/lib/utils";
import { stackServerApp } from "@/stack";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  console.log("[STRIPE/PORTAL] POST request received");
  const body = await request.json();
  const { returnUrl } = body;
  const user = await stackServerApp.getUser();

  if (!user) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  // Get the profile to access customerId
  const profile = await getOrCreateProfile(user);

  if (!profile.customerId) {
    return new NextResponse(JSON.stringify({ error: "Customer ID not found" }), {
      status: 400,
    });
  }

  const { data: stripePortalUrl, error } = await tryCatch(
    createCustomerPortal({
      customerId: profile.customerId,
      returnUrl: returnUrl,
    })
  );

  if (error) {
    console.error("[STRIPE/PORTAL] Error creating portal session:", error);
    return new NextResponse(
      JSON.stringify({
        error: "Failed to create checkout session",
        message: error.message || "An error occurred",
      }),
      { status: 500 }
    );
  }

  console.log("[STRIPE/PORTAL] Portal session created successfully:", stripePortalUrl);
  return NextResponse.json({ stripePortalUrl });
}
