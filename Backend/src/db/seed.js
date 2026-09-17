import argon2 from "argon2";
import { createDatabase } from "./postgres.js";
import userSchema from "../models/User.model.js";
import reportSchema from "../models/Report.model.js";
import workerSchema from "../models/Worker.model.js";
import adminSchema from "../models/Admin.model.js";

/**
 * Script to initialize clean tables and optionally seed a fresh baseline dataset
 */
export async function initAndSeedDatabase(config = process.env) {
  const sql = createDatabase(config);

  console.log("🔄 Initializing fresh database schema...");
  await sql`SELECT 1`;
  await sql.unsafe(userSchema.createTableQuery);
  await sql.unsafe(reportSchema.createTableQuery);
  await sql.unsafe(workerSchema.createTableQuery);
  await sql.unsafe(adminSchema.createTableQuery);
  console.log("✅ Tables and extensions verified.");

  // Check if admin exists
  const existingAdmins = await sql`SELECT id FROM admins LIMIT 1`;
  if (existingAdmins.length === 0) {
    const adminEmail = config.ADMIN_BOOTSTRAP_EMAIL || "admin@roadsense.com";
    const adminName = config.ADMIN_BOOTSTRAP_NAME || "System Admin";
    const adminPassword = config.ADMIN_BOOTSTRAP_PASSWORD || "Admin@RoadSense2026";
    const passwordHash = await argon2.hash(adminPassword);

    await sql`
      INSERT INTO admins (name, email, password_hash, role)
      VALUES (${adminName}, ${adminEmail}, ${passwordHash}, 'ADMIN')
      ON CONFLICT (email) DO NOTHING
    `;
    console.log(`👤 Baseline Admin seeded: ${adminEmail}`);
  }

  // Check if worker group exists
  const existingWorkers = await sql`SELECT id FROM worker_groups LIMIT 1`;
  if (existingWorkers.length === 0) {
    const workerHash = await argon2.hash("Worker@123456");
    await sql`
      INSERT INTO worker_groups (name, email, password_hash, role)
      VALUES ('North Sector Rapid Repair Team', 'worker.north@roadsense.com', ${workerHash}, 'WORKER_GROUP')
      ON CONFLICT (email) DO NOTHING
    `;
    console.log("👷 Baseline Worker Group seeded: worker.north@roadsense.com");
  }

  console.log("🎉 Fresh dataset initialization complete.");
  await sql.end();
}

if (process.argv[1] && process.argv[1].endsWith("seed.js")) {
  initAndSeedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Seed failed:", err);
      process.exit(1);
    });
}
