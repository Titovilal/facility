"use client";

import { Button } from "@/components/ui/button";
import { cn, fetchApi } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

// This component is used to create Stripe Checkout Sessions
// It calls the /api/stripe/create-checkout route with the priceId, successUrl and cancelUrl
// Users must be authenticated. It will prefill the Checkout data with their email and/or credit card (if any)
// You can also change the mode to "subscription" if you want to create a subscription instead of a one-time payment
const ButtonCheckout = ({
  priceId,
  mode = "payment",
  variant = "default",
  size = "default",
  quantity = 1,
  children,
  className,
}: {
  priceId: string;
  mode?: "payment" | "subscription";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  quantity?: number;
  children?: React.ReactNode;
  className?: string;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handlePayment = async () => {
    setIsLoading(true);

    try {
      const { data, error } = await fetchApi<{ stripeSessionUrl: string }>("/api/stripe/checkout", {
        method: "POST",
        body: JSON.stringify({
          priceId,
          successUrl: window.location.href,
          cancelUrl: window.location.href,
          mode,
          quantity,
        }),
      });

      if (error) {
        console.error("Checkout error:", error.message);

        // Show different toast messages based on error status
        if (error.status === 401) {
          toast.error("You need to be logged in to make a purchase", {
            description: "Please sign in or create an account to continue.",
            action: {
              label: "Sign in",
              onClick: () => (window.location.href = "/auth"),
            },
          });
        } else if (error.status === 400) {
          toast.error("Invalid request", {
            description: "There was an issue with your purchase request. Please try again.",
          });
        } else if (error.status === 409) {
          toast.info("You already have an active subscription", {
            description: "You can manage your subscription in your billing portal.",
          });
        } else {
          toast.error("Payment process failed", {
            description: error.message || "Something went wrong. Please try again later.",
          });
        }
        return;
      }

      if (data?.stripeSessionUrl) {
        window.location.href = data.stripeSessionUrl;
      } else {
        toast.error("Couldn't create checkout session", {
          description: "No checkout URL was returned. Please try again.",
        });
      }
    } catch (e) {
      console.error(e);
      toast.error("Payment process failed", {
        description: "An unexpected error occurred. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => handlePayment()}
      disabled={isLoading}
      className={cn("w-full", className)}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{children || `Get Started`}</>}
    </Button>
  );
};

export default ButtonCheckout;
