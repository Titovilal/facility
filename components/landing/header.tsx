"use client";
import { useUser } from "@stackframe/stack";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

function AuthButtonsSkeleton() {
  return (
    <div className="flex justify-end">
      <Skeleton className="h-9 w-22" />
    </div>
  );
}

function AuthButtons() {
  const router = useRouter();
  const user = useUser();

  // Check onboarding status and redirect if necessary
  useEffect(() => {
    if (user && !user.clientMetadata?.onboarded) {
      router.push("/dashboard");
    }
  }, [user, router]);

  return (
    <div className="flex justify-end">
      {user ? (
        <Link href={`/dashboard`}>
          <Button className="group relative overflow-hidden transition-all duration-300 hover:shadow-md">
            <span className="relative z-10 flex items-center gap-2">Dashboard</span>
            <span className="from-primary/80 to-primary absolute inset-0 bg-gradient-to-r opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </Button>
        </Link>
      ) : (
        <Link href={`/auth`}>
          <Button className="from-primary/90 to-primary hover:from-primary hover:to-primary/90 relative overflow-hidden bg-gradient-to-r transition-all duration-300 hover:shadow-md">
            <span className="relative z-10 flex items-center gap-2">Sign In</span>
          </Button>
        </Link>
      )}
    </div>
  );
}

export default function Header() {
  return (
    <>
      <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 w-full border-b px-4 shadow-sm backdrop-blur transition-all duration-300">
        <div className="container mx-auto flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href={`/`} className="flex items-center space-x-3">
            <div className="relative h-8 w-8 overflow-hidden sm:h-10 sm:w-10">
              <Image
                src="/terturions-icon.png"
                alt="Krevo Logo"
                width={42}
                height={42}
                className="rounded-lg object-contain"
              />
            </div>
            <span className="text-xl font-bold transition-colors duration-300 sm:text-2xl">
              Terturions Template
            </span>
          </Link>

          {/* Auth buttons with Suspense */}
          <div>
            <Suspense fallback={<AuthButtonsSkeleton />}>
              <AuthButtons />
            </Suspense>
          </div>
        </div>
      </header>
    </>
  );
}
