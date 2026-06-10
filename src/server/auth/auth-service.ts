import type { Role, User } from "@prisma/client";
import { serverEnv } from "@/server/config/env";
import { prisma } from "@/server/db/prisma";
import { ApiError } from "@/server/http/api-error";
import { comparePassword, hashPassword } from "./password";
import {
  generateTokenId,
  hashToken,
  parseDurationToMs,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  type AuthRole,
} from "./token";
import type { LoginInput, RefreshTokenInput, RegisterInput } from "./auth-schemas";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
};

export type AuthTokensResponse = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: string;
  refreshTokenExpiresIn: string;
  user: AuthUser;
};

function toAuthUser(user: Pick<User, "id" | "name" | "email" | "role">): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

function assertAuthRole(role: Role): AuthRole {
  return role;
}

async function register(input: RegisterInput): Promise<AuthTokensResponse> {
  const email = input.email.trim().toLowerCase();
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw new ApiError(409, "Email is already in use.");
  }

  const usersCount = await prisma.user.count();
  const role: AuthRole = usersCount === 0 ? "ADMIN" : "MEMBER";
  const user = await prisma.user.create({
    data: {
      name: input.name.trim(),
      email,
      passwordHash: await hashPassword(input.password),
      role,
      isActive: true,
    },
  });

  return issueSession(user);
}

async function login(input: LoginInput): Promise<AuthTokensResponse> {
  const user = await prisma.user.findUnique({
    where: { email: input.email.trim().toLowerCase() },
  });

  if (!user) {
    throw new ApiError(401, "Invalid credentials.");
  }

  if (!user.isActive) {
    throw new ApiError(401, "User is inactive.");
  }

  const passwordMatches = await comparePassword(input.password, user.passwordHash);

  if (!passwordMatches) {
    throw new ApiError(401, "Invalid credentials.");
  }

  return issueSession(user);
}

async function refresh(input: RefreshTokenInput): Promise<AuthTokensResponse> {
  const payload = await verifyRefreshToken(input.refreshToken).catch(() => null);

  if (!payload) {
    throw new ApiError(401, "Invalid refresh token.");
  }

  const storedToken = await prisma.refreshToken.findUnique({
    where: { jti: payload.jti },
    include: { user: true },
  });

  if (!storedToken || storedToken.userId !== payload.sub) {
    throw new ApiError(401, "Invalid refresh token.");
  }

  if (storedToken.revokedAt || storedToken.expiresAt < new Date()) {
    throw new ApiError(401, "Refresh token has expired or was revoked.");
  }

  if (storedToken.tokenHash !== hashToken(input.refreshToken)) {
    throw new ApiError(401, "Invalid refresh token.");
  }

  if (!storedToken.user.isActive) {
    throw new ApiError(401, "User is inactive.");
  }

  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { revokedAt: new Date() },
  });

  return issueSession(storedToken.user);
}

async function logout(input: RefreshTokenInput): Promise<{ message: string }> {
  const payload = await verifyRefreshToken(input.refreshToken).catch(() => null);

  if (payload) {
    await prisma.refreshToken.updateMany({
      where: {
        jti: payload.jti,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  return { message: "Session finished." };
}

async function me(userId: string): Promise<AuthUser> {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user || !user.isActive) {
    throw new ApiError(404, "User not found.");
  }

  return toAuthUser(user);
}

async function issueSession(user: User): Promise<AuthTokensResponse> {
  const authUser = toAuthUser(user);
  const role = assertAuthRole(user.role);
  const accessToken = await signAccessToken({
    sub: user.id,
    email: user.email,
    name: user.name,
    role,
    type: "access",
  });
  const refreshPayload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role,
    type: "refresh" as const,
    jti: generateTokenId(),
  };
  const refreshToken = await signRefreshToken(refreshPayload);

  await prisma.refreshToken.create({
    data: {
      jti: refreshPayload.jti,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + parseDurationToMs(serverEnv.JWT_REFRESH_TTL)),
      userId: user.id,
    },
  });

  return {
    accessToken,
    refreshToken,
    accessTokenExpiresIn: serverEnv.JWT_ACCESS_TTL,
    refreshTokenExpiresIn: serverEnv.JWT_REFRESH_TTL,
    user: authUser,
  };
}

export const authService = {
  register,
  login,
  refresh,
  logout,
  me,
};
