import { LandingContentProvider } from "@/context/LandingContentContext";
import { DEFAULT_LANDING_PAGE_CONTENT } from "@/lib/landing/default-content";
import type { LandingPageContent } from "@/lib/landing/types";
import { landingService } from "@/server/landing/landing-service";
import { LandingContentClient } from "./LandingContentClient";

async function getLandingContent(): Promise<LandingPageContent> {
  try {
    return await landingService.getDefaultPage();
  } catch {
    return DEFAULT_LANDING_PAGE_CONTENT;
  }
}

export const PageContainer = async () => {
  const content = await getLandingContent();

  return (
    <LandingContentProvider initialContent={content}>
      <LandingContentClient />
    </LandingContentProvider>
  );
};
