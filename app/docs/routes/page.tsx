import { CodeBlock } from "@/components/docs/code-block";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function ProtectedRoutesPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="space-y-12">
        <div className="text-center">
          <div className="mb-4 flex items-center justify-center gap-4">
            <ShieldAlert className="h-8 w-8 text-yellow-400" />
            <h1 className="text-4xl font-bold tracking-tight">Protected Routes</h1>
          </div>
          <p className="text-muted-foreground text-xl">
            Implementing authentication protection in your Terturions project
          </p>
        </div>

        <section>
          <div className="space-y-6">
            <p>
              Protected routes ensure that certain parts of your application are only accessible to
              authenticated users. There are several approaches to implement protected routes in
              Next.js, each with its own advantages and use cases.
            </p>

            <div className="bg-primary/10 border-primary/20 mb-8 rounded-md border p-4">
              <p className="flex items-center font-medium text-yellow-400">
                <ShieldAlert className="mr-2 h-5 w-5" />
                Important Note about Next.js 15 Middleware:
              </p>
              <p className="mt-2">
                As of Next.js 15,{" "}
                <strong>asynchronous functions are no longer supported in middleware</strong>. This
                is a significant limitation that affects how we implement authentication protection.
                While middleware-based protection was previously recommended, we now need to rely
                more on client-side and server-side protection methods.
              </p>
            </div>

            <h2 className="mb-4 text-2xl font-semibold">Recommended Protection Approaches</h2>

            <div className="space-y-8">
              {/* Client-Side Protection */}
              <div className="space-y-4">
                <h3 className="flex items-center text-xl font-medium">
                  <div className="bg-primary/10 mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                    <span className="font-semibold">1</span>
                  </div>
                  Client-Side Protection
                </h3>
                <div className="pl-11">
                  <p className="mb-4">
                    This approach uses React hooks to check authentication status and redirect
                    unauthenticated users. It&apos;s simple to implement and works well for most use
                    cases.
                  </p>
                  <div className="bg-muted rounded-lg p-6">
                    <CodeBlock
                      title="Example from dashboard/page.tsx:"
                      language="typescript"
                      code={`"use client";

import { useUser } from "@stackframe/stack";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { configFile } from "@/lib/config";

export default function DashboardPage() {
  const user = useUser();
  const router = useRouter();

  // Redirect unauthenticated users to the auth page
  useEffect(() => {
    if (!user) {
      router.push(configFile.authPage);
    }
  }, [user, router]);
  
  // Prevent rendering of protected content
  if (!user) return null;

  return (
    <div className="container mx-auto space-y-6 py-8">
      {/* Protected content that only authenticated users can see */}
      <h1>Welcome, {user.email}</h1>
      {/* Rest of dashboard content */}
    </div>
  );
}`}
                    />
                  </div>
                  <div className="mt-4 space-y-2">
                    <p className="font-medium">Advantages:</p>
                    <ul className="list-disc pl-5">
                      <li>Simple to implement</li>
                      <li>Works with Next.js 15</li>
                      <li>Can handle complex authentication logic</li>
                    </ul>
                    <p className="mt-4 font-medium">Disadvantages:</p>
                    <ul className="list-disc pl-5">
                      <li>Content might briefly flash before redirect occurs</li>
                      <li>Requires JavaScript to be enabled</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Layout-Level Protection */}
              <div className="space-y-4">
                <h3 className="flex items-center text-xl font-medium">
                  <div className="bg-primary/10 mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                    <span className="font-semibold">2</span>
                  </div>
                  Layout-Level Protection
                </h3>
                <div className="pl-11">
                  <p className="mb-4">
                    Protect entire sections of your application by adding authentication checks to a
                    layout component. This is useful when you have multiple protected pages that
                    share the same layout.
                  </p>
                  <div className="bg-muted rounded-lg p-6">
                    <CodeBlock
                      title="Example layout.tsx for protected section:"
                      language="typescript"
                      code={`"use client";

import { useUser } from "@stackframe/stack";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { configFile } from "@/lib/config";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push(configFile.authPage);
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <>
      {/* Navigation, sidebar, or other layout elements */}
      <main>{children}</main>
    </>
  );
}`}
                    />
                  </div>
                  <div className="mt-4 space-y-2">
                    <p className="font-medium">Advantages:</p>
                    <ul className="list-disc pl-5">
                      <li>Protects multiple pages with a single implementation</li>
                      <li>Consistent user experience across protected pages</li>
                      <li>Works with Next.js 15</li>
                    </ul>
                    <p className="mt-4 font-medium">When to use:</p>
                    <ul className="list-disc pl-5">
                      <li>When you have entire sections of your app that require authentication</li>
                      <li>When protected pages share common layout elements</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Middleware Limitations */}
              <div className="space-y-4">
                <h3 className="flex items-center text-xl font-medium">
                  <div className="bg-primary/10 mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                    <span className="font-semibold">3</span>
                  </div>
                  Middleware Limitations in Next.js 15
                </h3>
                <div className="pl-11">
                  <p className="mb-4">
                    Previously, middleware was a powerful way to implement route protection.
                    However, Next.js 15 introduced a significant limitation: asynchronous functions
                    are no longer supported in middleware.
                  </p>
                  <div className="bg-muted rounded-lg p-6">
                    <CodeBlock
                      title="This middleware approach no longer works in Next.js 15:"
                      language="ts"
                      code={`// This will NOT work in Next.js 15
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from '@stackframe/stack/edge';

// ❌ Error: Async functions are no longer supported in middleware
export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }
  
  return NextResponse.next();
}`}
                    />
                  </div>
                  <div className="mt-4">
                    <p className="font-medium">Why is this a limitation?</p>
                    <p className="mt-2">
                      Authentication often requires asynchronous operations like token verification.
                      Without async support in middleware, we can&apos;t reliably check
                      authentication status before rendering protected pages using this approach.
                    </p>

                    <p className="mt-4 font-medium">Alternative approaches:</p>
                    <ul className="mt-2 list-disc pl-5">
                      <li>Use client-side protection with useEffect and redirects</li>
                      <li>Implement layout-based protection for sections of your app</li>
                      <li>
                        For simple cases, you can still use middleware for non-async checks (like
                        path-based logic)
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Server Components Protection */}
              <div className="space-y-4">
                <h3 className="flex items-center text-xl font-medium">
                  <div className="bg-primary/10 mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                    <span className="font-semibold">4</span>
                  </div>
                  Server Components Protection
                </h3>
                <div className="pl-11">
                  <p className="mb-4">
                    For server components, you can implement protection using server-side
                    authentication checks and redirects.
                  </p>
                  <div className="bg-muted rounded-lg p-6">
                    <CodeBlock
                      title="Example server component protection:"
                      language="tsx"
                      code={`// Server component with authentication check
import { redirect } from 'next/navigation';
import { getServerSession } from '@stackframe/stack/server';
import { configFile } from '@/lib/config';

export default async function ProtectedServerComponent() {
  const session = await getServerSession();
  
  if (!session?.user) {
    // Redirect to auth page if no user is found
    redirect(configFile.authPage);
  }
  
  return (
    <div>
      <h1>Protected Server Component</h1>
      <p>Welcome, {session.user.email}</p>
      {/* Protected content here */}
    </div>
  );
}`}
                    />
                  </div>
                  <div className="mt-4 space-y-2">
                    <p className="font-medium">Advantages:</p>
                    <ul className="list-disc pl-5">
                      <li>No content flashing - protection happens before rendering</li>
                      <li>Works with or without JavaScript</li>
                      <li>Fully supported in Next.js 15</li>
                    </ul>
                    <p className="mt-4 font-medium">When to use:</p>
                    <ul className="list-disc pl-5">
                      <li>For pages that don&apos;t require client-side interactivity</li>
                      <li>When SEO is important for your protected content</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-primary/10 border-primary/20 mt-8 rounded-md border p-4">
              <p className="font-medium">Best Practices:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Use a combination of approaches based on your specific needs</li>
                <li>
                  Always have a fallback (return null) while checking authentication to prevent
                  flashing of protected content
                </li>
                <li>
                  Store auth-related configuration (like redirect paths) in a central config file
                </li>
                <li>
                  For client-side protection, consider using Suspense for better loading states
                </li>
                <li>Test your protection with both authenticated and unauthenticated states</li>
              </ul>
            </div>
          </div>
        </section>

        <div className="text-center">
          <Link
            href="/docs"
            className="inline-flex items-center justify-center text-sm font-medium text-blue-400 hover:underline"
          >
            Back to Documentation
          </Link>
        </div>
      </div>
    </div>
  );
}
