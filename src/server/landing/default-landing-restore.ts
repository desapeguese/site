import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { DEFAULT_LANDING_CONTENT } from "./default-landing-content";
import { readFrontendAssetAsBase64 } from "./landing-assets";

function defaultMetadata(metadata: Record<string, unknown> | undefined) {
  return metadata === undefined ? Prisma.JsonNull : (metadata as Prisma.InputJsonValue);
}

export async function restoreDefaultLandingContent(): Promise<void> {
  await prisma.$transaction(
    async (tx) => {
      const page = await tx.landingPage.upsert({
        where: { slug: DEFAULT_LANDING_CONTENT.page.slug },
        update: {
          locale: DEFAULT_LANDING_CONTENT.page.locale,
          seoTitle: DEFAULT_LANDING_CONTENT.page.seoTitle,
          seoDescription: DEFAULT_LANDING_CONTENT.page.seoDescription,
          isActive: true,
        },
        create: {
          slug: DEFAULT_LANDING_CONTENT.page.slug,
          locale: DEFAULT_LANDING_CONTENT.page.locale,
          seoTitle: DEFAULT_LANDING_CONTENT.page.seoTitle,
          seoDescription: DEFAULT_LANDING_CONTENT.page.seoDescription,
          isActive: true,
        },
      });

      const defaultSectionKeys = DEFAULT_LANDING_CONTENT.sections.map((section) => section.key);

      await tx.landingSection.updateMany({
        where: {
          landingPageId: page.id,
          ...(defaultSectionKeys.length > 0 ? { key: { notIn: defaultSectionKeys } } : {}),
        },
        data: { isActive: false },
      });

      const defaultAssetKeys = DEFAULT_LANDING_CONTENT.sections.flatMap((section) =>
        section.assets.map((asset) => asset.key)
      );

      await tx.landingAsset.updateMany({
        where: {
          landingPageId: page.id,
          ...(defaultAssetKeys.length > 0 ? { key: { notIn: defaultAssetKeys } } : {}),
        },
        data: { isActive: false },
      });

      for (const sectionInput of DEFAULT_LANDING_CONTENT.sections) {
        const section = await tx.landingSection.upsert({
          where: {
            landingPageId_key: {
              landingPageId: page.id,
              key: sectionInput.key,
            },
          },
          update: {
            type: sectionInput.type,
            title: sectionInput.title ?? null,
            subtitle: sectionInput.subtitle ?? null,
            description: sectionInput.description ?? null,
            metadata: defaultMetadata(sectionInput.metadata),
            sortOrder: sectionInput.sortOrder,
            isActive: true,
          },
          create: {
            landingPageId: page.id,
            key: sectionInput.key,
            type: sectionInput.type,
            title: sectionInput.title ?? null,
            subtitle: sectionInput.subtitle ?? null,
            description: sectionInput.description ?? null,
            metadata: defaultMetadata(sectionInput.metadata),
            sortOrder: sectionInput.sortOrder,
            isActive: true,
          },
        });

        const defaultItemKeys = sectionInput.items.map((item) => item.key);

        await tx.landingItem.updateMany({
          where: {
            sectionId: section.id,
            ...(defaultItemKeys.length > 0 ? { key: { notIn: defaultItemKeys } } : {}),
          },
          data: { isActive: false },
        });

        for (const itemInput of sectionInput.items) {
          await tx.landingItem.upsert({
            where: {
              sectionId_key: {
                sectionId: section.id,
                key: itemInput.key,
              },
            },
            update: {
              type: itemInput.type,
              title: itemInput.title ?? null,
              subtitle: itemInput.subtitle ?? null,
              description: itemInput.description ?? null,
              value: itemInput.value ?? null,
              icon: itemInput.icon ?? null,
              color: itemInput.color ?? null,
              url: itemInput.url ?? null,
              metadata: defaultMetadata(itemInput.metadata),
              sortOrder: itemInput.sortOrder,
              isActive: true,
            },
            create: {
              sectionId: section.id,
              key: itemInput.key,
              type: itemInput.type,
              title: itemInput.title ?? null,
              subtitle: itemInput.subtitle ?? null,
              description: itemInput.description ?? null,
              value: itemInput.value ?? null,
              icon: itemInput.icon ?? null,
              color: itemInput.color ?? null,
              url: itemInput.url ?? null,
              metadata: defaultMetadata(itemInput.metadata),
              sortOrder: itemInput.sortOrder,
              isActive: true,
            },
          });
        }

        for (const assetInput of sectionInput.assets) {
          await tx.landingAsset.upsert({
            where: {
              landingPageId_key: {
                landingPageId: page.id,
                key: assetInput.key,
              },
            },
            update: {
              sectionId: section.id,
              itemId: null,
              type: assetInput.type,
              theme: assetInput.theme ?? null,
              fileName: assetInput.fileName,
              mimeType: assetInput.mimeType,
              base64Data: readFrontendAssetAsBase64(assetInput.sourcePath),
              altText: assetInput.altText,
              sortOrder: assetInput.sortOrder,
              isActive: true,
            },
            create: {
              landingPageId: page.id,
              sectionId: section.id,
              itemId: null,
              key: assetInput.key,
              type: assetInput.type,
              theme: assetInput.theme ?? null,
              fileName: assetInput.fileName,
              mimeType: assetInput.mimeType,
              base64Data: readFrontendAssetAsBase64(assetInput.sourcePath),
              altText: assetInput.altText,
              sortOrder: assetInput.sortOrder,
              isActive: true,
            },
          });
        }
      }
    },
    { timeout: 30_000 }
  );
}
