import type { Metadata } from "next";

export function createDefaultMetadata(title: string, description: string, image?: string): Metadata {
  return {
    title,
    description,

    openGraph: {
      title,
      description,
      images: image ? [{ url: image }] : [],
    },

    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : [],
    },
  };
}
