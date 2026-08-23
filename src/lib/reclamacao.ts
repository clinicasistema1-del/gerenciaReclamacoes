import { addHours } from "date-fns";
import type { EsteiraEtapa, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendSlaEmail } from "@/lib/email";

export async function gerarProtocolo() {
  const year = new Date().getFullYear();
  const count = await prisma.reclamacao.count({
    where: {
      createdAt: {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`),
      },
    },
  });
  return `GRC-${year}-${String(count + 1).padStart(6, "0")}`;
}

export async function primeiraEtapa() {
  return prisma.esteiraEtapa.findFirst({
    where: { active: true },
    orderBy: { ordem: "asc" },
  });
}

export function calcularPrazo(etapa: EsteiraEtapa | null) {
  if (!etapa) return null;
  return addHours(new Date(), etapa.prazoHoras);
}

export async function avancarEtapa(reclamacaoId: string, usuarioId: string) {
  const reclamacao = await prisma.reclamacao.findUnique({
    where: { id: reclamacaoId },
    include: { etapa: true },
  });
  if (!reclamacao) throw new Error("Reclamação não encontrada");

  const proxima = await prisma.esteiraEtapa.findFirst({
    where: {
      active: true,
      ordem: { gt: reclamacao.etapa?.ordem ?? 0 },
    },
    orderBy: { ordem: "asc" },
  });

  if (!proxima) {
    return prisma.reclamacao.update({
      where: { id: reclamacaoId },
      data: {
        status: "AGUARDANDO_PARECER",
        historicos: {
          create: {
            usuarioId,
            acao: "ETAPA_FINAL",
            detalhe: "Aguardando parecer final da administração",
          },
        },
      },
    });
  }

  return prisma.reclamacao.update({
    where: { id: reclamacaoId },
    data: {
      etapaId: proxima.id,
      status: "EM_ANDAMENTO",
      prazoEm: calcularPrazo(proxima),
      atrasadaEm: null,
      historicos: {
        create: {
          usuarioId,
          acao: "AVANCO_ETAPA",
          detalhe: `Avançou para ${proxima.nome}`,
        },
      },
    },
  });
}

export async function processarEscalonamentos() {
  const agora = new Date();
  const atrasadas = await prisma.reclamacao.findMany({
    where: {
      status: { in: ["ABERTA", "EM_ANDAMENTO", "ATRASADA"] },
      prazoEm: { lt: agora },
    },
    include: {
      clinic: true,
      etapa: true,
      responsavel: true,
    },
  });

  let enviados = 0;

  for (const item of atrasadas) {
    if (item.status !== "ATRASADA") {
      await prisma.reclamacao.update({
        where: { id: item.id },
        data: {
          status: "ATRASADA",
          atrasadaEm: item.atrasadaEm ?? agora,
          historicos: {
            create: {
              acao: "MARCADA_ATRASADA",
              detalhe: "Prazo da etapa atual ultrapassado",
            },
          },
        },
      });
    }

    const etapaOrdem = item.etapa?.ordem ?? 1;
    const etapaAlvo = await prisma.esteiraEtapa.findFirst({
      where: { active: true, ordem: { gte: etapaOrdem }, emailAviso: true },
      orderBy: { ordem: "asc" },
    });

    if (!etapaAlvo) continue;

    const destinatarios = await prisma.user.findMany({
      where: {
        active: true,
        role: etapaAlvo.roleAlvo as Role,
        OR: [{ clinicId: item.clinicId }, { role: "ADMIN" }],
      },
    });

    for (const dest of destinatarios) {
      const jaEnviado = await prisma.escalonamentoLog.findFirst({
        where: {
          reclamacaoId: item.id,
          etapaOrdem: etapaAlvo.ordem,
          emailDestino: dest.email,
        },
      });
      if (jaEnviado) continue;

      const result = await sendSlaEmail({
        to: dest.email,
        protocolo: item.protocolo,
        pacienteNome: item.pacienteNome,
        clinica: item.clinic.name,
        etapa: item.etapa?.nome ?? etapaAlvo.nome,
        prazoEm: item.prazoEm ?? agora,
      });

      await prisma.escalonamentoLog.create({
        data: {
          reclamacaoId: item.id,
          etapaOrdem: etapaAlvo.ordem,
          emailDestino: dest.email,
          sucesso: result.ok,
          erro: result.error,
        },
      });
      enviados += 1;
    }
  }

  return { processadas: atrasadas.length, enviados };
}
