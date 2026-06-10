"use client";

import React from "react";
import type { LandingAsset, LandingItem, LandingPageContent, LandingSection } from "@/lib/landing/types";

type LandingContentContextValue = {
  content: LandingPageContent;
  replaceContent: (content: LandingPageContent) => void;
  replaceSection: (section: LandingSection) => void;
  replaceItem: (item: LandingItem) => void;
  replaceItems: (items: LandingItem[]) => void;
  addItem: (sectionId: string, item: LandingItem) => void;
  removeItem: (itemId: string) => void;
  replaceAsset: (asset: LandingAsset) => void;
};

const LandingContentContext = React.createContext<LandingContentContextValue | null>(null);

function bySortOrder<T extends { sortOrder: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder);
}

function replaceAssetInList(assets: LandingAsset[], updatedAsset: LandingAsset): LandingAsset[] {
  if (!assets.some((asset) => asset.id === updatedAsset.id)) return assets;
  return bySortOrder(assets.map((asset) => (asset.id === updatedAsset.id ? updatedAsset : asset)));
}

export function LandingContentProvider({
  initialContent,
  children,
}: {
  initialContent: LandingPageContent;
  children: React.ReactNode;
}) {
  const [content, setContent] = React.useState(initialContent);

  React.useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const replaceContent = React.useCallback((updatedContent: LandingPageContent) => {
    setContent(updatedContent);
  }, []);

  const replaceSection = React.useCallback((updatedSection: LandingSection) => {
    setContent((current) => ({
      ...current,
      sections: bySortOrder(
        current.sections.map((section) => (section.id === updatedSection.id ? updatedSection : section))
      ),
    }));
  }, []);

  const replaceItem = React.useCallback((updatedItem: LandingItem) => {
    setContent((current) => ({
      ...current,
      sections: current.sections.map((section) => ({
        ...section,
        items: bySortOrder(section.items.map((item) => (item.id === updatedItem.id ? updatedItem : item))),
      })),
    }));
  }, []);

  const replaceItems = React.useCallback((updatedItems: LandingItem[]) => {
    const updatedById = new Map(updatedItems.map((item) => [item.id, item]));

    setContent((current) => ({
      ...current,
      sections: current.sections.map((section) => ({
        ...section,
        items: bySortOrder(section.items.map((item) => updatedById.get(item.id) ?? item)),
      })),
    }));
  }, []);

  const addItem = React.useCallback((sectionId: string, createdItem: LandingItem) => {
    setContent((current) => ({
      ...current,
      sections: current.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: bySortOrder([...section.items.filter((item) => item.id !== createdItem.id), createdItem]),
            }
          : section
      ),
    }));
  }, []);

  const removeItem = React.useCallback((itemId: string) => {
    setContent((current) => ({
      ...current,
      sections: current.sections.map((section) => ({
        ...section,
        items: section.items.filter((item) => item.id !== itemId),
      })),
    }));
  }, []);

  const replaceAsset = React.useCallback((updatedAsset: LandingAsset) => {
    setContent((current) => ({
      ...current,
      assets: replaceAssetInList(current.assets, updatedAsset),
      sections: current.sections.map((section) => ({
        ...section,
        assets: replaceAssetInList(section.assets, updatedAsset),
        items: section.items.map((item) => ({
          ...item,
          assets: replaceAssetInList(item.assets, updatedAsset),
        })),
      })),
    }));
  }, []);

  const value = React.useMemo(
    () => ({
      content,
      replaceContent,
      replaceSection,
      replaceItem,
      replaceItems,
      addItem,
      removeItem,
      replaceAsset,
    }),
    [addItem, content, removeItem, replaceAsset, replaceContent, replaceItem, replaceItems, replaceSection]
  );

  return <LandingContentContext.Provider value={value}>{children}</LandingContentContext.Provider>;
}

export function useLandingContent() {
  const context = React.useContext(LandingContentContext);

  if (!context) {
    throw new Error("useLandingContent must be used inside LandingContentProvider.");
  }

  return context;
}

export function useOptionalLandingContent() {
  return React.useContext(LandingContentContext);
}
