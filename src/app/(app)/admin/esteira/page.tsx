import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { saveEsteira } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cargoLabels } from "@/lib/labels";

export default async function EsteiraPage() {
  await requireAdmin();
  const etapas = await prisma.esteiraEtapa.findMany({ orderBy: { ordem: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl">
          Gestão da esteira
        </h1>
        <p className="text-[var(--muted)]">
          Fluxo de etapas, prazos e acionamentos por e-mail
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nova etapa</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={saveEsteira} className="grid gap-3 md:grid-cols-5">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" name="nome" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ordem">Ordem</Label>
              <Input id="ordem" name="ordem" type="number" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prazoHoras">Prazo (horas)</Label>
              <Input id="prazoHoras" name="prazoHoras" type="number" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cargoAlvo">Cargo avisado</Label>
              <select
                id="cargoAlvo"
                name="cargoAlvo"
                className="flex h-10 w-full rounded-md border border-[var(--border)] px-3 text-sm"
              >
                {Object.entries(cargoLabels).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm md:col-span-2">
              <input type="checkbox" name="emailAviso" defaultChecked />
              Enviar e-mail ao atrasar
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="active" defaultChecked />
              Ativa
            </label>
            <div className="md:col-span-2">
              <Button type="submit">Adicionar etapa</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {etapas.map((e) => (
          <Card key={e.id}>
            <CardContent className="pt-5">
              <form action={saveEsteira} className="grid gap-3 md:grid-cols-5 items-end">
                <input type="hidden" name="id" value={e.id} />
                <div className="space-y-2 md:col-span-2">
                  <Label>Nome</Label>
                  <Input name="nome" defaultValue={e.nome} required />
                </div>
                <div className="space-y-2">
                  <Label>Ordem</Label>
                  <Input name="ordem" type="number" defaultValue={e.ordem} required />
                </div>
                <div className="space-y-2">
                  <Label>Prazo (h)</Label>
                  <Input
                    name="prazoHoras"
                    type="number"
                    defaultValue={e.prazoHoras}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cargo</Label>
                  <select
                    name="cargoAlvo"
                    defaultValue={e.cargoAlvo}
                    className="flex h-10 w-full rounded-md border border-[var(--border)] px-3 text-sm"
                  >
                    {Object.entries(cargoLabels).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="emailAviso" defaultChecked={e.emailAviso} />
                  E-mail
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="active" defaultChecked={e.active} />
                  Ativa
                </label>
                <Button type="submit" variant="secondary" size="sm">
                  Salvar
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
