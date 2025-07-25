CREATE INDEX "idx_daily_data_user_id" ON "daily_data" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_time_entries_user_id" ON "time_entries" USING btree ("user_id");