export async function GET(request: Request) {
  const uf = new URL(request.url).searchParams.get("uf")?.toUpperCase();
  if (!uf) {
    return Response.json([]);
  }
  const res = await fetch(
    `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`,
    { next: { revalidate: 86400 } }
  );
  if (!res.ok) {
    return Response.json([], { status: 502 });
  }
  const data = (await res.json()) as { nome: string }[];
  return Response.json(data.map((c) => c.nome));
}
