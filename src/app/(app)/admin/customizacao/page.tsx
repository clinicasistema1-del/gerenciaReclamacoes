import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import {
  createMotivo,
  createServico,
  deleteMotivo,
  deleteServico,
  updateMotivo,
  updateServico,
} from "@/app/actions";
import { CustomizacaoCadastro } from "@/components/customizacao-cadastro";

export default async function CustomizacaoPage() {
  await requireAdmin();
  const [motivos, servicos] = await Promise.all([
    prisma.motivo.findMany({
      orderBy: { descricao: "asc" },
      include: { _count: { select: { reclamacoes: true } } },
    }),
    prisma.servico.findMany({
      orderBy: { descricao: "asc" },
      include: { _count: { select: { reclamacoes: true } } },
    }),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl">
          Customização
        </h1>
        <p className="text-[var(--muted)]">
          Cadastro de motivos e serviços usados na abertura de reclamações
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Motivos
        </h2>
        <CustomizacaoCadastro
          titulo="Motivos"
          tituloNovo="Novo motivo"
          rotuloSingular="Motivo"
          itens={motivos.map((item) => ({
            id: item.id,
            descricao: item.descricao,
            reclamacoes: item._count.reclamacoes,
          }))}
          createAction={createMotivo}
          updateAction={updateMotivo}
          deleteAction={deleteMotivo}
        />
      </div>

      <div className="space-y-4">
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Serviços
        </h2>
        <CustomizacaoCadastro
          titulo="Serviços"
          tituloNovo="Novo serviço"
          rotuloSingular="Serviço"
          itens={servicos.map((item) => ({
            id: item.id,
            descricao: item.descricao,
            reclamacoes: item._count.reclamacoes,
          }))}
          createAction={createServico}
          updateAction={updateServico}
          deleteAction={deleteServico}
        />
      </div>
    </div>
  );
}
