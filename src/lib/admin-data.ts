import { queryOptions } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";

export type Society = {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  created_at: string;
};

export type Member = {
  id: string;
  society_id: string | null;
  secretary_name: string;
  phone: string | null;
  is_committee: boolean;
  is_enabled: boolean;
  approval_status: string;
  created_at: string;
};

type RawSociety = Record<string, unknown>;
type RawMember = Record<string, unknown>;

const str = (v: unknown) => (v === null || v === undefined ? null : String(v));
const bool = (v: unknown) => v === 1 || v === "1" || v === true;

export const societiesQuery = queryOptions({
  queryKey: ["societies"],
  queryFn: async (): Promise<Society[]> => {
    const json = await apiGet<{ societies?: RawSociety[] }>("admin-get-societies.php");
    return (json.societies ?? []).map((s) => ({
      id: String(s['id']),
      name: String(s['name'] ?? ""),
      address: str(s['address']),
      city: str(s['city']),
      postal_code: str(s['postal_code']),
      created_at: String(s['created_at'] ?? ""),
    }));
  },
});

export const membersQuery = queryOptions({
  queryKey: ["members"],
  queryFn: async (): Promise<Member[]> => {
    const json = await apiGet<{ members?: RawMember[] }>("admin-get-members.php");
    return (json.members ?? []).map((m) => ({
      id: String(m['id']),
      society_id: str(m['society_id']),
      secretary_name: String(m['secretary_name'] ?? ""),
      phone: str(m['phone']),
      is_committee: bool(m['is_committee']),
      is_enabled: bool(m['is_enabled']),
      approval_status: String(m['approval_status'] ?? "pending"),
      created_at: String(m['created_at'] ?? ""),
    }));
  },
});
