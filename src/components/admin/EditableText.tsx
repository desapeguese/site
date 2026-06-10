"use client";

import React from "react";
import { Check, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { useAdminMode } from "@/context/AdminModeContext";
import { cn } from "@/lib/utils";

type EditableTextProps = {
  value: string;
  className?: string;
  testId?: string;
  multiline?: boolean;
  onSave: (value: string, accessToken: string) => Promise<void>;
  children: (value: string) => React.ReactNode;
};

export function EditableText({ value, className, testId, multiline = false, onSave, children }: EditableTextProps) {
  const { isAdmin, accessToken } = useAdminMode();
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    setDraft(value);
  }, [value]);

  async function save() {
    if (!accessToken) return;

    setSaving(true);
    try {
      await onSave(draft, accessToken);
      setEditing(false);
      toast.success("Conteúdo atualizado.");
    } catch {
      toast.error("Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  }

  if (!isAdmin) {
    return <>{children(value)}</>;
  }

  if (editing) {
    const fieldClassName = "w-full rounded-lg border border-primary bg-background px-3 py-2 text-foreground";

    return (
      <div className={cn("inline-flex w-full flex-col gap-2", className)} data-testid={testId}>
        {multiline ? (
          <textarea
            className={fieldClassName}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={4}
          />
        ) : (
          <input className={fieldClassName} value={draft} onChange={(event) => setDraft(event.target.value)} />
        )}
        <span className="inline-flex gap-2">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded-full bg-primary p-2 text-background disabled:opacity-60"
            aria-label="Salvar"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-full bg-muted p-2 text-foreground"
            aria-label="Cancelar"
          >
            <X className="h-4 w-4" />
          </button>
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group relative inline-flex items-center gap-2 outline outline-1 outline-dashed outline-primary/40",
        className
      )}
      data-testid={testId}
    >
      {children(value)}
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="rounded-full bg-primary p-1 text-background opacity-0 transition-opacity group-hover:opacity-100"
        aria-label="Editar texto"
      >
        <Pencil className="h-3 w-3" />
      </button>
    </div>
  );
}
