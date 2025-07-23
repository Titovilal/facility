import Link from "next/link";

// Import the JSON data
import { CodeBlock } from "@/components/docs/code-block";
import { DocImage } from "@/components/docs/doc-image";
import { Database } from "lucide-react";

export default function DatabaseSetupPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="space-y-12">
        <div className="text-center">
          <div className="mb-4 flex items-center justify-center gap-4">
            <Database className="h-8 w-8 text-red-400" />

            <h1 className="text-4xl font-bold tracking-tight">Database Setup</h1>
          </div>
          <p className="text-muted-foreground text-xl">
            Configure database connections for your Terturions project
          </p>
        </div>

        <section>
          <div className="space-y-12">
            {/* Step 1: Create a NeonDB account */}
            <div className="space-y-4">
              <h3 className="flex items-center text-2xl font-medium">
                <div className="bg-primary/10 mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                  <span className="font-semibold">1</span>
                </div>
                Create a NeonDB account
              </h3>
              <div className="pl-11">
                <p className="mb-4">
                  Visit{" "}
                  <a
                    href="https://neon.com/"
                    className="text-blue-400 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    neon.com
                  </a>{" "}
                  and create an account. NeonDB is a serverless PostgreSQL database that offers a
                  generous free tier and scales with your application.
                </p>
                <DocImage
                  src="/docs/images/neondb_create_project.png"
                  alt="Creating a NeonDB project"
                  width={800}
                  height={450}
                />
              </div>
            </div>

            {/* Step 2: Set up the auth provider */}
            <div className="space-y-4">
              <h3 className="flex items-center text-2xl font-medium">
                <div className="bg-primary/10 mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                  <span className="font-semibold">2</span>
                </div>
                Set up the auth provider in NeonDB
              </h3>
              <div className="pl-11">
                <p className="mb-4">
                  Navigate to your project&apos;s Settings and then to the Row Level Security (RLS)
                  section. Here, you&apos;ll configure the authentication provider to secure your
                  database access.
                </p>
                <DocImage
                  src="/docs/images/neondb_rls_activation.png"
                  alt="Activating Row Level Security"
                  width={800}
                  height={450}
                />
              </div>
            </div>

            {/* Step 3: Remove Development Branch */}
            <div className="space-y-4">
              <h3 className="flex items-center text-2xl font-medium">
                <div className="bg-primary/10 mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                  <span className="font-semibold">3</span>
                </div>
                Remove Development Branch
              </h3>
              <div className="pl-11">
                <p className="mb-4">
                  To ensure optimal performance and prevent conflicts, it&apos;s recommended to
                  remove the development branch.
                </p>
                <DocImage
                  src="/docs/images/neondb_remove_development_branch.png"
                  alt="Managing development branches"
                  width={800}
                  height={450}
                />
              </div>
            </div>

            {/* Step 4: Run SQL setup commands */}
            <div className="space-y-4">
              <h3 className="flex items-center text-2xl font-medium">
                <div className="bg-primary/10 mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                  <span className="font-semibold">4</span>
                </div>
                Run SQL setup commands in NeonDB SQL editor
              </h3>
              <div className="pl-11">
                <p className="mb-4">
                  Use the NeonDB SQL editor to execute the initial setup commands. These commands
                  will activate Row Level Security (RLS) for your existing tables and any future
                  tables you create.
                </p>
                <DocImage
                  src="/docs/images/neondb_sql_commands.png"
                  alt="Running SQL commands in NeonDB"
                  width={800}
                  height={450}
                />

                <CodeBlock
                  title="The SQL commands below will set up your initial database structure"
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
              </div>
            </div>

            {/* Step 5: Copy database credentials */}
            <div className="space-y-4">
              <h3 className="flex items-center text-2xl font-medium">
                <div className="bg-primary/10 mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                  <span className="font-semibold">5</span>
                </div>
                Copy database credentials to .env.local
              </h3>
              <div className="pl-11">
                <p className="mb-4">
                  After setting up your database, locate your database credentials in the NeonDB
                  dashboard. Add these to your .env.local file to enable your application to connect
                  to the database.
                </p>
                <DocImage
                  src="/docs/images/neondb_env_variables.png"
                  alt="Database environment variables"
                  width={800}
                  height={450}
                />
                <p className="my-4">Your .env.local file should include these variables:</p>
                <p className="my-4">
                  When configuring your database URLs, ensure you use the correct roles and disable
                  connection pooling:
                </p>
                <ul className="mb-4 list-disc pl-5">
                  <li>
                    For <code>DATABASE_URL</code>, use the credentials associated with the{" "}
                    <code>*_db_owner</code> role.
                  </li>
                  <li>
                    For <code>DATABASE_AUTHENTICATED_URL</code> and{" "}
                    <code>NEXT_PUBLIC_DATABASE_AUTHENTICATED_URL</code>, use the credentials
                    associated with the <code>authenticated</code> role.
                  </li>
                </ul>
                <CodeBlock
                  title=".env.local Database Variables"
                  language="bash"
                  code={`# Database URLs
DATABASE_URL=postgres://user:password@db.neon.tech/main?options=project%3DYOUR_PROJECT_ID&sslmode=require&pgbouncer=false
DATABASE_AUTHENTICATED_URL=postgres://user:password@db.neon.tech/main?options=project%3DYOUR_PROJECT_ID&sslmode=require&pgbouncer=false
NEXT_PUBLIC_DATABASE_AUTHENTICATED_URL=postgres://user:password@db.neon.tech/main?options=project%3DYOUR_PROJECT_ID&sslmode=require&pgbouncer=false

# StackAuth
NEXT_PUBLIC_STACK_PROJECT_ID=e19h328b-a575-4bca-9eea-735595e5f87e
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=pck_sstasd324jkh560fdg82svcanw67asq7sk7sd4sdsdfsd
STACK_SECRET_SERVER_KEY=ssk_093jkdfhdl344678h0hg54hghv213hg45k6h7gh9ghbmd`}
                />
                <p className="my-4">
                  Note: <code>DATABASE_AUTHENTICATED_URL</code> and{" "}
                  <code>NEXT_PUBLIC_DATABASE_AUTHENTICATED_URL</code> should have the same value.
                </p>
              </div>
            </div>

            {/* Step 7: Generate migrations */}
            <div className="space-y-4">
              <h3 className="flex items-center text-2xl font-medium">
                <div className="bg-primary/10 mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                  <span className="font-semibold">7</span>
                </div>
                Run migrations with Drizzle
              </h3>
              <div className="pl-11">
                <p className="mb-4">
                  Use Drizzle ORM to generate and run database migrations. This will create and
                  update your database schema based on your application&apos;s models.
                </p>
                <CodeBlock title="Generate Migrations" language="bash" code={`bun drizzle:gm`} />
                <DocImage
                  src="/docs/images/drizzle_gm_succesfull.png"
                  alt="Successful Drizzle migration"
                  width={800}
                  height={450}
                />
              </div>
            </div>

            {/* Step 8: Additional Database Management */}
            <div className="space-y-4">
              <h3 className="flex items-center text-2xl font-medium">
                <div className="bg-primary/10 mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                  <span className="font-semibold">8</span>
                </div>
                Optimize Database Resources
              </h3>
              <div className="pl-11">
                <p className="mb-4">
                  For development environments, you may want to decrease the compute size to save on
                  resources. This can be done in the NeonDB project settings, reducing it to 0.25
                  CUs while active.
                </p>
                <DocImage
                  src="/docs/images/neondb_decrease_compute_size.png"
                  alt="Decreasing compute size in NeonDB"
                  width={800}
                  height={450}
                />
              </div>
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
