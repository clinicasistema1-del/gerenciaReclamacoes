"use server";

import { revalidatePath } from "next/cache";
import { hashPassword } from "better-auth/crypto";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireSession } from "@/lib/session";
import {
  avancarEtapa,
  calcularPrazo,
  gerarProtocolo,
  primeiraEtapa,
} from "@/lib/reclamacao";
import type {
  CanalOrigem,
  MotivoReclamacao,
  Prioridade,
  Role,
} from "@prisma/client";

export async function createClinic(formData: FormData) {
  await requireAdmin();
  await prisma.clinic.create({
    data: {
      name: String(formData.get("name")),
      city: String(formData.get("city")),
      state: String(formData.get("state")).toUpperCase(),
    },
  });
  revalidatePath("/admin/clinicas");
  return { ok: true as const };
}

export async function updateClinic(formData: FormData) {
  await requireAdmin();
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
  return { ok: true as const };
}

export async function deleteClinic(id: string) {
  await requireAdmin();
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
}

export async function createUser(formData: FormData) {
  await requireAdmin();
  const password = String(formData.get("password"));
  const hashed = await hashPassword(password);
  const email = String(formData.get("email")).toLowerCase();
  const name = String(formData.get("name"));
  const role = String(formData.get("role")) as Role;
  const clinicId = String(formData.get("clinicId") || "") || null;

  const user = await prisma.user.create({
    data: {
      name,
      email,
      role,
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
  return { ok: true as const };
}

export async function updateUser(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.user.update({
    where: { id },
    data: {
      name: String(formData.get("name")),
      role: String(formData.get("role")) as Role,
      clinicId: String(formData.get("clinicId") || "") || null,
      active: formData.get("active") === "on",
    },
  });
  revalidatePath("/admin/usuarios");
  return { ok: true as const };
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
    };
  }
  const [responsavel, criadas, tratamentos, historicos] = await Promise.all([
    prisma.reclamacao.count({ where: { responsavelId: id } }),
    prisma.reclamacao.count({ where: { criadoPorId: id } }),
    prisma.tratamento.count({ where: { responsavelId: id } }),
    prisma.historicoReclamacao.count({ where: { usuarioId: id } }),
  ]);
  const reclamacoes = responsavel + criadas;
  if (reclamacoes > 0 || tratamentos > 0 || historicos > 0) {
    return {
      ok: false as const,
      motivo: "vinculos" as const,
      reclamacoes,
      tratamentos,
      historicos,
    };
  }
  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/usuarios");
  return { ok: true as const };
}

export async function saveEsteira(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const data = {
    nome: String(formData.get("nome")),
    ordem: Number(formData.get("ordem")),
    prazoHoras: Number(formData.get("prazoHoras")),
    roleAlvo: String(formData.get("roleAlvo")) as Role,
    emailAviso: formData.get("emailAviso") === "on",
    active: formData.get("active") === "on",
  };

  if (id) {
    await prisma.esteiraEtapa.update({ where: { id }, data });
  } else {
    await prisma.esteiraEtapa.create({ data });
  }
  revalidatePath("/admin/esteira");
}

export async function createReclamacao(formData: FormData) {
  const session = await requireSession();
  const etapa = await primeiraEtapa();
  const protocolo = await gerarProtocolo();

  const reclamacao = await prisma.reclamacao.create({
    data: {
      protocolo,
      pacienteNome: String(formData.get("pacienteNome")),
      pacienteContato: String(formData.get("pacienteContato") || "") || null,
      clinicId: String(formData.get("clinicId")),
      canal: String(formData.get("canal")) as CanalOrigem,
      motivo: String(formData.get("motivo")) as MotivoReclamacao,
      servico: String(formData.get("servico") || "") || null,
      prioridade: String(formData.get("prioridade") || "MEDIA") as Prioridade,
      descricao: String(formData.get("descricao")),
      etapaId: etapa?.id,
      responsavelId: String(formData.get("responsavelId") || "") || session.user.id,
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
  return reclamacao.id;
}

export async function updateReclamacaoStatus(formData: FormData) {
  const session = await requireSession();
  const id = String(formData.get("id"));
  const acao = String(formData.get("acao"));

  if (acao === "avancar") {
    await avancarEtapa(id, session.user.id);
  } else if (acao === "concluir") {
    await prisma.reclamacao.update({
      where: { id },
      data: {
        status: "CONCLUIDA",
        concluidaEm: new Date(),
        historicos: {
          create: {
            usuarioId: session.user.id,
            acao: "CONCLUSAO",
            detalhe: "Demanda concluída",
          },
        },
        nps: {
          create: {},
        },
      },
    });
  } else if (acao === "encerrar") {
    await prisma.reclamacao.update({
      where: { id },
      data: {
        status: "ENCERRADA",
        encerradaEm: new Date(),
        parecerFinal: String(formData.get("parecerFinal") || ""),
        historicos: {
          create: {
            usuarioId: session.user.id,
            acao: "ENCERRAMENTO",
            detalhe: "Parecer final e encerramento",
          },
        },
      },
    });
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
}

export async function createTratamento(formData: FormData) {
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
}

export async function updateTratamentoStatus(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id"));
  await prisma.tratamento.update({
    where: { id },
    data: { status: String(formData.get("status")) },
  });
  revalidatePath("/tratamentos");
}

export async function submitNps(formData: FormData) {
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
}
