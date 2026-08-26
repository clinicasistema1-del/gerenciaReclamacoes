import { AppSidebar } from "@/components/app-sidebar";
import { requireSession } from "@/lib/session";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();

  return (
    <div className="flex h-dvh overflow-hidden bg-[var(--surface)]">
      <AppSidebar userName={session.user.name} role={session.user.role} />
      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[100rem] p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
