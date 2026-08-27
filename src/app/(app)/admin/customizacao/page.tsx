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
    prisma.motivo.findMany({ orderBy: { descricao: "asc" } }),
    prisma.servico.findMany({ orderBy: { descricao: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl">
          Customização
        </h1>
        <p className="text-[var(--muted)]">
          Cadastros usados na abertura de reclamações
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <CustomizacaoCadastro
          titulo="Motivos"
          rotuloSingular="Motivo"
          itens={motivos.map((item) => ({
            id: item.id,
            descricao: item.descricao,
          }))}
          createAction={createMotivo}
          updateAction={updateMotivo}
          deleteAction={deleteMotivo}
        />
        <CustomizacaoCadastro
          titulo="Serviços"
          rotuloSingular="Serviço"
          itens={servicos.map((item) => ({
            id: item.id,
            descricao: item.descricao,
          }))}
          createAction={createServico}
          updateAction={updateServico}
          deleteAction={deleteServico}
        />
      </div>
    </div>
  );
}
