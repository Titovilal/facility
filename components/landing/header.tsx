"use client";
import { useUser } from "@stackframe/stack";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

function AuthButtonsSkeleton() {
  return (
    <div className="flex justify-end">
      <Skeleton className="h-8 w-16 md:h-9 md:w-22" />
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
          <Button
            size="sm"
            className="group md:size-default relative overflow-hidden transition-all duration-300 hover:shadow-md"
          >
            <span className="relative z-10 flex items-center gap-2">Panel</span>
            <span className="from-primary/80 to-primary absolute inset-0 bg-gradient-to-r opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </Button>
        </Link>
      ) : (
        <Link href={`/auth`}>
          <Button
            size="sm"
            className="from-primary/90 to-primary hover:from-primary hover:to-primary/90 md:size-default relative overflow-hidden bg-gradient-to-r transition-all duration-300 hover:shadow-md"
          >
            <span className="relative z-10 flex items-center gap-2 text-xs md:text-sm">
              Iniciar Sesión
            </span>
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
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between">
          {/* Logo */}
          <Link href={`/`} className="flex items-center space-x-2">
            <div className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-md font-bold md:text-lg">
              F
            </div>
            <span className="text-lg font-bold transition-colors duration-300 md:text-xl">
              Facility
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
