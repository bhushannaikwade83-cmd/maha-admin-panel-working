import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { LayoutDashboard, Building2, Users } from "lucide-react";

export const Route = createFileRoute("/_admin")({
  component: AdminShell,
});

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/societies", label: "Add Societies", icon: Building2 },
  { to: "/members", label: "Members", icon: Users },
] as const;

function AdminShell() {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar p-4 md:flex">
        <div className="mb-8 px-2">
          <p className="text-lg font-semibold tracking-tight text-sidebar-foreground">
            Maha Maintain Pro
          </p>
          <p className="text-xs text-muted-foreground">Admin Panel</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              activeProps={{
                className:
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium bg-sidebar-primary text-sidebar-primary-foreground",
              }}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-1 overflow-x-auto border-b border-border bg-card px-4 py-2 md:hidden">
          {nav.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground"
              activeProps={{
                className:
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm bg-primary text-primary-foreground",
              }}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </header>
        <main className="flex-1 p-6 md:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
