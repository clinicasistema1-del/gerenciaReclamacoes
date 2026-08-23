"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const result = await authClient.signIn.email({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    setLoading(false);
    if (result.error) {
      setError(result.error.message || "Falha no login");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#ffce00_0%,#fff176_100%)] px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,0,0,0.12),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.35),transparent_35%)]" />
      <Card className="relative w-full max-w-md border-0 shadow-2xl">
        <CardHeader>
          <img
            src="/logo-sorria.png"
            alt="Sorria Goiás"
            className="mb-3 h-14 w-14 rounded-md object-cover"
          />
          <p className="text-xs uppercase tracking-[0.2em] text-black">
            Grupo Sorria
          </p>
          <CardTitle className="font-[family-name:var(--font-display)] text-3xl">
            SISTEMA GRC
          </CardTitle>
          <p className="text-sm text-[var(--muted)]">
            Acesse a central de gestão de reclamações
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                defaultValue="admin@gmail.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                defaultValue="admin"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
