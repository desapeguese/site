"use client";

import { EditableText } from "@/components/admin/EditableText";
import { useLandingContent } from "@/context/LandingContentContext";
import { festivalApi } from "@/lib/api/festival-api";
import { getFallbackSection } from "@/lib/landing/default-content";
import type { LandingSection } from "@/lib/landing/types";
import { TrajetoriaTimeline } from "./TrajetoriaTimeline";

export const NossaTragetoria = ({ section }: { section?: LandingSection }) => {
  const { replaceSection } = useLandingContent();
  const activeSection = section ?? getFallbackSection("trajetoria");
  const timelineItems = activeSection?.items.filter((item) => item.type === "timeline_event") ?? [];

  const updateSection = async (payload: Record<string, unknown>, token: string) => {
    if (!activeSection) return;
    const updatedSection = await festivalApi.updateSection(activeSection.id, payload, token);
    replaceSection(updatedSection);
  };

  return (
    <div
      id="sobre"
      className="flex flex-col items-center justify-center gap-8 px-4 py-12 text-center sm:px-6 md:gap-10 md:px-8 md:py-16 lg:gap-12 lg:px-16 lg:py-20 xl:px-24 2xl:gap-[3.5rem] 2xl:px-[14.375rem] 2xl:py-[5rem]"
    >
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

      <TrajetoriaTimeline items={timelineItems} />
    </div>
  );
};
