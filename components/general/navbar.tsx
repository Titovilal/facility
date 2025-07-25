"use client";

import { ConfigurationDrawer } from "@/components/general/configuration-drawer";
import { UserButton } from "@/components/general/user-button";
import { VacationDrawer } from "@/components/general/vacation-drawer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StackUser } from "@/db/db";
import type { Profile } from "@/db/schemas/profiles";
import { HandHelping } from "lucide-react";

interface NavbarProps {
  profile: Profile | null;
  user: StackUser;
}

// Skeleton component for UserButton
function UserButtonSkeleton() {
  return (
    <div className="flex animate-pulse items-center gap-2">
      <Avatar className="bg-muted h-9 w-9">
        <AvatarFallback className="bg-secondary"></AvatarFallback>
      </Avatar>
    </div>
  );
}

export function Navbar({ profile, user }: NavbarProps) {
  return (
    <header className="border-b">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-md text-sm font-bold md:h-8 md:w-8">
            <HandHelping className="h-4 w-4" />
          </div>
          <h1 className="text-lg font-semibold md:text-xl">Facility</h1>
        </div>
        <div className="flex items-center gap-2">
          <VacationDrawer />
          <ConfigurationDrawer />
          {profile ? <UserButton profile={profile} user={user} /> : <UserButtonSkeleton />}
        </div>
      </div>
    </header>
  );
}
