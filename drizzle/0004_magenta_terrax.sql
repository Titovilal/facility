ALTER TABLE "user_config" ALTER COLUMN "annual_salary" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "user_config" ALTER COLUMN "payment_type" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "user_config" ALTER COLUMN "extra_rate" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "user_config" ALTER COLUMN "saturday_rate" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "user_config" ALTER COLUMN "sunday_rate" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "user_config" ALTER COLUMN "daily_hour_limit" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "user_config" ALTER COLUMN "has_dieta" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "user_config" ALTER COLUMN "dieta_price" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "user_config" ALTER COLUMN "has_pernocta" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "user_config" ALTER COLUMN "pernocta_price" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "user_config" ALTER COLUMN "max_vacation_days" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "user_config" ADD COLUMN "weekly_hours" text DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_config" DROP COLUMN "monthly_net";--> statement-breakpoint
ALTER TABLE "user_config" DROP COLUMN "normal_rate";