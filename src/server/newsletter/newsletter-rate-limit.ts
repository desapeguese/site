import { serverEnv } from "@/server/config/env";
import { ApiError } from "@/server/http/api-error";

const attempts = new Map<string, number[]>();

export function assertNewsletterRateLimit(request: Request, email: string): void {
  const now = Date.now();
  const keys = [`ip:${getClientIp(request)}`, `email:${email.trim().toLowerCase()}`];

  for (const key of keys) {
    const recentAttempts = getRecentAttempts(key, now);

    if (recentAttempts.length >= serverEnv.NEWSLETTER_RATE_LIMIT_MAX) {
      throw new ApiError(
        429,
        "Muitas tentativas de inscrição na newsletter. Tente novamente em instantes."
      );
    }
  }

  for (const key of keys) {
    const recentAttempts = getRecentAttempts(key, now);
    recentAttempts.push(now);
    attempts.set(key, recentAttempts);
  }
}

function getRecentAttempts(key: string, now: number): number[] {
  return (attempts.get(key) ?? []).filter(
    (attemptTime) => now - attemptTime <= serverEnv.NEWSLETTER_RATE_LIMIT_WINDOW_MS
  );
}

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const firstForwardedIp = forwardedFor?.split(",")[0]?.trim();

  return firstForwardedIp || request.headers.get("x-real-ip") || "unknown";
}
