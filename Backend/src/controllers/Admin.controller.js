import argon2 from "argon2";
import {
  createAdmin,
  findAdminByEmail,
  findAdminById,
} from "../dao/AdminDao.js";
import { getAllUsers } from "../dao/UserDao.js";
import { getAllWorkerGroups } from "../dao/WorkerDao.js";
import { adminCreateSchema, adminLoginSchema } from "../zod/AdminSchema.js";

const adminCookieOptions = (request) => ({
  path: "/",
  httpOnly: true,
  secure: request.server.config.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

export const requireAdmin = async (request, reply) => {
  if (!request.user?.admin || request.user.role !== "ADMIN") {
    return reply.status(403).send({
      success: false,
      error: "Administrator authentication required",
    });
  }
};

export const createAdminController = async (request, reply) => {
  try {
    const validationResult = adminCreateSchema.safeParse(request.body);
    if (!validationResult.success) {
      return reply.status(400).send({
        success: false,
        error: validationResult.error.issues,
      });
    }

    const { name, email, password } = validationResult.data;

    if (await findAdminByEmail(email)) {
      return reply.status(409).send({
        success: false,
        error: "Admin email already exists",
      });
    }

    const admin = await createAdmin({
      name,
      email,
      passwordHash: await argon2.hash(password),
    });

    return reply.status(201).send({
      success: true,
      message: "Admin created successfully",
      admin,
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      success: false,
      error: "Failed to create admin",
    });
  }
};

export const loginAdmin = async (request, reply) => {
  try {
    const validationResult = adminLoginSchema.safeParse(request.body);
    if (!validationResult.success) {
      return reply.status(400).send({
        success: false,
        error: validationResult.error.issues,
      });
    }

    const admin = await findAdminByEmail(validationResult.data.email);
    if (
      !admin ||
      !(await argon2.verify(
        admin.password_hash,
        validationResult.data.password,
      ))
    ) {
      return reply.status(401).send({
        success: false,
        error: "Invalid admin email or password",
      });
    }

    const token = request.server.jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        admin: true,
      },
      { expiresIn: "7d" },
    );

    reply.setCookie("admin_token", token, adminCookieOptions(request));
    return reply.status(200).send({
      success: true,
      message: "Admin login successful",
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
      token,
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      success: false,
      error: "Admin login failed",
    });
  }
};

export const logoutAdmin = async (request, reply) => {
  reply.clearCookie("admin_token", { path: "/" });
  return reply.status(200).send({
    success: true,
    message: "Admin logout successful",
  });
};

export const getAdminProfile = async (request, reply) => {
  try {
    const admin = await findAdminById(request.user.id);
    if (!admin) {
      return reply
        .status(404)
        .send({ success: false, error: "Admin not found" });
    }
    return reply.status(200).send({ success: true, admin });
  } catch (error) {
    request.log.error(error);
    return reply
      .status(500)
      .send({ success: false, error: "Failed to fetch admin profile" });
  }
};

export const getAllUsersForAdmin = async (request, reply) => {
  try {
    return reply
      .status(200)
      .send({ success: true, users: await getAllUsers() });
  } catch (error) {
    request.log.error(error);
    return reply
      .status(500)
      .send({ success: false, error: "Failed to fetch users" });
  }
};

export const getAllWorkerGroupsForAdmin = async (request, reply) => {
  try {
    return reply.status(200).send({
      success: true,
      worker_groups: await getAllWorkerGroups(),
    });
  } catch (error) {
    request.log.error(error);
    return reply
      .status(500)
      .send({ success: false, error: "Failed to fetch worker groups" });
  }
};

