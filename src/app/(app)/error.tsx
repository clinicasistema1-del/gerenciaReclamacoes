"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
      <h2 className="text-xl font-semibold text-[var(--ink)]">
        Algo deu errado
      </h2>
      <p className="text-sm text-[var(--muted)]">
        Não foi possível carregar esta página. Você pode tentar novamente sem
        perder o restante do sistema.
      </p>
      <Button type="button" onClick={reset}>
        Tentar novamente
      </Button>
    </div>
  );
}
