import { z } from "zod";

const booleanFromEnv = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const normalized = value.trim().toLowerCase();

  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no", "off", ""].includes(normalized)) {
    return false;
  }

  return value;
}, z.boolean());

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().optional(),
  DATABASE_REQUIRED: booleanFromEnv.optional().default(false),
  JWT_ACCESS_SECRET: z.string().min(1).default("dev-access-secret"),
  JWT_REFRESH_SECRET: z.string().min(1).default("dev-refresh-secret"),
  JWT_ACCESS_TTL: z.string().min(1).default("15m"),
  JWT_REFRESH_TTL: z.string().min(1).default("7d"),
  ENABLE_REQUEST_LOGGING: booleanFromEnv.optional().default(true),
  NEWSLETTER_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(5),
  NEWSLETTER_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
});

const env = envSchema.parse(process.env);

if (env.DATABASE_REQUIRED && !env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required when DATABASE_REQUIRED=true.");
}

export const serverEnv = env;
