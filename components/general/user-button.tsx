"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { StackUser } from "@/db/db";
import { Profile } from "@/db/schemas/profiles";
import { formatDate } from "@/lib/utils";
import { CreditCard, LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

interface UserButtonProps {
  user: StackUser;
  profile: Profile;
}

export const UserButton = ({ user, profile }: UserButtonProps) => {
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const name = user?.displayName || "";
  const avatarUrl = user?.profileImageUrl || "";
  const email = user?.primaryEmail || "";
  // Get first letter of display name for fallback
  const initials = name.charAt(0).toUpperCase();

  // Function to open Stripe billing portal
  const openBillingPortal = async () => {
    try {
      setIsLoadingPortal(true);
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          returnUrl: window.location.origin + "/tools",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to open billing portal");
      }

      const { stripePortalUrl } = await response.json();
      window.location.href = stripePortalUrl;
    } catch (error) {
      console.error("Error opening billing portal:", error);
      toast.error("Could not open billing portal", {
        description: "Please try again later.",
      });
    } finally {
      setIsLoadingPortal(false);
    }
  };

  return (
    <>
      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Profile Details</DialogTitle>
          </DialogHeader>

          {profile && (
            <div className="space-y-6">
              {/* User info section */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={avatarUrl} alt={name} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-medium">{profile.name}</h3>
                  <p className="text-muted-foreground text-sm">{profile.mail}</p>
                </div>
              </div>

              <Separator />

              {/* Subscription section */}
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="text-md flex items-center font-medium">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Subscription
                  </h4>
                  {profile.hasSub ? (
                    <Badge
                      variant="outline"
                      className="border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400"
                    >
                      Active
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                    >
                      Inactive
                    </Badge>
                  )}
                </div>

                <div className="grid gap-3">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-muted-foreground text-sm">Credits Available</span>
                    <span className="font-medium">{profile.subCredits}</span>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-muted-foreground text-sm">Initial Date</span>
                    <span>
                      {profile.initialSubDate
                        ? formatDate(profile.initialSubDate)
                        : "Not subscribed"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-muted-foreground text-sm">Auto-Renewal</span>
                    <span>{profile.cancelNextMonth ? "Disabled" : "Enabled"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage src={avatarUrl} alt={name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-2">
              <p className="leading-none font-medium">{name}</p>
              <p className="text-sm leading-none text-gray-500">{email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {profile && (
              <DropdownMenuItem onClick={() => setProfileDialogOpen(true)}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile Info</span>
              </DropdownMenuItem>
            )}
            <Link href="/handler/account-settings">
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
            </Link>
            {profile?.customerId && (
              <DropdownMenuItem onClick={openBillingPortal} disabled={isLoadingPortal}>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>{isLoadingPortal ? "Loading..." : "Billing Portal"}</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              user?.signOut();
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
