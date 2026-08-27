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
  calcularPrazo,
  calcularPrazoTratamento,
  entradaNaEtapa,
  gerarProtocolo,
  primeiraEtapa,
} from "@/lib/reclamacao";
import { sendReclamacaoAbertaEmail, sendReclamacaoEncerradaEmail } from "@/lib/email";
import { somenteDigitos } from "@/lib/utils";
import type {
  CanalOrigem,
  Cargo,
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
    revalidatePath(`/admin/clinicas/${id}`);
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

function revalidateCustomizacao() {
  revalidatePath("/admin/customizacao");
  revalidatePath("/reclamacoes/nova");
  revalidatePath("/reclamacoes");
  revalidatePath("/relatorios");
}

export async function createMotivo(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const descricao = String(formData.get("descricao") || "").trim();
  if (!descricao) {
    return actionFail("Informe a descrição do motivo.");
  }
  return runAction(async () => {
    await prisma.motivo.create({ data: { descricao } });
    revalidateCustomizacao();
  }, "Não foi possível cadastrar o motivo.");
}

export async function updateMotivo(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const descricao = String(formData.get("descricao") || "").trim();
  if (!id || !descricao) {
    return actionFail("Informe a descrição do motivo.");
  }
  return runAction(async () => {
    await prisma.motivo.update({ where: { id }, data: { descricao } });
    revalidateCustomizacao();
  }, "Não foi possível atualizar o motivo.");
}

export async function deleteMotivo(id: string) {
  await requireAdmin();
  try {
    const reclamacoes = await prisma.reclamacao.count({ where: { motivoId: id } });
    if (reclamacoes > 0) {
      return { ok: false as const, reclamacoes };
    }
    await prisma.motivo.delete({ where: { id } });
    revalidateCustomizacao();
    return { ok: true as const };
  } catch (error) {
    console.error(error);
    return {
      ok: false as const,
      reclamacoes: 0,
      error: mapPrismaError(error, "Não foi possível excluir o motivo."),
    };
  }
}

export async function createServico(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const descricao = String(formData.get("descricao") || "").trim();
  if (!descricao) {
    return actionFail("Informe a descrição do serviço.");
  }
  return runAction(async () => {
    await prisma.servico.create({ data: { descricao } });
    revalidateCustomizacao();
  }, "Não foi possível cadastrar o serviço.");
}

export async function updateServico(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const descricao = String(formData.get("descricao") || "").trim();
  if (!id || !descricao) {
    return actionFail("Informe a descrição do serviço.");
  }
  return runAction(async () => {
    await prisma.servico.update({ where: { id }, data: { descricao } });
    revalidateCustomizacao();
  }, "Não foi possível atualizar o serviço.");
}

export async function deleteServico(id: string) {
  await requireAdmin();
  try {
    const reclamacoes = await prisma.reclamacao.count({
      where: { servicoId: id },
    });
    if (reclamacoes > 0) {
      return { ok: false as const, reclamacoes };
    }
    await prisma.servico.delete({ where: { id } });
    revalidateCustomizacao();
    return { ok: true as const };
  } catch (error) {
    console.error(error);
    return {
      ok: false as const,
      reclamacoes: 0,
      error: mapPrismaError(error, "Não foi possível excluir o serviço."),
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
  const cpfRaw = String(formData.get("cpf") || "").trim();
  const cpf = cpfRaw ? somenteDigitos(cpfRaw) : "";
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
        cpf: cpf || null,
        senhaAcesso: password,
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
  const id = String(formData.get("id"));
  const cargoRaw = String(formData.get("cargo") || "");
  const cpfRaw = String(formData.get("cpf") || "").trim();
  const cpf = cpfRaw ? somenteDigitos(cpfRaw) : "";
  const password = String(formData.get("password") || "");

  if (password && password.length < 5) {
    return actionFail("A senha deve ter pelo menos 5 caracteres.");
  }

  return runAction(async () => {
    await prisma.user.update({
      where: { id },
      data: {
        name: String(formData.get("name")),
        role: String(formData.get("role")) as Role,
        cargo: cargoRaw ? (cargoRaw as Cargo) : null,
        clinicId: String(formData.get("clinicId") || "") || null,
        cpf: cpf || null,
        active: formData.get("active") === "on",
        ...(password ? { senhaAcesso: password } : {}),
      },
    });

    if (password) {
      const hashed = await hashPassword(password);
      const account = await prisma.account.findFirst({
        where: { userId: id, providerId: "credential" },
      });
      if (account) {
        await prisma.account.update({
          where: { id: account.id },
          data: { password: hashed },
        });
      } else {
        await prisma.account.create({
          data: {
            userId: id,
            accountId: id,
            providerId: "credential",
            password: hashed,
          },
        });
      }
    }

    revalidatePath("/admin/usuarios");
    revalidatePath(`/admin/usuarios/${id}`);
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
        emailAviso: true,
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
        emailAviso: true,
        active: formData.get("active") === "on",
      },
    });
    revalidatePath("/admin/esteira");
    revalidatePath(`/admin/esteira/${id}`);
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
    const pacienteCpfRaw = String(formData.get("pacienteCpf") || "").trim();
    const pacienteCpf = pacienteCpfRaw ? somenteDigitos(pacienteCpfRaw) : "";
    const descricao = String(formData.get("descricao") || "").trim();
    const responsavelId = String(formData.get("responsavelId") || "").trim();

    const motivoId = String(formData.get("motivoId") || "").trim();
    const servicoId = String(formData.get("servicoId") || "").trim();

    if (!pacienteNome || !clinicId || !descricao) {
      return actionFail("Preencha paciente, clínica e descrição.");
    }
    if (!motivoId) {
      return actionFail("Selecione o motivo.");
    }
    if (!responsavelId) {
      return actionFail("Selecione o responsável pelo atendimento.");
    }

    const [responsavel, motivo, servico] = await Promise.all([
      prisma.user.findFirst({
        where: { id: responsavelId, active: true, clinicId },
        select: { id: true },
      }),
      prisma.motivo.findUnique({ where: { id: motivoId }, select: { id: true } }),
      servicoId
        ? prisma.servico.findUnique({
            where: { id: servicoId },
            select: { id: true },
          })
        : Promise.resolve(null),
    ]);
    if (!responsavel) {
      return actionFail(
        "Responsável pelo atendimento inválido para a clínica selecionada."
      );
    }
    if (!motivo) {
      return actionFail("Motivo inválido.");
    }
    if (servicoId && !servico) {
      return actionFail("Serviço inválido.");
    }

    const reclamacao = await prisma.reclamacao.create({
      data: {
        protocolo,
        pacienteNome,
        pacienteCpf: pacienteCpf || null,
        pacienteContato: String(formData.get("pacienteContato") || "") || null,
        clinicId,
        canal: String(formData.get("canal")) as CanalOrigem,
        motivoId,
        servicoId: servicoId || null,
        prioridade: String(formData.get("prioridade") || "MEDIA") as Prioridade,
        descricao,
        etapaId: etapa?.id,
        responsavelId,
        criadoPorId: session.user.id,
        prazoEm: null,
        status: "ABERTA",
        historicos: {
          create: {
            usuarioId: session.user.id,
            acao: "ABERTURA",
            detalhe: `Protocolo ${protocolo} aberto`,
          },
        },
      },
      include: {
        clinic: true,
        responsavel: true,
        criadoPor: true,
        etapa: true,
      },
    });

    let prazoEm: Date | null = null;

    if (etapa) {
      const entrada = await entradaNaEtapa(reclamacao.id, etapa).catch(
        (error) => {
          console.error("[email:entrada-etapa]", error);
          return { prazoEm: null, enviado: false };
        }
      );
      prazoEm = entrada.prazoEm;
    }

    const destinatario =
      reclamacao.responsavel?.email || reclamacao.criadoPor.email;
    const nomeResponsavel =
      reclamacao.responsavel?.name || reclamacao.criadoPor.name;

    if (destinatario) {
      await sendReclamacaoAbertaEmail({
        to: destinatario,
        reclamacaoId: reclamacao.id,
        protocolo: reclamacao.protocolo,
        pacienteNome: reclamacao.pacienteNome,
        clinica: reclamacao.clinic.name,
        etapa: reclamacao.etapa?.nome ?? null,
        prazoEm,
        descricao: reclamacao.descricao,
        responsavelAtendimento: nomeResponsavel,
      }).catch((error) => console.error("[email:abertura]", error));
    }

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
  const encerrarTratamento = String(formData.get("encerrarTratamento") || "") === "1";

  if (!parecerFinal) {
    return actionFail("Informe o parecer final.");
  }

  const reclamacao = await prisma.reclamacao.findUnique({
    where: { id },
    select: {
      status: true,
      tratamentos: {
        where: { status: "EM_ANDAMENTO" },
        select: { id: true },
        take: 1,
      },
    },
  });

  const tratamentoAberto = reclamacao?.tratamentos[0] ?? null;

  if (tratamentoAberto && !encerrarTratamento) {
    return actionFail(
      "Esta reclamação possui um tratamento em aberto. Confirme o encerramento conjunto para continuar."
    );
  }

  const result = await runAction(async () => {
    await prisma.$transaction(async (tx) => {
      if (tratamentoAberto) {
        await tx.tratamento.update({
          where: { id: tratamentoAberto.id },
          data: {
            status: "CONCLUIDO",
            finalizadoEm: new Date(),
            historicos: {
              create: {
                usuarioId: session.user.id,
                acao: "FINALIZACAO",
                detalhe:
                  "Tratamento encerrado junto com a reclamação. Parecer: " +
                  parecerFinal,
              },
            },
          },
        });
      }

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
              detalhe: tratamentoAberto
                ? "Reclamação e tratamento encerrados com parecer final e NPS gerado"
                : "Reclamação encerrada com parecer final e NPS gerado",
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

    const reclamacaoAtualizada = await prisma.reclamacao.findUnique({
      where: { id },
      include: {
        clinic: true,
        responsavel: true,
        criadoPor: true,
      },
    });

    if (reclamacaoAtualizada) {
      const destinatario =
        reclamacaoAtualizada.responsavel?.email ||
        reclamacaoAtualizada.criadoPor.email;
      const nomeResponsavel =
        reclamacaoAtualizada.responsavel?.name ||
        reclamacaoAtualizada.criadoPor.name;

      if (destinatario) {
        await sendReclamacaoEncerradaEmail({
          to: destinatario,
          reclamacaoId: reclamacaoAtualizada.id,
          protocolo: reclamacaoAtualizada.protocolo,
          pacienteNome: reclamacaoAtualizada.pacienteNome,
          clinica: reclamacaoAtualizada.clinic.name,
          descricao: reclamacaoAtualizada.descricao,
          parecerFinal,
          responsavelAtendimento: nomeResponsavel,
        }).catch((error) => console.error("[email:encerramento]", error));
      }
    }

    revalidatePath(`/reclamacoes/${id}`);
    revalidatePath("/reclamacoes");
    revalidatePath("/agenda");
    revalidatePath("/nps");
    revalidatePath("/tratamentos");
    if (tratamentoAberto) {
      revalidatePath(`/tratamentos/${tratamentoAberto.id}`);
    }
  }, "Não foi possível encerrar a reclamação.");

  if (!result.ok) return result;
  redirect(`/reclamacoes/${id}`);
}

export async function createTratamento(
  formData: FormData
): Promise<ActionResultWithId> {
  try {
    const session = await requireSession();
    const reclamacaoId = String(formData.get("reclamacaoId") || "");
    const descricao = String(formData.get("descricao") || "").trim();
    const responsavelId = String(formData.get("responsavelId") || "").trim();
    const clinicId = String(formData.get("clinicId") || "").trim();
    const dataProximaRaw = String(formData.get("dataProxima") || "").trim();

    if (!reclamacaoId || !descricao || !responsavelId || !clinicId || !dataProximaRaw) {
      return actionFail(
        "Preencha descrição, responsável, clínica e data do próximo tratamento."
      );
    }

    const existente = await prisma.tratamento.findUnique({
      where: { reclamacaoId },
    });
    if (existente) {
      return actionFail("Esta reclamação já possui um tratamento vinculado.");
    }

    const dataProxima = new Date(`${dataProximaRaw}T12:00:00`);
    if (Number.isNaN(dataProxima.getTime())) {
      return actionFail("Informe uma data válida para o próximo tratamento.");
    }

    const tratamento = await prisma.$transaction(async (tx) => {
      const criado = await tx.tratamento.create({
        data: {
          reclamacaoId,
          clinicId,
          descricao,
          responsavelId,
          dataProxima,
          status: "EM_ANDAMENTO",
          historicos: {
            create: {
              usuarioId: session.user.id,
              acao: "ABERTURA",
              detalhe: "Tratamento vinculado à reclamação",
            },
          },
        },
      });

      await tx.reclamacao.update({
        where: { id: reclamacaoId },
        data: {
          status: "VINCULADA_TRATAMENTO",
          prazoEm: calcularPrazoTratamento(dataProxima),
          atrasadaEm: null,
          historicos: {
            create: {
              usuarioId: session.user.id,
              acao: "VINCULO_TRATAMENTO",
              detalhe: "Reclamação vinculada a um tratamento em andamento",
            },
          },
        },
      });

      return criado;
    });

    revalidatePath("/tratamentos");
    revalidatePath(`/tratamentos/${tratamento.id}`);
    revalidatePath(`/reclamacoes/${reclamacaoId}`);
    revalidatePath("/agenda");
    return actionOkId(tratamento.id);
  } catch (error) {
    console.error(error);
    return actionFail(
      mapPrismaError(error, "Não foi possível vincular o tratamento.")
    );
  }
}

export async function adicionarEvolucaoTratamento(
  formData: FormData
): Promise<ActionResult> {
  const session = await requireSession();
  const id = String(formData.get("id") || "");
  const evolucao = String(formData.get("evolucao") || "").trim();
  const dataProximaRaw = String(formData.get("dataProxima") || "").trim();

  if (!evolucao) {
    return actionFail("Informe o texto da evolução.");
  }

  const tratamento = await prisma.tratamento.findUnique({ where: { id } });
  if (!tratamento) {
    return actionFail("Tratamento não encontrado.");
  }
  if (tratamento.status !== "EM_ANDAMENTO") {
    return actionFail("Não é possível evoluir um tratamento finalizado.");
  }

  let dataProxima: Date | undefined;
  if (dataProximaRaw) {
    dataProxima = new Date(`${dataProximaRaw}T12:00:00`);
    if (Number.isNaN(dataProxima.getTime())) {
      return actionFail("Informe uma data válida para o próximo retorno.");
    }
  }

  const result = await runAction(async () => {
    await prisma.tratamento.update({
      where: { id },
      data: {
        ...(dataProxima ? { dataProxima } : {}),
        historicos: {
          create: {
            usuarioId: session.user.id,
            acao: "EVOLUCAO",
            detalhe: evolucao,
          },
        },
      },
    });

    if (dataProxima) {
      await prisma.reclamacao.update({
        where: { id: tratamento.reclamacaoId },
        data: {
          prazoEm: calcularPrazoTratamento(dataProxima),
          atrasadaEm: null,
        },
      });
    }

    revalidatePath(`/tratamentos/${id}`);
    revalidatePath("/tratamentos");
    revalidatePath(`/reclamacoes/${tratamento.reclamacaoId}`);
    revalidatePath("/agenda");
  }, "Não foi possível salvar a evolução do tratamento.");

  if (!result.ok) return result;
  redirect(`/tratamentos/${id}`);
}

export async function finalizarTratamento(
  formData: FormData
): Promise<ActionResult> {
  const session = await requireSession();
  const id = String(formData.get("id") || "");
  const parecer = String(formData.get("parecer") || "").trim();

  if (!parecer) {
    return actionFail("Informe o parecer de finalização.");
  }

  const tratamento = await prisma.tratamento.findUnique({ where: { id } });
  if (!tratamento) {
    return actionFail("Tratamento não encontrado.");
  }
  if (tratamento.status !== "EM_ANDAMENTO") {
    return actionFail("Este tratamento já está finalizado.");
  }

  const result = await runAction(async () => {
    await prisma.$transaction(async (tx) => {
      const reclamacao = await tx.reclamacao.findUnique({
        where: { id: tratamento.reclamacaoId },
        include: { etapa: true },
      });

      await tx.tratamento.update({
        where: { id },
        data: {
          status: "CONCLUIDO",
          finalizadoEm: new Date(),
          historicos: {
            create: {
              usuarioId: session.user.id,
              acao: "FINALIZACAO",
              detalhe: parecer,
            },
          },
        },
      });

      if (
        reclamacao &&
        reclamacao.status !== "ENCERRADA" &&
        reclamacao.status !== "CONCLUIDA"
      ) {
        await tx.reclamacao.update({
          where: { id: reclamacao.id },
          data: {
            status: "EM_ANDAMENTO",
            atrasadaEm: null,
            historicos: {
              create: {
                usuarioId: session.user.id,
                acao: "RETORNO_ESTEIRA",
                detalhe:
                  "Tratamento finalizado. Reclamação retomou o fluxo da esteira",
              },
            },
          },
        });
      }
    });

    const reclamacaoRetorno = await prisma.reclamacao.findUnique({
      where: { id: tratamento.reclamacaoId },
      include: { etapa: { include: { usuario: true } } },
    });

    if (
      reclamacaoRetorno?.etapa &&
      reclamacaoRetorno.status === "EM_ANDAMENTO"
    ) {
      await entradaNaEtapa(reclamacaoRetorno.id, reclamacaoRetorno.etapa, {
        usuarioId: session.user.id,
        historicoAcao: "ENTRADA_ETAPA",
        historicoDetalhe: "Prazo reiniciado após retorno do tratamento",
      }).catch((error) => console.error("[email:entrada-etapa]", error));
    }

    revalidatePath(`/tratamentos/${id}`);
    revalidatePath("/tratamentos");
    revalidatePath(`/reclamacoes/${tratamento.reclamacaoId}`);
    revalidatePath("/agenda");
  }, "Não foi possível finalizar o tratamento.");

  if (!result.ok) return result;
  redirect(`/tratamentos/${id}`);
}

export async function updateTratamentoStatus(
  formData: FormData
): Promise<ActionResult> {
  return runAction(async () => {
    await requireSession();
    const id = String(formData.get("id"));
    const status = String(formData.get("status"));
    await prisma.tratamento.update({
      where: { id },
      data: {
        status,
        finalizadoEm:
          status === "CONCLUIDO" || status === "CANCELADO"
            ? new Date()
            : null,
      },
    });
    revalidatePath("/tratamentos");
    revalidatePath(`/tratamentos/${id}`);
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
