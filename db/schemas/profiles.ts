import { InferSelectModel } from "drizzle-orm";
import { authenticatedRole, authUid, crudPolicy } from "drizzle-orm/neon";
import { boolean, index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// schema for Profiles table
export const profiles = pgTable(
  "profiles",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    userId: text("user_id").notNull().unique(),
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

export type Profile = InferSelectModel<typeof profiles>;
