"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { festivalApi } from "@/lib/api/festival-api";
import { saveAdminSession } from "@/lib/admin/admin-session";

export default function AdminLoginPage() {
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const session = await festivalApi.login(email, password);
      saveAdminSession(session);

      if (session.user.role !== "ADMIN") {
        toast.error("Este usuário não tem permissão de administrador.");
        return;
      }

      toast.success("Modo administrador ativado.");
      router.push(`/${params.locale ?? "pt-BR"}`);
    } catch {
      toast.error("Não foi possível entrar. Confira e-mail e senha.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-20">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-md flex-col gap-5 rounded-lg bg-card p-6 shadow-elevated"
      >
        <div>
          <h1 className="heading-03-bold text-foreground">Admin Festival</h1>
            <p className="body-callout mt-2 text-foreground">Entre para editar o conteúdo da landing.</p>
        </div>

        <label className="body-callout-medium flex flex-col gap-2 text-foreground">
          E-mail
          <input
            className="body-paragraph rounded-lg border bg-background px-4 py-3"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label className="body-callout-medium flex flex-col gap-2 text-foreground">
          Senha
          <input
            className="body-paragraph rounded-lg border bg-background px-4 py-3"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        <Button type="submit" loading={loading} loadingText="Entrando...">
          <LogIn aria-hidden="true" />
          Entrar
        </Button>
      </form>
    </main>
  );
}
