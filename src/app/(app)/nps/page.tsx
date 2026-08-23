import Link from "next/link";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export default async function NpsPage() {
  await requireSession();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const respostas = await prisma.npsResposta.findMany({
    include: {
      reclamacao: { include: { clinic: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const respondidas = respostas.filter((r) => r.respondidoEm);
  const media =
    respondidas.length > 0
      ? (
          respondidas.reduce((acc, r) => acc + (r.nota || 0), 0) /
          respondidas.length
        ).toFixed(1)
      : "—";

  const comQr = await Promise.all(
    respostas.map(async (r) => ({
      ...r,
      qr: await QRCode.toDataURL(`${baseUrl}/nps/${r.token}`),
      url: `${baseUrl}/nps/${r.token}`,
    }))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl">
          Gestão de NPS
        </h1>
        <p className="text-[var(--muted)]">
          Pesquisa de satisfação por QR Code após conclusão do protocolo
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-[var(--muted)]">Pesquisas</CardTitle>
          </CardHeader>
          <CardContent className="font-[family-name:var(--font-display)] text-3xl">
            {respostas.length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-[var(--muted)]">Respondidas</CardTitle>
          </CardHeader>
          <CardContent className="font-[family-name:var(--font-display)] text-3xl">
            {respondidas.length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-[var(--muted)]">Nota média</CardTitle>
          </CardHeader>
          <CardContent className="font-[family-name:var(--font-display)] text-3xl">
            {media}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {comQr.map((r) => (
          <Card key={r.id}>
            <CardHeader>
              <CardTitle className="text-base">
                <Link
                  href={`/reclamacoes/${r.reclamacaoId}`}
                  className="text-[var(--brand)] hover:underline"
                >
                  {r.reclamacao.protocolo}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-start gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={r.qr} alt="QR Code NPS" className="h-28 w-28 rounded-md border" />
              <div className="text-sm">
                <p>{r.reclamacao.pacienteNome}</p>
                <p className="text-[var(--muted)]">{r.reclamacao.clinic.name}</p>
                <p className="mt-2">
                  {r.respondidoEm
                    ? `Nota ${r.nota} · ${formatDate(r.respondidoEm)}`
                    : "Aguardando resposta"}
                </p>
                {r.comentario && (
                  <p className="mt-1 text-[var(--muted)]">{r.comentario}</p>
                )}
                <a
                  href={r.url}
                  className="mt-2 inline-block text-xs text-[var(--brand)] hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  Abrir link público
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
        {comQr.length === 0 && (
          <p className="text-[var(--muted)]">
            Conclua um protocolo para gerar pesquisa NPS com QR Code.
          </p>
        )}
      </div>
    </div>
  );
}
