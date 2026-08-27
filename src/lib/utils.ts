import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function somenteDigitos(valor: string) {
  return valor.replace(/\D/g, "");
}

export function formatCpf(valor: string | null | undefined) {
  const digitos = somenteDigitos(valor || "");
  if (digitos.length !== 11) return valor || "—";
  return digitos.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function mascaraCpf(valor: string) {
  const digitos = somenteDigitos(valor).slice(0, 11);
  return digitos
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function mascaraTelefone(valor: string) {
  const digitos = somenteDigitos(valor).slice(0, 11);
  if (digitos.length <= 10) {
    return digitos
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  return digitos
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

export function cpfValido(valor: string) {
  const cpf = somenteDigitos(valor);
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  const calc = (base: string, fator: number) => {
    let soma = 0;
    for (let i = 0; i < base.length; i++) {
      soma += Number(base[i]) * (fator - i);
    }
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  const d1 = calc(cpf.slice(0, 9), 10);
  const d2 = calc(cpf.slice(0, 10), 11);
  return d1 === Number(cpf[9]) && d2 === Number(cpf[10]);
}

export function formatDate(date: Date | string | null | undefined) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatDateShort(date: Date | string | null | undefined) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

function partesDataSaoPaulo(ref = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(ref);
  const y = parts.find((p) => p.type === "year")!.value;
  const m = parts.find((p) => p.type === "month")!.value;
  const d = parts.find((p) => p.type === "day")!.value;
  return { y, m, d };
}

export function inicioDiaSaoPaulo(isoDate: string) {
  return new Date(`${isoDate}T00:00:00-03:00`);
}

export function fimDiaSaoPaulo(isoDate: string) {
  return new Date(`${isoDate}T23:59:59.999-03:00`);
}

export function hojeIsoSaoPaulo(ref = new Date()) {
  const { y, m, d } = partesDataSaoPaulo(ref);
  return `${y}-${m}-${d}`;
}

export function inicioMesAtualSaoPaulo(ref = new Date()) {
  const { y, m } = partesDataSaoPaulo(ref);
  return `${y}-${m}-01`;
}

export function periodoPadraoRelatorios() {
  return {
    de: inicioMesAtualSaoPaulo(),
    ate: hojeIsoSaoPaulo(),
  };
}

export function parsePeriodoRelatorios(de?: string, ate?: string) {
  const padrao = periodoPadraoRelatorios();
  const deIso = de && /^\d{4}-\d{2}-\d{2}$/.test(de) ? de : padrao.de;
  const ateIso = ate && /^\d{4}-\d{2}-\d{2}$/.test(ate) ? ate : padrao.ate;
  const inicio = inicioDiaSaoPaulo(deIso);
  const fim = fimDiaSaoPaulo(ateIso <= deIso ? deIso : ateIso);
  return { de: deIso, ate: ateIso <= deIso ? deIso : ateIso, inicio, fim };
}

export function agruparComOutros(
  map: Map<string, number>,
  limite = 8
): { name: string; value: number }[] {
  const sorted = [...map.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
  if (sorted.length <= limite) return sorted;
  const top = sorted.slice(0, limite);
  const resto = sorted.slice(limite).reduce((acc, item) => acc + item.value, 0);
  if (resto > 0) top.push({ name: "Outros", value: resto });
  return top;
}
