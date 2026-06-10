import type { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { ApiError } from "@/server/http/api-error";
import {
  CreateLandingItemInput,
  LandingAssetPayload,
  LandingItemPayload,
  LandingPagePayload,
  LandingSectionPayload,
  UpdateLandingAssetInput,
  UpdateLandingItemInput,
  UpdateLandingPageInput,
  UpdateLandingSectionInput,
} from "./landing-types";
import { normalizeBase64Image } from "./landing-assets";
import { restoreDefaultLandingContent } from "./default-landing-restore";

type LandingAssetRecord = {
  id: string;
  key: string;
  type: string;
  theme: string | null;
  fileName: string;
  mimeType: string;
  base64Data: string;
  altText: string;
  sortOrder: number;
};

type LandingItemRecord = {
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
  metadata: unknown;
  sortOrder: number;
  assets: LandingAssetRecord[];
};

type LandingSectionRecord = {
  id: string;
  key: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  metadata: unknown;
  sortOrder: number;
  items: LandingItemRecord[];
  assets: LandingAssetRecord[];
};

type LandingPageRecord = {
  id: string;
  slug: string;
  locale: string;
  seoTitle: string;
  seoDescription: string;
  isActive: boolean;
  sections: LandingSectionRecord[];
  assets: LandingAssetRecord[];
};

const PAGE_ASSETS_INCLUDE = {
  where: { isActive: true, sectionId: null, itemId: null },
  orderBy: { sortOrder: "asc" as const },
};

const SECTION_ASSETS_INCLUDE = {
  where: { isActive: true, itemId: null },
  orderBy: { sortOrder: "asc" as const },
};

const ITEM_ASSETS_INCLUDE = {
  where: { isActive: true },
  orderBy: { sortOrder: "asc" as const },
};

const DEFAULT_PAGE_INCLUDE = {
  assets: PAGE_ASSETS_INCLUDE,
  sections: {
    where: { isActive: true },
    include: {
      assets: SECTION_ASSETS_INCLUDE,
      items: {
        where: { isActive: true },
        include: {
          assets: ITEM_ASSETS_INCLUDE,
        },
        orderBy: { sortOrder: "asc" as const },
      },
    },
    orderBy: { sortOrder: "asc" as const },
  },
};

function sortBySortOrder<T extends { sortOrder: number }>(records: T[]): T[] {
  return [...records].sort((left, right) => left.sortOrder - right.sortOrder);
}

function cleanNullableText(value: string | null | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return value.trim();
}

function cleanText(value: string): string {
  return value.trim();
}

function cleanMetadata(metadata: Record<string, unknown> | undefined): Prisma.InputJsonValue | undefined {
  return metadata as Prisma.InputJsonValue | undefined;
}

function mapMetadata(metadata: unknown): Record<string, unknown> | null {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }

  return metadata as Record<string, unknown>;
}

async function getDefaultPage(): Promise<LandingPagePayload> {
  const page = await prisma.landingPage.findUnique({
    where: { slug: "default" },
    include: DEFAULT_PAGE_INCLUDE,
  });

  if (!page || !page.isActive) {
    throw new ApiError(404, "Default landing page not found.");
  }

  return mapPage(page);
}

async function updateDefaultPage(input: UpdateLandingPageInput): Promise<LandingPagePayload> {
  await ensureDefaultPageExists();

  const page = await prisma.landingPage.update({
    where: { slug: "default" },
    data: {
      ...(input.seoTitle !== undefined ? { seoTitle: cleanText(input.seoTitle) } : {}),
      ...(input.seoDescription !== undefined ? { seoDescription: cleanText(input.seoDescription) } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    },
    include: DEFAULT_PAGE_INCLUDE,
  });

  return mapPage(page);
}

async function restoreDefaultPage(): Promise<LandingPagePayload> {
  await restoreDefaultLandingContent();
  return getDefaultPage();
}

async function updateSection(id: string, input: UpdateLandingSectionInput): Promise<LandingSectionPayload> {
  await ensureSectionExists(id);

  const section = await prisma.landingSection.update({
    where: { id },
    data: {
      ...(input.title !== undefined ? { title: cleanNullableText(input.title) } : {}),
      ...(input.subtitle !== undefined ? { subtitle: cleanNullableText(input.subtitle) } : {}),
      ...(input.description !== undefined ? { description: cleanNullableText(input.description) } : {}),
      ...(input.metadata !== undefined ? { metadata: cleanMetadata(input.metadata) } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    },
    include: {
      assets: SECTION_ASSETS_INCLUDE,
      items: {
        where: { isActive: true },
        include: {
          assets: ITEM_ASSETS_INCLUDE,
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  return mapSection(section);
}

async function createItem(sectionId: string, input: CreateLandingItemInput): Promise<LandingItemPayload> {
  await ensureSectionExists(sectionId);

  const item = await prisma.landingItem.create({
    data: {
      sectionId,
      key: cleanText(input.key),
      type: cleanText(input.type),
      title: cleanNullableText(input.title) ?? null,
      subtitle: cleanNullableText(input.subtitle) ?? null,
      description: cleanNullableText(input.description) ?? null,
      value: cleanNullableText(input.value) ?? null,
      icon: cleanNullableText(input.icon) ?? null,
      color: cleanNullableText(input.color) ?? null,
      url: cleanNullableText(input.url) ?? null,
      metadata: cleanMetadata(input.metadata),
      sortOrder: input.sortOrder ?? 0,
      isActive: input.isActive ?? true,
    },
    include: {
      assets: ITEM_ASSETS_INCLUDE,
    },
  });

  return mapItem(item);
}

async function updateItem(id: string, input: UpdateLandingItemInput): Promise<LandingItemPayload> {
  await ensureItemExists(id);

  const item = await prisma.landingItem.update({
    where: { id },
    data: {
      ...(input.title !== undefined ? { title: cleanNullableText(input.title) } : {}),
      ...(input.subtitle !== undefined ? { subtitle: cleanNullableText(input.subtitle) } : {}),
      ...(input.description !== undefined ? { description: cleanNullableText(input.description) } : {}),
      ...(input.value !== undefined ? { value: cleanNullableText(input.value) } : {}),
      ...(input.icon !== undefined ? { icon: cleanNullableText(input.icon) } : {}),
      ...(input.color !== undefined ? { color: cleanNullableText(input.color) } : {}),
      ...(input.url !== undefined ? { url: cleanNullableText(input.url) } : {}),
      ...(input.metadata !== undefined ? { metadata: cleanMetadata(input.metadata) } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    },
    include: {
      assets: ITEM_ASSETS_INCLUDE,
    },
  });

  return mapItem(item);
}

async function removeItem(id: string): Promise<void> {
  await ensureItemExists(id);
  await prisma.landingItem.update({
    where: { id },
    data: { isActive: false },
  });
}

async function updateAsset(id: string, input: UpdateLandingAssetInput): Promise<LandingAssetPayload> {
  const currentAsset = await ensureAssetExists(id);
  await validateAssetOwnership(input, currentAsset);

  const normalized =
    input.base64Data !== undefined
      ? normalizeBase64Image(input.base64Data, input.mimeType?.trim() ?? currentAsset.mimeType)
      : null;

  const asset = await prisma.landingAsset.update({
    where: { id },
    data: {
      ...(input.landingPageId !== undefined ? { landingPageId: input.landingPageId } : {}),
      ...(input.sectionId !== undefined ? { sectionId: input.sectionId } : {}),
      ...(input.itemId !== undefined ? { itemId: input.itemId } : {}),
      ...(input.key !== undefined ? { key: cleanText(input.key) } : {}),
      ...(input.type !== undefined ? { type: cleanText(input.type) } : {}),
      ...(input.theme !== undefined ? { theme: input.theme } : {}),
      ...(input.fileName !== undefined ? { fileName: cleanText(input.fileName) } : {}),
      ...(normalized
        ? {
            base64Data: normalized.base64Data,
            mimeType: normalized.mimeType,
          }
        : input.mimeType !== undefined
          ? { mimeType: cleanText(input.mimeType) }
          : {}),
      ...(input.altText !== undefined ? { altText: cleanText(input.altText) } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    },
  });

  return mapAsset(asset);
}

function mapPage(page: LandingPageRecord): LandingPagePayload {
  return {
    id: page.id,
    slug: page.slug,
    locale: page.locale,
    seoTitle: page.seoTitle,
    seoDescription: page.seoDescription,
    sections: sortBySortOrder(page.sections).map((section) => mapSection(section)),
    assets: sortBySortOrder(page.assets).map((asset) => mapAsset(asset)),
  };
}

function mapSection(section: LandingSectionRecord): LandingSectionPayload {
  return {
    id: section.id,
    key: section.key,
    type: section.type,
    title: section.title,
    subtitle: section.subtitle,
    description: section.description,
    metadata: mapMetadata(section.metadata),
    sortOrder: section.sortOrder,
    items: sortBySortOrder(section.items).map((item) => mapItem(item)),
    assets: sortBySortOrder(section.assets).map((asset) => mapAsset(asset)),
  };
}

function mapItem(item: LandingItemRecord): LandingItemPayload {
  return {
    id: item.id,
    key: item.key,
    type: item.type,
    title: item.title,
    subtitle: item.subtitle,
    description: item.description,
    value: item.value,
    icon: item.icon,
    color: item.color,
    url: item.url,
    metadata: mapMetadata(item.metadata),
    sortOrder: item.sortOrder,
    assets: sortBySortOrder(item.assets).map((asset) => mapAsset(asset)),
  };
}

function mapAsset(asset: LandingAssetRecord): LandingAssetPayload {
  return {
    id: asset.id,
    key: asset.key,
    type: asset.type,
    theme: asset.theme,
    fileName: asset.fileName,
    mimeType: asset.mimeType,
    src: `data:${asset.mimeType};base64,${asset.base64Data}`,
    altText: asset.altText,
    sortOrder: asset.sortOrder,
  };
}

async function ensureDefaultPageExists(): Promise<void> {
  const page = await prisma.landingPage.findUnique({
    where: { slug: "default" },
    select: { id: true },
  });

  if (!page) {
    throw new ApiError(404, "Default landing page not found.");
  }
}

async function ensureSectionExists(id: string): Promise<void> {
  const section = await prisma.landingSection.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!section) {
    throw new ApiError(404, "Landing section not found.");
  }
}

async function ensureItemExists(id: string): Promise<void> {
  const item = await prisma.landingItem.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!item) {
    throw new ApiError(404, "Landing item not found.");
  }
}

async function ensureAssetExists(id: string): Promise<{
  id: string;
  landingPageId: string;
  sectionId: string | null;
  itemId: string | null;
  mimeType: string;
}> {
  const asset = await prisma.landingAsset.findUnique({
    where: { id },
    select: {
      id: true,
      landingPageId: true,
      sectionId: true,
      itemId: true,
      mimeType: true,
    },
  });

  if (!asset) {
    throw new ApiError(404, "Landing asset not found.");
  }

  return asset;
}

async function validateAssetOwnership(
  input: {
    landingPageId?: string;
    sectionId?: string | null;
    itemId?: string | null;
  },
  currentAsset: {
    landingPageId: string;
    sectionId: string | null;
    itemId: string | null;
  }
): Promise<void> {
  const landingPageId = input.landingPageId !== undefined ? input.landingPageId : currentAsset.landingPageId;
  const sectionId = input.sectionId !== undefined ? input.sectionId : currentAsset.sectionId;
  const itemId = input.itemId !== undefined ? input.itemId : currentAsset.itemId;

  if (!sectionId && !itemId) {
    if (input.landingPageId !== undefined) {
      await ensureAssetLandingPageExists(landingPageId);
    }

    return;
  }

  let selectedSectionId = sectionId;

  if (sectionId) {
    const section = await prisma.landingSection.findUnique({
      where: { id: sectionId },
      select: { landingPageId: true },
    });

    if (!section || section.landingPageId !== landingPageId) {
      throw new ApiError(400, "Asset section must belong to the landing page.");
    }
  }

  if (itemId) {
    const item = await prisma.landingItem.findUnique({
      where: { id: itemId },
      select: {
        sectionId: true,
        section: { select: { landingPageId: true } },
      },
    });

    if (!item || item.section.landingPageId !== landingPageId) {
      throw new ApiError(400, "Asset item must belong to the landing page.");
    }

    selectedSectionId ??= item.sectionId;

    if (selectedSectionId !== item.sectionId) {
      throw new ApiError(400, "Asset item must belong to the selected section.");
    }
  }
}

async function ensureAssetLandingPageExists(landingPageId: string): Promise<void> {
  const page = await prisma.landingPage.findUnique({
    where: { id: landingPageId },
    select: { id: true },
  });

  if (!page) {
    throw new ApiError(400, "Asset landing page must exist.");
  }
}

export const landingService = {
  getDefaultPage,
  updateDefaultPage,
  restoreDefaultPage,
  updateSection,
  createItem,
  updateItem,
  removeItem,
  updateAsset,
};
