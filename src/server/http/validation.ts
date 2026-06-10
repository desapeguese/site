import type { ZodSchema } from "zod";

export async function parseJsonBody<T>(request: Request, schema: ZodSchema<T>): Promise<T> {
  const body = await request.json().catch(() => null);
  return schema.parse(body);
}
