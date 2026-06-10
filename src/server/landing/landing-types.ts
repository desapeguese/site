export type LandingAssetPayload = {
  id: string;
  key: string;
  type: string;
  theme: string | null;
  fileName: string;
  mimeType: string;
  src: string;
  altText: string;
  sortOrder: number;
};

export type LandingItemPayload = {
  id: string;
  key: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  value: string | null;
  icon: string | null;
  color: string | null;
  url: string | null;
  metadata: Record<string, unknown> | null;
  sortOrder: number;
  assets: LandingAssetPayload[];
};

export type LandingSectionPayload = {
  id: string;
  key: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  metadata: Record<string, unknown> | null;
  sortOrder: number;
  items: LandingItemPayload[];
  assets: LandingAssetPayload[];
};

export type LandingPagePayload = {
  id: string;
  slug: string;
  locale: string;
  seoTitle: string;
  seoDescription: string;
  sections: LandingSectionPayload[];
  assets: LandingAssetPayload[];
};

export type UpdateLandingPageInput = {
  seoTitle?: string;
  seoDescription?: string;
  isActive?: boolean;
};

export type UpdateLandingSectionInput = {
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  metadata?: Record<string, unknown>;
  sortOrder?: number;
  isActive?: boolean;
};

export type CreateLandingItemInput = {
  key: string;
  type: string;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  value?: string | null;
  icon?: string | null;
  color?: string | null;
  url?: string | null;
  metadata?: Record<string, unknown>;
  sortOrder?: number;
  isActive?: boolean;
};

export type UpdateLandingItemInput = Omit<
  Partial<CreateLandingItemInput>,
  'key' | 'type'
>;

export type UpdateLandingAssetInput = {
  landingPageId?: string;
  sectionId?: string | null;
  itemId?: string | null;
  key?: string;
  type?: string;
  theme?: 'light' | 'dark' | null;
  fileName?: string;
  mimeType?: string;
  base64Data?: string;
  altText?: string;
  sortOrder?: number;
  isActive?: boolean;
};
