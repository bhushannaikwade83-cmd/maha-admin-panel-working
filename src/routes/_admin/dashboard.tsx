import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { membersQuery, societiesQuery } from "@/lib/admin-data";
import { Building2, Users, ShieldCheck, Clock } from "lucide-react";

export const Route = createFileRoute("/_admin/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Maha Maintain Pro Admin" },
      {
        name: "description",
        content: "Overview of societies, members, committee members and pending approvals.",
      },
      { property: "og:title", content: "Dashboard — Maha Maintain Pro Admin" },
      {
        property: "og:description",
        content: "Live statistics for societies and member approvals.",
      },
    ],
  }),
  component: Dashboard,
});

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-card-foreground">{value}</p>
    </div>
  );
}

function Dashboard() {
  const members = useQuery(membersQuery);
  const societies = useQuery(societiesQuery);

  const list = members.data ?? [];
  const loading = members.isLoading || societies.isLoading;

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {loading ? "Loading statistics…" : "Live statistics from your database."}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Members" value={list.length} icon={Users} />
        <StatCard
          label="Enabled"
          value={list.filter((m) => m.is_enabled).length}
          icon={ShieldCheck}
        />
        <StatCard
          label="Committee Members"
          value={list.filter((m) => m.is_committee).length}
          icon={Building2}
        />
        <StatCard
          label="Pending Approvals"
          value={list.filter((m) => m.approval_status === "pending").length}
          icon={Clock}
        />
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card p-5 shadow-sm">
        <p className="text-sm text-muted-foreground">Total Societies</p>
        <p className="mt-2 text-3xl font-semibold tracking-tight text-card-foreground">
          {societies.data?.length ?? 0}
        </p>
      </div>
    </div>
  );
}
