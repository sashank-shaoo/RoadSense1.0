import * as z from "zod";

export const bidReportIdSchema = z.string().uuid();
export const bidIdSchema = z.string().uuid();

export const placeBidBodySchema = z.object({
  amount: z.coerce
    .number({ invalid_type_error: "Bid amount must be a number" })
    .positive("Bid amount must be greater than 0")
    .max(10000000, "Bid amount exceeds maximum allowed limit"),
});

