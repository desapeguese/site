"use client";

import React, { useState } from "react";
import { Mail, X } from "lucide-react";
import { toast } from "sonner";
import { AdminAddItemButton } from "@/components/admin/AdminAddItemButton";
import { AdminLinkEditor } from "@/components/admin/AdminLinkEditor";
import { AdminSelectField } from "@/components/admin/AdminSelectField";
import { EditableText } from "@/components/admin/EditableText";
import { Button } from "@/components/ui/button";
import { useAdminMode } from "@/context/AdminModeContext";
import { useOptionalLandingContent } from "@/context/LandingContentContext";
import { festivalApi } from "@/lib/api/festival-api";
import { LANDING_ICON_OPTIONS, getMetadataString, mergeMetadata } from "@/lib/landing/admin-options";
import { getFallbackSection } from "@/lib/landing/default-content";
import { getLandingIcon } from "@/lib/landing/icon-map";
import type { LandingItem, LandingSection } from "@/lib/landing/types";

type FooterProps = {
  section?: LandingSection;
  editable?: boolean;
};

type EditableSlotProps = {
  editable: boolean;
  value: string;
  multiline?: boolean;
  onSave: (value: string, accessToken: string) => Promise<void>;
  children: (value: string) => React.ReactNode;
};

function bySortOrder<T extends { sortOrder: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder);
}

function EditableSlot({ editable, value, multiline, onSave, children }: EditableSlotProps) {
  if (!editable) return <>{children(value)}</>;

  return (
    <EditableText value={value} multiline={multiline} onSave={onSave}>
      {children}
    </EditableText>
  );
}

function fallbackFooterSection(): LandingSection {
  return getFallbackSection("footer") as LandingSection;
}

export const Footer = ({ section, editable = false }: FooterProps) => {
  const landingContent = useOptionalLandingContent();
  const { accessToken } = useAdminMode();
  const activeSection = section ?? fallbackFooterSection();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const communityLink = activeSection.items.find((item) => item.key === "community_whatsapp" || item.type === "cta_link");
  const policyLinks = bySortOrder(activeSection.items.filter((item) => item.type === "footer_link"));
  const socialLinks = bySortOrder(activeSection.items.filter((item) => item.type === "social_link"));
  const brandTitle = getMetadataString(activeSection.metadata, "brandTitle", "Festival Desapegue-se");
  const brandDescription = getMetadataString(
    activeSection.metadata,
    "brandDescription",
    "Um movimento que conecta pessoas, ideias e práticas sustentáveis para transformar a forma como consumimos e nos relacionamos com o mundo."
  );
  const copyrightText = getMetadataString(
    activeSection.metadata,
    "copyrightText",
    "© 2025 Festival Desapegue-se. Todos os direitos reservados."
  );
  const creditLabel = getMetadataString(
    activeSection.metadata,
    "creditLabel",
    "Biomob - Instituto Brasileiro de Mobilidade e Acessibilidade"
  );
  const creditUrl = getMetadataString(activeSection.metadata, "creditUrl", "https://biomob.org/pt");

  async function updateSection(payload: Record<string, unknown>, accessToken: string) {
    const updatedSection = await festivalApi.updateSection(activeSection.id, payload, accessToken);
    landingContent?.replaceSection(updatedSection);
  }

  async function updateMetadata(patch: Record<string, unknown>, accessToken: string) {
    await updateSection({ metadata: mergeMetadata(activeSection.metadata, patch) }, accessToken);
  }

  async function updateItem(item: LandingItem, payload: Record<string, unknown>, accessToken: string) {
    const updatedItem = await festivalApi.updateItem(item.id, payload, accessToken);
    landingContent?.replaceItem(updatedItem);
  }

  async function removePolicyLink(item: LandingItem, accessToken: string) {
    try {
      await festivalApi.removeItem(item.id, accessToken);
      landingContent?.removeItem(item.id);
      toast.success("Link removido.");
    } catch {
      toast.error("Não foi possível remover o link.");
    }
  }

  async function handleNewsletterSubmit(event: React.FormEvent) {
    event.preventDefault();

    const normalizedEmail = email.trim();
    if (!normalizedEmail || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await festivalApi.subscribeNewsletter(normalizedEmail, "footer");
      toast.success(response.message || "Inscrição confirmada.");
      setEmail("");
    } catch {
      toast.error("Não foi possível assinar a newsletter.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <footer className="bg-primary-dark-background text-primary-foreground" role="contentinfo">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-16 flex flex-col items-center text-center">
          <div className="mb-6">
            <Mail className="h-12 w-12 text-secondary" strokeWidth={1.5} />
          </div>
          <EditableSlot
            editable={editable}
            value={activeSection.title ?? "Inscreva-se na Transformação"}
            onSave={(value, token) => updateSection({ title: value }, token)}
          >
            {(text) => <h2 className="heading-03-bold mb-4 font-display-hero">{text}</h2>}
          </EditableSlot>
          <EditableSlot
            editable={editable}
            value={activeSection.description ?? ""}
            multiline
            onSave={(value, token) => updateSection({ description: value }, token)}
          >
            {(text) => <p className="body-paragraph mb-8 max-w-2xl">{text}</p>}
          </EditableSlot>
          <form onSubmit={handleNewsletterSubmit} className="flex w-full flex-col gap-4 sm:flex-row">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Insira seu e-mail"
              required
              disabled={isSubmitting}
              className="body-paragraph flex-1 rounded-xl border border-primary-foreground bg-background px-6 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
              aria-label="Endereço de email"
            />
            <Button type="submit" variant={"secondary"} disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Assinar Newsletter"}
            </Button>
            {communityLink?.url && (
              <a
                href={communityLink.url}
                target="_blank"
                rel="noopener noreferrer"
                className="body-title-medium inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-8 py-3 text-[#0B1B12] transition-colors duration-300 hover:bg-[#7BE39D]"
              >
                {React.createElement(getLandingIcon(communityLink.icon), { className: "h-5 w-5" })}
                {communityLink.title ?? "Entrar na comunidade"}
              </a>
            )}
          </form>
          {editable && communityLink && (
            <div className="mt-4 grid w-full max-w-xl gap-3 [grid-template-columns:repeat(auto-fit,minmax(min(100%,12rem),1fr))]">
              <EditableSlot
                editable={editable}
                value={communityLink.title ?? "Entrar na comunidade"}
                onSave={(value, token) => updateItem(communityLink, { title: value }, token)}
              >
                {(text) => <span className="sr-only">{text}</span>}
              </EditableSlot>
              <AdminSelectField
                label={`Ícone ${communityLink.title ?? "comunidade"}`}
                value={communityLink.icon ?? "MessageCircle"}
                options={LANDING_ICON_OPTIONS}
                onChange={(value, token) => updateItem(communityLink, { icon: value }, token)}
              />
              <AdminLinkEditor
                label={communityLink.title ?? "Entrar na comunidade"}
                value={communityLink.url}
                onSave={(value, token) => updateItem(communityLink, { url: value || null }, token)}
              />
            </div>
          )}
        </div>

        <div className="mb-12 flex flex-col items-start gap-12 border-t pt-12 md:flex-row md:gap-24">
          <div className="max-w-sm">
            <EditableSlot
              editable={editable}
              value={brandTitle}
              onSave={(value, token) => updateMetadata({ brandTitle: value }, token)}
            >
              {(text) => <h3 className="heading-05-bold mb-4">{text}</h3>}
            </EditableSlot>
            <EditableSlot
              editable={editable}
              value={brandDescription}
              multiline
              onSave={(value, token) => updateMetadata({ brandDescription: value }, token)}
            >
              {(text) => <p className="body-callout-light leading-relaxed">{text}</p>}
            </EditableSlot>
          </div>

          <div>
            <h3 className="heading-05-bold mb-4">Políticas</h3>
            <ul className="space-y-3">
              {policyLinks.map((item) => (
                <li key={item.id} className="flex flex-col items-start gap-2">
                  <div className="flex w-full items-center gap-2">
                    <EditableSlot
                      editable={editable}
                      value={item.title ?? "Política"}
                      onSave={(value, token) => updateItem(item, { title: value }, token)}
                    >
                      {(text) => (
                        <a
                          href={item.url ?? "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="body-callout-light transition-colors hover:text-secondary"
                        >
                          {text}
                        </a>
                      )}
                    </EditableSlot>
                    {editable && (
                      <button
                        type="button"
                        onClick={() => {
                          if (!accessToken) return;
                          void removePolicyLink(item, accessToken);
                        }}
                        className="rounded-full p-1 text-destructive transition-colors hover:bg-destructive/10"
                        aria-label={`Remover ${item.title ?? "política"}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  {editable && (
                    <AdminLinkEditor
                      label={item.title ?? "Política"}
                      value={item.url}
                      onSave={(value, token) => updateItem(item, { url: value || null }, token)}
                    />
                  )}
                </li>
              ))}
            </ul>
            {editable && (
              <AdminAddItemButton
                label="Adicionar link de política"
                className="mt-4"
                onCreate={async (token) => {
                  const maxSortOrder = policyLinks.reduce((max, item) => Math.max(max, item.sortOrder), 0);
                  const createdItem = await festivalApi.createItem(
                    activeSection.id,
                    {
                      key: `policy_link_${Date.now()}`,
                      type: "footer_link",
                      title: "Nova política",
                      url: "#",
                      sortOrder: maxSortOrder + 1,
                    },
                    token
                  );
                  landingContent?.addItem(activeSection.id, createdItem);
                }}
              />
            )}
          </div>

          <div>
            <h3 className="heading-05-bold mb-4">Homepage</h3>
            <ul className="space-y-3">
              <li>
                <a href="#missao" className="body-callout-light transition-colors hover:text-secondary">
                  Nossa Missão
                </a>
              </li>
              <li>
                <a href="#sobre" className="body-callout-light transition-colors hover:text-secondary">
                  Sobre o Festival
                </a>
              </li>
              <li>
                <a href="#programacao" className="body-callout-light transition-colors hover:text-secondary">
                  Programação
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-6 border-t pt-8 md:flex-row">
          <div className="flex flex-wrap justify-center gap-6">
            {socialLinks.map((item) => {
              const Icon = getLandingIcon(item.icon);

              return (
                <div key={item.id} className="flex flex-col items-center gap-2">
                  <a
                    href={item.url ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-secondary"
                    aria-label={item.title ?? item.key}
                  >
                    <Icon className="h-6 w-6" />
                  </a>
                  {editable && (
                    <div className="grid w-full gap-3">
                      <EditableSlot
                        editable={editable}
                        value={item.title ?? item.key}
                        onSave={(value, token) => updateItem(item, { title: value }, token)}
                      >
                        {(text) => <span className="body-caption text-center">{text}</span>}
                      </EditableSlot>
                      <AdminSelectField
                        label={`Ícone ${item.title ?? item.key}`}
                        value={item.icon ?? "Leaf"}
                        options={LANDING_ICON_OPTIONS}
                        onChange={(value, token) => updateItem(item, { icon: value }, token)}
                      />
                      <AdminLinkEditor
                        label={item.title ?? item.key}
                        value={item.url}
                        onSave={(value, token) => updateItem(item, { url: value || null }, token)}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="body-callout-light text-center md:text-right">
            <EditableSlot
              editable={editable}
              value={copyrightText}
              onSave={(value, token) => updateMetadata({ copyrightText: value }, token)}
            >
              {(text) => <span>{text}</span>}
            </EditableSlot>{" "}
            Criado por{" "}
            <EditableSlot
              editable={editable}
              value={creditLabel}
              onSave={(value, token) => updateMetadata({ creditLabel: value }, token)}
            >
              {(text) => (
                <a
                  href={creditUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-secondary"
                >
                  {text}
                </a>
              )}
            </EditableSlot>
            {editable && (
              <span className="ml-2 inline-flex align-middle">
                <AdminLinkEditor
                  label={creditLabel}
                  value={creditUrl}
                  onSave={(value, token) => updateMetadata({ creditUrl: value || null }, token)}
                />
              </span>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
