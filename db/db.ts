import { neon } from "@neondatabase/serverless";
import { CurrentInternalUser, CurrentUser } from "@stackframe/stack";
import { drizzle } from "drizzle-orm/neon-http";

export type StackUser = CurrentUser | CurrentInternalUser;
export type DrizzleDb = ReturnType<typeof drizzle>;

let adminConnection: DrizzleDb | null = null;

/**
 * Retrieves a Drizzle database instance configured with Row Level Security (RLS) for the given user.
 * @param {StackUser} user - The user object containing authentication information.
 * @returns {Promise<DrizzleDb>} A Drizzle database instance.
 * @throws {Error} If no database URL or authentication token is found.
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
 * @throws {Error} If no database URL is found.
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
};

// --- CLIENT SIDE WITH RLS ---
// import { useUser } from '@stackframe/stack';
// const user = useUser();
// const db = await getRlsDb(user);

// --- SERVER SIDE WITH RLS ---
// import { stackServerApp } from "@/stack";
// const user = await stackServerApp.getUser();
// const db = await getRlsDb(user);

// --- SERVER SIDE AS ADMIN ---
// import { stackServerApp } from "@/stack";
// const user = await stackServerApp.getUser();
// const db = getAdminDb();
