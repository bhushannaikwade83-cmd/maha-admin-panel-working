export const API_BASE = "https://digitrixmedia.com/mahamaintainpro/api";

async function request<T>(file: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}/${file}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  const text = await res.text();
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Invalid response from ${file}: ${text.slice(0, 120)}`);
  }
  if (!res.ok || json?.success === false) {
    throw new Error(json?.message || json?.error || `Request to ${file} failed`);
  }
  return json as T;
}

export const apiGet = <T,>(file: string) => request<T>(file);
export const apiPost = <T,>(file: string, body: unknown) =>
  request<T>(file, { method: "POST", body: JSON.stringify(body) });
