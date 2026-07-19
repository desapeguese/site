"use client";

import { AnimateIn } from "@/components/AnimateIn";
import { AdminAddItemButton } from "@/components/admin/AdminAddItemButton";
import { AdminLinkEditor } from "@/components/admin/AdminLinkEditor";
import { AdminSelectField } from "@/components/admin/AdminSelectField";
import { AdminToggleField } from "@/components/admin/AdminToggleField";
import { EditableCardToolbar } from "@/components/admin/EditableCardToolbar";
import { EditableText } from "@/components/admin/EditableText";
import { buttonVariants } from "@/components/ui/button";
import { useAdminMode } from "@/context/AdminModeContext";
import { useLandingContent } from "@/context/LandingContentContext";
import { festivalApi } from "@/lib/api/festival-api";
import {
  LANDING_ICON_OPTIONS,
  THEMATIC_SPACE_COLOR_OPTIONS,
  getMetadataBoolean,
  mergeMetadata,
} from "@/lib/landing/admin-options";
import { getFallbackSection } from "@/lib/landing/default-content";
import { getLandingIcon } from "@/lib/landing/icon-map";
import type { LandingItem, LandingSection } from "@/lib/landing/types";
import { cn } from "@/lib/utils";
import { Calendar, MapPin } from "lucide-react";
import Link from "next/link";

function isFeatured(item: LandingItem): boolean {
  return item.metadata !== null && typeof item.metadata === "object" && item.metadata.destaque === true;
}

function getThematicColor(color: string | null | undefined): string {
  return THEMATIC_SPACE_COLOR_OPTIONS.some((option) => option.value === color) ? color! : "bg-espacos-roxo";
}

export const JusticaClimatica = ({ section }: { section?: LandingSection }) => {
  const { addItem, removeItem, replaceItem, replaceItems, replaceSection } = useLandingContent();
  const { accessToken, isAdmin } = useAdminMode();
  const activeSection = section ?? getFallbackSection("programacao");
  const programEvents =
    activeSection?.items.filter((item) => item.type === "program_event").sort((a, b) => a.sortOrder - b.sortOrder) ??
    [];
  const thematicSpaces =
    activeSection?.items.filter((item) => item.type === "thematic_space").sort((a, b) => a.sortOrder - b.sortOrder) ??
    [];
  const ctaLink = activeSection?.items.find((item) => item.type === "cta_link");
  const ctaEnabled = getMetadataBoolean(ctaLink?.metadata, "ctaEnabled", true);

  const updateSection = async (payload: Record<string, unknown>, token: string) => {
    if (!activeSection) return;
    const updatedSection = await festivalApi.updateSection(activeSection.id, payload, token);
    replaceSection(updatedSection);
  };

  const updateItem = async (item: LandingItem, payload: Record<string, unknown>, token: string) => {
    const updatedItem = await festivalApi.updateItem(item.id, payload, token);
    replaceItem(updatedItem);
  };

  async function swapSortOrder(items: LandingItem[], index: number, direction: -1 | 1) {
    if (!accessToken) return;
    const current = items[index];
    const target = items[index + direction];
    if (!current || !target) return;

    const updatedItems = await Promise.all([
      festivalApi.updateItem(current.id, { sortOrder: target.sortOrder }, accessToken),
      festivalApi.updateItem(target.id, { sortOrder: current.sortOrder }, accessToken),
    ]);
    replaceItems(updatedItems);
  }

  return (
    <div
      id="programacao"
      className="flex flex-col items-center gap-10 bg-background px-4 py-12 sm:px-6 md:gap-12 md:px-8 md:py-16 lg:gap-14 lg:px-16 lg:py-20 xl:px-24 2xl:gap-16 2xl:px-[14.375rem] 2xl:py-[5rem]"
    >
      <div className="flex max-w-[55.9375rem] flex-col items-center gap-4 text-center">
        <EditableText
          value={activeSection?.title ?? ""}
          onSave={(value, token) => updateSection({ title: value }, token)}
        >
          {(text) => (
            <h2 className="heading-03-bold font-display-hero font-bold text-foreground 2xl:heading-02-bold">{text}</h2>
          )}
        </EditableText>
        <EditableText
          value={activeSection?.description ?? ""}
          multiline
          onSave={(value, token) => updateSection({ description: value }, token)}
        >
          {(text) => <p className="heading-05 text-muted-foreground">{text}</p>}
        </EditableText>
      </div>

      <div className="grid w-full grid-cols-1 items-stretch gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
        {programEvents.map((evento, index) => {
          const destaque = isFeatured(evento);

          return (
            <AnimateIn key={evento.id} delay={index * 70} className="h-full">
              <div
                className={`relative flex h-full flex-col gap-3 rounded-2xl px-5 py-5 shadow-card sm:px-6 sm:py-6 lg:px-7 lg:py-6 ${
                  destaque
                    ? "bg-gradient-linear-orange text-white"
                    : "border-l-4 border-primary bg-card dark:border-secondary"
                }`}
              >
                <EditableCardToolbar
                  onMoveUp={index > 0 ? () => swapSortOrder(programEvents, index, -1) : undefined}
                  onMoveDown={
                    index < programEvents.length - 1 ? () => swapSortOrder(programEvents, index, 1) : undefined
                  }
                  onRemove={async () => {
                    if (!accessToken) return;
                    await festivalApi.removeItem(evento.id, accessToken);
                    removeItem(evento.id);
                  }}
                />
                <div className="flex flex-col items-start gap-2">
                  <div className="flex gap-2">
                    <Calendar className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary dark:text-secondary" />
                    <EditableText
                      value={evento.value ?? ""}
                      onSave={(value, token) => updateItem(evento, { value }, token)}
                    >
                      {(text) => <span className="heading-05-bold text-primary dark:text-secondary">{text}</span>}
                    </EditableText>
                  </div>
                  <EditableText
                    value={evento.title ?? ""}
                    onSave={(value, token) => updateItem(evento, { title: value }, token)}
                  >
                    {(text) => (
                      <span className={`body-callout ${destaque ? "text-white" : "text-muted-foreground"}`}>
                        {text}
                      </span>
                    )}
                  </EditableText>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-start gap-2">
                    <MapPin className={`mt-0.5 h-4 w-4 flex-shrink-0 ${destaque ? "text-white" : "text-secondary"}`} />
                    <EditableText
                      value={evento.subtitle ?? ""}
                      onSave={(value, token) => updateItem(evento, { subtitle: value }, token)}
                    >
                      {(text) => (
                        <span className={`body-paragraph-medium ${destaque ? "text-white" : "text-foreground"}`}>
                          {text}
                        </span>
                      )}
                    </EditableText>
                  </div>
                  <EditableText
                    value={evento.description ?? ""}
                    multiline
                    onSave={(value, token) => updateItem(evento, { description: value }, token)}
                  >
                    {(text) => (
                      <span className={`body-callout ${destaque ? "text-white opacity-90" : "text-muted-foreground"}`}>
                        {text}
                      </span>
                    )}
                  </EditableText>
                </div>
              </div>
            </AnimateIn>
          );
        })}
      </div>

      <div className="flex w-full flex-col items-center gap-6 md:gap-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <h3 className="heading-03-bold font-display-hero text-foreground 2xl:heading-02-bold">Espaços Temáticos</h3>
          <p className="heading-05 text-muted-foreground">
            Mais de 20 atividades distribuídas em espaços especialmente preparados
          </p>
        </div>

        <div className="grid w-full grid-cols-1 items-stretch gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {thematicSpaces.map((espaco, index) => {
            const Icon = getLandingIcon(espaco.icon);
            const thematicColor = getThematicColor(espaco.color);

            return (
              <AnimateIn key={espaco.id} delay={index * 80} className="flex h-full w-full">
                <div
                  className={cn(
                    "relative flex h-full w-full flex-col gap-4 rounded-2xl p-6 text-white shadow-elevated lg:p-8",
                    thematicColor
                  )}
                >
                  <EditableCardToolbar
                    onMoveUp={index > 0 ? () => swapSortOrder(thematicSpaces, index, -1) : undefined}
                    onMoveDown={
                      index < thematicSpaces.length - 1 ? () => swapSortOrder(thematicSpaces, index, 1) : undefined
                    }
                    onRemove={async () => {
                      if (!accessToken) return;
                      await festivalApi.removeItem(espaco.id, accessToken);
                      removeItem(espaco.id);
                    }}
                  />
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-white/20">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <EditableText
                        value={espaco.title ?? ""}
                        onSave={(value, token) => updateItem(espaco, { title: value }, token)}
                      >
                        {(text) => <h4 className="heading-05-bold text-white">{text}</h4>}
                      </EditableText>
                      <EditableText
                        value={espaco.description ?? ""}
                        multiline
                        onSave={(value, token) => updateItem(espaco, { description: value }, token)}
                      >
                        {(text) => <p className="body-callout-light text-white/90">{text}</p>}
                      </EditableText>
                    </div>
                  </div>

                  {espaco.url && (
                    <Link
                      href={espaco.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto inline-flex w-fit items-center rounded-lg bg-white/15 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/25"
                    >
                      Acessar
                    </Link>
                  )}

                  <div className="mt-auto grid w-full gap-3 [grid-template-columns:repeat(auto-fit,minmax(min(100%,12rem),1fr))]">
                    <AdminSelectField
                      label={`Ícone ${espaco.title ?? "espaço"}`}
                      value={espaco.icon ?? "Leaf"}
                      options={LANDING_ICON_OPTIONS}
                      onChange={(value, token) => updateItem(espaco, { icon: value }, token)}
                    />
                    <AdminSelectField
                      label={`Cor ${espaco.title ?? "espaço"}`}
                      value={thematicColor}
                      options={THEMATIC_SPACE_COLOR_OPTIONS}
                      onChange={(value, token) => updateItem(espaco, { color: value }, token)}
                    />
                    <AdminLinkEditor
                      label={espaco.title ?? "Espaço temático"}
                      value={espaco.url}
                      onSave={(value, token) => updateItem(espaco, { url: value || null }, token)}
                    />
                  </div>
                </div>
              </AnimateIn>
            );
          })}
        </div>

        <AdminAddItemButton
          label="Adicionar espaço temático"
          onCreate={async (token) => {
            if (!activeSection) return;
            const maxSortOrder = thematicSpaces.reduce((max, item) => Math.max(max, item.sortOrder), 9);
            const createdItem = await festivalApi.createItem(
              activeSection.id,
              {
                key: `thematic_space_${Date.now()}`,
                type: "thematic_space",
                title: "Novo espaço",
                description: "Descrição do novo espaço temático",
                icon: "Leaf",
                color: "bg-espacos-verde-escuro",
                sortOrder: maxSortOrder + 1,
              },
              token
            );
            addItem(activeSection.id, createdItem);
          }}
        />

        {ctaLink && isAdmin && (
          <div className="mt-4 w-full max-w-sm">
            <AdminToggleField
              label="Mostrar botão de ingresso"
              value={ctaEnabled}
              onChange={async (next, token) => {
                const updated = await festivalApi.updateItem(
                  ctaLink.id,
                  { metadata: mergeMetadata(ctaLink.metadata, { ctaEnabled: next }) },
                  token
                );
                replaceItem(updated);
              }}
            />
          </div>
        )}

        {ctaLink && ctaEnabled && (
          <div className="mt-8 flex flex-col items-center gap-3">
            {ctaLink.url ? (
              <EditableText
                value={ctaLink.title ?? "Retire seu ingresso"}
                onSave={(value, token) => updateItem(ctaLink, { title: value }, token)}
              >
                {(text) => (
                  <Link
                    href={ctaLink.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants({
                      variant: "secondary",
                      className: "heading-05-bold h-auto px-10 py-6 uppercase tracking-wider",
                    })}
                  >
                    {text}
                  </Link>
                )}
              </EditableText>
            ) : (
              <EditableText
                value={ctaLink.title ?? "Retire seu ingresso"}
                onSave={(value, token) => updateItem(ctaLink, { title: value }, token)}
              >
                {(text) => <span className="heading-05-bold text-foreground">{text}</span>}
              </EditableText>
            )}
            <AdminLinkEditor
              label={ctaLink.title ?? "Retire seu ingresso"}
              value={ctaLink.url}
              onSave={(value, token) => updateItem(ctaLink, { url: value || null }, token)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
