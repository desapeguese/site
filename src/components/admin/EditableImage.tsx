"use client";

import React from "react";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { useAdminMode } from "@/context/AdminModeContext";
import { fileToBase64Payload, type Base64AssetPayload } from "@/lib/admin/file-to-base64";
import { cn } from "@/lib/utils";

type EditableImageProps = {
  className?: string;
  testId?: string;
  onSave: (payload: Base64AssetPayload, accessToken: string) => Promise<void>;
  children: React.ReactNode;
};

export function EditableImage({ className, testId, onSave, children }: EditableImageProps) {
  const { isAdmin, accessToken } = useAdminMode();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [saving, setSaving] = React.useState(false);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    event.stopPropagation();
    const file = event.target.files?.[0];
    if (!file || !accessToken) return;

    setSaving(true);
    try {
      const payload = await fileToBase64Payload(file);
      await onSave(payload, accessToken);
      toast.success("Imagem atualizada.");
    } catch {
      toast.error("Não foi possível atualizar a imagem.");
    } finally {
      setSaving(false);
      event.target.value = "";
    }
  }

  if (!isAdmin) {
    return <>{children}</>;
  }

  return (
    <div
      className={cn(
        "group relative inline-flex scroll-mt-28 outline outline-1 outline-dashed outline-primary/40",
        className
      )}
      data-testid={testId}
    >
      {children}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        data-testid={testId ? `${testId}-input` : undefined}
        onClick={(event) => event.stopPropagation()}
        onChange={handleFileChange}
      />
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          inputRef.current?.click();
        }}
        disabled={saving}
        className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-primary p-2 text-background opacity-0 shadow-elevated transition-opacity group-hover:opacity-100 focus-visible:opacity-100 disabled:opacity-60"
        aria-label="Editar imagem"
      >
        <Pencil className="h-4 w-4" />
      </button>
    </div>
  );
}
