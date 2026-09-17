import {
  registerUser,
  verifyEmail,
  resendVerificationOtp,
  loginUser,
  logoutUser,
  getUser,
  getCurrentUser,
  updateCurrentUser,
  deleteCurrentUser,
  getAllRegisteredUsers,
} from "../controllers/User.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../controllers/Admin.controller.js";
import { strictAuthRateLimitConfig } from "../services/rateLimitService.js";

const userRoutes = async (fastify, options) => {
  // Public routes with rate limiting protection
  fastify.post("/register", strictAuthRateLimitConfig, registerUser);
  fastify.post("/verify-email", strictAuthRateLimitConfig, verifyEmail);
  fastify.post("/resend-otp", strictAuthRateLimitConfig, resendVerificationOtp);
  fastify.post("/login", strictAuthRateLimitConfig, loginUser);
  fastify.post("/logout", { preHandler: [authenticate] }, logoutUser);

  // Authenticated current user routes
  fastify.get("/me", { preHandler: [authenticate] }, getCurrentUser);
  fastify.put("/me", { preHandler: [authenticate] }, updateCurrentUser);
  fastify.delete("/me", { preHandler: [authenticate] }, deleteCurrentUser);

  // Static user routes (must be placed before parametric /:userId)
  fastify.get(
    "/all",
    { preHandler: [authenticate, requireAdmin] },
    getAllRegisteredUsers,
  );

  // Parametric routes
  fastify.get(
    "/:userId",
    { preHandler: [authenticate, requireAdmin] },
    getUser,
  );
};

export default userRoutes;
