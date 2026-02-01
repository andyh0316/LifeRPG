import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const testUrl = process.env.DATABASE_URL!.replace(/\/[^/]+$/, "/life_rpg_test");

export default defineConfig({
  out: "./drizzle",
  schema: "./src/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: testUrl,
  },
});
