import { z } from 'zod';

const metadataSchema = z.record(z.string(), z.unknown()).optional();
const imageMimeTypeSchema = z.enum([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
]);

export const updateLandingPageSchema = z
  .strictObject({
    seoTitle: z.string().trim().min(1).max(180).optional(),
    seoDescription: z.string().trim().min(1).max(2000).optional(),
    isActive: z.boolean().optional(),
  })
  .refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be informed.',
  });

export const updateLandingSectionSchema = z
  .strictObject({
    title: z.string().trim().min(1).max(240).nullable().optional(),
    subtitle: z.string().trim().min(1).max(320).nullable().optional(),
    description: z.string().trim().min(1).max(4000).nullable().optional(),
    metadata: metadataSchema,
    sortOrder: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
  })
  .refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be informed.',
  });

export const createLandingItemSchema = z.strictObject({
  key: z.string().trim().min(1).max(100),
  type: z.string().trim().min(1).max(80),
  title: z.string().trim().min(1).max(240).nullable().optional(),
  subtitle: z.string().trim().min(1).max(320).nullable().optional(),
  description: z.string().trim().min(1).max(4000).nullable().optional(),
  value: z.string().trim().min(1).max(80).nullable().optional(),
  icon: z.string().trim().min(1).max(80).nullable().optional(),
  color: z.string().trim().min(1).max(80).nullable().optional(),
  url: z.string().trim().url().nullable().optional(),
  metadata: metadataSchema,
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const updateLandingItemSchema = createLandingItemSchema
  .omit({ key: true, type: true })
  .partial()
  .refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be informed.',
  });

export const upsertLandingAssetSchema = z
  .strictObject({
    landingPageId: z.string().uuid().optional(),
    sectionId: z.string().uuid().nullable().optional(),
    itemId: z.string().uuid().nullable().optional(),
    key: z.string().trim().min(1).max(120).optional(),
    type: z.string().trim().min(1).max(80).optional(),
    theme: z.enum(['light', 'dark']).nullable().optional(),
    fileName: z.string().trim().min(1).max(220).optional(),
    mimeType: imageMimeTypeSchema.optional(),
    base64Data: z.string().trim().min(1).max(8_000_000).optional(),
    altText: z.string().trim().min(1).max(240).optional(),
    sortOrder: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
  })
  .refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be informed.',
  });
