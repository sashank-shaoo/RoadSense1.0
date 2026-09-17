import * as z from "zod";

export const adminCreateSchema = z.object({
  name: z.string().trim().min(2).max(255),
  email: z.string().trim().email(),
  password: z.string().min(6).max(255),
});

export const adminLoginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6).max(255),
});
