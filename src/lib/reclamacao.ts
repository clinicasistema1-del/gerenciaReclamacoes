import { addDays } from "date-fns";
import type { EsteiraEtapa } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendEtapaEntradaEmail, sendSlaEmail } from "@/lib/email";

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
  return addDays(new Date(), etapa.prazoDias);
}

export function calcularPrazoTratamento(dataProxima: Date) {
  return addDays(dataProxima, 1);
}

type EtapaComUsuario = EsteiraEtapa & {
  usuario?: { email: string; name: string } | null;
};

export async function entradaNaEtapa(
  reclamacaoId: string,
  etapa: EtapaComUsuario,
  options?: {
    usuarioId?: string | null;
    historicoAcao?: string;
    historicoDetalhe?: string;
  }
) {
  const reclamacao = await prisma.reclamacao.findUnique({
    where: { id: reclamacaoId },
    include: { clinic: true, responsavel: true, criadoPor: true },
  });
  if (!reclamacao) throw new Error("Reclamação não encontrada");

  const prazoEm = calcularPrazo(etapa);
  let enviado = false;

  const etapaCompleta =
    etapa.usuario !== undefined
      ? etapa
      : await prisma.esteiraEtapa.findUnique({
          where: { id: etapa.id },
          include: { usuario: true },
        });

  if (
    etapaCompleta?.emailAviso &&
    etapaCompleta.usuario?.email &&
    prazoEm
  ) {
    const result = await sendEtapaEntradaEmail({
      to: etapaCompleta.usuario.email,
      reclamacaoId: reclamacao.id,
      protocolo: reclamacao.protocolo,
      pacienteNome: reclamacao.pacienteNome,
      clinica: reclamacao.clinic.name,
      etapa: etapaCompleta.nome,
      prazoEm,
      descricao: reclamacao.descricao,
      responsavelAtendimento:
        reclamacao.responsavel?.name || reclamacao.criadoPor.name,
    });

    await prisma.escalonamentoLog.create({
      data: {
        reclamacaoId: reclamacao.id,
        etapaOrdem: etapaCompleta.ordem,
        emailDestino: etapaCompleta.usuario.email,
        sucesso: result.ok,
        erro: result.error,
      },
    });

    enviado = result.ok;
  }

  await prisma.reclamacao.update({
    where: { id: reclamacaoId },
    data: {
      prazoEm,
      atrasadaEm: null,
      ...(options?.historicoAcao
        ? {
            historicos: {
              create: {
                usuarioId: options.usuarioId ?? null,
                acao: options.historicoAcao,
                detalhe: options.historicoDetalhe ?? "",
              },
            },
          }
        : {}),
    },
  });

  return { prazoEm, enviado };
}

export async function avancarEtapa(
  reclamacaoId: string,
  usuarioId?: string | null
) {
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
    include: { usuario: true },
  });

  if (!proxima) {
    await prisma.reclamacao.update({
      where: { id: reclamacaoId },
      data: {
        status: "AGUARDANDO_PARECER",
        historicos: {
          create: {
            usuarioId: usuarioId || null,
            acao: "ETAPA_FINAL",
            detalhe:
              "Aguardando parecer final. Alertas continuarão no intervalo da etapa atual",
          },
        },
      },
    });

    if (reclamacao.etapa) {
      await entradaNaEtapa(reclamacaoId, reclamacao.etapa);
    }

    return prisma.reclamacao.findUnique({ where: { id: reclamacaoId } });
  }

  await prisma.reclamacao.update({
    where: { id: reclamacaoId },
    data: {
      etapaId: proxima.id,
      status: "EM_ANDAMENTO",
      historicos: {
        create: {
          usuarioId: usuarioId || null,
          acao: "AVANCO_ETAPA",
          detalhe: `Avançou para ${proxima.nome}`,
        },
      },
    },
  });

  await entradaNaEtapa(reclamacaoId, proxima);

  return prisma.reclamacao.findUnique({ where: { id: reclamacaoId } });
}

async function enviarAlertaParecer(item: {
  id: string;
  protocolo: string;
  pacienteNome: string;
  descricao: string;
  prazoEm: Date | null;
  clinic: { name: string };
  etapa: { nome: string; ordem: number } | null;
  responsavel: { name: string } | null;
  criadoPor: { name: string };
}) {
  const agora = new Date();
  const etapaOrdem = item.etapa?.ordem ?? 1;
  const etapaAlvo = await prisma.esteiraEtapa.findFirst({
    where: { active: true, ordem: etapaOrdem, emailAviso: true },
    include: { usuario: true },
  });

  if (!etapaAlvo?.usuario?.email) {
    return { enviado: false, etapaOrdem };
  }

  const result = await sendSlaEmail({
    to: etapaAlvo.usuario.email,
    protocolo: item.protocolo,
    pacienteNome: item.pacienteNome,
    clinica: item.clinic.name,
    etapa: item.etapa?.nome ?? etapaAlvo.nome,
    prazoEm: item.prazoEm ?? agora,
    descricao: item.descricao,
    responsavelAtendimento: item.responsavel?.name || item.criadoPor.name,
  });

  await prisma.escalonamentoLog.create({
    data: {
      reclamacaoId: item.id,
      etapaOrdem: etapaAlvo.ordem,
      emailDestino: etapaAlvo.usuario.email,
      sucesso: result.ok,
      erro: result.error,
    },
  });

  return { enviado: result.ok, etapaOrdem: etapaAlvo.ordem };
}

export async function processarEscalonamentos() {
  const agora = new Date();
  const candidatas = await prisma.reclamacao.findMany({
    where: {
      status: {
        in: ["ABERTA", "EM_ANDAMENTO", "ATRASADA", "AGUARDANDO_PARECER"],
      },
      prazoEm: { lt: agora },
    },
    include: {
      clinic: true,
      etapa: true,
      responsavel: true,
      criadoPor: true,
    },
  });

  let enviados = 0;
  let avancadas = 0;
  let realertas = 0;

  for (const item of candidatas) {
    if (item.status === "AGUARDANDO_PARECER") {
      const alerta = await enviarAlertaParecer(item);
      if (alerta.enviado) {
        enviados += 1;
        realertas += 1;
      }

      await prisma.reclamacao.update({
        where: { id: item.id },
        data: {
          prazoEm: calcularPrazo(item.etapa),
          atrasadaEm: null,
          historicos: {
            create: {
              acao: "ALERTA_PARECER",
              detalhe:
                "Novo alerta de aguardando parecer enviado. Prazo renovado pelo intervalo da etapa",
            },
          },
        },
      });
      continue;
    }

    await avancarEtapa(item.id, null);
    avancadas += 1;
  }

  return { processadas: candidatas.length, enviados, avancadas, realertas };
}
