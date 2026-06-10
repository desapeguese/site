"use client";

import { AnimateIn } from "@/components/AnimateIn";
import { AdminAddItemButton } from "@/components/admin/AdminAddItemButton";
import { AdminSelectField } from "@/components/admin/AdminSelectField";
import { EditableCardToolbar } from "@/components/admin/EditableCardToolbar";
import { EditableText } from "@/components/admin/EditableText";
import { useAdminMode } from "@/context/AdminModeContext";
import { useLandingContent } from "@/context/LandingContentContext";
import { festivalApi } from "@/lib/api/festival-api";
import { STAT_BACKGROUND_OPTIONS, getMetadataString, mergeMetadata } from "@/lib/landing/admin-options";
import type { LandingItem, LandingSection } from "@/lib/landing/types";
import { cn } from "@/lib/utils";

export const StatisticsCard = ({ section, items }: { section?: LandingSection; items: LandingItem[] }) => {
  const { addItem, removeItem, replaceItem, replaceItems, replaceSection } = useLandingContent();
  const { accessToken, isAdmin } = useAdminMode();
  const orderedItems = [...items].sort((a, b) => a.sortOrder - b.sortOrder);
  const backgroundColor = getMetadataString(section?.metadata, "statsBackgroundColor", "bg-gradient-linear-card");
  const canAddMore = orderedItems.length < 5;

  async function swapSortOrder(index: number, direction: -1 | 1) {
    if (!accessToken) return;
    const current = orderedItems[index];
    const target = orderedItems[index + direction];
    if (!current || !target) return;

    const updatedItems = await Promise.all([
      festivalApi.updateItem(current.id, { sortOrder: target.sortOrder }, accessToken),
      festivalApi.updateItem(target.id, { sortOrder: current.sortOrder }, accessToken),
    ]);
    replaceItems(updatedItems);
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex justify-center">
        <AdminSelectField
          label="Fundo dos quantitativos"
          value={backgroundColor}
          options={STAT_BACKGROUND_OPTIONS}
          onChange={async (value, token) => {
            if (!section) return;
            const updatedSection = await festivalApi.updateSection(
              section.id,
              { metadata: mergeMetadata(section.metadata, { statsBackgroundColor: value }) },
              token
            );
            replaceSection(updatedSection);
          }}
        />
      </div>

      <AnimateIn>
        <div className={`w-full rounded-2xl p-4 shadow-elevated sm:p-5 md:p-6 lg:p-8 ${backgroundColor}`}>
          <div className="grid grid-cols-2 gap-4 text-center text-white sm:gap-6 md:grid-cols-5 lg:gap-8">
            {orderedItems.map((stat, index) => (
              <div key={stat.id} className={cn("relative flex flex-col gap-2", isAdmin && "pt-12")}>
                <EditableCardToolbar
                  onMoveUp={index > 0 ? () => swapSortOrder(index, -1) : undefined}
                  onMoveDown={index < orderedItems.length - 1 ? () => swapSortOrder(index, 1) : undefined}
                  onRemove={async () => {
                    if (!accessToken) return;
                    await festivalApi.removeItem(stat.id, accessToken);
                    removeItem(stat.id);
                  }}
                />
                <EditableText
                  value={stat.value ?? ""}
                  testId={`stat-value-${stat.key}`}
                  onSave={async (value, token) => {
                    const updatedItem = await festivalApi.updateItem(stat.id, { value }, token);
                    replaceItem(updatedItem);
                  }}
                >
                  {(text) => (
                    <span className="font-display text-2xl font-bold sm:text-3xl lg:heading-02-bold">{text}</span>
                  )}
                </EditableText>
                <EditableText
                  value={stat.title ?? ""}
                  onSave={async (value, token) => {
                    const updatedItem = await festivalApi.updateItem(stat.id, { title: value }, token);
                    replaceItem(updatedItem);
                  }}
                >
                  {(text) => <span className="body-paragraph-light">{text}</span>}
                </EditableText>
              </div>
            ))}
          </div>
        </div>
      </AnimateIn>

      <AdminAddItemButton
        label="Adicionar quantitativo"
        disabled={!canAddMore}
        disabledLabel="Limite de 5 quantitativos"
        className="self-center"
        onCreate={async (token) => {
          if (!section) return;
          const maxSortOrder = orderedItems.reduce((max, item) => Math.max(max, item.sortOrder), 9);
          const createdItem = await festivalApi.createItem(
            section.id,
            {
              key: `stat_${Date.now()}`,
              type: "stat",
              title: "novo indicador",
              value: "+0",
              sortOrder: maxSortOrder + 1,
            },
            token
          );
          addItem(section.id, createdItem);
        }}
      />
    </div>
  );
};
