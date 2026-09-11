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

const userRoutes = async (fastify, options) => {
  // Public routes
  fastify.post("/register", registerUser);
  fastify.post("/verify-email", verifyEmail);
  fastify.post("/resend-otp", resendVerificationOtp);
  fastify.post("/login", loginUser);
  fastify.post("/logout", { preHandler: [authenticate] }, logoutUser);

  // Authenticated current user routes
  fastify.get("/me", { preHandler: [authenticate] }, getCurrentUser);
  fastify.put("/me", { preHandler: [authenticate] }, updateCurrentUser);
  fastify.delete("/me", { preHandler: [authenticate] }, deleteCurrentUser);

  // Static user routes (must be placed before parametric /:userId)
  fastify.get("/all", getAllRegisteredUsers);

  // Parametric routes
  fastify.get("/:userId", getUser);
};

export default userRoutes;