"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StackUser } from "@/db/db";
import { Profile } from "@/db/schemas/profiles";
import { formatDate } from "@/lib/utils";
import { CreditCard, LogOut, Moon, Settings, Sun, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { useConfigStore } from "./use-config-store";
import { useTimeEntriesStore } from "../dashboard/use-time-entries-store";
import { useUser } from "@stackframe/stack";

interface UserButtonProps {
  user: StackUser;
  profile: Profile;
}

export const UserButton = ({ user, profile }: UserButtonProps) => {
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const [isLoadingReset, setIsLoadingReset] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  const stackUser = useUser();
  const initializeFromDatabase = useConfigStore((state) => state.initializeFromDatabase);
  
  const name = user?.displayName || "";
  const avatarUrl = user?.profileImageUrl || "";
  const email = user?.primaryEmail || "";
  // Get first letter of display name for fallback
  const initials = name.charAt(0).toUpperCase();

  // Ensure component is mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Set initial theme to system on component mount
  useEffect(() => {
    if (mounted && !theme) {
      setTheme("system");
    }
  }, [mounted, theme, setTheme]);

  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

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

  // Function to clear stores and reload from database
  const clearStoresAndReload = async () => {
    if (!stackUser) {
      toast.error("User not authenticated");
      return;
    }

    try {
      setIsLoadingReset(true);
      
      // Clear both stores from localStorage
      localStorage.removeItem("facility-config-storage");
      localStorage.removeItem("facility-time-entries-storage");
      
      // Reset store states using the store's setState method
      useTimeEntriesStore.setState({ 
        monthlyData: {}, 
        loadedDates: new Set(),
        selectedDate: new Date()
      });
      
      // Reload configuration from database
      await initializeFromDatabase(stackUser);
      
      toast.success("Data refreshed from database", {
        description: "All local data has been cleared and reloaded.",
      });
    } catch (error) {
      console.error("Error clearing stores and reloading:", error);
      toast.error("Failed to refresh data", {
        description: "Please try again later.",
      });
    } finally {
      setIsLoadingReset(false);
    }
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DrawerTrigger>

      <DrawerContent className="fixed right-0 bottom-0 left-0 max-h-[60dvh]">
        <DrawerTitle className="sr-only">User Menu</DrawerTitle>
        <ScrollArea className="overflow-auto p-4">
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-lg font-semibold">Account</h2>
            </div>

            {/* User Header */}
            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
              <Avatar className="h-12 w-12">
                <AvatarImage src={avatarUrl} alt={name} />
                <AvatarFallback className="font-medium">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{name}</p>
                <p className="text-muted-foreground text-sm truncate">{email}</p>
              </div>
            </div>

            {/* Subscription Card */}
            {profile && (
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${profile.hasSub ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span className="text-sm font-medium">Subscription</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    profile.hasSub 
                      ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
                      : 'bg-gray-500/10 text-gray-600 dark:text-gray-400'
                  }`}>
                    {profile.hasSub ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Credits</span>
                    <span className="font-medium">{profile.subCredits}</span>
                  </div>
                  {profile.initialSubDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Since</span>
                      <span className="font-medium">{formatDate(profile.initialSubDate)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Theme Toggle */}
            <div 
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={toggleTheme}
            >
              <div className="flex items-center gap-3">
                {mounted && (
                  <div className="relative w-4 h-4">
                    <Sun className="absolute w-4 h-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                    <Moon className="absolute w-4 h-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                  </div>
                )}
                <span>Theme</span>
              </div>
              <span className="text-sm text-muted-foreground capitalize">
                {mounted ? theme : "system"}
              </span>
            </div>

            {/* Menu Items */}
            <div className="space-y-2">
              <Link href="/handler/account-settings">
                <Button variant="ghost" className="w-full justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Button>
              </Link>
              
              {profile?.customerId && (
                <Button 
                  variant="ghost" 
                  className="w-full justify-start" 
                  onClick={openBillingPortal} 
                  disabled={isLoadingPortal}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>{isLoadingPortal ? "Loading..." : "Billing Portal"}</span>
                </Button>
              )}

              <Button 
                variant="ghost" 
                className="w-full justify-start" 
                onClick={clearStoresAndReload} 
                disabled={isLoadingReset}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoadingReset ? "animate-spin" : ""}`} />
                <span>{isLoadingReset ? "Refreshing..." : "Refresh Data"}</span>
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-2">
              <DrawerClose asChild>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => user?.signOut()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </Button>
              </DrawerClose>
            </div>
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
};
