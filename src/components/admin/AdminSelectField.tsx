"use client";

import React from "react";
import { toast } from "sonner";
import { useAdminMode } from "@/context/AdminModeContext";
import type { LandingOption } from "@/lib/landing/admin-options";

type AdminSelectFieldProps = {
  label: string;
  value: string;
  options: LandingOption[];
  onChange: (value: string, accessToken: string) => Promise<void>;
};

export function AdminSelectField({ label, value, options, onChange }: AdminSelectFieldProps) {
  const { isAdmin, accessToken } = useAdminMode();
  const [saving, setSaving] = React.useState(false);

  if (!isAdmin) return null;

  async function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    if (!accessToken) return;

    setSaving(true);
    try {
      await onChange(event.target.value, accessToken);
      toast.success("Configuração atualizada.");
    } catch {
      toast.error("Não foi possível atualizar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <label className="flex min-w-0 flex-col gap-2 rounded-lg border bg-background p-3 text-left text-base font-medium leading-snug text-foreground shadow-sm">
      <span className="break-words">{label}</span>
      <select
        value={value}
        onChange={handleChange}
        disabled={saving}
        className="min-h-11 w-full rounded-md border bg-background px-3 py-2 text-base text-foreground disabled:opacity-60"
        aria-label={label}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
