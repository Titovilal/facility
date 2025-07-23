import { CodeBlock } from "@/components/docs/code-block";
import { Database, FileCode, Table } from "lucide-react";
import Link from "next/link";

export default function DrizzleTablesPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="space-y-12">
        <div className="text-center">
          <div className="mb-4 flex items-center justify-center gap-4">
            <Table className="h-8 w-8 text-blue-400" />
            <h1 className="text-4xl font-bold tracking-tight">Creating Database Tables</h1>
          </div>
          <p className="text-muted-foreground text-xl">
            Building and managing database tables with Drizzle ORM
          </p>
        </div>

        <section>
          <div className="space-y-12">
            {/* Introduction to Drizzle Schema */}
            <div className="space-y-4">
              <h3 className="flex items-center text-2xl font-medium">
                <FileCode className="mr-3 h-6 w-6 text-blue-400" />
                Understanding Drizzle Schema
              </h3>
              <p>
                This template uses Drizzle ORM to define database schemas in a type-safe way. We
                organize our database schemas in the <code>/db/schemas</code> directory and database
                operations in the <code>/db/actions</code> directory.
              </p>
              <div className="bg-muted rounded-lg p-6">
                <CodeBlock
                  title="Database directory structure"
                  language="bash"
                  code={`/db
  /schemas
    profiles.ts    # User profiles schema
    other-tables.ts    # Other tables schemas
  /actions
    profiles.ts    # Database actions for profiles
    other-actions.ts   # Actions for other tables
  db.ts            # Database connection setup`}
                />
              </div>
            </div>

            {/* Step 1: Create a Schema File */}
            <div className="space-y-4">
              <h3 className="flex items-center text-2xl font-medium">
                <div className="bg-primary/10 mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                  <span className="font-semibold">1</span>
                </div>
                Create a Schema File
              </h3>
              <div className="pl-11">
                <p className="mb-4">
                  Let&apos;s examine the <code>profiles.ts</code> schema as an example. This defines
                  a table that stores user profile information with appropriate columns and Row
                  Level Security (RLS) policies.
                </p>
                <div className="bg-muted rounded-lg p-6">
                  <CodeBlock
                    title="/db/schemas/profiles.ts"
                    language="typescript"
                    code={`import { InferSelectModel } from "drizzle-orm";
import { authenticatedRole, authUid, crudPolicy } from "drizzle-orm/neon";
import { boolean, index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// schema for Profiles table
export const profiles = pgTable(
  "profiles",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    userId: text("user_id").notNull(),
    subCredits: integer("sub_credits").notNull().default(0),
    otpCredits: integer("otp_credits").notNull().default(0),
    initialSubDate: timestamp("initial_sub_date", { withTimezone: true }),
    lastOtpDate: timestamp("last_otp_date", { withTimezone: true }),
    priceId: text("price_id").notNull(),
    customerId: text("customer_id").notNull(),
    name: text("name").notNull(),
    mail: text("mail").notNull(),
    cancelNextMonth: boolean("cancel_next_month").notNull().default(false),
    hasSub: boolean("has_sub").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  // Create RLS policy for the table
  (table) => [
    crudPolicy({
      role: authenticatedRole,
      read: authUid(table.userId),
      modify: false,
    }),
    index("idx_profiles_user_id").on(table.userId),
  ]
);

export type Profile = InferSelectModel<typeof profiles>;`}
                  />
                </div>
                <div className="mt-4 space-y-2">
                  <p className="font-medium">Key components of a schema file:</p>
                  <ul className="list-disc pl-5">
                    <li>
                      <strong>Table definition</strong>: Using <code>pgTable</code> to define a
                      PostgreSQL table
                    </li>
                    <li>
                      <strong>Column definitions</strong>: Various column types like{" "}
                      <code>integer</code>, <code>text</code>, <code>boolean</code>, and{" "}
                      <code>timestamp</code>
                    </li>
                    <li>
                      <strong>Primary key</strong>: <code>id</code> column with{" "}
                      <code>primaryKey()</code>
                    </li>
                    <li>
                      <strong>Default values</strong>: Using <code>default()</code> or{" "}
                      <code>defaultNow()</code>
                    </li>
                    <li>
                      <strong>Not null constraints</strong>: Using <code>notNull()</code>
                    </li>
                    <li>
                      <strong>Row Level Security (RLS)</strong>: Using <code>crudPolicy</code> to
                      restrict access to authorized users
                    </li>
                    <li>
                      <strong>Indexes</strong>: Creating an index on <code>userId</code> for
                      improved query performance
                    </li>
                    <li>
                      <strong>Type exports</strong>: Using <code>InferSelectModel</code> to generate
                      TypeScript types
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Step 2: Understand Row Level Security */}
            <div className="space-y-4">
              <h3 className="flex items-center text-2xl font-medium">
                <div className="bg-primary/10 mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                  <span className="font-semibold">2</span>
                </div>
                Understand Row Level Security (RLS)
              </h3>
              <div className="pl-11">
                <p className="mb-4">
                  Notice the RLS policy defined in the profiles schema. This template integrates RLS
                  directly in the schema definition:
                </p>
                <div className="bg-muted rounded-lg p-6">
                  <CodeBlock
                    title="RLS Policy in Schema"
                    language="typescript"
                    code={`crudPolicy({
  role: authenticatedRole,
  read: authUid(table.userId),
  modify: false,
}),`}
                  />
                </div>
                <div className="mt-4">
                  <p className="font-medium">This RLS policy ensures:</p>
                  <ul className="mt-2 list-disc pl-5">
                    <li>
                      <strong>Role-based access</strong>: Only authenticated users can access the
                      data
                    </li>
                    <li>
                      <strong>Row-level filtering</strong>: Users can only read rows where the{" "}
                      <code>userId</code> matches their own ID
                    </li>
                    <li>
                      <strong>Modification restrictions</strong>: Users cannot modify records
                      through the RLS connection (<code>modify: false</code>)
                    </li>
                  </ul>
                  <p className="mt-4">
                    With this approach, you don&apos;t need to manually create RLS policies in SQL -
                    they&apos;re generated and applied automatically when you run migrations.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3: Create Database Actions */}
            <div className="space-y-4">
              <h3 className="flex items-center text-2xl font-medium">
                <div className="bg-primary/10 mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                  <span className="font-semibold">3</span>
                </div>
                Create Database Actions
              </h3>
              <div className="pl-11">
                <p className="mb-4">
                  After defining your schema, create a file in the <code>/db/actions</code>{" "}
                  directory to define functions for interacting with your table. Let&apos;s look at
                  the profiles actions:
                </p>
                <div className="bg-muted rounded-lg p-6">
                  <CodeBlock
                    title="/db/actions/profiles.ts"
                    language="typescript"
                    code={`import { Profile, profiles } from "@/db/schemas/profiles";
import { fetchApi } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { getAdminDb, getRlsDb, StackUser } from "../db";

export const getProfile = async (user: StackUser): Promise<Profile | null> => {
  const db = await getRlsDb(user);
  const existingProfiles = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);
  return existingProfiles[0];
};

type ProfileInput = Partial<Omit<Profile, "id" | "userId" | "createdAt" | "updatedAt">>;

export const getOrCreateProfile = async (
  user: StackUser,
  data: ProfileInput = {}
): Promise<Profile> => {
  const existingProfile = await getProfile(user);
  if (existingProfile) {
    return existingProfile;
  }
  const result = await fetchApi<{ profile: Profile }>("/api/profiles", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (result.error || !result.data || !result.data.profile) {
    throw new Error("Failed to create profile: " + (result.error?.message || "Unknown error"));
  }

  return result.data.profile;
};

export const getProfileByUserId = async (userId: string): Promise<Profile | null> => {
  const db = await getAdminDb();
  const results = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  return results.length > 0 ? results[0] : null;
};

export const createProfile = async (user: StackUser, data: ProfileInput): Promise<Profile> => {
  const db = await getAdminDb();
  const result = await db.insert(profiles).values(getDefaultProfile(user, data)).returning();
  return result[0];
};

const getDefaultProfile = (user: StackUser, data: ProfileInput): Omit<Profile, "id"> => {
  return {
    userId: user.id,
    subCredits: data.subCredits ?? 0,
    otpCredits: data.otpCredits ?? 0,
    initialSubDate: data.initialSubDate ?? null,
    lastOtpDate: data.lastOtpDate ?? null,
    priceId: data.priceId ?? "",
    customerId: data.customerId ?? "",
    name: user.displayName ?? data.name ?? "",
    mail: user.primaryEmail ?? data.mail ?? "",
    cancelNextMonth: data.cancelNextMonth ?? false,
    hasSub: data.hasSub ?? false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

export const getProfileByCustomerId = async (customerId: string): Promise<Profile | null> => {
  const db = await getAdminDb();
  const results = await db
    .select()
    .from(profiles)
    .where(eq(profiles.customerId, customerId))
    .limit(1);
  return results.length > 0 ? results[0] : null;
};

export const updateProfileByCustomerId = async (
  customerId: string,
  data: ProfileInput
): Promise<Profile | null> => {
  const db = await getAdminDb();
  const updateData = {
    ...data,
    updatedAt: new Date(),
  };

  const result = await db
    .update(profiles)
    .set(updateData)
    .where(eq(profiles.customerId, customerId))
    .returning();
  return result.length > 0 ? result[0] : null;
};

export const updateProfileByUserId = async (
  userId: string,
  data: ProfileInput
): Promise<Profile | null> => {
  const db = await getAdminDb();
  const updateData = {
    ...data,
    updatedAt: new Date(),
  };

  const result = await db
    .update(profiles)
    .set(updateData)
    .where(eq(profiles.userId, userId))
    .returning();
  return result.length > 0 ? result[0] : null;
};`}
                  />
                </div>
                <div className="mt-4 space-y-2">
                  <p className="font-medium">Important patterns in database actions:</p>
                  <ul className="list-disc pl-5">
                    <li>
                      <strong>Two database clients</strong>:
                      <ul className="mt-1 list-disc pl-5">
                        <li>
                          <code>getRlsDb(user)</code>: For authenticated user operations that
                          respect RLS
                        </li>
                        <li>
                          <code>getAdminDb()</code>: For administrative operations that bypass RLS
                        </li>
                      </ul>
                    </li>
                    <li>
                      <strong>CRUD operations</strong>: Functions for Create, Read, Update, and
                      Delete operations
                    </li>
                    <li>
                      <strong>Type safety</strong>: Using TypeScript types from the schema for
                      parameters and return values
                    </li>
                    <li>
                      <strong>Error handling</strong>: Checking for valid results and throwing
                      appropriate errors
                    </li>
                    <li>
                      <strong>Default values</strong>: Setting reasonable defaults when creating new
                      records
                    </li>
                    <li>
                      <strong>Updating timestamps</strong>: Always updating <code>updatedAt</code>{" "}
                      when modifying records
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Step 4: Understand Database Connections */}
            <div className="space-y-4">
              <h3 className="flex items-center text-2xl font-medium">
                <div className="bg-primary/10 mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                  <span className="font-semibold">4</span>
                </div>
                Understand Database Connections
              </h3>
              <div className="pl-11">
                <p className="mb-4">
                  The template provides two database connection methods in <code>/db/db.ts</code>:
                </p>
                <div className="bg-muted rounded-lg p-6">
                  <CodeBlock
                    title="/db/db.ts (partial)"
                    language="typescript"
                    code={`/**
 * Retrieves a Drizzle database instance configured with Row Level Security (RLS) for the given user.
 * @param {StackUser} user - The user object containing authentication information.
 * @returns {Promise<DrizzleDb>} A Drizzle database instance.
 */
export const getRlsDb = async (user: StackUser): Promise<DrizzleDb> => {
  const authToken = (await user?.getAuthJson())?.accessToken;
  const url = process.env.NEXT_PUBLIC_DATABASE_AUTHENTICATED_URL;

  if (!url) {
    throw new Error("No database URL found");
  }
  if (!authToken) {
    throw new Error("No token found");
  }

  const sql = neon(url, {
    authToken,
  });

  return drizzle(sql);
};

/**
 * Retrieves a Drizzle database instance with admin privileges.
 * This function uses a singleton pattern to ensure only one admin connection is created.
 * @returns {DrizzleDb} A Drizzle database instance with admin privileges.
 */
export const getAdminDb = (): DrizzleDb => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("No database URL found");
  }

  if (!adminConnection) {
    const sql = neon(url);
    adminConnection = drizzle(sql);
  }

  return adminConnection;
};`}
                  />
                </div>
                <div className="bg-muted mt-4 rounded-lg p-6">
                  <CodeBlock
                    title="Database Connection Usage Examples"
                    language="typescript"
                    code={`// --- CLIENT SIDE WITH RLS ---
import { useUser } from '@stackframe/stack';
const user = useUser();
const db = await getRlsDb(user);

// --- SERVER SIDE WITH RLS ---
import { stackServerApp } from "@/stack";
const user = await stackServerApp.getUser();
const db = await getRlsDb(user);

// --- SERVER SIDE AS ADMIN ---
import { stackServerApp } from "@/stack";
const user = await stackServerApp.getUser();
const db = getAdminDb();`}
                  />
                </div>
                <div className="mt-4">
                  <p className="font-medium">Choose the right connection type:</p>
                  <ul className="mt-2 list-disc pl-5">
                    <li>
                      <strong>Use RLS connection</strong> when users should only see their own data
                    </li>
                    <li>
                      <strong>Use Admin connection</strong> when you need to bypass RLS (like
                      creating records for users or administrative functions)
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Step 5: Generate and Run Migrations */}
            <div className="space-y-4">
              <h3 className="flex items-center text-2xl font-medium">
                <div className="bg-primary/10 mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                  <span className="font-semibold">5</span>
                </div>
                Generate and Run Migrations
              </h3>
              <div className="pl-11">
                <p className="mb-4">
                  After defining your schema, you need to generate and run migrations to create the
                  actual tables in your database. This template simplifies the process with a single
                  command:
                </p>
                <div className="bg-muted rounded-lg p-6">
                  <CodeBlock
                    title="Generate and apply migrations with one command"
                    language="bash"
                    code={`# Generate and apply migrations in one step
bun drizzle:gm`}
                  />
                </div>
                <p className="mt-4">
                  The <code>bun drizzle:gm</code> command handles both steps:
                </p>
                <ol className="mt-2 list-decimal space-y-2 pl-5">
                  <li>
                    <strong>Generation</strong>: Creates SQL migration files based on changes to
                    your schema
                  </li>
                  <li>
                    <strong>Migration</strong>: Applies those migrations to your database
                  </li>
                </ol>
                <p className="mt-4">
                  This will create and run migration files in the <code>/drizzle</code> directory.
                  These files contain the SQL commands necessary to create or modify your database
                  tables, including the RLS policies defined in your schema.
                </p>
                <div className="bg-primary/10 border-primary/20 mt-4 rounded-md border p-4">
                  <p className="font-medium">Note:</p>
                  <p className="mt-1">
                    Always run <code>bun drizzle:gm</code> after making changes to your schema files
                    to ensure your database structure stays in sync with your code.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 6: Use in Components and API Routes */}
            <div className="space-y-4">
              <h3 className="flex items-center text-2xl font-medium">
                <div className="bg-primary/10 mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                  <span className="font-semibold">6</span>
                </div>
                Use in Components and API Routes
              </h3>
              <div className="pl-11">
                <p className="mb-4">
                  Now you can use your database actions in components and API routes. Here&apos;s an
                  example of how to use the profile actions in an API route:
                </p>
                <div className="bg-muted rounded-lg p-6">
                  <CodeBlock
                    title="Example: API Route for Profiles"
                    language="typescript"
                    code={`// app/api/profiles/route.ts
import { createProfile } from '@/db/actions/profiles';
import { stackServerApp } from '@/stack';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const profile = await createProfile(user, data);

    return NextResponse.json({ profile }, { status: 201 });
  } catch (error) {
    console.error('Error creating profile:', error);
    return NextResponse.json(
      { error: 'Failed to create profile' },
      { status: 500 }
    );
  }
}`}
                  />
                </div>
                <div className="bg-muted mt-4 rounded-lg p-6">
                  <CodeBlock
                    title="Example: React Component Using Profile"
                    language="tsx"
                    code={`"use client";
import { Profile } from '@/db/schemas/profiles';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/utils';

export function ProfileDisplay() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const result = await fetchApi<{ profile: Profile }>('/api/profiles/me');
        
        if (result.error) {
          throw new Error(result.error.message || 'Failed to load profile');
        }
        
        setProfile(result.data?.profile || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!profile) return <div>No profile found</div>;

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold">{profile.name}</h2>
      <p>Email: {profile.mail}</p>
      <p>Subscription: {profile.hasSub ? 'Active' : 'Inactive'}</p>
      <p>Credits: {profile.subCredits}</p>
    </div>
  );
}`}
                  />
                </div>
              </div>
            </div>

            {/* Best Practices */}
            <div className="space-y-4">
              <h3 className="flex items-center text-2xl font-medium">
                <Database className="mr-3 h-6 w-6 text-blue-400" />
                Best Practices
              </h3>
              <div className="bg-primary/10 border-primary/20 rounded-md border p-4">
                <p className="font-medium">
                  Follow these best practices when working with database tables:
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>
                    Always include <code>userId</code> in tables that store user-specific data
                  </li>
                  <li>
                    Include <code>createdAt</code> and <code>updatedAt</code> timestamps in every
                    table
                  </li>
                  <li>Define RLS policies in your schema to enforce data access security</li>
                  <li>
                    Use the appropriate database connection (<code>getRlsDb</code> vs{" "}
                    <code>getAdminDb</code>)
                  </li>
                  <li>
                    Create helper functions in <code>/db/actions</code> for common database
                    operations
                  </li>
                  <li>
                    Generate and apply migrations with <code>bun drizzle:gm</code> after schema
                    changes
                  </li>
                  <li>Add indexes for columns frequently used in WHERE clauses</li>
                  <li>Use proper error handling in database operations</li>
                  <li>Keep your schema definitions focused and organized by table</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <div className="text-center">
          <Link
            href="/docs/database"
            className="mr-4 inline-flex items-center justify-center text-sm font-medium text-blue-400 hover:underline"
          >
            Back to Database Setup
          </Link>
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
