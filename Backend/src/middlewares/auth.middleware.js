/**
 * Fastify Authentication Middleware
 * Supports both HTTP Bearer Authorization header and HTTP-only Cookie
 */
export const authenticate = async (request, reply) => {
  try {
    const token =
      request.cookies?.admin_token ||
      request.cookies?.worker_token ||
      request.cookies?.user_token ||
      request.cookies?.token ||
      (request.headers.authorization?.startsWith("Bearer ")
        ? request.headers.authorization.split(" ")[1]
        : null);

    if (!token) {
      return reply.status(401).send({
        success: false,
        error: "Unauthorized: Token missing",
      });
    }

    // Verify token with Fastify JWT
    const decoded = await request.server.jwt.verify(token);
    request.user = decoded;
  } catch (err) {
    request.log.error(err);
    return reply.status(401).send({
      success: false,
      error: "Unauthorized: Token invalid or expired",
    });
  }
};

export default authenticate;
