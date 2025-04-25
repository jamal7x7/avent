import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { sessionTable, userTable } from "../db/schema/users.js";

/**
 * Seeds the database with dummy data for local testing.
 * Run with: pnpm seed
 */
async function main() {
  // Clean up (optional: comment out if you want to keep existing data)
  await db.delete(sessionTable);
  await db.delete(userTable);

  // Insert dummy users
  const users = [
    {
      id: "user-1",
      name: "Alice Example",
      email: "alice@example.com",
      emailVerified: true,
      image: "https://randomuser.me/api/portraits/women/1.jpg",
      createdAt: new Date(),
      updatedAt: new Date(),
      twoFactorEnabled: false,
      age: 28,
      firstName: "Alice",
      lastName: "Example",
    },
    {
      id: "user-2",
      name: "Bob Test",
      email: "bob@example.com",
      emailVerified: false,
      image: "https://randomuser.me/api/portraits/men/2.jpg",
      createdAt: new Date(),
      updatedAt: new Date(),
      twoFactorEnabled: true,
      age: 35,
      firstName: "Bob",
      lastName: "Test",
    },
  ];
  await db.insert(userTable).values(users);

  // Insert dummy sessions
  const sessions = [
    {
      id: "session-1",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      token: "token-1",
      createdAt: new Date(),
      updatedAt: new Date(),
      ipAddress: "127.0.0.1",
      userAgent: "Mozilla/5.0",
      userId: "user-1",
    },
  ];
  await db.insert(sessionTable).values(sessions);

  // You can extend with more tables/accounts as needed
  console.log("✅ Dummy data seeded.");
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
