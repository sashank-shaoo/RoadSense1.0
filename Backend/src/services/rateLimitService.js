/**
 * Rate Limiting Configuration & Service for Fastify
 * Uses @fastify/rate-limit to protect auth and resource-heavy endpoints.
 */

export const rateLimitConfig = {
  global: true,
  max: 100, // 100 requests per timeWindow globally
  timeWindow: 60 * 1000, // 1 minute
  allowList: ["127.0.0.1", "localhost"],
  errorResponseBuilder: (request, context) => {
    return {
      success: false,
      statusCode: 429,
      error: "Too Many Requests",
      message: `Rate limit exceeded. You can only make ${context.max} requests per ${context.after}. Please try again later.`,
    };
  },
};

/**
 * Stricter rate limit config for sensitive authentication & OTP endpoints
 * e.g., login, email verification OTP, resend OTP
 */
export const strictAuthRateLimitConfig = {
  config: {
    rateLimit: {
      max: 10, // 10 attempts per minute
      timeWindow: 60 * 1000,
      errorResponseBuilder: () => ({
        success: false,
        statusCode: 429,
        error: "Too Many Requests",
        message: "Too many attempts from this IP. Please wait a minute before trying again.",
      }),
    },
  },
};

export default rateLimitConfig;
