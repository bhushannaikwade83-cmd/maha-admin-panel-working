import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { membersQuery, societiesQuery, type Member } from "@/lib/admin-data";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  const qc = useQueryClient();
  const societies = useQuery(societiesQuery);
  const members = useQuery(membersQuery);
  const [selectedSociety, setSelectedSociety] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    secretary_name: "",
    phone: "",
    is_committee: false,
    designation: "MEMBER",
  });

  const addMember = useMutation({
    mutationFn: async () => {
      if (!selectedSociety) throw new Error("Select a society first");
      if (!formData.secretary_name) throw new Error("Name is required");
      if (!formData.phone) throw new Error("Phone is required");

      await apiPost("admin-add-member.php", {
        society_id: selectedSociety,
        secretary_name: formData.secretary_name,
        phone: formData.phone,
        is_committee: formData.is_committee ? 1 : 0,
        designation: formData.designation,
      });
    },
    onSuccess: () => {
      toast.success("Member added successfully");
      setFormData({ secretary_name: "", phone: "", is_committee: false, designation: "MEMBER" });
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
                onClick={() => setSelectedSociety(s.id)}
                className={`rounded-lg border-2 p-4 text-left transition-all ${
                  selectedSociety === s.id
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-primary/50"
                }`}
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
                  {selectedSociety === s.id && <span className="text-xs font-semibold text-primary">✓ Selected</span>}
                </div>
              </button>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No societies yet.</p>
          )}
        </div>
      </section>

      {selectedSociety && (
        <section className="mt-8 rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-6">
            Add Member to {societies.data?.find((s) => s.id === selectedSociety)?.name}
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addMember.mutate();
            }}
            className="space-y-4 max-w-md"
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
            {formData.is_committee && (
              <div>
                <Label htmlFor="designation">Designation *</Label>
                <select
                  id="designation"
                  value={formData.designation}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, designation: e.target.value }))
                  }
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="MEMBER">Member</option>
                  <option value="CHAIRMAN">Chairman</option>
                  <option value="TREASURER">Treasurer</option>
                  <option value="SECRETARY">Secretary</option>
                </select>
              </div>
            )}
            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={addMember.isPending}>
                {addMember.isPending ? "Adding…" : "Add Member"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSelectedSociety(null);
                  setFormData({ secretary_name: "", phone: "", is_committee: false, designation: "MEMBER" });
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </section>
      )}

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
