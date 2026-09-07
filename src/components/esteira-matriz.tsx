const ORDENS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

type EtapaCelula = {
  nome: string;
  prazoDias: number;
  active: boolean;
  responsavelNome: string;
  responsavelEmail: string;
};

export function EsteiraMatriz({
  clinicas,
  etapasPorClinica,
}: {
  clinicas: { id: string; name: string; city: string; state: string }[];
  etapasPorClinica: Record<string, Record<number, EtapaCelula>>;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-white">
      <table className="w-max min-w-full border-collapse text-left text-sm">
        <thead className="bg-[var(--surface-2)] text-[var(--muted)]">
          <tr>
            <th className="sticky left-0 z-20 min-w-[220px] border-b border-r border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 font-medium">
              Clínica
            </th>
            {ORDENS.map((ordem) => (
              <th
                key={ordem}
                className="min-w-[200px] border-b border-[var(--border)] px-4 py-3 font-medium"
              >
                Etapa {ordem}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {clinicas.map((clinica) => {
            const etapas = etapasPorClinica[clinica.id] || {};
            return (
              <tr
                key={clinica.id}
                className="border-b border-[var(--border)] last:border-b-0"
              >
                <td className="sticky left-0 z-10 border-r border-[var(--border)] bg-white px-4 py-3 align-top">
                  <p className="font-medium text-[var(--ink)]">{clinica.name}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {clinica.city}/{clinica.state}
                  </p>
                </td>
                {ORDENS.map((ordem) => {
                  const etapa = etapas[ordem];
                  if (!etapa) {
                    return (
                      <td
                        key={ordem}
                        className="px-4 py-3 align-top text-[var(--muted)]"
                      >
                        —
                      </td>
                    );
                  }
                  return (
                    <td
                      key={ordem}
                      className={`px-4 py-3 align-top ${
                        etapa.active ? "" : "opacity-50"
                      }`}
                    >
                      <p className="font-medium text-[var(--ink)]">
                        {etapa.nome}
                      </p>
                      <p className="mt-1 text-[var(--ink)]">
                        {etapa.responsavelNome}
                      </p>
                      <p className="text-xs text-[var(--muted)]">
                        {etapa.responsavelEmail}
                      </p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        {etapa.prazoDias === 1
                          ? "1 dia"
                          : `${etapa.prazoDias} dias`}
                        {!etapa.active ? " · Inativa" : ""}
                      </p>
                    </td>
                  );
                })}
              </tr>
            );
          })}
          {clinicas.length === 0 && (
            <tr>
              <td
                colSpan={11}
                className="px-4 py-10 text-center text-[var(--muted)]"
              >
                Nenhuma clínica ativa encontrada
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
