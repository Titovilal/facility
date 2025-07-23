"use client";

import { ThemeToggle } from "@/components/general/theme-toggle";
import { UserButton } from "@/components/general/user-button";
import { getOrCreateProfile } from "@/db/actions/profiles";
import type { Profile } from "@/db/schemas/profiles";
import { configFile } from "@/lib/config";
import { useUser } from "@stackframe/stack";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function DashboardPage() {
  const user = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      try {
        const userProfile = await getOrCreateProfile(user, {});
        setProfile(userProfile);
      } catch (error) {
        toast.error("Failed to load profile");
        console.error("Error loading profile:", error);
      }
    };

    loadProfile();
  }, [user]);

  // ! The user has not authenticated yet, redirecting to auth page from config
  useEffect(() => {
    if (!user) {
      router.push(configFile.authPage);
    }
  }, [user, router]);
  if (!user) return null;

  return (
    <div className="container mx-auto space-y-6 py-8">
      <div className="flex items-center justify-end gap-2">
        <ThemeToggle />
        {profile && <UserButton profile={profile} user={user} />}
      </div>
    </div>
  );
}
