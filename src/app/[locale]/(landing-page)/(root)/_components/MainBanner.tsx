"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { EditableImage } from "@/components/admin/EditableImage";
import { EditableText } from "@/components/admin/EditableText";
import { useAdminMode } from "@/context/AdminModeContext";
import { useLandingContent } from "@/context/LandingContentContext";
import { festivalApi } from "@/lib/api/festival-api";
import { getFallbackSection } from "@/lib/landing/default-content";
import type { LandingAsset, LandingSection } from "@/lib/landing/types";

function bySortOrder<T extends { sortOrder: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder);
}

function getMetadataText(metadata: Record<string, unknown> | null, key: string, fallback: string): string {
  const value = metadata?.[key];
  return typeof value === "string" ? value : fallback;
}

function isDataUrl(src: string): boolean {
  return src.startsWith("data:");
}

export const MainBanner = ({ section }: { section?: LandingSection }) => {
  const { replaceAsset, replaceSection } = useLandingContent();
  const fallbackHero = getFallbackSection("hero");
  const activeSection = section ?? fallbackHero;
  const fallbackAssets = fallbackHero?.assets ?? [];
  const sectionAssets = activeSection?.assets ?? [];
  const heroImages = bySortOrder(sectionAssets.filter((asset) => asset.type === "image"));
  const fallbackImages = bySortOrder(fallbackAssets.filter((asset) => asset.type === "image"));
  const imageAssets = heroImages.length > 0 ? heroImages : fallbackImages;
  const images = imageAssets.map((asset) => asset.src);
  const logoLight =
    sectionAssets.find((asset) => asset.key === "main_logo_light") ??
    fallbackAssets.find((asset) => asset.key === "main_logo_light");
  const logoDark =
    sectionAssets.find((asset) => asset.key === "main_logo_dark") ??
    fallbackAssets.find((asset) => asset.key === "main_logo_dark");
  const { resolvedTheme } = useTheme();
  const { isAdmin } = useAdminMode();
  const [mounted, setMounted] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const slider = scrollRef.current;
    if (!slider) return;

    let isDown = false;
    let startX: number;
    let scrollLeft: number;

    const handleMouseDown = (event: globalThis.MouseEvent) => {
      isDown = true;
      slider.classList.add("active");
      startX = event.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    };

    const handleMouseLeave = () => {
      isDown = false;
    };

    const handleMouseUp = () => {
      isDown = false;
    };

    const handleMouseMove = (event: globalThis.MouseEvent) => {
      if (!isDown) return;
      event.preventDefault();
      const x = event.pageX - slider.offsetLeft;
      const walk = (x - startX) * 2;
      slider.scrollLeft = scrollLeft - walk;
    };

    slider.addEventListener("mousedown", handleMouseDown);
    slider.addEventListener("mouseleave", handleMouseLeave);
    slider.addEventListener("mouseup", handleMouseUp);
    slider.addEventListener("mousemove", handleMouseMove);

    const interval = setInterval(() => {
      if (slider && selectedIndex === null && !isDown) {
        const { scrollLeft, scrollWidth, clientWidth } = slider;
        const maxScroll = scrollWidth - clientWidth;
        if (scrollLeft >= maxScroll - 10) {
          slider.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          slider.scrollBy({ left: 300, behavior: "smooth" });
        }
      }
    }, 4000);

    return () => {
      slider.removeEventListener("mousedown", handleMouseDown);
      slider.removeEventListener("mouseleave", handleMouseLeave);
      slider.removeEventListener("mouseup", handleMouseUp);
      slider.removeEventListener("mousemove", handleMouseMove);
      clearInterval(interval);
    };
  }, [selectedIndex]);

  if (!mounted || images.length === 0) return null;

  const nextImage = (event?: MouseEvent) => {
    event?.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % images.length);
    }
  };

  const prevImage = (event?: MouseEvent) => {
    event?.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + images.length) % images.length);
    }
  };

  const logo = resolvedTheme === "dark" ? logoDark : logoLight;
  const logoSrc = logo?.src ?? logoLight?.src ?? logoDark?.src;
  const helperText = getMetadataText(
    activeSection?.metadata ?? null,
    "helperText",
    "Autoplay Ativo • Clique para expandir"
  );
  const updateSection = async (payload: Record<string, unknown>, token: string) => {
    if (!activeSection) return;
    const updatedSection = await festivalApi.updateSection(activeSection.id, payload, token);
    replaceSection(updatedSection);
  };

  return (
    <section className="relative flex min-h-screen w-full flex-col items-center bg-background px-4 pb-20 pt-12 transition-colors duration-500 md:px-10">
      {logoSrc && (
        <EditableImage
          testId="hero-logo"
          onSave={async (payload, token) => {
            if (!logo) return;
            const updatedAsset = await festivalApi.updateAsset(logo.id, payload, token);
            replaceAsset(updatedAsset);
          }}
        >
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-3">
            <Image
              src={logoSrc}
              alt={logo?.altText ?? "Logo Festival Desapegue-se"}
              width={280}
              height={80}
              className="h-auto object-contain"
              priority
              unoptimized={isDataUrl(logoSrc)}
            />
          </motion.div>
        </EditableImage>
      )}

      <div className="container mx-auto mb-12 max-w-5xl text-center">
        <EditableText
          value={activeSection?.title ?? "Festival Desapegue-se"}
          testId="hero-title"
          onSave={(value, token) => updateSection({ title: value }, token)}
        >
          {(text) => (
            <motion.h1 className="mb-16 break-words text-5xl font-black leading-tight tracking-tighter text-primary sm:text-6xl md:text-8xl">
              {text}
            </motion.h1>
          )}
        </EditableText>
        <EditableText
          value={activeSection?.description ?? ""}
          testId="hero-description"
          multiline
          onSave={(value, token) => updateSection({ description: value }, token)}
        >
          {(text) => (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mx-auto max-w-2xl text-lg font-light leading-relaxed text-muted-foreground md:text-2xl"
            >
              {text}
            </motion.p>
          )}
        </EditableText>
      </div>

      <div className="group mx-auto w-full max-w-[1400px]">
        <div
          ref={scrollRef}
          tabIndex={0}
          aria-label="Carrossel de imagens do festival"
          className="flex cursor-grab select-none gap-4 overflow-x-auto pb-8 snap-x snap-mandatory active:cursor-grabbing
            [&::-webkit-scrollbar]:h-2
            [&::-webkit-scrollbar-track]:rounded-full
            [&::-webkit-scrollbar-track]:bg-black/5
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-espacos-magenta
            [scrollbar-color:bg-espacos-magenta]
            [scrollbar-width:thin]"
        >
          {imageAssets.map((asset: LandingAsset, index) => (
            <motion.div
              key={asset.id}
              whileHover={isAdmin ? undefined : { y: -10 }}
              onClick={() => {
                if (!isAdmin) setSelectedIndex(index);
              }}
              className="relative h-[350px] min-w-[260px] shrink-0 scroll-mt-32 cursor-pointer select-none overflow-hidden rounded-[1.5rem] border border-border/40 shadow-[0px_10px_5px_-0px_rgba(219,39,119,0.5)] snap-center md:h-[500px] md:min-w-[400px]"
            >
              <EditableImage
                className="absolute inset-0"
                testId={`hero-image-${index}`}
                onSave={async (payload, token) => {
                  const updatedAsset = await festivalApi.updateAsset(asset.id, { ...payload, theme: null }, token);
                  replaceAsset(updatedAsset);
                }}
              >
                <Image
                  src={asset.src}
                  fill
                  className="pointer-events-none object-cover transition-transform duration-700 hover:scale-105"
                  alt={asset.altText}
                  draggable={false}
                  unoptimized={isDataUrl(asset.src)}
                />
              </EditableImage>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </motion.div>
          ))}
        </div>

        <div className="mt-4 flex justify-center">
          <span className="animate-pulse text-xs font-black uppercase tracking-[0.2em] text-foreground">
            {helperText}
          </span>
        </div>
      </div>

      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm"
            data-testid="hero-lightbox"
            onClick={() => setSelectedIndex(null)}
          >
            <button className="absolute right-6 top-6 z-[110] text-white/70 hover:text-white">
              <X size={48} strokeWidth={1.5} />
            </button>

            <button
              onClick={prevImage}
              className="absolute left-4 z-[110] text-white/50 transition-colors hover:text-white md:left-10"
            >
              <ChevronLeft size={60} strokeWidth={1} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 z-[110] text-white/50 transition-colors hover:text-white md:right-10"
            >
              <ChevronRight size={60} strokeWidth={1} />
            </button>

            <motion.div
              key={selectedIndex}
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className="relative aspect-[4/3] w-full max-w-6xl md:aspect-video"
            >
              <Image
                src={images[selectedIndex]}
                fill
                className="object-contain"
                alt={imageAssets[selectedIndex]?.altText ?? "Imagem expandida"}
                unoptimized={isDataUrl(images[selectedIndex])}
              />
            </motion.div>

            <div className="absolute bottom-10 font-mono text-sm tracking-widest text-white/60">
              {selectedIndex + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
