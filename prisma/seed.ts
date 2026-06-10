import { Prisma, PrismaClient } from "@prisma/client";
import { loadEnvFile } from "node:process";
import { hashPassword } from "../src/server/auth/password";
import { DEFAULT_LANDING_CONTENT } from "../src/server/landing/default-landing-content";
import { readFrontendAssetAsBase64 } from "../src/server/landing/landing-assets";

loadEnvFile();

const prisma = new PrismaClient();

function seedMetadata(metadata: Record<string, unknown> | undefined) {
  return metadata === undefined ? Prisma.JsonNull : (metadata as Prisma.InputJsonValue);
}

async function seedUsers(): Promise<void> {
  await prisma.user.upsert({
    where: { email: "admin@festivaldesapeguese.com.br" },
    update: {
      name: "Administrador Festival Desapegue-se",
      role: "ADMIN",
      isActive: true,
    },
    create: {
      email: "admin@festivaldesapeguese.com.br",
      name: "Administrador Festival Desapegue-se",
      passwordHash: await hashPassword("Admin@2611"),
      role: "ADMIN",
      isActive: true,
    },
  });
}

async function seedLandingPage(): Promise<void> {
  const page = await prisma.landingPage.upsert({
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

  for (const sectionInput of DEFAULT_LANDING_CONTENT.sections) {
    const section = await prisma.landingSection.upsert({
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
        metadata: seedMetadata(sectionInput.metadata),
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
        metadata: seedMetadata(sectionInput.metadata),
        sortOrder: sectionInput.sortOrder,
        isActive: true,
      },
    });

    for (const itemInput of sectionInput.items) {
      await prisma.landingItem.upsert({
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
          metadata: seedMetadata(itemInput.metadata),
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
          metadata: seedMetadata(itemInput.metadata),
          sortOrder: itemInput.sortOrder,
          isActive: true,
        },
      });
    }

    for (const assetInput of sectionInput.assets) {
      await prisma.landingAsset.upsert({
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
}

async function main(): Promise<void> {
  console.log("Seeding database...");
  await seedUsers();
  await seedLandingPage();
  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
