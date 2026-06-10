"use client";

import { EditableText } from "@/components/admin/EditableText";
import { useLandingContent } from "@/context/LandingContentContext";
import { festivalApi } from "@/lib/api/festival-api";
import { getFallbackSection } from "@/lib/landing/default-content";
import type { LandingSection } from "@/lib/landing/types";
import { PillaresCards } from "./PillaresCards";
import { StatisticsCard } from "./StatisticsCard";

export const DesapegarParaRegenerar = ({ section }: { section?: LandingSection }) => {
  const { replaceSection } = useLandingContent();
  const activeSection = section ?? getFallbackSection("regenerar");
  const pillarCards = activeSection?.items.filter((item) => item.type === "pillar_card") ?? [];
  const stats = activeSection?.items.filter((item) => item.type === "stat") ?? [];

  const updateSection = async (payload: Record<string, unknown>, token: string) => {
    if (!activeSection) return;
    const updatedSection = await festivalApi.updateSection(activeSection.id, payload, token);
    replaceSection(updatedSection);
  };

  return (
    <div
      className="flex flex-col items-center justify-center gap-6 px-4 py-10 text-center sm:gap-8 sm:px-6 sm:py-12 md:gap-10 md:px-8 md:py-16 lg:gap-12 lg:px-16 lg:py-20 xl:gap-14 xl:px-24 xl:py-24 2xl:gap-16 2xl:px-[14.375rem] 2xl:py-[6rem]"
      data-testid="regenerar-section"
    >
      <div className="flex flex-col items-center justify-center gap-4 sm:gap-5 lg:gap-6">
        <EditableText
          value={activeSection?.title ?? ""}
          onSave={(value, token) => updateSection({ title: value }, token)}
        >
          {(text) => (
            <span className="font-display-hero text-4xl font-bold text-foreground lg:text-5xl xl:display-02 2xl:display-02">
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

      <PillaresCards section={activeSection} items={pillarCards} />
      <StatisticsCard section={activeSection} items={stats} />
    </div>
  );
};
