export const PAGE_SIZE = 20;

export function parsePage(raw?: string) {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : 1;
}

export function paginationMeta(
  total: number,
  page: number,
  pageSize = PAGE_SIZE
) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(page, 1), totalPages);
  const skip = (current - 1) * pageSize;
  return {
    total,
    pageSize,
    totalPages,
    page: current,
    skip,
    take: pageSize,
  };
}

export function buildPageHref(
  basePath: string,
  page: number,
  params: Record<string, string | undefined>
) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  if (page > 1) search.set("page", String(page));
  const qs = search.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}
