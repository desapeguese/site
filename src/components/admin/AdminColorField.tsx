"use client";

import React from "react";
import { toast } from "sonner";
import { useAdminMode } from "@/context/AdminModeContext";

type AdminColorFieldProps = {
  label: string;
  value: string;
  onChange: (value: string, accessToken: string) => Promise<void>;
};

export function AdminColorField({ label, value, onChange }: AdminColorFieldProps) {
  const { isAdmin, accessToken } = useAdminMode();
  const [saving, setSaving] = React.useState(false);

  if (!isAdmin) return null;

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (!accessToken) return;

    setSaving(true);
    try {
      await onChange(event.target.value, accessToken);
      toast.success("Cor atualizada.");
    } catch {
      toast.error("Não foi possível atualizar a cor.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <label className="flex min-w-0 flex-col gap-2 rounded-lg border bg-background p-3 text-left text-base font-medium leading-snug text-foreground shadow-sm">
      <span className="break-words">{label}</span>
      <input
        type="color"
        value={value.startsWith("#") ? value : "#1B3226"}
        onChange={handleChange}
        disabled={saving}
        className="h-11 w-full cursor-pointer rounded-md border bg-background disabled:opacity-60"
        aria-label={label}
      />
    </label>
  );
}
