"use client";

import { useEffect, useState } from "react";
import { AnimateIn } from "@/components/AnimateIn";
import { EditableText } from "@/components/admin/EditableText";
import { AnimatePresence, motion } from "framer-motion";
import { MdOutlineEco } from "react-icons/md";
import Image from "next/image";
import { useLandingContent } from "@/context/LandingContentContext";
import { festivalApi } from "@/lib/api/festival-api";
import { getFallbackSection } from "@/lib/landing/default-content";
import type { LandingSection } from "@/lib/landing/types";

function bySortOrder<T extends { sortOrder: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder);
}

function isDataUrl(src: string): boolean {
  return src.startsWith("data:");
}

export const NossaMissao = ({ section }: { section?: LandingSection }) => {
  const { replaceSection } = useLandingContent();
  const activeSection = section ?? getFallbackSection("missao");
  const fallbackSection = getFallbackSection("missao");
  const odsItems = bySortOrder(activeSection?.items.filter((item) => item.type === "ods_logo") ?? []);
  const odsAssets = bySortOrder(activeSection?.assets.filter((asset) => asset.type === "image") ?? []);
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
    <div
      id="missao"
      className="relative flex flex-col items-center justify-center overflow-hidden px-4 py-12 text-center sm:px-6 md:px-8 md:py-16 lg:px-16 lg:py-20 xl:px-24 2xl:px-[14.375rem] 2xl:py-[5rem]"
    >
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

          <div className="absolute inset-0 z-[1] bg-black/40" />
        </div>
      )}

      <AnimateIn>
        <div className="w-full max-w-4xl rounded-3xl bg-espacos-roxo p-6 shadow-elevated sm:p-8 md:p-10 lg:p-12">
          <div className="flex flex-col items-center gap-6 text-white sm:gap-8 lg:gap-10">
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 sm:h-16 sm:w-16 lg:h-20 lg:w-20">
                <MdOutlineEco className="h-7 w-7 text-white sm:h-8 sm:w-8 lg:h-10 lg:w-10" />
              </div>
              <EditableText
                value={activeSection?.title ?? ""}
                onSave={(value, token) => updateSection({ title: value }, token)}
              >
                {(text) => (
                  <h2 className="heading-03-bold font-display-hero font-bold text-white 2xl:heading-02-bold">{text}</h2>
                )}
              </EditableText>
            </div>

            <EditableText
              value={activeSection?.description ?? ""}
              multiline
              onSave={(value, token) => updateSection({ description: value }, token)}
            >
              {(text) => <p className="body-title max-w-2xl leading-relaxed text-white">{text}</p>}
            </EditableText>

            <div className="flex flex-wrap justify-center gap-4 pt-4 sm:gap-6">
              {odsAssets.map((asset, index) => (
                <div
                  key={asset.id}
                  className="relative h-20 w-20 transition-transform duration-300 hover:scale-110 sm:h-24 sm:w-24"
                >
                  <Image
                    src={asset.src}
                    alt={asset.altText || `Logo ${odsItems[index]?.title}`}
                    fill
                    className="object-contain"
                    unoptimized={isDataUrl(asset.src)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </AnimateIn>
    </div>
  );
};
