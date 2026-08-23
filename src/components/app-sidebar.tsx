"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  ClipboardList,
  CalendarDays,
  BarChart3,
  Users,
  GitBranch,
  HeartPulse,
  Home,
  LogOut,
  QrCode,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const links = [
  { href: "/", label: "Home GRC", icon: Home },
  { href: "/reclamacoes", label: "Reclamações", icon: ClipboardList },
  { href: "/agenda", label: "Agenda GRC", icon: CalendarDays },
  { href: "/tratamentos", label: "Tratamentos", icon: HeartPulse },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/nps", label: "Gestão de NPS", icon: QrCode },
];

const adminLinks = [
  { href: "/admin/usuarios", label: "Usuários", icon: Users },
  { href: "/admin/clinicas", label: "Clínicas", icon: Building2 },
  { href: "/admin/esteira", label: "Esteira", icon: GitBranch },
];

export function AppSidebar({
  userName,
  role,
}: {
  userName: string;
  role: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = role === "ADMIN";

  async function logout() {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-[var(--border)] bg-[var(--sidebar)] text-white">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-6">
        <img
          src="/logo-sorria.png"
          alt="Sorria Goiás"
          className="h-12 w-12 rounded-md object-cover"
        />
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--brand)]">
            Grupo Sorria
          </p>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-2xl">
            SISTEMA GRC
          </h1>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {links.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition",
                active
                  ? "bg-[var(--brand)] text-black"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
        {isAdmin && (
          <>
            <p className="px-3 pt-4 text-xs uppercase tracking-wider text-white/40">
              Administrador
            </p>
            {adminLinks.map((item) => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition",
                    active
                      ? "bg-[var(--brand)] text-black"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </>
        )}
      </nav>
      <div className="border-t border-white/10 p-4">
        <p className="truncate text-sm font-medium">{userName}</p>
        <p className="text-xs text-white/50">{role}</p>
        <button
          onClick={logout}
          className="mt-3 flex items-center gap-2 text-sm text-white/70 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}
