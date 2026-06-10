"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AnimateIn } from "@/components/AnimateIn";
import { EditableText } from "@/components/admin/EditableText";
import { useLandingContent } from "@/context/LandingContentContext";
import { festivalApi } from "@/lib/api/festival-api";
import { getFallbackSection } from "@/lib/landing/default-content";
import type { LandingSection } from "@/lib/landing/types";
import { Award, Scale } from "lucide-react";

function bySortOrder<T extends { sortOrder: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder);
}

export const ReconhecimentoLegal = ({ section }: { section?: LandingSection }) => {
  const { replaceSection } = useLandingContent();
  const activeSection = section ?? getFallbackSection("reconhecimento");
  const fallbackSection = getFallbackSection("reconhecimento");
  const backgrounds = bySortOrder(activeSection?.assets.filter((asset) => asset.type === "background") ?? []);
  const fallbackBackgrounds = bySortOrder(fallbackSection?.assets.filter((asset) => asset.type === "background") ?? []);
  const backgroundImages = backgrounds.length > 0 ? backgrounds : fallbackBackgrounds;
  const [currentImage, setCurrentImage] = useState(0);

  const updateSection = async (payload: Record<string, unknown>, token: string) => {
    if (!activeSection) return;
    const updatedSection = await festivalApi.updateSection(activeSection.id, payload, token);
    replaceSection(updatedSection);
  };

  useEffect(() => {
    if (backgroundImages.length === 0) return;

    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [backgroundImages.length]);

  return (
    <div className="relative flex min-h-[600px] flex-col items-center justify-center overflow-hidden px-4 py-12 text-center sm:px-6 md:px-8 md:py-16 lg:px-16 lg:py-20 xl:px-24 2xl:px-[14.375rem] 2xl:py-[5rem]">
      {backgroundImages[currentImage] && (
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={backgroundImages[currentImage].id}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 0.8, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0 bg-cover bg-center blur-sm filter"
              style={{
                backgroundImage: `url(${backgroundImages[currentImage].src})`,
              }}
            />
          </AnimatePresence>

          <div className="absolute inset-0 z-[1] bg-black/20" />
        </div>
      )}

      <AnimateIn>
        <div className="w-full max-w-4xl rounded-3xl bg-espacos-roxo p-6 shadow-elevated sm:p-8 md:p-10 lg:p-12">
          <div className="flex flex-col items-center gap-4 text-white sm:gap-5 lg:gap-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 sm:h-16 sm:w-16 lg:h-20 lg:w-20">
              <Scale className="h-7 w-7 text-white sm:h-8 sm:w-8 lg:h-10 lg:w-10" />
            </div>

            <EditableText
              value={activeSection?.title ?? ""}
              onSave={(value, token) => updateSection({ title: value }, token)}
            >
              {(text) => (
                <h2 className="heading-03-bold font-display-hero font-bold text-white 2xl:heading-02-bold">{text}</h2>
              )}
            </EditableText>

            {activeSection?.subtitle && (
              <div className="flex flex-wrap items-center justify-center gap-2 text-secondary-light">
                <Award className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                <EditableText
                  value={activeSection.subtitle}
                  onSave={(value, token) => updateSection({ subtitle: value }, token)}
                >
                  {(text) => <span className="heading-05-bold text-white">{text}</span>}
                </EditableText>
                <Award className="h-4 w-4 text-white sm:h-5 sm:w-5" />
              </div>
            )}

            <EditableText
              value={activeSection?.description ?? ""}
              multiline
              onSave={(value, token) => updateSection({ description: value }, token)}
            >
              {(text) => <p className="body-title max-w-2xl leading-relaxed text-white">{text}</p>}
            </EditableText>
          </div>
        </div>
      </AnimateIn>
    </div>
  );
};
