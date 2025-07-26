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
    annualSalary: text("annual_salary").notNull().default("0"),
    weeklyHours: text("weekly_hours").notNull().default("0"),
    paymentType: text("payment_type").notNull().default("0"),

    // Tarifas por Hora
    extraRate: text("extra_rate").notNull().default("0"),
    saturdayRate: text("saturday_rate").notNull().default("0"),
    sundayRate: text("sunday_rate").notNull().default("0"),

    // Límite de horas
    dailyHourLimit: text("daily_hour_limit").notNull().default("0"),

    // Dietas y Pernocta
    hasDieta: boolean("has_dieta").notNull().default(false),
    dietaPrice: text("dieta_price").notNull().default("0"),
    hasPernocta: boolean("has_pernocta").notNull().default(false),
    pernoctaPrice: text("pernocta_price").notNull().default("0"),

    // Vacaciones
    maxVacationDays: text("max_vacation_days").notNull().default("0"),

    // Segunda paga (14 pagas)
    segundaPagaMonths: text("segunda_paga_months").notNull().default("6,12"),

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
