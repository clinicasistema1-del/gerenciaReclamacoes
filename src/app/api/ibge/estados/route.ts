export async function GET() {
  const res = await fetch(
    "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome",
    { next: { revalidate: 86400 } }
  );
  if (!res.ok) {
    return Response.json([], { status: 502 });
  }
  const data = (await res.json()) as { sigla: string; nome: string }[];
  return Response.json(data.map((e) => ({ sigla: e.sigla, nome: e.nome })));
}
