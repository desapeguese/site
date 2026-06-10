"use client";

import { AnimateIn } from "@/components/AnimateIn";
import { AdminAddItemButton } from "@/components/admin/AdminAddItemButton";
import { AdminSelectField } from "@/components/admin/AdminSelectField";
import { EditableCardToolbar } from "@/components/admin/EditableCardToolbar";
import { EditableText } from "@/components/admin/EditableText";
import { useAdminMode } from "@/context/AdminModeContext";
import { useLandingContent } from "@/context/LandingContentContext";
import { festivalApi } from "@/lib/api/festival-api";
import {
  CARD_ACCENT_OPTIONS,
  CARD_BACKGROUND_OPTIONS,
  LANDING_ICON_OPTIONS,
  getMetadataString,
  mergeMetadata,
} from "@/lib/landing/admin-options";
import { getLandingIcon } from "@/lib/landing/icon-map";
import { cn } from "@/lib/utils";
import type { LandingItem, LandingSection } from "@/lib/landing/types";

export const PillaresCards = ({ section, items }: { section?: LandingSection; items: LandingItem[] }) => {
  const { addItem, removeItem, replaceItem, replaceItems } = useLandingContent();
  const { accessToken } = useAdminMode();
  const orderedItems = [...items].sort((a, b) => a.sortOrder - b.sortOrder);
  const canAddMore = orderedItems.length < 5;

  async function updateItem(item: LandingItem, payload: Record<string, unknown>, token: string) {
    const updatedItem = await festivalApi.updateItem(item.id, payload, token);
    replaceItem(updatedItem);
  }

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
    <div className="flex w-full flex-col items-center gap-4">
      <div className="grid w-full grid-cols-1 items-stretch gap-3 text-start md:grid-cols-2 md:gap-4 lg:grid-cols-4">
        {orderedItems.map((card, index) => {
          const Icon = getLandingIcon(card.icon);
          const backgroundColor = getMetadataString(card.metadata, "backgroundColor", "bg-primary-10");
          const isDarkCard = backgroundColor !== "bg-primary-10";

          return (
            <AnimateIn key={card.id} delay={index * 80} className="h-full">
              <div
                className={cn(
                  "relative flex h-full flex-col gap-4 rounded-2xl p-4 shadow-card transition-all duration-300 hover:shadow-elevated sm:p-5 lg:p-6",
                  backgroundColor
                )}
              >
                <EditableCardToolbar
                  onMoveUp={index > 0 ? () => swapSortOrder(index, -1) : undefined}
                  onMoveDown={index < orderedItems.length - 1 ? () => swapSortOrder(index, 1) : undefined}
                  onRemove={async () => {
                    if (!accessToken) return;
                    await festivalApi.removeItem(card.id, accessToken);
                    removeItem(card.id);
                  }}
                />
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-md sm:h-16 sm:w-16 ${card.color ?? "bg-primary"}`}
                >
                  <Icon className="h-6 w-6 text-primary-foreground sm:h-8 sm:w-8" />
                </div>

                <div className="flex flex-grow flex-col gap-2">
                  <EditableText
                    value={card.title ?? ""}
                    onSave={(value, token) => updateItem(card, { title: value }, token)}
                  >
                    {(text) => (
                      <h3 className={cn("heading-05-bold", isDarkCard ? "text-white" : "text-foreground")}>{text}</h3>
                    )}
                  </EditableText>
                  <EditableText
                    value={card.description ?? ""}
                    multiline
                    onSave={(value, token) => updateItem(card, { description: value }, token)}
                  >
                    {(text) => (
                      <p className={cn("body-paragraph", isDarkCard ? "text-white/90" : "text-muted-foreground")}>
                        {text}
                      </p>
                    )}
                  </EditableText>
                </div>

                <div className="mt-auto grid w-full gap-3 [grid-template-columns:repeat(auto-fit,minmax(min(100%,12rem),1fr))]">
                  <AdminSelectField
                    label={`Ícone ${card.title ?? "card"}`}
                    value={card.icon ?? "Leaf"}
                    options={LANDING_ICON_OPTIONS}
                    onChange={(value, token) => updateItem(card, { icon: value }, token)}
                  />
                  <AdminSelectField
                    label={`Cor do ícone ${card.title ?? "card"}`}
                    value={card.color ?? "bg-primary"}
                    options={CARD_ACCENT_OPTIONS}
                    onChange={(value, token) => updateItem(card, { color: value }, token)}
                  />
                  <AdminSelectField
                    label={`Fundo ${card.title ?? "card"}`}
                    value={backgroundColor}
                    options={CARD_BACKGROUND_OPTIONS}
                    onChange={(value, token) =>
                      updateItem(card, { metadata: mergeMetadata(card.metadata, { backgroundColor: value }) }, token)
                    }
                  />
                </div>
              </div>
            </AnimateIn>
          );
        })}
      </div>

      <AdminAddItemButton
        label="Adicionar card de regeneração"
        disabled={!canAddMore}
        disabledLabel="Limite de 5 cards"
        onCreate={async (token) => {
          if (!section) return;
          const maxSortOrder = orderedItems.reduce((max, item) => Math.max(max, item.sortOrder), 0);
          const createdItem = await festivalApi.createItem(
            section.id,
            {
              key: `pillar_card_${Date.now()}`,
              type: "pillar_card",
              title: "Novo card",
              description: "Descrição do novo card",
              icon: "Leaf",
              color: "bg-espacos-verde-escuro",
              metadata: { backgroundColor: "bg-primary-10" },
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
