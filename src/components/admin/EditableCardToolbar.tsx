"use client";

import React from "react";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAdminMode } from "@/context/AdminModeContext";

type EditableCardToolbarProps = {
  onMoveUp?: () => Promise<void>;
  onMoveDown?: () => Promise<void>;
  onRemove?: () => Promise<void>;
};

export function EditableCardToolbar({ onMoveUp, onMoveDown, onRemove }: EditableCardToolbarProps) {
  const { isAdmin } = useAdminMode();
  const [busyAction, setBusyAction] = React.useState<string | null>(null);

  if (!isAdmin) return null;

  async function runAction(label: string, action?: () => Promise<void>) {
    if (!action) return;

    setBusyAction(label);
    try {
      await action();
      toast.success(label === "remove" ? "Item removido." : "Ordem atualizada.");
    } catch {
      toast.error("Não foi possível concluir a ação.");
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <div className="absolute right-2 top-2 z-20 inline-flex gap-1 rounded-full bg-background/95 p-1 shadow-elevated backdrop-blur">
      <button
        type="button"
        onClick={() => runAction("up", onMoveUp)}
        disabled={!onMoveUp || busyAction !== null}
        className="rounded-full p-2 text-foreground hover:bg-muted disabled:opacity-40"
        aria-label="Mover para cima"
      >
        <ArrowUp className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => runAction("down", onMoveDown)}
        disabled={!onMoveDown || busyAction !== null}
        className="rounded-full p-2 text-foreground hover:bg-muted disabled:opacity-40"
        aria-label="Mover para baixo"
      >
        <ArrowDown className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => runAction("remove", onRemove)}
        disabled={!onRemove || busyAction !== null}
        className="rounded-full p-2 text-destructive hover:bg-destructive/10 disabled:opacity-40"
        aria-label="Remover"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
