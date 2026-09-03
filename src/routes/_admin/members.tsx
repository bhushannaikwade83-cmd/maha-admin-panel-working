import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { membersQuery, societiesQuery, type Member } from "@/lib/admin-data";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useMutation } from "@tanstack/react-query";
import { apiPost } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/members")({
  head: () => ({
    meta: [
      { title: "Members — Maha Maintain Pro Admin" },
      {
        name: "description",
        content:
          "Manage society members: enable or disable access, set committee status and approve or reject requests.",
      },
      { property: "og:title", content: "Members — Maha Maintain Pro Admin" },
      { property: "og:description", content: "Approve, enable and organise members by society." },
    ],
  }),
  component: MembersPage,
});

function MembersPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const societies = useQuery(societiesQuery);
  const members = useQuery(membersQuery);

  const updateMember = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Member> }) => {
      const payload: Record<string, unknown> = { id };
      if (patch.is_enabled !== undefined) payload['is_enabled'] = patch.is_enabled ? 1 : 0;
      if (patch.is_committee !== undefined) payload['is_committee'] = patch.is_committee ? 1 : 0;
      if (patch.approval_status !== undefined) payload['approval_status'] = patch.approval_status;
      await apiPost("admin-update-member.php", payload);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["members"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Members</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Societies and their members, with approval and access control.
      </p>

      <section className="mt-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Select Society</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {societies.data?.length ? (
            societies.data.map((s) => (
              <button
                key={s.id}
                onClick={() => navigate({ to: "/members/$societyId", params: { societyId: s.id } })}
                className="rounded-lg border-2 border-border bg-card p-4 text-left transition-all hover:border-primary/50"
              >
                <h3 className="font-semibold text-foreground">{s.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  📍 {s.address}
                </p>
                <p className="text-sm text-muted-foreground">{s.city}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Members: {members.data?.filter((m) => m.society_id === s.id).length ?? 0}
                  </span>
                  <span className="text-xs text-primary">→</span>
                </div>
              </button>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No societies yet.</p>
          )}
        </div>
      </section>

      <div className="mt-8 overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/50 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Society</th>
              <th className="px-4 py-3 font-medium">Enabled</th>
              <th className="px-4 py-3 font-medium">Committee</th>
              <th className="px-4 py-3 font-medium">Approval</th>
            </tr>
          </thead>
          <tbody>
            {members.isLoading && (
              <tr>
                <td className="px-4 py-6 text-muted-foreground" colSpan={6}>
                  Loading…
                </td>
              </tr>
            )}
            {!members.isLoading && (members.data?.length ?? 0) === 0 && (
              <tr>
                <td className="px-4 py-6 text-muted-foreground" colSpan={6}>
                  No members yet.
                </td>
              </tr>
            )}
            {members.data?.map((m) => (
              <tr key={m.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium text-card-foreground">{m.secretary_name}</td>
                <td className="px-4 py-3 text-muted-foreground">{m.phone ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {societies.data?.find((s) => s.id === m.society_id)?.name ?? "Unassigned"}
                </td>
                <td className="px-4 py-3">
                  <Switch
                    checked={m.is_enabled}
                    onCheckedChange={(v) =>
                      updateMember.mutate({ id: m.id, patch: { is_enabled: v } })
                    }
                  />
                </td>
                <td className="px-4 py-3">
                  <Switch
                    checked={m.is_committee}
                    onCheckedChange={(v) =>
                      updateMember.mutate({ id: m.id, patch: { is_committee: v } })
                    }
                  />
                </td>
                <td className="px-4 py-3">
                  {m.approval_status === "approved" ? (
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      Approved
                    </span>
                  ) : m.approval_status === "rejected" ? (
                    <span className="rounded-full bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive">
                      Rejected
                    </span>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          updateMember.mutate({
                            id: m.id,
                            patch: { approval_status: "approved" },
                          })
                        }
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateMember.mutate({
                            id: m.id,
                            patch: { approval_status: "rejected" },
                          })
                        }
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
