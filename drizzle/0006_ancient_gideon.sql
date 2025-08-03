DROP POLICY "crud-authenticated-policy-select" ON "daily_data" CASCADE;--> statement-breakpoint
DROP POLICY "crud-authenticated-policy-insert" ON "daily_data" CASCADE;--> statement-breakpoint
DROP POLICY "crud-authenticated-policy-update" ON "daily_data" CASCADE;--> statement-breakpoint
DROP POLICY "crud-authenticated-policy-delete" ON "daily_data" CASCADE;--> statement-breakpoint
DROP TABLE "daily_data" CASCADE;--> statement-breakpoint
ALTER TABLE "time_entries" ADD COLUMN "dietas_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "time_entries" ADD COLUMN "is_pernocta" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "time_entries" ADD COLUMN "vacation_type" "vacation_type" DEFAULT 'none' NOT NULL;