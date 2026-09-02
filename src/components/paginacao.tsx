import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildPageHref } from "@/lib/pagination";

export function Paginacao({
  basePath,
  page,
  totalPages,
  total,
  pageSize,
  params,
}: {
  basePath: string;
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  params: Record<string, string | undefined>;
}) {
  if (total === 0) return null;

  const inicio = (page - 1) * pageSize + 1;
  const fim = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm">
      <p className="text-[var(--muted)]">
        Exibindo {inicio}–{fim} de {total}
      </p>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link
            href={buildPageHref(basePath, page - 1, params)}
            className="inline-flex h-9 cursor-pointer items-center gap-1 rounded-md border border-[var(--border)] px-3 hover:bg-[var(--surface)]"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Link>
        ) : (
          <span className="inline-flex h-9 cursor-not-allowed items-center gap-1 rounded-md border border-[var(--border)] px-3 opacity-40">
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </span>
        )}
        <span className="min-w-[7rem] text-center text-[var(--ink)]">
          Página {page} de {totalPages}
        </span>
        {page < totalPages ? (
          <Link
            href={buildPageHref(basePath, page + 1, params)}
            className="inline-flex h-9 cursor-pointer items-center gap-1 rounded-md border border-[var(--border)] px-3 hover:bg-[var(--surface)]"
          >
            Próxima
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span className="inline-flex h-9 cursor-not-allowed items-center gap-1 rounded-md border border-[var(--border)] px-3 opacity-40">
            Próxima
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </div>
    </div>
  );
}
