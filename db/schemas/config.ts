import { InferSelectModel } from "drizzle-orm";
import { authenticatedRole, authUid, crudPolicy } from "drizzle-orm/neon";
import { boolean, index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// Schema for user configuration
export const userConfig = pgTable(
  "user_config",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    userId: text("user_id").notNull().unique(),

    // Salario Base
    annualSalary: text("annual_salary").notNull().default("25000"),
    monthlyNet: text("monthly_net").notNull().default("1700"),
    paymentType: text("payment_type").notNull().default("14"),

    // Tarifas por Hora
    normalRate: text("normal_rate").notNull().default("15.60"),
    extraRate: text("extra_rate").notNull().default("23.40"),
    saturdayRate: text("saturday_rate").notNull().default("23.40"),
    sundayRate: text("sunday_rate").notNull().default("31.20"),

    // Límite de horas
    dailyHourLimit: text("daily_hour_limit").notNull().default("8"),

    // Dietas y Pernocta
    hasDieta: boolean("has_dieta").notNull().default(true),
    dietaPrice: text("dieta_price").notNull().default("5.00"),
    hasPernocta: boolean("has_pernocta").notNull().default(true),
    pernoctaPrice: text("pernocta_price").notNull().default("25.00"),

    // Vacaciones
    maxVacationDays: text("max_vacation_days").notNull().default("22"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    crudPolicy({
      role: authenticatedRole,
      read: authUid(table.userId),
      modify: authUid(table.userId),
    }),
    index("idx_user_config_user_id").on(table.userId),
  ]
);

export type UserConfig = InferSelectModel<typeof userConfig>;
