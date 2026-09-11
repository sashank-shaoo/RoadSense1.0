import Fastify from "fastify";
import env from "@fastify/env";
import helmet from "@fastify/helmet";
import formbody from "@fastify/formbody";
import cookie from "@fastify/cookie";
import jwt from "@fastify/jwt";
import multipart from "@fastify/multipart";

import { createDatabase } from "./db/postgres.js";
import userRoutes from "./routes/User.route.js";
import reportRoutes from "./routes/Report.route.js";
//creating tables if not exists
// import userSchema from "./models/User.model.js";
// import reportSchema from "./models/Report.model.js";
// import reportDetectionSchema from "./models/ReportDetection.model.js";
const app = Fastify({
  logger: true,
});

await app.register(env, {
  confKey: "config",
  dotenv: true,

  schema: {
    type: "object",

    required: [
      "DB_HOST",
      "DB_PORT",
      "DB_NAME",
      "DB_USER",
      "DB_PASSWORD",
      "JWT_SECRET",
      "COOKIE_SECRET",
      "BREVO_API_KEY",
      "FROM_EMAIL",
      "EMAIL_FROM_NAME",
    ],

    properties: {
      //configure DB credentials
      DB_HOST: { type: "string" },
      DB_PORT: { type: "string" },
      DB_NAME: { type: "string" },
      DB_USER: { type: "string" },
      DB_PASSWORD: { type: "string" },
      //Port
      PORT: { type: "string" },
      JWT_SECRET: { type: "string" },
      COOKIE_SECRET: { type: "string" },
      NODE_ENV: { type: "string", default: "development" },
      //Email Services
      BREVO_API_KEY: { type: "string" },
      FROM_EMAIL: { type: "string" },
      EMAIL_FROM_NAME: { type: "string" },
      // AWS media and AI services
      AWS_REGION: { type: "string" },
      AWS_S3_BUCKET_NAME: { type: "string" },
      AWS_ACCESS_KEY_ID: { type: "string" },
      AWS_SECRET_ACCESS_KEY: { type: "string" },
      AWS_SESSION_TOKEN: { type: "string" },
      AI_SERVICE_URL: { type: "string" },
      AI_SERVICE_TIMEOUT_MS: { type: "string", default: "30000" },
    },
  },
});

const sql = createDatabase(app.config);
app.decorate("db", sql);
await sql`SELECT 1`;

app.log.info("Connected to PostgreSQL");

// Initialize users table if it doesn't exist
// await sql.unsafe(userSchema.createTableQuery);
// app.log.info("Users table verified / created successfully");

// await sql.unsafe(userSchema.deleteTableQuery);
// app.log.info("Users table verified / deleted successfully");

// // Initialize reports table if it doesn't exist
// await sql.unsafe(reportSchema.createTableQuery);
// app.log.info("Reports table verified / created successfully");

// // Initialize report_detections table if it doesn't exist
// await sql.unsafe(reportDetectionSchema.createTableQuery);
// app.log.info("Report Detections table verified / created successfully");

await app.register(helmet);
await app.register(formbody);
await app.register(cookie, {
  secret: app.config.COOKIE_SECRET || "default_cookie_secret_hackathon",
});
await app.register(jwt, {
  secret: app.config.JWT_SECRET,
});
await app.register(multipart, {
  limits: {
    files: 1,
    fileSize: 10 * 1024 * 1024,
  },
});

// Register User Routes under /api/v1/users
await app.register(userRoutes, { prefix: "/api/v1/users" });
await app.register(reportRoutes, { prefix: "/api/v1/createreport" });

app.get("/health", async () => {
  return {
    success: true,
    service: "RodeSence Backend",
    status: "Healthy",
    database: "Connected",
    s3: "Connected",
    ec2_ai: "Connected",
  };
});

export default app;
