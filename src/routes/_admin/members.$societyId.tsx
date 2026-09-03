import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiPost } from "@/lib/api";
import { membersQuery, societiesQuery, type Member } from "@/lib/admin-data";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/members/$societyId")({
  head: () => ({
    meta: [
      { title: "Add Members — Maha Maintain Pro Admin" },
      { name: "description", content: "Add members to society." },
    ],
  }),
  component: AddMembersPage,
});

function AddMembersPage() {
  const { societyId } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const societies = useQuery(societiesQuery);
  const members = useQuery(membersQuery);

  const [formData, setFormData] = useState({
    secretary_name: "",
    phone: "",
    is_committee: false,
  });

  const society = societies.data?.find((s) => s.id === societyId);
  const societyMembers = members.data?.filter((m) => m.society_id === societyId) || [];

  const addMember = useMutation({
    mutationFn: async () => {
      if (!formData.secretary_name) throw new Error("Name is required");
      if (!formData.phone) throw new Error("Phone is required");

      await apiPost("admin-add-member.php", {
        society_id: societyId,
        secretary_name: formData.secretary_name,
        phone: formData.phone,
        is_committee: formData.is_committee ? 1 : 0,
      });
    },
    onSuccess: () => {
      toast.success("Member added successfully");
      setFormData({ secretary_name: "", phone: "", is_committee: false });
      qc.invalidateQueries({ queryKey: ["members"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMember = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Member> }) => {
      const payload: Record<string, unknown> = { id };
      if (patch.is_enabled !== undefined) payload['is_enabled'] = patch.is_enabled ? 1 : 0;
      if (patch.is_committee !== undefined) payload['is_committee'] = patch.is_committee ? 1 : 0;
      if (patch.approval_status !== undefined) payload['approval_status'] = patch.approval_status;
      await apiPost("admin-update-member.php", payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["members"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!society) {
    return (
      <div className="mx-auto max-w-4xl">
        <p className="text-muted-foreground">Society not found</p>
        <Button onClick={() => navigate({ to: "/_admin/members" })} className="mt-4">
          ← Back to Members
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => navigate({ to: "/_admin/members" })}
        className="mb-4"
      >
        ← Back to Members
      </Button>

      <div className="rounded-lg border border-border bg-card p-6 mb-8">
        <h1 className="text-3xl font-bold text-foreground">{society.name}</h1>
        <p className="mt-2 text-muted-foreground">📍 {society.address}</p>
        <p className="text-muted-foreground">{society.city} {society.postal_code}</p>
        <div className="mt-4 text-sm text-muted-foreground">
          Members: <span className="font-semibold text-foreground">{societyMembers.length}</span>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-6">Add New Member</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addMember.mutate();
          }}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.secretary_name}
              onChange={(e) =>
                setFormData((p) => ({ ...p, secretary_name: e.target.value }))
              }
              placeholder="Member name"
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
              placeholder="Phone number"
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="committee"
              checked={formData.is_committee}
              onCheckedChange={(v) =>
                setFormData((p) => ({ ...p, is_committee: Boolean(v) }))
              }
            />
            <Label htmlFor="committee">Committee Member</Label>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={addMember.isPending}>
              {addMember.isPending ? "Adding…" : "Add Member"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setFormData({ secretary_name: "", phone: "", is_committee: false })}
            >
              Clear
            </Button>
          </div>
        </form>
      </div>

      {societyMembers.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <h2 className="text-lg font-semibold text-foreground p-6 pb-3">Members</h2>
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Phone</th>
                <th className="px-6 py-3 font-medium">Enabled</th>
                <th className="px-6 py-3 font-medium">Committee</th>
                <th className="px-6 py-3 font-medium">Approval</th>
              </tr>
            </thead>
            <tbody>
              {societyMembers.map((m) => (
                <tr key={m.id} className="border-b border-border last:border-0">
                  <td className="px-6 py-3 font-medium text-card-foreground">{m.secretary_name}</td>
                  <td className="px-6 py-3 text-muted-foreground">{m.phone ?? "—"}</td>
                  <td className="px-6 py-3">
                    <Switch
                      checked={m.is_enabled}
                      onCheckedChange={(v) =>
                        updateMember.mutate({ id: m.id, patch: { is_enabled: v } })
                      }
                    />
                  </td>
                  <td className="px-6 py-3">
                    <Switch
                      checked={m.is_committee}
                      onCheckedChange={(v) =>
                        updateMember.mutate({ id: m.id, patch: { is_committee: v } })
                      }
                    />
                  </td>
                  <td className="px-6 py-3">
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
      )}
    </div>
  );
}
