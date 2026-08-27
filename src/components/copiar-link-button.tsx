"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopiarLinkButton({ url }: { url: string }) {
  const [feedback, setFeedback] = useState("");

  async function copiar() {
    try {
      await navigator.clipboard.writeText(url);
      setFeedback("Copiado");
      setTimeout(() => setFeedback(""), 2000);
    } catch {
      setFeedback("Falha ao copiar");
      setTimeout(() => setFeedback(""), 2000);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button type="button" size="sm" variant="secondary" onClick={copiar}>
        Copiar link
      </Button>
      {feedback && (
        <span className="text-xs text-emerald-700">{feedback}</span>
      )}
    </div>
  );
}
