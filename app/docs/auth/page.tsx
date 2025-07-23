import { Database, Lock } from "lucide-react";
import Link from "next/link";

// Import the JSON data
import { CodeBlock } from "@/components/docs/code-block";
import { DocImage } from "@/components/docs/doc-image";

export default function AuthSetupPage() {
  // Function to handle code copy with syntax highlightin
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="space-y-12">
        <div className="text-center">
          <div className="mb-4 flex items-center justify-center gap-4">
            <Lock className="h-8 w-8 text-green-400" />

            <h1 className="text-4xl font-bold tracking-tight">Authentication Setup</h1>
          </div>
          <p className="text-muted-foreground text-xl">
            Configure authentication for your Terturions project
          </p>
        </div>

        <section>
          <div className="space-y-12">
            {/* Step 1: Create Stack Auth account */}
            <div className="space-y-4">
              <h3 className="flex items-center text-2xl font-medium">
                <div className="bg-primary/10 mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                  <span className="font-semibold">1</span>
                </div>
                Create a Stack Auth account
              </h3>
              <div className="pl-11">
                <p className="mb-4">
                  Start by visiting{" "}
                  <a
                    href="https://stack-auth.com/"
                    className="text-blue-400 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    stack-auth.com
                  </a>{" "}
                  and creating an account. Stack Auth provides an easy way to implement
                  authentication in your Terturions project.
                </p>
              </div>
            </div>

            {/* Step 2: Create a project */}
            <div className="space-y-4">
              <h3 className="flex items-center text-2xl font-medium">
                <div className="bg-primary/10 mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                  <span className="font-semibold">2</span>
                </div>
                Create a project with authentication methods
              </h3>
              <div className="pl-11">
                <p className="mb-4">
                  After logging in, create a new project and select the authentication methods you
                  want to implement. We recommend setting up Google and Magic Link authentication
                  for a seamless user experience.
                </p>
                <DocImage
                  src="/docs/images/stack_auth_create_project.png"
                  alt="Creating a project in Stack Auth"
                  width={800}
                  height={450}
                />
              </div>
            </div>

            {/* Step 3: Enable localhost callbacks */}
            <div className="space-y-4">
              <h3 className="flex items-center text-2xl font-medium">
                <div className="bg-primary/10 mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                  <span className="font-semibold">3</span>
                </div>
                Enable localhost callbacks for development
              </h3>
              <div className="pl-11">
                <p className="mb-4">
                  For development purposes, you&apos;ll need to enable localhost callbacks in the
                  Domains section of your project. This allows you to test authentication flows
                  locally before deploying to production.
                </p>
                <DocImage
                  src="/docs/images/stack_auth_allow_localhost_callbacks.png"
                  alt="Enabling localhost callbacks"
                  width={800}
                  height={450}
                />
              </div>
            </div>

            {/* Step 4: Configure environment variables */}
            <div className="space-y-4">
              <h3 className="flex items-center text-2xl font-medium">
                <div className="bg-primary/10 mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                  <span className="font-semibold">4</span>
                </div>
                Copy NextJS credentials to .env.local
              </h3>
              <div className="pl-11">
                <p className="mb-4">
                  Stack Auth provides you with environment variables that need to be added to your
                  .env.local file. Copy these credentials exactly as shown to ensure your
                  authentication system works properly.
                </p>
                <DocImage
                  src="/docs/images/stack_auth_env_variables.png"
                  alt="Environment variables"
                  width={800}
                  height={450}
                />
              </div>
            </div>

            {/* Step 5: Get JWKS URL */}
            <div className="space-y-4">
              <h3 className="flex items-center text-2xl font-medium">
                <div className="bg-primary/10 mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                  <span className="font-semibold">5</span>
                </div>
                Copy the JWKS URL from Project Settings
              </h3>
              <div className="pl-11">
                <p className="mb-4">
                  The JWKS URL is needed for token validation. Find this in your project settings
                  and copy it to your environment variables.
                </p>
                <DocImage
                  src="/docs/images/stack_auth_get_jwks_url.png"
                  alt="Getting JWKS URL"
                  width={800}
                  height={450}
                />
                <p className="my-4">Your .env.local file should include these variables:</p>
                <CodeBlock
                  title=".env.local Stack Auth Variables"
                  language="bash"
                  code={`# StackAuth
NEXT_PUBLIC_STACK_PROJECT_ID=e19h328b-a575-4bca-9eea-735595e5f87e
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=pck_sstasd324jkh560fdg82svcanw67asq7sk7sd4sdsdfsd
STACK_SECRET_SERVER_KEY=ssk_093jkdfhdl344678h0hg54hghv213hg45k6h7gh9ghbmd`}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="border-border bg-muted/30 space-y-6 rounded-lg border p-6">
          <div className="mb-4 flex items-center">
            <Database className="mr-2 h-6 w-6 text-blue-400" />
            <h2 className="text-3xl font-semibold">Next Step: Database Setup</h2>
          </div>
          <p className="text-muted-foreground mb-6">
            Now that you have authentication set up, it&apos;s time to configure your database
            connection. The database setup will allow you to store user information and other
            application data securely.
          </p>
          <div className="flex justify-start">
            <Link
              href="/docs/database"
              className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center rounded-md px-4 py-2 transition-colors duration-200"
            >
              <span>Go to Database Setup</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="ml-2 h-5 w-5"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
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
