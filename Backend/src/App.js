import Fastify from "fastify";
import env from "@fastify/env";
import helmet from "@fastify/helmet";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import formbody from "@fastify/formbody";
import cookie from "@fastify/cookie";
import jwt from "@fastify/jwt";
import multipart from "@fastify/multipart";
import { rateLimitConfig } from "./services/rateLimitService.js";

import { createDatabase } from "./db/postgres.js";
import userRoutes from "./routes/User.route.js";
import reportRoutes from "./routes/Report.route.js";
import workerRoutes from "./routes/Worker.route.js";
import adminRoutes from "./routes/Admin.route.js";
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
      ADMIN_BOOTSTRAP_NAME: { type: "string" },
      ADMIN_BOOTSTRAP_EMAIL: { type: "string" },
      ADMIN_BOOTSTRAP_PASSWORD: { type: "string" },
      ADMIN_CREATION_ENABLED: { type: "string", default: "false" },
    },
  },
});

const sql = createDatabase(app.config);
app.decorate("db", sql);
await sql`SELECT 1`;
app.log.info("Database connection established successfully");

await app.register(helmet);
await app.register(cors, {
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
});
await app.register(rateLimit, rateLimitConfig);
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
    fileSize: 100 * 1024 * 1024, // 100MB limit for image/video uploads
  },
});

// Register User Routes under /api/v1/users
await app.register(userRoutes, { prefix: "/api/v1/users" });
await app.register(reportRoutes, { prefix: "/api/v1/reports" });
await app.register(workerRoutes, { prefix: "/api/v1/workers" });
if (app.config.ADMIN_CREATION_ENABLED === "true") {
  app.log.warn("Temporary public admin creation route is enabled");
}
await app.register(adminRoutes, { prefix: "/api/v1/admin" });

app.get("/health", async (request, reply) => {
  let dbStatus = "Disconnected";
  try {
    await app.db`SELECT 1`;
    dbStatus = "Connected";
  } catch (error) {
    app.log.error({ error }, "Database health check failed");
  }

  const isHealthy = dbStatus === "Connected";
  return reply.status(isHealthy ? 200 : 503).send({
    success: isHealthy,
    service: "RodeSense Backend",
    status: isHealthy ? "Healthy" : "Degraded",
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

export default app;
