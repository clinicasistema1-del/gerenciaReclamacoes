"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

type Opcao = { value: string; label: string };

export function SearchableSelect({
  id,
  name,
  value,
  options,
  placeholder,
  disabled,
  required,
  emptyText = "Nenhum resultado",
  onChange,
}: {
  id: string;
  name: string;
  value: string;
  options: Opcao[];
  placeholder: string;
  disabled?: boolean;
  required?: boolean;
  emptyText?: string;
  onChange: (value: string) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selecionado = options.find((o) => o.value === value);
  const filtradas = useMemo(() => {
    const termo = normalizar(busca.trim());
    if (!termo) return options;
    return options.filter(
      (o) =>
        normalizar(o.label).includes(termo) ||
        normalizar(o.value).includes(termo)
    );
  }, [options, busca]);

  useEffect(() => {
    function fechar(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setAberto(false);
        setBusca("");
      }
    }
    document.addEventListener("mousedown", fechar);
    return () => document.removeEventListener("mousedown", fechar);
  }, []);

  useEffect(() => {
    if (aberto) {
      inputRef.current?.focus();
    }
  }, [aberto]);

  return (
    <div ref={rootRef} className="relative">
      <input
        id={id}
        name={name}
        value={value}
        required={required}
        readOnly
        tabIndex={-1}
        className="sr-only"
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setAberto((v) => !v);
          setBusca("");
        }}
        className="flex h-10 w-full cursor-pointer items-center justify-between rounded-md border border-[var(--border)] bg-white px-3 text-left text-sm text-[var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className={selecionado ? "" : "text-[var(--muted)]"}>
          {selecionado ? selecionado.label : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 text-[var(--muted)]" />
      </button>
      {aberto && !disabled && (
        <div className="absolute z-30 mt-1 w-full rounded-md border border-[var(--border)] bg-white shadow-lg">
          <div className="border-b border-[var(--border)] p-2">
            <input
              ref={inputRef}
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Pesquisar..."
              className="h-9 w-full rounded-md border border-[var(--border)] px-2 text-sm outline-none focus:ring-2 focus:ring-[var(--brand)]"
            />
          </div>
          <ul className="max-h-52 overflow-y-auto py-1">
            {filtradas.length === 0 ? (
              <li className="px-3 py-2 text-sm text-[var(--muted)]">{emptyText}</li>
            ) : (
              filtradas.map((o) => (
                <li key={o.value}>
                  <button
                    type="button"
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-[var(--surface-2)] ${
                      o.value === value ? "bg-[var(--surface-2)] font-medium" : ""
                    }`}
                    onClick={() => {
                      onChange(o.value);
                      setAberto(false);
                      setBusca("");
                    }}
                  >
                    {o.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
