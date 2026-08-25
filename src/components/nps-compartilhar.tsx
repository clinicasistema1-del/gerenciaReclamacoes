"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function NpsCompartilhar({
  protocolo,
  url,
  qrDataUrl,
}: {
  protocolo: string;
  url: string;
  qrDataUrl: string;
}) {
  const [feedback, setFeedback] = useState("");

  async function copiar(texto: string, mensagem: string) {
    try {
      await navigator.clipboard.writeText(texto);
      setFeedback(mensagem);
      setTimeout(() => setFeedback(""), 2500);
    } catch {
      setFeedback("Não foi possível copiar. Selecione o link manualmente.");
    }
  }

  const mensagemCliente = `Olá! Gostaríamos da sua avaliação sobre o atendimento do protocolo ${protocolo}. Acesse: ${url}`;

  return (
    <div className="space-y-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
      <p className="text-sm font-medium">Pesquisa NPS</p>
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrDataUrl}
          alt={`QR Code NPS ${protocolo}`}
          className="h-36 w-36 rounded-md border border-[var(--border)] bg-white p-1"
        />
        <div className="w-full space-y-2 text-sm">
          <p className="text-[var(--muted)]">
            Envie o QR Code ou o link para o cliente responder a pesquisa.
          </p>
          <input
            readOnly
            value={url}
            className="h-10 w-full rounded-md border border-[var(--border)] bg-white px-3 text-xs"
            onFocus={(e) => e.currentTarget.select()}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => copiar(url, "Link copiado.")}
            >
              Copiar link
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => copiar(mensagemCliente, "Mensagem copiada.")}
            >
              Copiar mensagem
            </Button>
            <Button type="button" size="sm" variant="ghost" asChild>
              <a href={url} target="_blank" rel="noreferrer">
                Abrir
              </a>
            </Button>
          </div>
          {feedback && (
            <p className="text-xs text-emerald-700">{feedback}</p>
          )}
        </div>
      </div>
    </div>
  );
}
