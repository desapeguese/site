"use client";

import React from "react";
import { Check, LinkIcon, X } from "lucide-react";
import { toast } from "sonner";
import { useAdminMode } from "@/context/AdminModeContext";

type AdminLinkEditorProps = {
  label: string;
  value: string | null | undefined;
  onSave: (value: string, accessToken: string) => Promise<void>;
};

export function AdminLinkEditor({ label, value, onSave }: AdminLinkEditorProps) {
  const { isAdmin, accessToken } = useAdminMode();
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value ?? "");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    setDraft(value ?? "");
  }, [value]);

  if (!isAdmin) return null;

  async function save() {
    if (!accessToken) return;

    setSaving(true);
    try {
      await onSave(draft.trim(), accessToken);
      setEditing(false);
      toast.success("Link atualizado.");
    } catch {
      toast.error("Não foi possível salvar o link.");
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <div className="flex w-full max-w-sm flex-col gap-3 rounded-lg border bg-background p-3 text-base text-foreground shadow-elevated">
        <input
          type="url"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="https://..."
          className="min-h-11 rounded-md border bg-background px-3 py-2 text-base"
          aria-label={`URL ${label}`}
        />
        <span className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-4 py-2 text-base font-medium text-primary-foreground disabled:opacity-60"
            aria-label={`Salvar link ${label}`}
          >
            <Check className="h-4 w-4" />
            Salvar
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-muted px-4 py-2 text-base font-medium text-foreground"
            aria-label={`Cancelar link ${label}`}
          >
            <X className="h-4 w-4" />
            Cancelar
          </button>
        </span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="inline-flex min-h-11 items-center gap-2 rounded-md border bg-background px-4 py-2 text-base font-medium text-foreground shadow-sm hover:bg-muted"
      aria-label={`Editar link ${label}`}
    >
      <LinkIcon className="h-4 w-4" />
      Link
    </button>
  );
}
