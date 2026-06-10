"use client";

import { EditableText } from "@/components/admin/EditableText";
import { useLandingContent } from "@/context/LandingContentContext";
import { festivalApi } from "@/lib/api/festival-api";
import { getFallbackSection } from "@/lib/landing/default-content";
import type { LandingSection } from "@/lib/landing/types";
import { CompromissosCards } from "./CompromissosCards";

export const NossosCompromissos = ({ section }: { section?: LandingSection }) => {
  const { replaceSection } = useLandingContent();
  const activeSection = section ?? getFallbackSection("compromissos");
  const commitmentCards = activeSection?.items.filter((item) => item.type === "commitment_card") ?? [];

  const updateSection = async (payload: Record<string, unknown>, token: string) => {
    if (!activeSection) return;
    const updatedSection = await festivalApi.updateSection(activeSection.id, payload, token);
    replaceSection(updatedSection);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8 bg-primary-10 px-4 py-12 text-center sm:px-6 md:gap-10 md:px-8 md:py-16 lg:gap-12 lg:px-16 lg:py-20 xl:px-24 2xl:gap-[3.5rem] 2xl:px-[14.375rem] 2xl:py-[5rem]">
      <div className="flex flex-col items-center gap-4">
        <EditableText
          value={activeSection?.title ?? ""}
          onSave={(value, token) => updateSection({ title: value }, token)}
        >
          {(text) => (
            <span className="heading-03-bold font-display-hero font-bold text-foreground 2xl:heading-02-bold">
              {text}
            </span>
          )}
        </EditableText>
        <EditableText
          value={activeSection?.description ?? ""}
          multiline
          onSave={(value, token) => updateSection({ description: value }, token)}
        >
          {(text) => <span className="heading-05 max-w-[55.9375rem] text-muted-foreground">{text}</span>}
        </EditableText>
      </div>

      <CompromissosCards section={activeSection} items={commitmentCards} />
    </div>
  );
};
