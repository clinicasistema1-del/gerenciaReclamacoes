import { hashPassword } from "better-auth/crypto";
import { Cargo, PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const clinicas = await Promise.all([
    prisma.clinic.upsert({
      where: { id: "clinic-catalao" },
      update: {},
      create: {
        id: "clinic-catalao",
        name: "Grupo Sorria Catalão",
        city: "Catalão",
        state: "GO",
      },
    }),
    prisma.clinic.upsert({
      where: { id: "clinic-goiania" },
      update: {},
      create: {
        id: "clinic-goiania",
        name: "Grupo Sorria Goiânia",
        city: "Goiânia",
        state: "GO",
      },
    }),
  ]);

  const etapas = [
    { id: "etapa-1", nome: "Abertura SAC", ordem: 1, prazoHoras: 24, cargoAlvo: Cargo.SAC },
    {
      id: "etapa-2",
      nome: "Coordenação",
      ordem: 2,
      prazoHoras: 48,
      cargoAlvo: Cargo.COORDENADOR,
    },
    {
      id: "etapa-3",
      nome: "Gerência da unidade",
      ordem: 3,
      prazoHoras: 48,
      cargoAlvo: Cargo.GERENCIA,
    },
    {
      id: "etapa-4",
      nome: "Diretoria",
      ordem: 4,
      prazoHoras: 72,
      cargoAlvo: Cargo.DIRETORIA,
    },
    {
      id: "etapa-5",
      nome: "Parecer administração",
      ordem: 5,
      prazoHoras: 48,
      cargoAlvo: Cargo.DIRETORIA,
    },
  ];

  for (const etapa of etapas) {
    await prisma.esteiraEtapa.upsert({
      where: { id: etapa.id },
      update: etapa,
      create: etapa,
    });
  }

  async function ensureUser(data: {
    id: string;
    name: string;
    email: string;
    role: Role;
    cargo?: Cargo;
    clinicId?: string;
    password: string;
  }) {
    const user = await prisma.user.upsert({
      where: { email: data.email },
      update: {
        name: data.name,
        role: data.role,
        cargo: data.cargo ?? null,
        clinicId: data.clinicId,
        active: true,
      },
      create: {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        cargo: data.cargo,
        clinicId: data.clinicId,
        emailVerified: true,
      },
    });

    const passwordHash = await hashPassword(data.password);
    const existing = await prisma.account.findFirst({
      where: { userId: user.id, providerId: "credential" },
    });

    if (existing) {
      await prisma.account.update({
        where: { id: existing.id },
        data: { password: passwordHash },
      });
    } else {
      await prisma.account.create({
        data: {
          userId: user.id,
          accountId: user.id,
          providerId: "credential",
          password: passwordHash,
        },
      });
    }

    return user;
  }

  const admin = await ensureUser({
    id: "user-admin",
    name: "Administrador GRC",
    email: "admin@gmail.com",
    role: Role.ADMIN,
    password: "admin",
  });

  await ensureUser({
    id: "user-sac",
    name: "Ana SAC",
    email: "sac@gruposorria.com.br",
    role: Role.PADRAO,
    cargo: Cargo.SAC,
    password: "sac123",
  });

  await ensureUser({
    id: "user-coord",
    name: "Carlos Coordenação",
    email: "coordenacao@gruposorria.com.br",
    role: Role.PADRAO,
    cargo: Cargo.COORDENADOR,
    clinicId: clinicas[0].id,
    password: "coord123",
  });

  const existing = await prisma.reclamacao.findUnique({
    where: { protocolo: "GRC-2026-000001" },
  });

  if (!existing) {
    await prisma.reclamacao.create({
      data: {
        protocolo: "GRC-2026-000001",
        pacienteNome: "Maria Silva",
        pacienteContato: "(64) 99999-0000",
        clinicId: clinicas[0].id,
        canal: "WHATSAPP",
        motivo: "QUALIDADE_TRATAMENTO",
        servico: "Implante",
        prioridade: "ALTA",
        descricao:
          "Paciente reclama no WhatsApp sobre um procedimento realizado na unidade de Catalão.",
        status: "EM_ANDAMENTO",
        etapaId: "etapa-1",
        responsavelId: admin.id,
        criadoPorId: admin.id,
        prazoEm: new Date(Date.now() + 12 * 60 * 60 * 1000),
        historicos: {
          create: {
            usuarioId: admin.id,
            acao: "ABERTURA",
            detalhe: "Protocolo de exemplo criado no seed",
          },
        },
      },
    });
  }

  console.log("Seed concluído.");
  console.log("Login: admin@gmail.com / admin");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
