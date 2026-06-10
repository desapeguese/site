export type LandingAsset = {
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

export type LandingItem = {
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
  assets: LandingAsset[];
};

export type LandingSection = {
  id: string;
  key: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  metadata: Record<string, unknown> | null;
  sortOrder: number;
  items: LandingItem[];
  assets: LandingAsset[];
};

export type LandingPageContent = {
  id: string;
  slug: string;
  locale: string;
  seoTitle: string;
  seoDescription: string;
  sections: LandingSection[];
  assets: LandingAsset[];
};

export type LandingPageUpdateInput = Partial<{
  seoTitle: string;
  seoDescription: string;
  locale: string;
}>;

export type LandingSectionUpdateInput = Partial<{
  title: string | null;
  subtitle: string | null;
  description: string | null;
  metadata: Record<string, unknown>;
  sortOrder: number;
  isActive: boolean;
}>;

export type LandingItemInput = {
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

export type LandingItemUpdateInput = Partial<Omit<LandingItemInput, "key">>;

export type LandingAssetUpdateInput = Partial<{
  key: string;
  type: string;
  theme: string | null;
  fileName: string;
  mimeType: string;
  base64Data: string;
  altText: string;
  sortOrder: number;
  sectionId: string | null;
  itemId: string | null;
  isActive: boolean;
}>;
