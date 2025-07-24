CREATE TYPE "public"."vacation_type" AS ENUM('none', 'full_day', 'half_day');--> statement-breakpoint
CREATE TABLE "user_config" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"annual_salary" text DEFAULT '25000' NOT NULL,
	"monthly_net" text DEFAULT '1700' NOT NULL,
	"payment_type" text DEFAULT '14' NOT NULL,
	"normal_rate" text DEFAULT '15.60' NOT NULL,
	"extra_rate" text DEFAULT '23.40' NOT NULL,
	"saturday_rate" text DEFAULT '23.40' NOT NULL,
	"sunday_rate" text DEFAULT '31.20' NOT NULL,
	"daily_hour_limit" text DEFAULT '8' NOT NULL,
	"has_dieta" boolean DEFAULT true NOT NULL,
	"dieta_price" text DEFAULT '5.00' NOT NULL,
	"has_pernocta" boolean DEFAULT true NOT NULL,
	"pernocta_price" text DEFAULT '25.00' NOT NULL,
	"max_vacation_days" text DEFAULT '22' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_config_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "user_config" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "daily_data" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"date" text NOT NULL,
	"dietas_count" integer DEFAULT 0 NOT NULL,
	"is_pernocta" boolean DEFAULT false NOT NULL,
	"vacation_type" "vacation_type" DEFAULT 'none' NOT NULL,
	"hour_breakdown" jsonb NOT NULL,
	"total_earnings" real DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "daily_data" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "time_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"date" text NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "time_entries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE INDEX "idx_user_config_user_id" ON "user_config" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_daily_data_user_date" ON "daily_data" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "idx_time_entries_user_date" ON "time_entries" USING btree ("user_id","date");--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-select" ON "user_config" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.user_id() = "user_config"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-insert" ON "user_config" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.user_id() = "user_config"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-update" ON "user_config" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.user_id() = "user_config"."user_id")) WITH CHECK ((select auth.user_id() = "user_config"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-delete" ON "user_config" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.user_id() = "user_config"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-select" ON "daily_data" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.user_id() = "daily_data"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-insert" ON "daily_data" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.user_id() = "daily_data"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-update" ON "daily_data" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.user_id() = "daily_data"."user_id")) WITH CHECK ((select auth.user_id() = "daily_data"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-delete" ON "daily_data" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.user_id() = "daily_data"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-select" ON "time_entries" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.user_id() = "time_entries"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-insert" ON "time_entries" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.user_id() = "time_entries"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-update" ON "time_entries" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.user_id() = "time_entries"."user_id")) WITH CHECK ((select auth.user_id() = "time_entries"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-delete" ON "time_entries" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.user_id() = "time_entries"."user_id"));