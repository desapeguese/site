import { z } from "zod";

export const createNewsletterSubscriptionSchema = z.strictObject({
  email: z.string().trim().email().max(180),
  source: z.string().trim().toLowerCase().regex(/^[a-z0-9_-]{1,80}$/).optional(),
});

export type CreateNewsletterSubscriptionInput = z.infer<typeof createNewsletterSubscriptionSchema>;
