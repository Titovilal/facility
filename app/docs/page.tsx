"use client";
import { ArrowUp, Check, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// Import the JSON data (you'll need to adjust the path based on your file structure)
import { CodeBlock } from "@/components/docs/code-block";

export default function DocsPage() {
  const features = [
    "Next.js 15 with App Router",
    "Authentication via Stack Auth",
    "Neon PostgreSQL Database",
    "Drizzle ORM for type-safe queries",
    "Row Level Security (RLS) for data protection",
    "Stripe payment integration",
    "Internationalization (i18n) support",
    "Light/dark theme support",
    "Shadcn/UI components",
    "End-to-end TypeScript type safety",
    "Bun package manager and runtime",
  ];

  const setupPhases = [
    {
      title: "Initial Setup",
      steps: [
        "Install Bun https://bun.sh/docs/installation",
        "Clone the repository",
        'Run <code class="text-blue-300">bun install</code> to install dependencies',
        'Run <code class="text-blue-300">bun dev</code> to start the development server',
      ],
    },
    {
      title: "Authentication Setup",
      steps: [
        "Create a Stack Auth account https://stack-auth.com/",
        "Create a project with Google and Magic Link authentication",
        "Enable localhost callbacks for development in the Domains section",
        "Copy NextJS credentials to .env.local",
        "Copy the JWKS URL from Project Settings",
      ],
    },
    {
      title: "Database Setup",
      steps: [
        "Create a NeonDB account https://neon.com/",
        "Set up the auth provider in NeonDB > Settings > RLS",
        "Run the SQL setup commands in NeonDB SQL editor",
        "Copy the database credentials to .env.local",
        "Add NEXT_PUBLIC_ prefix to DATABASE_AUTHENTICATED_URL",
        'Run <code class="text-blue-300">bun drizzle:gm</code> to generate migrations',
      ],
    },
  ];

  // Track the active section
  const [activeSection, setActiveSection] = useState("features");

  // Add state to track scroll position
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  // Function to handle code copy with syntax highlighting

  // Function to scroll to a section and update URL
  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      // Add offset for the navbar
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        // behavior: "smooth",
      });

      // Update URL hash without causing a jump
      window.history.pushState(null, "", `#${id}`);
    }
  };

  // Function to scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Check for URL hash on load and scroll to that section
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      // Slight delay to ensure the page has fully loaded
      setTimeout(() => {
        scrollToSection(hash);
      }, 100);
    }
  }, []);

  // Listen for scroll to update active section and control scroll-to-top button visibility
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        "features",
        "setup",
        "auth",
        "routes",
        "database",
        "extensions",
        "examples",
      ];

      // Show scroll-to-top button after scrolling down 300px
      setShowScrollToTop(window.scrollY > 300);

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          // If the section is near the top of the viewport
          if (rect.top <= 150 && rect.bottom > 150) {
            if (activeSection !== section) {
              setActiveSection(section);
              window.history.replaceState(null, "", `#${section}`);
            }
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [activeSection]);

  return (
    <>
      {/* Floating Navbar - Centered buttons */}
      <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 fixed top-4 right-0 left-0 z-50 mx-auto flex w-fit max-w-6xl justify-center rounded-lg border px-6 py-3 shadow-md backdrop-blur">
        <nav className="flex flex-col items-center justify-center">
          <div className="flex items-center gap-6">
            <button
              onClick={() => scrollToSection("features")}
              className={`text-sm font-medium transition-colors ${activeSection === "features" ? "underlined font-semibold text-blue-300 underline" : "hover:text-blue-300"}`}
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("setup")}
              className={`text-sm font-medium transition-colors ${activeSection === "setup" ? "underlined font-semibold text-blue-300 underline" : "hover:text-blue-300"}`}
            >
              Setup
            </button>
            <button
              onClick={() => scrollToSection("auth")}
              className={`text-sm font-medium transition-colors ${activeSection === "auth" ? "underlined font-semibold text-blue-300 underline" : "hover:text-blue-300"}`}
            >
              Auth
            </button>
            <button
              onClick={() => scrollToSection("routes")}
              className={`text-sm font-medium transition-colors ${activeSection === "routes" ? "underlined font-semibold text-blue-300 underline" : "hover:text-blue-300"}`}
            >
              Routes
            </button>
            <button
              onClick={() => scrollToSection("database")}
              className={`text-sm font-medium transition-colors ${activeSection === "database" ? "underlined font-semibold text-blue-300 underline" : "hover:text-blue-300"}`}
            >
              Database
            </button>
            <button
              onClick={() => scrollToSection("extensions")}
              className={`text-sm font-medium transition-colors ${activeSection === "extensions" ? "underlined font-semibold text-blue-300 underline" : "hover:text-blue-300"}`}
            >
              Extensions
            </button>
            <button
              onClick={() => scrollToSection("examples")}
              className={`text-sm font-medium transition-colors ${activeSection === "examples" ? "underlined font-semibold text-blue-300 underline" : "hover:text-blue-300"}`}
            >
              Examples
            </button>
          </div>
        </nav>
      </div>

      {/* Add padding to account for the floating navbar */}
      <div className="h-20"></div>

      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="space-y-12">
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight">Project Documentation</h1>
            <p className="text-muted-foreground text-xl">
              A comprehensive guide to the Terturions template and its features
            </p>
          </div>

          <section id="features">
            <div className="mb-6 flex items-center">
              <Zap className="text-primary mr-2 h-6 w-6" />
              <h2 className="text-3xl font-semibold">Features</h2>
            </div>
            <ul className="grid list-disc grid-cols-1 gap-3 pl-5 md:grid-cols-2">
              {features.map((feature, i) => (
                <li key={i} className="text-lg">
                  {feature}
                </li>
              ))}
            </ul>
          </section>

          <section id="setup">
            <div className="mb-6 flex items-center">
              <Zap className="text-primary mr-2 h-6 w-6" />
              <h2 className="text-3xl font-semibold">Setup Instructions</h2>
            </div>
            <div className="space-y-8">
              {setupPhases.map((phase, phaseIndex) => (
                <div key={phaseIndex} className="space-y-4">
                  <h3 className="text-xl font-medium">{phase.title}</h3>
                  <div className="space-y-3">
                    {phase.steps.map((step, stepIndex) => (
                      <div key={stepIndex} className="flex items-start">
                        <div className="bg-primary/10 mt-0.5 mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full">
                          <Check className="text-primary h-4 w-4" />
                        </div>
                        <p>
                          {stepIndex + 1}. <span dangerouslySetInnerHTML={{ __html: step }}></span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="auth">
            <div className="mb-6 flex items-center">
              <Zap className="text-primary mr-2 h-6 w-6" />
              <h2 className="text-3xl font-semibold">Using Stack Auth with Suspense</h2>
            </div>
            <div className="space-y-4">
              <p>
                This template utilizes React&apos;s Suspense with Stack Auth to handle loading
                states when fetching user authentication data. There are two main approaches to
                handle authentication loading states:
              </p>

              <h3 className="text-xl font-medium">1. Using Suspense (Recommended)</h3>
              <p>
                Wrap your authentication components with Suspense and provide a fallback component
                to show while loading. This approach provides a cleaner way to handle loading states
                directly in your component tree.
              </p>

              <div className="bg-muted rounded-lg p-6">
                <CodeBlock
                  title="Example from header.tsx:"
                  language="tsx"
                  code={`// AuthButtons component that uses Stack Auth
function AuthButtons() {
  const router = useRouter();
  const user = useUser();  // This hook suspends while loading

  useEffect(() => {
    if (user && !user.clientMetadata?.onboarded) {
      router.push("/dashboard");
    }
  }, [user, router]);

  return (
    <div className="flex justify-end">
      {user ? (
        <Link href={\`/dashboard\`}>
          <Button>Dashboard</Button>
        </Link>
      ) : (
        <Link href={\`/auth\`}>
          <Button>Sign In</Button>
        </Link>
      )}
    </div>
  );
}

// In your main component:
<Suspense fallback={<AuthButtonsSkeleton />}>
  <AuthButtons />
</Suspense>`}
                />
              </div>

              <h3 className="text-xl font-medium">2. Using loading.tsx</h3>
              <p>
                If you&apos;re not using Suspense, Next.js provides a loading.tsx file that will be
                shown while the page is loading. This approach is useful for page-level loading
                states.
              </p>

              <div className="bg-muted rounded-lg p-6">
                <CodeBlock
                  title="Example loading.tsx:"
                  language="tsx"
                  code={`// app/dashboard/loading.tsx
export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
    </div>
  );
}`}
                />
              </div>

              <div className="bg-primary/10 border-primary/20 rounded-md border p-4">
                <p className="font-medium">Note:</p>
                <p>
                  The Suspense approach is recommended as it provides more granular control over
                  loading states for specific components rather than the entire page.
                </p>
              </div>
            </div>
          </section>

          <section id="routes">
            <div className="mb-6 flex items-center">
              <Zap className="text-primary mr-2 h-6 w-6" />
              <h2 className="text-3xl font-semibold">Protected Routes & Authentication</h2>
            </div>
            <div className="space-y-4">
              <p>
                This template includes a pattern for creating protected routes that require
                authentication. There are several approaches to implement protected routes:
              </p>

              <h3 className="text-xl font-medium">1. Client-Side Protection</h3>
              <p>
                Using the useUser hook to check authentication and redirect unauthenticated users.
                This approach is shown in the dashboard page:
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

              <h3 className="text-xl font-medium">2. Layout-Level Protection</h3>
              <p>
                You can also protect an entire section of your app by adding authentication checks
                to a layout component:
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

              <div className="bg-primary/10 border-primary/20 mt-4 rounded-md border p-4">
                <p className="font-medium">Best Practices:</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Use client-side redirects for simple protected routes</li>
                  <li>Use layout protection for entire sections that should be protected</li>
                  <li>For more robust protection, consider implementing middleware</li>
                  <li>
                    Always have a fallback (return null) while checking authentication to prevent
                    flashing of protected content
                  </li>
                  <li>
                    Store auth-related configuration (like redirect paths) in a central config file
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section id="database" className="bg-muted rounded-lg p-6">
            <div className="mb-6 flex items-center">
              <Zap className="text-primary mr-2 h-6 w-6" />
              <h2 className="text-3xl font-semibold">Database Setup SQL</h2>
            </div>
            <CodeBlock
              language="sql"
              code={`CREATE EXTENSION IF NOT EXISTS pg_session_jwt;

GRANT SELECT, UPDATE, INSERT, DELETE ON ALL TABLES
IN SCHEMA public
to authenticated;

GRANT SELECT, UPDATE, INSERT, DELETE ON ALL TABLES
IN SCHEMA public
to anonymous;

ALTER DEFAULT PRIVILEGES
IN SCHEMA public
GRANT SELECT, UPDATE, INSERT, DELETE ON TABLES
TO authenticated;

ALTER DEFAULT PRIVILEGES
IN SCHEMA public
GRANT SELECT, UPDATE, INSERT, DELETE ON TABLES
TO anonymous;

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anonymous;`}
            />
          </section>

          {/* New Recommended Extensions Section */}
          <section id="extensions">
            <div className="mb-6 flex items-center">
              <Zap className="text-primary mr-2 h-6 w-6" />
              <h2 className="text-3xl font-semibold">Recommended Extensions</h2>
            </div>
            <div className="space-y-4">
              <p>
                To enhance your development experience with this template, we recommend installing
                the following VSCode extensions:
              </p>

              <div className="bg-muted rounded-lg p-6">
                <h3 className="mb-4 text-xl font-medium">Better Comments</h3>
                <p className="mb-2">
                  This extension helps you create more human-friendly comments in your code by
                  highlighting specific comment types.
                </p>
                <p className="mb-4">
                  <a
                    href="https://marketplace.visualstudio.com/items?itemName=aaron-bond.better-comments"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    https://marketplace.visualstudio.com/items?itemName=aaron-bond.better-comments
                  </a>
                </p>

                <div className="bg-primary/10 border-primary/20 rounded-md border p-4">
                  <p className="font-medium">Benefits:</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    <li>Easily distinguish important comments with different colors</li>
                    <li>
                      Highlight critical sections in webhook handlers (e.g., Stripe webhook
                      verification)
                    </li>
                    <li>Color-coded TODOs, alerts, and questions</li>
                    <li>Better visualization of code that needs attention or documentation</li>
                    <li>Improves readability when working with complex API integrations</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* New Examples Section using the additional snippets from JSON */}
          <section id="examples">
            <div className="mb-6 flex items-center">
              <Zap className="text-primary mr-2 h-6 w-6" />
              <h2 className="text-3xl font-semibold">Real Implementation Examples</h2>
            </div>
            <div className="space-y-8">
              <div>
                <h3 className="mb-4 text-xl font-medium">Complete Header Component</h3>
                <p className="mb-4">
                  Here&apos;s a real implementation of a header component that includes
                  authentication handling, proper Suspense usage, and gradient styling effects:
                </p>
                <div className="bg-muted rounded-lg p-6">
                  <CodeBlock
                    title="Real Example from header.tsx:"
                    language="tsx"
                    code={`"use client";
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
        <Link href={\`/dashboard\`}>
          <Button className="group relative overflow-hidden transition-all duration-300 hover:shadow-md">
            <span className="relative z-10 flex items-center gap-2">Dashboard</span>
            <span className="from-primary/80 to-primary absolute inset-0 bg-gradient-to-r opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </Button>
        </Link>
      ) : (
        <Link href={\`/auth\`}>
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
          <Link href={\`/\`} className="flex items-center space-x-3">
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
}`}
                  />
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-xl font-medium">Complete Dashboard Page</h3>
                <p className="mb-4">
                  This is a real dashboard page implementation that shows how to handle user
                  authentication, profile loading, and proper error handling with toast
                  notifications:
                </p>
                <div className="bg-muted rounded-lg p-6">
                  <CodeBlock
                    title="Real Example from dashboard/page.tsx:"
                    language="tsx"
                    code={`"use client";

import { ProfileDisplay } from "@/components/dashboard/profile-display";
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
      <div className=" flex items-center justify-end gap-2">
        <ThemeToggle />
        {profile && <UserButton profile={profile} user={user} />}
      </div>

     {profile && <ProfileDisplay profile={profile} />}

      {/* <TodoList dictionary={dictionary} user={user} profile={profile} /> */}
    </div>
  );
}`}
                  />
                </div>
              </div>

              <div className="bg-primary/10 border-primary/20 rounded-md border p-4">
                <p className="font-medium">Key Features in These Examples:</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Proper error handling with toast notifications</li>
                  <li>Profile creation and management</li>
                  <li>Gradient styling effects with hover states</li>
                  <li>Responsive design with Tailwind CSS</li>
                  <li>TypeScript type safety throughout</li>
                  <li>Integration with external services (database, authentication)</li>
                </ul>
              </div>
            </div>
          </section>

          <div className="text-center">
            <Link
              href="/"
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll to top button */}
      {showScrollToTop && (
        <button
          onClick={scrollToTop}
          className="bg-muted text- fixed right-6 bottom-6 z-50 rounded-full p-3 shadow-lg transition-all duration-300"
          aria-label="Scroll to top"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </>
  );
}
