"use client";

import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, sans-serif",
          background: "#fffdf6",
          color: "#111",
        }}
      >
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            padding: 24,
            textAlign: "center",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 22 }}>Algo deu errado</h2>
          <p style={{ margin: 0, color: "#5c5748", maxWidth: 420 }}>
            Ocorreu um erro inesperado. Tente novamente.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              cursor: "pointer",
              background: "#ffce00",
              border: "none",
              borderRadius: 8,
              padding: "10px 16px",
              fontWeight: 600,
            }}
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}
