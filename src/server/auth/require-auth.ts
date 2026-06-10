import { prisma } from "@/server/db/prisma";
import { ApiError } from "@/server/http/api-error";
import { verifyAccessToken, type AuthRole } from "./token";

export async function requireAuth(request: Request, role?: AuthRole) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : null;

  if (!token) {
    throw new ApiError(401, "Unauthorized.");
  }

  const payload = await verifyAccessToken(token).catch(() => null);

  if (!payload) {
    throw new ApiError(401, "Unauthorized.");
  }

  if (role && payload.role !== role) {
    throw new ApiError(403, "Forbidden.");
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });

  if (!user || !user.isActive) {
    throw new ApiError(401, "Unauthorized.");
  }

  return user;
}
