"use client";

import React from "react";
import { Download, LogOut, RotateCcw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAdminMode } from "@/context/AdminModeContext";
import { useLandingContent } from "@/context/LandingContentContext";
import { festivalApi } from "@/lib/api/festival-api";

export function AdminFloatingBar() {
  const { accessToken, isAdmin, logout, session } = useAdminMode();
  const { replaceContent } = useLandingContent();
  const [exportingNewsletter, setExportingNewsletter] = React.useState(false);
  const [restoringDefault, setRestoringDefault] = React.useState(false);

  if (!isAdmin || !session) return null;

  async function handleNewsletterExport() {
    if (!accessToken || exportingNewsletter) return;

    setExportingNewsletter(true);

    try {
      const blob = await festivalApi.exportNewsletterCsv(accessToken);
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `newsletter-festival-desapegue-se-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      toast.success("CSV da newsletter baixado.");
    } catch {
      toast.error("Não foi possível baixar a newsletter.");
    } finally {
      setExportingNewsletter(false);
    }
  }

  async function handleRestoreDefault() {
    if (!accessToken || restoringDefault) return;

    setRestoringDefault(true);

    try {
      const restoredContent = await festivalApi.restoreDefaultLandingPage(accessToken);
      replaceContent(restoredContent);
      toast.success("Backup versão 01 restaurado.");
    } catch {
      toast.error("Não foi possível restaurar o backup.");
    } finally {
      setRestoringDefault(false);
    }
  }

  function requestRestoreConfirmation() {
    toast.warning("Restaurar backup da versão 01?", {
      description: "Isso substitui as edições atuais pelo conteúdo default salvo no projeto.",
      action: {
        label: "Restaurar versão 01",
        onClick: () => {
          void handleRestoreDefault();
        },
      },
      cancel: {
        label: "Cancelar",
        onClick: () => undefined,
      },
    });
  }

  return (
    <div className="fixed bottom-4 left-1/2 z-[260] flex w-[calc(100%-2rem)] max-w-4xl -translate-x-1/2 flex-wrap items-center justify-between gap-3 rounded-lg border bg-background px-4 py-3 shadow-elevated">
      <div className="flex min-w-0 items-center gap-2">
        <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
        <div className="min-w-0">
          <p className="body-callout-medium truncate text-foreground">Modo administrador</p>
          <p className="body-small truncate text-foreground">{session.user.email}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-base"
          onClick={handleNewsletterExport}
          loading={exportingNewsletter}
          loadingText="Baixando"
          aria-label="Baixar newsletter CSV"
        >
          <Download aria-hidden="true" />
          Newsletter CSV
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-warning text-base text-foreground hover:bg-warning/10"
          onClick={requestRestoreConfirmation}
          loading={restoringDefault}
          loadingText="Restaurando"
          aria-label="Restaurar backup"
        >
          <RotateCcw aria-hidden="true" />
          Restaurar backup
        </Button>
        <Button type="button" variant="outline" size="sm" className="text-base" onClick={logout}>
          <LogOut aria-hidden="true" />
          Sair
        </Button>
      </div>
    </div>
  );
}
