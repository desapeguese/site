"use client";

import React from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useAdminMode } from "@/context/AdminModeContext";
import { cn } from "@/lib/utils";

type AdminAddItemButtonProps = {
  label: string;
  disabled?: boolean;
  disabledLabel?: string;
  className?: string;
  onCreate: (accessToken: string) => Promise<void>;
};

export function AdminAddItemButton({
  label,
  disabled = false,
  disabledLabel,
  className,
  onCreate,
}: AdminAddItemButtonProps) {
  const { isAdmin, accessToken } = useAdminMode();
  const [saving, setSaving] = React.useState(false);

  if (!isAdmin) return null;

  async function createItem() {
    if (!accessToken || disabled) return;

    setSaving(true);
    try {
      await onCreate(accessToken);
      toast.success("Item adicionado.");
    } catch {
      toast.error("Não foi possível adicionar o item.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <button
      type="button"
      onClick={createItem}
      disabled={saving || disabled}
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-dashed border-primary bg-background px-5 py-3 text-base font-medium text-primary shadow-sm transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      aria-label={label}
      title={disabled && disabledLabel ? disabledLabel : undefined}
    >
      <Plus className="h-5 w-5" />
      {disabled && disabledLabel ? disabledLabel : label}
    </button>
  );
}
