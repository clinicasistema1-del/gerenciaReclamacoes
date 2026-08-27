export type ActionResult =
  | { ok: true }
  | { ok: false; error: string };

export type ActionResultWithId =
  | { ok: true; id: string }
  | { ok: false; error: string };

export function actionOk(): { ok: true } {
  return { ok: true };
}

export function actionOkId(id: string): { ok: true; id: string } {
  return { ok: true, id };
}

export function actionFail(error: string): { ok: false; error: string } {
  return { ok: false, error };
}

export function mapPrismaError(
  error: unknown,
  fallback = "Não foi possível concluir a operação. Tente novamente."
): string {
  if (!error || typeof error !== "object") return fallback;

  const code = "code" in error ? String(error.code) : "";
  const target =
    "meta" in error &&
    error.meta &&
    typeof error.meta === "object" &&
    "target" in error.meta
      ? (error.meta.target as string[] | string | undefined)
      : undefined;
  const campos = Array.isArray(target)
    ? target.join(",")
    : typeof target === "string"
      ? target
      : "";

  if (code === "P2002") {
    if (campos.includes("email")) {
      return "Já existe um usuário com este e-mail.";
    }
    if (campos.includes("ordem")) {
      return "Já existe uma etapa com esta ordem.";
    }
    if (campos.includes("protocolo")) {
      return "Já existe uma reclamação com este protocolo.";
    }
    if (campos.includes("descricao")) {
      return "Já existe um cadastro com esta descrição.";
    }
    return "Já existe um registro com esses dados.";
  }

  if (code === "P2003") {
    return "Há um vínculo inválido. Verifique os dados selecionados.";
  }

  if (code === "P2025") {
    return "Registro não encontrado.";
  }

  return fallback;
}

export async function runAction(
  fn: () => Promise<void>,
  fallback?: string
): Promise<ActionResult> {
  try {
    await fn();
    return actionOk();
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "digest" in error &&
      typeof (error as { digest?: unknown }).digest === "string" &&
      String((error as { digest: string }).digest).startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    console.error(error);
    return actionFail(mapPrismaError(error, fallback));
  }
}
