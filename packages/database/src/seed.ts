import "dotenv/config";
import { createDb } from "./index.js";
import { users } from "./schema.js";

async function seed() {
  const db = createDb(process.env.DATABASE_URL!);

  console.log("Seeding database...");

  await db.insert(users).values({
    email: "alice@example.com",
    firstName: "Alice",
    lastName: "Johnson",
    displayName: "Alice",
  });

  console.log("Seeded 1 user.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
