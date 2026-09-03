import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiPost } from "@/lib/api";
import { societiesQuery } from "@/lib/admin-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/_admin/societies")({
  head: () => ({
    meta: [
      { title: "Add Societies — Maha Maintain Pro Admin" },
      {
        name: "description",
        content: "Add, review and delete housing societies with address, city and postal code.",
      },
      { property: "og:title", content: "Add Societies — Maha Maintain Pro Admin" },
      { property: "og:description", content: "Manage the societies registered in your system." },
    ],
  }),
  component: SocietiesPage,
});

const empty = { name: "", address: "", city: "", postal_code: "" };

function SocietiesPage() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery(societiesQuery);
  const [form, setForm] = useState(empty);

  const addSociety = useMutation({
    mutationFn: async () => {
      await apiPost("admin-add-society.php", {
        name: form.name,
        address: form.address,
        city: form.city,
        postal_code: form.postal_code,
      });
    },
    onSuccess: () => {
      setForm(empty);
      toast.success("Society added");
      qc.invalidateQueries({ queryKey: ["societies"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeSociety = useMutation({
    mutationFn: async (id: string) => {
      await apiPost("admin-delete-society.php", { id });
    },
    onSuccess: () => {
      toast.success("Society deleted");
      qc.invalidateQueries({ queryKey: ["societies"] });
      qc.invalidateQueries({ queryKey: ["members"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Add Societies</h1>
      <p className="mt-1 text-sm text-muted-foreground">Register a new society and manage the list.</p>

      <form
        className="mt-6 grid gap-4 rounded-xl border border-border bg-card p-5 shadow-sm sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          addSociety.mutate();
        }}
      >
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Society name</Label>
          <Input
            id="name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="postal">Postal code</Label>
          <Input
            id="postal"
            value={form.postal_code}
            onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
          />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={addSociety.isPending}>
            Add society
          </Button>
        </div>
      </form>

      <div className="mt-8 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/50 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Address</th>
              <th className="px-4 py-3 font-medium">City</th>
              <th className="px-4 py-3 font-medium">Postal</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className="px-4 py-6 text-muted-foreground" colSpan={5}>
                  Loading…
                </td>
              </tr>
            )}
            {!isLoading && data.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-muted-foreground" colSpan={5}>
                  No societies yet.
                </td>
              </tr>
            )}
            {data.map((s) => (
              <tr key={s.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium text-card-foreground">{s.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.address ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.city ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.postal_code ?? "—"}</td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSociety.mutate(s.id)}
                    aria-label={`Delete ${s.name}`}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
