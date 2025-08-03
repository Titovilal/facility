import { InferSelectModel } from "drizzle-orm";
import { authenticatedRole, authUid, crudPolicy } from "drizzle-orm/neon";
import { boolean, index, integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// Enum for vacation types
export const vacationTypeEnum = pgEnum("vacation_type", ["none", "full_day", "half_day"]);

// Schema for time entries
export const timeEntries = pgTable(
  "time_entries",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    date: text("date").notNull(), // YYYY-MM-DD format
    startTime: text("start_time").notNull(),
    endTime: text("end_time").notNull(),
    dietasCount: integer("dietas_count").notNull().default(0),
    isPernocta: boolean("is_pernocta").notNull().default(false),
    vacationType: vacationTypeEnum("vacation_type").notNull().default("none"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    crudPolicy({
      role: authenticatedRole,
      read: authUid(table.userId),
      modify: authUid(table.userId),
    }),
    index("idx_time_entries_user_date").on(table.userId, table.date),
    index("idx_time_entries_user_id").on(table.userId),
  ]
);

export type TimeEntry = InferSelectModel<typeof timeEntries>;
