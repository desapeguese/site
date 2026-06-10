"use client";

import { AnimateIn } from "@/components/AnimateIn";
import { AdminAddItemButton } from "@/components/admin/AdminAddItemButton";
import { AdminColorField } from "@/components/admin/AdminColorField";
import { AdminSelectField } from "@/components/admin/AdminSelectField";
import { EditableCardToolbar } from "@/components/admin/EditableCardToolbar";
import { EditableText } from "@/components/admin/EditableText";
import { useAdminMode } from "@/context/AdminModeContext";
import { useLandingContent } from "@/context/LandingContentContext";
import { festivalApi } from "@/lib/api/festival-api";
import { LANDING_ICON_OPTIONS } from "@/lib/landing/admin-options";
import { getLandingIcon } from "@/lib/landing/icon-map";
import type { LandingItem, LandingSection } from "@/lib/landing/types";

export const CompromissosCards = ({ section, items }: { section?: LandingSection; items: LandingItem[] }) => {
  const { addItem, removeItem, replaceItem, replaceItems } = useLandingContent();
  const { accessToken, isAdmin } = useAdminMode();
  const orderedItems = [...items].sort((a, b) => a.sortOrder - b.sortOrder);

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
      <div
        className={
          isAdmin
            ? "grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
            : "grid w-full grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-4 lg:gap-6 xl:grid-cols-5 2xl:grid-cols-7"
        }
      >
        {orderedItems.map((compromisso, index) => {
          const Icon = getLandingIcon(compromisso.icon);

          return (
            <AnimateIn key={compromisso.id} delay={index * 60}>
              <div className="relative flex h-full min-w-0 flex-col items-center gap-4 rounded-[1rem] bg-card p-4 text-center 2xl:p-6">
                <EditableCardToolbar
                  onMoveUp={index > 0 ? () => swapSortOrder(index, -1) : undefined}
                  onMoveDown={index < orderedItems.length - 1 ? () => swapSortOrder(index, 1) : undefined}
                  onRemove={async () => {
                    if (!accessToken) return;
                    await festivalApi.removeItem(compromisso.id, accessToken);
                    removeItem(compromisso.id);
                  }}
                />
                <div
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full 2xl:h-16 2xl:w-16"
                  style={{ backgroundColor: compromisso.color ?? "#1B3226" }}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>

                <EditableText
                  value={compromisso.title ?? ""}
                  onSave={async (value, token) => {
                    const updatedItem = await festivalApi.updateItem(compromisso.id, { title: value }, token);
                    replaceItem(updatedItem);
                  }}
                >
                  {(text) => <span className="body-callout-medium text-sm text-foreground 2xl:text-base">{text}</span>}
                </EditableText>

                <div className="mt-auto grid w-full gap-3">
                  <AdminSelectField
                    label={`Ícone ${compromisso.title ?? "compromisso"}`}
                    value={compromisso.icon ?? "Leaf"}
                    options={LANDING_ICON_OPTIONS}
                    onChange={async (value, token) => {
                      const updatedItem = await festivalApi.updateItem(compromisso.id, { icon: value }, token);
                      replaceItem(updatedItem);
                    }}
                  />
                  <AdminColorField
                    label={`Cor ${compromisso.title ?? "compromisso"}`}
                    value={compromisso.color ?? "#1B3226"}
                    onChange={async (value, token) => {
                      const updatedItem = await festivalApi.updateItem(compromisso.id, { color: value }, token);
                      replaceItem(updatedItem);
                    }}
                  />
                </div>
              </div>
            </AnimateIn>
          );
        })}
      </div>

      <AdminAddItemButton
        label="Adicionar compromisso"
        onCreate={async (token) => {
          if (!section) return;
          const maxSortOrder = orderedItems.reduce((max, item) => Math.max(max, item.sortOrder), 0);
          const createdItem = await festivalApi.createItem(
            section.id,
            {
              key: `commitment_card_${Date.now()}`,
              type: "commitment_card",
              title: "Novo compromisso",
              icon: "Leaf",
              color: "#1B3226",
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
