import { createHash, randomUUID } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { serverEnv } from "@/server/config/env";

export type AuthRole = "ADMIN" | "MEMBER";

export type AccessTokenPayload = {
  sub: string;
  email: string;
  name: string;
  role: AuthRole;
  type: "access";
};

export type RefreshTokenPayload = Omit<AccessTokenPayload, "type"> & {
  type: "refresh";
  jti: string;
};

const encoder = new TextEncoder();

export function generateTokenId(): string {
  return randomUUID();
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function parseDurationToMs(value: string): number {
  const match = /^(\d+)(ms|s|m|h|d)$/.exec(value);

  if (!match) {
    throw new Error(`Invalid duration: ${value}`);
  }

  const amount = Number(match[1]);
  const unit = match[2] as "ms" | "s" | "m" | "h" | "d";
  const multipliers = { ms: 1, s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };

  return amount * multipliers[unit];
}

export async function signAccessToken(payload: AccessTokenPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setExpirationTime(serverEnv.JWT_ACCESS_TTL)
    .sign(encoder.encode(serverEnv.JWT_ACCESS_SECRET));
}

export async function signRefreshToken(payload: RefreshTokenPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setExpirationTime(serverEnv.JWT_REFRESH_TTL)
    .sign(encoder.encode(serverEnv.JWT_REFRESH_SECRET));
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
  const { payload } = await jwtVerify(token, encoder.encode(serverEnv.JWT_ACCESS_SECRET));

  if (payload.type !== "access") {
    throw new Error("Invalid access token.");
  }

  return payload as AccessTokenPayload;
}

export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
  const { payload } = await jwtVerify(token, encoder.encode(serverEnv.JWT_REFRESH_SECRET));

  if (payload.type !== "refresh") {
    throw new Error("Invalid refresh token.");
  }

  return payload as RefreshTokenPayload;
}
