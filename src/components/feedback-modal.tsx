"use client";

import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export type FeedbackVariant = "success" | "error" | "warning";

export function variantFromMessage(message: string): FeedbackVariant {
  const texto = message.toLowerCase();
  if (
    texto.startsWith("já existe") ||
    texto.startsWith("preencha") ||
    texto.startsWith("informe") ||
    texto.startsWith("a senha") ||
    texto.startsWith("selecione") ||
    texto.startsWith("responsável pelo atendimento") ||
    texto.includes("tratamento em andamento") ||
    texto.includes("não é possível encerrar") ||
    texto.startsWith("perfil inválido") ||
    texto.includes("não é possível excluir") ||
    texto.includes("usuário logado")
  ) {
    return "warning";
  }
  return "error";
}

const styles: Record<
  FeedbackVariant,
  {
    icon: typeof CheckCircle2;
    panel: string;
    iconWrap: string;
    iconColor: string;
    title: string;
    bar: string;
    button: "default" | "danger" | "secondary";
  }
> = {
  success: {
    icon: CheckCircle2,
    panel: "border-emerald-200 bg-white",
    iconWrap: "bg-emerald-100",
    iconColor: "text-emerald-700",
    title: "text-emerald-900",
    bar: "bg-emerald-500",
    button: "default",
  },
  error: {
    icon: XCircle,
    panel: "border-red-200 bg-white",
    iconWrap: "bg-red-100",
    iconColor: "text-red-700",
    title: "text-red-900",
    bar: "bg-red-500",
    button: "danger",
  },
  warning: {
    icon: AlertTriangle,
    panel: "border-amber-200 bg-white",
    iconWrap: "bg-amber-100",
    iconColor: "text-amber-700",
    title: "text-amber-950",
    bar: "bg-amber-500",
    button: "secondary",
  },
};

const defaultTitles: Record<FeedbackVariant, string> = {
  success: "Concluído",
  error: "Algo deu errado",
  warning: "Atenção",
};

export function FeedbackModal({
  title,
  message,
  onClose,
  variant = "success",
}: {
  title?: string;
  message: string;
  onClose: () => void;
  variant?: FeedbackVariant;
}) {
  const style = styles[variant];
  const Icon = style.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="feedback-title"
        aria-describedby="feedback-message"
        className={`w-full max-w-md overflow-hidden rounded-xl border shadow-xl ${style.panel}`}
      >
        <div className={`h-1.5 w-full ${style.bar}`} />
        <div className="p-6">
          <div className="flex gap-4">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${style.iconWrap}`}
            >
              <Icon className={`h-6 w-6 ${style.iconColor}`} aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <h2
                id="feedback-title"
                className={`text-lg font-semibold ${style.title}`}
              >
                {title || defaultTitles[variant]}
              </h2>
              <p
                id="feedback-message"
                className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]"
              >
                {message}
              </p>
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <Button type="button" variant={style.button} onClick={onClose}>
              Ok
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
