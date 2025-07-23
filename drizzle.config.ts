import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

export default defineConfig({
  dialect: "postgresql",
  schema: "./db/schemas/*",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
