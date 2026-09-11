import * as z from "zod";

export const reportLocationSchema = z.object({
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
});

export const reportCreateSchema = z.object({
  image_mime_type: z.enum(["image/jpeg", "image/png", "image/webp"]),
  original_filename: z.string().trim().min(1).max(255),
  s3_object_key: z.string().trim().min(1),
  file_size_bytes: z.number().int().positive(),
  location: reportLocationSchema,
});

export const reportStatusSchema = z.enum([
  "notStarted",
  "onGoing",
  "completed",
]);

export const reportProcessingStatusSchema = z.enum([
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
]);

export const reportDetectionSchema = z.object({
  class: z.string().trim().min(1).max(50),
  confidence: z.number().finite().min(0).max(1),
  bbox: z.array(z.number().finite()).length(4),
});

export const aiResponseSchema = z.object({
  count: z.number().int().nonnegative(),
  highest_severity: z.string().trim().min(1).max(50).nullable(),
  damage_score: z.number().finite(),
  detections: z.array(reportDetectionSchema),
  model_version: z.string().trim().max(100).optional(),
});

export const reportLocationConfirmationSchema = z.object({
  location: reportLocationSchema,
});
