"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hashPassword } from "better-auth/crypto";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireSession } from "@/lib/session";
import {
  actionFail,
  actionOkId,
  mapPrismaError,
  runAction,
  type ActionResult,
  type ActionResultWithId,
} from "@/lib/action-result";
import {
  avancarEtapa,
  calcularPrazo,
  gerarProtocolo,
  primeiraEtapa,
} from "@/lib/reclamacao";
import type {
  CanalOrigem,
  Cargo,
  MotivoReclamacao,
  Prioridade,
  Role,
} from "@prisma/client";

export async function createClinic(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  return runAction(async () => {
    await prisma.clinic.create({
      data: {
        name: String(formData.get("name")),
        city: String(formData.get("city")),
        state: String(formData.get("state")).toUpperCase(),
      },
    });
    revalidatePath("/admin/clinicas");
  }, "Não foi possível cadastrar a clínica.");
}

export async function updateClinic(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  return runAction(async () => {
    const id = String(formData.get("id"));
    await prisma.clinic.update({
      where: { id },
      data: {
        name: String(formData.get("name")),
        city: String(formData.get("city")),
        state: String(formData.get("state")).toUpperCase(),
        active: formData.get("active") === "on",
      },
    });
    revalidatePath("/admin/clinicas");
  }, "Não foi possível atualizar a clínica.");
}

export async function deleteClinic(id: string) {
  await requireAdmin();
  try {
    const [users, reclamacoes] = await Promise.all([
      prisma.user.count({ where: { clinicId: id } }),
      prisma.reclamacao.count({ where: { clinicId: id } }),
    ]);
    if (users > 0 || reclamacoes > 0) {
      return { ok: false as const, users, reclamacoes };
    }
    await prisma.clinic.delete({ where: { id } });
    revalidatePath("/admin/clinicas");
    return { ok: true as const };
  } catch (error) {
    console.error(error);
    return {
      ok: false as const,
      users: 0,
      reclamacoes: 0,
      error: mapPrismaError(error, "Não foi possível excluir a clínica."),
    };
  }
}

export async function createUser(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const password = String(formData.get("password") || "");
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const name = String(formData.get("name") || "").trim();
  const role = String(formData.get("role") || "PADRAO") as Role;
  const cargoRaw = String(formData.get("cargo") || "");
  const cargo = cargoRaw ? (cargoRaw as Cargo) : null;
  const clinicId = String(formData.get("clinicId") || "") || null;

  if (!name || !email || !password) {
    return actionFail("Preencha nome, e-mail e senha.");
  }
  if (password.length < 5) {
    return actionFail("A senha deve ter pelo menos 5 caracteres.");
  }
  if (role !== "ADMIN" && role !== "PADRAO") {
    return actionFail("Perfil inválido.");
  }

  const existente = await prisma.user.findUnique({ where: { email } });
  if (existente) {
    return actionFail("Já existe um usuário com este e-mail.");
  }

  return runAction(async () => {
    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
        cargo,
        clinicId,
        emailVerified: true,
      },
    });

    await prisma.account.create({
      data: {
        userId: user.id,
        accountId: user.id,
        providerId: "credential",
        password: hashed,
      },
    });
    revalidatePath("/admin/usuarios");
  }, "Não foi possível cadastrar o usuário. Tente novamente.");
}

export async function updateUser(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  return runAction(async () => {
    const id = String(formData.get("id"));
    const cargoRaw = String(formData.get("cargo") || "");
    await prisma.user.update({
      where: { id },
      data: {
        name: String(formData.get("name")),
        role: String(formData.get("role")) as Role,
        cargo: cargoRaw ? (cargoRaw as Cargo) : null,
        clinicId: String(formData.get("clinicId") || "") || null,
        active: formData.get("active") === "on",
      },
    });
    revalidatePath("/admin/usuarios");
  }, "Não foi possível atualizar o usuário.");
}

export async function deleteUser(id: string) {
  const session = await requireAdmin();
  if (session.user.id === id) {
    return {
      ok: false as const,
      motivo: "self" as const,
      reclamacoes: 0,
      tratamentos: 0,
      historicos: 0,
      etapas: 0,
    };
  }
  try {
    const [responsavel, criadas, tratamentos, historicos, etapas] =
      await Promise.all([
        prisma.reclamacao.count({ where: { responsavelId: id } }),
        prisma.reclamacao.count({ where: { criadoPorId: id } }),
        prisma.tratamento.count({ where: { responsavelId: id } }),
        prisma.historicoReclamacao.count({ where: { usuarioId: id } }),
        prisma.esteiraEtapa.count({ where: { usuarioId: id } }),
      ]);
    const reclamacoes = responsavel + criadas;
    if (reclamacoes > 0 || tratamentos > 0 || historicos > 0 || etapas > 0) {
      return {
        ok: false as const,
        motivo: "vinculos" as const,
        reclamacoes,
        tratamentos,
        historicos,
        etapas,
      };
    }
    await prisma.user.delete({ where: { id } });
    revalidatePath("/admin/usuarios");
    return { ok: true as const };
  } catch (error) {
    console.error(error);
    return {
      ok: false as const,
      motivo: "vinculos" as const,
      reclamacoes: 0,
      tratamentos: 0,
      historicos: 0,
      etapas: 0,
      error: mapPrismaError(error, "Não foi possível excluir o usuário."),
    };
  }
}

export async function createEsteira(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const ordem = Number(formData.get("ordem"));
  if (!Number.isFinite(ordem) || ordem < 1) {
    return actionFail("Informe uma ordem válida.");
  }
  const usuarioId = String(formData.get("usuarioId") || "");
  if (!usuarioId) {
    return actionFail("Selecione o usuário do alerta.");
  }

  const ordemExistente = await prisma.esteiraEtapa.findUnique({
    where: { ordem },
  });
  if (ordemExistente) {
    return actionFail("Já existe uma etapa com esta ordem.");
  }

  return runAction(async () => {
    await prisma.esteiraEtapa.create({
      data: {
        nome: String(formData.get("nome")),
        ordem,
        prazoDias: Number(formData.get("prazoDias")),
        usuarioId,
        emailAviso: formData.get("emailAviso") === "on",
        active: formData.get("active") === "on",
      },
    });
    revalidatePath("/admin/esteira");
  }, "Não foi possível cadastrar a etapa.");
}

export async function updateEsteira(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get("id"));
  const ordem = Number(formData.get("ordem"));
  if (!Number.isFinite(ordem) || ordem < 1) {
    return actionFail("Informe uma ordem válida.");
  }
  const usuarioId = String(formData.get("usuarioId") || "");
  if (!usuarioId) {
    return actionFail("Selecione o usuário do alerta.");
  }

  const ordemExistente = await prisma.esteiraEtapa.findFirst({
    where: { ordem, NOT: { id } },
  });
  if (ordemExistente) {
    return actionFail("Já existe uma etapa com esta ordem.");
  }

  return runAction(async () => {
    await prisma.esteiraEtapa.update({
      where: { id },
      data: {
        nome: String(formData.get("nome")),
        ordem,
        prazoDias: Number(formData.get("prazoDias")),
        usuarioId,
        emailAviso: formData.get("emailAviso") === "on",
        active: formData.get("active") === "on",
      },
    });
    revalidatePath("/admin/esteira");
  }, "Não foi possível atualizar a etapa.");
}

export async function deleteEsteira(id: string) {
  await requireAdmin();
  try {
    const reclamacoes = await prisma.reclamacao.count({
      where: { etapaId: id },
    });
    if (reclamacoes > 0) {
      return { ok: false as const, reclamacoes };
    }
    await prisma.esteiraEtapa.delete({ where: { id } });
    revalidatePath("/admin/esteira");
    return { ok: true as const };
  } catch (error) {
    console.error(error);
    return {
      ok: false as const,
      reclamacoes: 0,
      error: mapPrismaError(error, "Não foi possível excluir a etapa."),
    };
  }
}

export async function createReclamacao(
  formData: FormData
): Promise<ActionResultWithId> {
  try {
    const session = await requireSession();
    const etapa = await primeiraEtapa();
    const protocolo = await gerarProtocolo();
    const clinicId = String(formData.get("clinicId") || "");
    const pacienteNome = String(formData.get("pacienteNome") || "").trim();
    const descricao = String(formData.get("descricao") || "").trim();

    if (!pacienteNome || !clinicId || !descricao) {
      return actionFail("Preencha paciente, clínica e descrição.");
    }

    const reclamacao = await prisma.reclamacao.create({
      data: {
        protocolo,
        pacienteNome,
        pacienteContato: String(formData.get("pacienteContato") || "") || null,
        clinicId,
        canal: String(formData.get("canal")) as CanalOrigem,
        motivo: String(formData.get("motivo")) as MotivoReclamacao,
        servico: String(formData.get("servico") || "") || null,
        prioridade: String(formData.get("prioridade") || "MEDIA") as Prioridade,
        descricao,
        etapaId: etapa?.id,
        responsavelId:
          String(formData.get("responsavelId") || "") || session.user.id,
        criadoPorId: session.user.id,
        prazoEm: calcularPrazo(etapa),
        status: "ABERTA",
        historicos: {
          create: {
            usuarioId: session.user.id,
            acao: "ABERTURA",
            detalhe: `Protocolo ${protocolo} aberto`,
          },
        },
      },
    });

    revalidatePath("/reclamacoes");
    revalidatePath("/agenda");
    return actionOkId(reclamacao.id);
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
    return actionFail(
      mapPrismaError(error, "Não foi possível abrir a reclamação.")
    );
  }
}

export async function adicionarEvolucao(
  formData: FormData
): Promise<ActionResult> {
  const session = await requireSession();
  const id = String(formData.get("id"));
  const evolucao = String(formData.get("evolucao") || "").trim();
  if (!evolucao) {
    return actionFail("Informe o texto da evolução.");
  }

  const result = await runAction(async () => {
    await prisma.historicoReclamacao.create({
      data: {
        reclamacaoId: id,
        usuarioId: session.user.id,
        acao: "EVOLUCAO",
        detalhe: evolucao,
      },
    });
    revalidatePath(`/reclamacoes/${id}`);
  }, "Não foi possível salvar a evolução.");

  if (!result.ok) return result;
  redirect(`/reclamacoes/${id}`);
}

export async function encerrarReclamacao(
  formData: FormData
): Promise<ActionResult> {
  const session = await requireSession();
  const id = String(formData.get("id"));
  const parecerFinal = String(formData.get("parecerFinal") || "").trim();
  if (!parecerFinal) {
    return actionFail("Informe o parecer final.");
  }

  const result = await runAction(async () => {
    await prisma.$transaction(async (tx) => {
      await tx.reclamacao.update({
        where: { id },
        data: {
          status: "ENCERRADA",
          encerradaEm: new Date(),
          concluidaEm: new Date(),
          parecerFinal,
          historicos: {
            create: {
              usuarioId: session.user.id,
              acao: "ENCERRAMENTO",
              detalhe: "Reclamação encerrada com parecer final e NPS gerado",
            },
          },
        },
      });

      const npsExistente = await tx.npsResposta.findUnique({
        where: { reclamacaoId: id },
      });
      if (!npsExistente) {
        await tx.npsResposta.create({
          data: { reclamacaoId: id },
        });
      }
    });
    revalidatePath(`/reclamacoes/${id}`);
    revalidatePath("/reclamacoes");
    revalidatePath("/agenda");
    revalidatePath("/nps");
  }, "Não foi possível encerrar a reclamação.");

  if (!result.ok) return result;
  redirect(`/reclamacoes/${id}`);
}

export async function updateReclamacaoStatus(
  formData: FormData
): Promise<ActionResult> {
  return runAction(async () => {
    const session = await requireSession();
    const id = String(formData.get("id"));
    const acao = String(formData.get("acao"));

    if (acao === "avancar") {
      await avancarEtapa(id, session.user.id);
    } else if (acao === "atribuir") {
      await prisma.reclamacao.update({
        where: { id },
        data: {
          responsavelId: String(formData.get("responsavelId")),
          historicos: {
            create: {
              usuarioId: session.user.id,
              acao: "ATRIBUICAO",
              detalhe: "Responsável atualizado",
            },
          },
        },
      });
    }

    revalidatePath(`/reclamacoes/${id}`);
    revalidatePath("/reclamacoes");
    revalidatePath("/agenda");
  }, "Não foi possível atualizar a reclamação.");
}

export async function createTratamento(formData: FormData): Promise<void> {
  await runAction(async () => {
    const session = await requireSession();
    const reclamacaoId = String(formData.get("reclamacaoId"));
    await prisma.tratamento.create({
      data: {
        reclamacaoId,
        descricao: String(formData.get("descricao")),
        responsavelId: session.user.id,
      },
    });
    revalidatePath("/tratamentos");
    revalidatePath(`/reclamacoes/${reclamacaoId}`);
  }, "Não foi possível vincular o tratamento.");
}

export async function updateTratamentoStatus(
  formData: FormData
): Promise<void> {
  await runAction(async () => {
    await requireSession();
    const id = String(formData.get("id"));
    await prisma.tratamento.update({
      where: { id },
      data: { status: String(formData.get("status")) },
    });
    revalidatePath("/tratamentos");
  }, "Não foi possível atualizar o tratamento.");
}

export async function submitNps(formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    const token = String(formData.get("token"));
    const nota = Number(formData.get("nota"));
    const comentario = String(formData.get("comentario") || "") || null;

    await prisma.npsResposta.update({
      where: { token },
      data: {
        nota,
        comentario,
        respondidoEm: new Date(),
      },
    });
  }, "Não foi possível registrar a avaliação.");
}
