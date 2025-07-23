import { CodeBlock } from "@/components/docs/code-block";
import { ArrowRight, CreditCard, DollarSign, Zap } from "lucide-react";
import Link from "next/link";

export default function StripeDocsPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="space-y-12">
        <div className="text-center">
          <div className="mb-4 flex items-center justify-center gap-4">
            <CreditCard className="h-8 w-8 text-green-400" />
            <h1 className="text-4xl font-bold tracking-tight">Stripe Integration</h1>
          </div>
          <p className="text-muted-foreground text-xl">
            A complete payment system with subscriptions and one-time payments
          </p>
        </div>

        <section>
          <div className="space-y-12">
            {/* Introduction to Stripe Integration */}
            <div className="space-y-4">
              <h3 className="flex items-center text-2xl font-medium">
                <DollarSign className="mr-3 h-6 w-6 text-green-400" />
                Overview of Stripe Integration
              </h3>
              <p>
                This template includes a complete Stripe payment system that supports both one-time
                payments and recurring subscriptions. The integration consists of:
              </p>
              <ul className="list-disc space-y-1 pl-6">
                <li>
                  Core Stripe utility functions in <code>/lib/stripe.ts</code>
                </li>
                <li>API routes for checkout and customer portal sessions</li>
                <li>Webhook handler for processing Stripe events</li>
                <li>Ready-to-use React component for initiating checkout</li>
              </ul>
              <p>
                The implementation handles common payment scenarios like creating checkouts,
                managing subscriptions, and processing webhooks for automatic profile updates.
              </p>
            </div>

            {/* Core Stripe Functions */}
            <div className="space-y-4">
              <h3 className="flex items-center text-2xl font-medium">
                <div className="bg-primary/10 mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                  <span className="font-semibold">1</span>
                </div>
                Core Stripe Functions
              </h3>
              <div className="pl-11">
                <p className="mb-4">
                  The <code>/lib/stripe.ts</code> file contains three main utility functions for
                  interacting with Stripe:
                </p>
                <div className="bg-muted rounded-lg p-6">
                  <CodeBlock
                    title="/lib/stripe.ts"
                    language="typescript"
                    code={`import Stripe from "stripe";

// Create a checkout session for one-time payments or subscriptions
export const createCheckout = async ({
  user,
  mode,
  clientReferenceId,
  successUrl,
  cancelUrl,
  priceId,
  couponId,
  quantity = 1,
}: CreateCheckoutParams): Promise<string | null> => {
  // Implementation...
};

// Create a customer portal session for managing subscriptions
export const createCustomerPortal = async ({
  customerId,
  returnUrl,
}: CreateCustomerPortalParams): Promise<string> => {
  // Implementation...
};

// Retrieve checkout session details with expanded line items
export const findCheckoutSession = async (
  sessionId: string
): Promise<Stripe.Response<Stripe.Checkout.Session> | null> => {
  // Implementation...
};`}
                  />
                </div>

                <div className="mt-6">
                  <h4 className="mb-2 text-lg font-medium">createCheckout</h4>
                  <p>
                    This function creates a Stripe checkout session for either one-time payments or
                    subscriptions. It handles customer creation, email prefilling, and more.
                  </p>
                  <div className="bg-muted mt-2 rounded-lg p-6">
                    <CodeBlock
                      title="Parameters for createCheckout"
                      language="typescript"
                      code={`interface CreateCheckoutParams {
  priceId: string;           // Stripe price ID for the product
  mode: "payment" | "subscription";  // Checkout mode
  successUrl: string;        // URL to redirect after successful payment
  cancelUrl: string;         // URL to redirect if user cancels
  couponId?: string | null;  // Optional coupon ID
  clientReferenceId?: string; // Usually the user ID
  quantity?: number;         // Quantity of the product
  user?: {
    customerId?: string;     // Stripe customer ID if exists
    email?: string;          // User email for prefilling
  };
}`}
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="mb-2 text-lg font-medium">createCustomerPortal</h4>
                  <p>
                    This function creates a Stripe customer portal session, allowing users to manage
                    their subscriptions, update payment methods, and more.
                  </p>
                </div>

                <div className="mt-6">
                  <h4 className="mb-2 text-lg font-medium">findCheckoutSession</h4>
                  <p>
                    This function retrieves a checkout session with expanded line item details.
                    It&apos;s used primarily by the webhook handler to process completed checkouts.
                  </p>
                </div>
              </div>
            </div>

            {/* API Routes */}
            <div className="space-y-4">
              <h3 className="flex items-center text-2xl font-medium">
                <div className="bg-primary/10 mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                  <span className="font-semibold">2</span>
                </div>
                API Routes
              </h3>
              <div className="pl-11">
                <p className="mb-4">
                  The template includes three API routes for handling different Stripe operations:
                </p>

                <div className="mt-6">
                  <h4 className="mb-2 text-lg font-medium">Checkout API</h4>
                  <p className="mb-2">
                    Located at <code>/app/api/stripe/checkout/route.ts</code>, this endpoint creates
                    checkout sessions for users to make payments.
                  </p>
                  <div className="bg-muted rounded-lg p-6">
                    <CodeBlock
                      title="/app/api/stripe/checkout/route.ts"
                      language="typescript"
                      code={`export async function POST(request: NextRequest) {
  // Parse request body
  const body = await request.json();
  const { priceId, successUrl, cancelUrl, quantity } = body;
  
  // Get authenticated user
  const user = await stackServerApp.getUser();
  if (!user) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }
  
  // Get pricing info and validate parameters
  const pricing = configFile.pricing.find((p) => p.priceId === priceId);
  if (!pricing || !successUrl || !cancelUrl) {
    return new NextResponse(JSON.stringify({ error: "Invalid params" }), { status: 400 });
  }
  
  // Get user profile to check for existing subscription
  const profile = await getOrCreateProfile(user);
  if (profile.hasSub && pricing.mode === "subscription") {
    return new NextResponse(
      JSON.stringify({
        error: "Subscription already exists",
        message: "You already have an active subscription",
      }),
      { status: 409 }
    );
  }
  
  // Create checkout session
  const { data: stripeSessionUrl, error } = await tryCatch(/*...*/);
  
  // Return response
  return NextResponse.json({ stripeSessionUrl });
}`}
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="mb-2 text-lg font-medium">Customer Portal API</h4>
                  <p className="mb-2">
                    Located at <code>/app/api/stripe/portal/route.ts</code>, this endpoint creates
                    customer portal sessions for managing subscriptions.
                  </p>
                  <div className="bg-muted rounded-lg p-6">
                    <CodeBlock
                      title="/app/api/stripe/portal/route.ts"
                      language="typescript"
                      code={`export async function POST(request: NextRequest) {
  // Parse request body
  const body = await request.json();
  const { returnUrl } = body;
  
  // Get authenticated user
  const user = await stackServerApp.getUser();
  if (!user) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }
  
  // Get profile to access customerId
  const profile = await getOrCreateProfile(user);
  if (!profile.customerId) {
    return new NextResponse(JSON.stringify({ error: "Customer ID not found" }), {
      status: 400,
    });
  }
  
  // Create portal session
  const { data: stripePortalUrl, error } = await tryCatch(/*...*/);
  
  // Return response
  return NextResponse.json({ stripePortalUrl });
}`}
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="mb-2 text-lg font-medium">Webhook API</h4>
                  <p className="mb-2">
                    Located at <code>/app/api/stripe/webhook/route.ts</code>, this endpoint
                    processes Stripe webhook events to update user profiles automatically.
                  </p>
                  <p>
                    It handles various events like completed checkouts, subscription updates, and
                    invoice payments.
                  </p>
                </div>
              </div>
            </div>

            {/* ButtonCheckout Component */}
            <div className="space-y-4">
              <h3 className="flex items-center text-2xl font-medium">
                <div className="bg-primary/10 mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                  <span className="font-semibold">3</span>
                </div>
                ButtonCheckout Component
              </h3>
              <div className="pl-11">
                <p className="mb-4">
                  The <code>&lt;ButtonCheckout /&gt;</code> component makes it easy to add payment
                  buttons to your UI:
                </p>
                <div className="bg-muted rounded-lg p-6">
                  <CodeBlock
                    title="Using ButtonCheckout Component"
                    language="tsx"
                    code={`import ButtonCheckout from "@/components/general/button-checkout";

// One-time payment button
<ButtonCheckout 
  priceId="price_1NZJUMKr7lv5FX8QlQY685vZ" 
  mode="payment"
  variant="default"
  size="default"
>
  Buy Now
</ButtonCheckout>

// Subscription button
<ButtonCheckout 
  priceId="price_1NZJUMKr7lv5FX8QlQY685vZ" 
  mode="subscription"
  variant="default"
  size="lg"
>
  Subscribe Monthly
</ButtonCheckout>`}
                  />
                </div>
                <div className="mt-6">
                  <h4 className="mb-2 text-lg font-medium">Component Props:</h4>
                  <ul className="list-disc pl-5">
                    <li>
                      <code>priceId</code>: Stripe price ID for the product
                    </li>
                    <li>
                      <code>mode</code>: &apos;payment&apos; (one-time) or &apos;subscription&apos;
                      (recurring)
                    </li>
                    <li>
                      <code>variant</code>: Button styling variant
                    </li>
                    <li>
                      <code>size</code>: Button size
                    </li>
                    <li>
                      <code>quantity</code>: Quantity of the product (default: 1)
                    </li>
                    <li>
                      <code>children</code>: Button text/content
                    </li>
                    <li>
                      <code>className</code>: Additional CSS classes
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Webhook Handler */}
            <div className="space-y-4">
              <h3 className="flex items-center text-2xl font-medium">
                <div className="bg-primary/10 mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                  <span className="font-semibold">4</span>
                </div>
                Webhook Handler
              </h3>
              <div className="pl-11">
                <p className="mb-4">
                  The webhook handler processes various Stripe events and updates the user&apos;s
                  profile accordingly:
                </p>
                <div className="bg-muted rounded-lg p-6">
                  <CodeBlock
                    title="Webhook Event Handling"
                    language="typescript"
                    code={`// Event types handled by the webhook:
switch (eventType) {
  // Checkout Session Completed - Handles successful payment checkouts
  case "checkout.session.completed":
    // Updates profile with payment/subscription info
    // ...
    break;

  // Customer Subscription Updated - Handles subscription changes
  case "customer.subscription.updated":
    // Updates cancellation status
    // ...
    break;

  // Customer Subscription Deleted - Handles subscription terminations
  case "customer.subscription.deleted":
    // Removes subscription details
    // ...
    break;

  // Invoice Paid - Handles successful invoice payments
  case "invoice.paid":
    // Updates profile with payment details
    // ...
    break;
}`}
                  />
                </div>
                <div className="mt-6">
                  <h4 className="mb-2 text-lg font-medium">Profile Updates:</h4>
                  <ul className="list-disc pl-5">
                    <li>
                      For one-time payments: Updates <code>otpCredits</code>
                    </li>
                    <li>
                      For subscriptions: Sets <code>hasSub</code>, <code>subCredits</code>, etc.
                    </li>
                    <li>
                      For subscription updates: Handles <code>cancelNextMonth</code>
                    </li>
                    <li>For subscription deletion: Resets subscription fields</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Configuration */}
            <div className="space-y-4">
              <h3 className="flex items-center text-2xl font-medium">
                <div className="bg-primary/10 mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                  <span className="font-semibold">5</span>
                </div>
                Stripe Configuration
              </h3>
              <div className="pl-11">
                <p className="mb-4">To use Stripe in your project, you need to:</p>
                <ol className="list-decimal space-y-2 pl-5">
                  <li>Sign up for a Stripe account</li>
                  <li>Add your Stripe API keys to the environment variables</li>
                  <li>Configure product pricing in the config file</li>
                  <li>Set up webhooks in the Stripe dashboard</li>
                </ol>
                <div className="bg-muted mt-4 rounded-lg p-6">
                  <CodeBlock
                    title="Environment Variables"
                    language="bash"
                    code={`# .env.local
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...`}
                  />
                </div>
                <div className="bg-muted mt-4 rounded-lg p-6">
                  <CodeBlock
                    title="Pricing Configuration"
                    language="typescript"
                    code={`// lib/config.ts
export const configFile = {
  // ...other config
  pricing: [
    {
      name: "Basic Plan",
      description: "One-time purchase",
      price: 9.99,
      priceId: "price_1NZJUMKr7lv5FX8QlQY685vZ",
      mode: "payment",
      otpCredits: 100,
    },
    {
      name: "Pro Plan",
      description: "Monthly subscription",
      price: 19.99,
      priceId: "price_1NZJUMKr7lv5FX8QlQY686vZ",
      mode: "subscription",
      subCredits: 1000,
    },
  ],
};`}
                  />
                </div>
              </div>
            </div>

            {/* Best Practices */}
            <div className="space-y-4">
              <h3 className="flex items-center text-2xl font-medium">
                <Zap className="mr-3 h-6 w-6 text-green-400" />
                Best Practices
              </h3>
              <div className="bg-primary/10 border-primary/20 rounded-md border p-4">
                <p className="font-medium">Follow these best practices when working with Stripe:</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>
                    Always use webhooks to confirm payments - client-side confirmations can be
                    unreliable
                  </li>
                  <li>Test with Stripe&apos;s test mode before going to production</li>
                  <li>Handle failed payments and payment retries gracefully</li>
                  <li>Store Stripe customer IDs in your database for recurring customers</li>
                  <li>
                    Use the customer portal for subscription management rather than building custom
                    UI
                  </li>
                  <li>Keep your webhook handler endpoint secure</li>
                  <li>Log all Stripe events for debugging purposes</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <div className="text-center">
          <Link
            href="/docs"
            className="inline-flex items-center justify-center text-sm font-medium text-green-400 hover:underline"
          >
            Back to Documentation
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
