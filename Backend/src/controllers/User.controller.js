import {
  createUser,
  findUserByEmail,
  findUserbyId,
  updateUser,
  deleteUser,
  getAllUsers,
  saveVerificationToken,
  verifyUserEmail,
} from "../dao/UserDao.js";
import {
  userCreateSchema,
  userUpdateSchema,
  userLoginSchema,
} from "../zod/UserSchema.js";
import argon2 from "argon2";
import { sendOtpEmail } from "../services/emailService.js";

const verificationCookieOptions = (req) => ({
  path: "/api/v1/users",
  httpOnly: true,
  secure: req.server.config.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 10 * 60 * 1000,
});

const getPendingVerification = async (req) => {
  const pendingToken = req.cookies?.verification_pending;
  if (!pendingToken) {
    return null;
  }

  try {
    const pending = await req.server.jwt.verify(pendingToken);
    if (pending.purpose !== "email_verification" || !pending.email) {
      return null;
    }
    return pending;
  } catch {
    return null;
  }
};

export const registerUser = async (req, res) => {
  try {
    const userData = req.body;

    const validationResult = userCreateSchema.safeParse(userData);
    if (!validationResult.success) {
      return res.status(400).send({ error: validationResult.error.issues });
    }

    const existingUser = await findUserByEmail(validationResult.data.email);
    if (existingUser) {
      return res.status(400).send({ error: "Email already exists" });
    }

    // Hash password with Argon2id
    const hashedPassword = await argon2.hash(validationResult.data.password);

    const newUser = await createUser({
      name: validationResult.data.name,
      email: validationResult.data.email,
      password_hash: hashedPassword,
      phone: validationResult.data.phone,
      date_of_birth: validationResult.data.date_of_birth,
      occupation: validationResult.data.occupation,
      bio: validationResult.data.bio,
    });

    // Generate 6-digit verification OTP (valid for 10 minutes)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await saveVerificationToken(newUser.email, otp, expiresAt);

    // Send OTP email asynchronously via Brevo HTTP API
    sendOtpEmail(newUser.email, otp, newUser.name, req.server.config).catch(
      (emailErr) => {
        req.log.error(`Email sending error: ${emailErr.message}`);
      },
    );

    const pendingToken = req.server.jwt.sign(
      { email: newUser.email, purpose: "email_verification" },
      { expiresIn: "10m" },
    );

    res.setCookie(
      "verification_pending",
      pendingToken,
      verificationCookieOptions(req),
    );

    return res.status(201).send({
      message:
        "Registration successful! Please check your email for the verification code.",
      user: newUser,
      verification_sent: true,
      verification_required: true,
      verification_endpoint: "/api/v1/users/verify-email",
    });
  } catch (error) {
    req.log.error(error);
    return res
      .status(500)
      .send({ error: "Registration failed. Please try again." });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).send({ error: "Email and OTP are required" });
    }

    const pendingVerification = await getPendingVerification(req);
    if (!pendingVerification) {
      return res.status(403).send({
        error: "Registration is required before email verification",
      });
    }

    if (pendingVerification.email !== email) {
      return res.status(403).send({
        error: "Verification email does not match the registration session",
      });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    if (user.is_varified_email) {
      return res.status(400).send({ message: "Email is already verified" });
    }

    if (!user.varification_token || user.varification_token !== otp.trim()) {
      return res.status(400).send({ error: "Invalid verification code" });
    }

    if (new Date() > new Date(user.varification_token_expires_at)) {
      return res.status(400).send({
        error: "Verification code has expired. Please request a new one.",
      });
    }

    const verifiedUser = await verifyUserEmail(email);
    const token = req.server.jwt.sign(
      {
        id: verifiedUser.id,
        email: verifiedUser.email,
        role: verifiedUser.role,
      },
      { expiresIn: "7d" },
    );

    res.setCookie("user_token", token, {
      path: "/",
      httpOnly: true,
      secure: req.server.config.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.clearCookie("verification_pending", { path: "/api/v1/users" });

    return res.status(200).send({
      message: "Email verified successfully!",
      user: verifiedUser,
      token,
    });
  } catch (error) {
    req.log.error(error);
    return res
      .status(500)
      .send({ error: "Verification failed. Please try again." });
  }
};

export const resendVerificationOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).send({ error: "Email is required" });
    }

    const pendingVerification = await getPendingVerification(req);
    if (!pendingVerification || pendingVerification.email !== email) {
      return res.status(403).send({
        error: "Registration is required before requesting a verification code",
      });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    if (user.is_varified_email) {
      return res.status(400).send({ message: "Email is already verified" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await saveVerificationToken(email, otp, expiresAt);

    await sendOtpEmail(email, otp, user.name, req.server.config);

    return res.status(200).send({
      message:
        "Verification code resent successfully. Please check your email.",
    });
  } catch (error) {
    req.log.error(error);
    return res
      .status(500)
      .send({ error: "Failed to resend verification code" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const loginData = req.body;
    const validationResult = userLoginSchema.safeParse(loginData);
    if (!validationResult.success) {
      return res.status(400).send({ error: validationResult.error.issues });
    }

    const user = await findUserByEmail(validationResult.data.email);
    if (!user) {
      return res.status(400).send({ error: "Invalid email or password" });
    }

    const isPasswordValid = await argon2.verify(
      user.password_hash,
      validationResult.data.password,
    );

    if (!isPasswordValid) {
      return res.status(400).send({ error: "Invalid email or password" });
    }

    if (!user.is_varified_email) {
      return res.status(403).send({
        error: "Please verify your email before logging in",
        verification_required: true,
      });
    }

    const token = req.server.jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      { expiresIn: "7d" },
    );

    res.setCookie("user_token", token, {
      path: "/",
      httpOnly: true,
      secure: req.server.config.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Exclude sensitive hash before sending response
    const { password_hash, refresh_token_hash, ...safeUser } = user;

    return res.status(200).send({
      message: "Login successful",
      user: safeUser,
      token,
    });
  } catch (error) {
    req.log.error(error);
    return res.status(500).send({ error: "Login failed. Please try again." });
  }
};

export const logoutUser = async (req, res) => {
  res.clearCookie("user_token", {
    path: "/",
    httpOnly: true,
    secure: req.server.config.NODE_ENV === "production",
    sameSite: "strict",
  });
  return res.status(200).send({ message: "Logout successful" });
};

export const getUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).send({ error: "User ID required" });
    }

    const user = await findUserbyId(userId);
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    const { password_hash, refresh_token_hash, ...safeUser } = user;
    return res.status(200).send({ user: safeUser });
  } catch (error) {
    req.log.error(error);
    return res.status(500).send({ error: "Failed to fetch user" });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).send({ error: "Unauthorized access" });
    }

    const currentUser = await findUserbyId(userId);
    if (!currentUser) {
      return res.status(404).send({ error: "Current user not found" });
    }

    const { password_hash, refresh_token_hash, ...safeUser } = currentUser;
    return res.status(200).send({ user: safeUser });
  } catch (error) {
    req.log.error(error);
    return res.status(500).send({ error: "Failed to fetch current user" });
  }
};

export const updateCurrentUser = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).send({ error: "Unauthorized access" });
    }

    const updateData = req.body;
    const validationResult = userUpdateSchema.safeParse(updateData);
    if (!validationResult.success) {
      return res.status(400).send({ error: validationResult.error.issues });
    }

    const updatedUser = await updateUser(userId, validationResult.data);
    return res.status(200).send({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    req.log.error(error);
    return res.status(500).send({ error: "Failed to update current user" });
  }
};

export const deleteCurrentUser = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).send({ error: "Unauthorized access" });
    }

    await deleteUser(userId);
    res.clearCookie("user_token", { path: "/" });
    return res.status(200).send({ message: "User deleted successfully" });
  } catch (error) {
    req.log.error(error);
    return res.status(500).send({ error: "Failed to delete current user" });
  }
};

export const getAllRegisteredUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    return res.status(200).send({
      message: "Users fetched successfully",
      count: users.length,
      users,
    });
  } catch (error) {
    req.log.error(error);
    return res.status(500).send({ error: "Failed to fetch users" });
  }
};
