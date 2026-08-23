import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { submitNps } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function NpsPublicPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const nps = await prisma.npsResposta.findUnique({
    where: { token },
    include: { reclamacao: { include: { clinic: true } } },
  });

  if (!nps) notFound();

  async function action(formData: FormData) {
    "use server";
    await submitNps(formData);
    redirect(`/nps/${token}?ok=1`);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--surface)] px-4 py-10">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--brand)]">
            Grupo Sorria
          </p>
          <CardTitle className="font-[family-name:var(--font-display)] text-3xl">
            Pesquisa de satisfação
          </CardTitle>
          <p className="text-sm text-[var(--muted)]">
            Protocolo {nps.reclamacao.protocolo} · {nps.reclamacao.clinic.name}
          </p>
        </CardHeader>
        <CardContent>
          {nps.respondidoEm ? (
            <p className="text-[var(--ink)]">
              Obrigado! Sua nota {nps.nota} já foi registrada.
            </p>
          ) : (
            <form action={action} className="space-y-4">
              <input type="hidden" name="token" value={token} />
              <div className="space-y-2">
                <Label>De 0 a 10, quanto você recomendaria a clínica?</Label>
                <div className="grid grid-cols-11 gap-1">
                  {Array.from({ length: 11 }, (_, i) => (
                    <label
                      key={i}
                      className="flex cursor-pointer flex-col items-center rounded-md border border-[var(--border)] py-2 text-sm hover:border-[var(--brand)] has-[:checked]:bg-[var(--brand)] has-[:checked]:text-white"
                    >
                      <input
                        type="radio"
                        name="nota"
                        value={i}
                        required
                        className="sr-only"
                      />
                      {i}
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="comentario">Comentário (opcional)</Label>
                <Textarea id="comentario" name="comentario" />
              </div>
              <Button type="submit" className="w-full">
                Enviar avaliação
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
