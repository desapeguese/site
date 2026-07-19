"use client";

import React from "react";
import { toast } from "sonner";
import { useAdminMode } from "@/context/AdminModeContext";
import { cn } from "@/lib/utils";

type AdminToggleFieldProps = {
  label: string;
  value: boolean;
  onChange: (value: boolean, accessToken: string) => Promise<void>;
};

export function AdminToggleField({ label, value, onChange }: AdminToggleFieldProps) {
  const { isAdmin, accessToken } = useAdminMode();
  const [saving, setSaving] = React.useState(false);

  if (!isAdmin) return null;

  async function handleChange(next: boolean) {
    if (!accessToken) return;

    setSaving(true);
    try {
      await onChange(next, accessToken);
      toast.success("Configuração atualizada.");
    } catch {
      toast.error("Não foi possível atualizar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <label className="flex min-w-0 items-center justify-between gap-3 rounded-lg border bg-background p-3 text-left text-base font-medium leading-snug text-foreground shadow-sm">
      <span className="break-words">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-label={label}
        disabled={saving}
        onClick={() => handleChange(!value)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-60",
          value ? "bg-primary" : "bg-muted"
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-background shadow transition-transform",
            value ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
    </label>
  );
}
