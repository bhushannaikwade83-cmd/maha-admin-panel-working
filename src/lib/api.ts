export const API_BASE = "https://digitrixmedia.com/mahamaintainpro/api";

async function request<T>(file: string, init?: RequestInit): Promise<T> {
  // Cache-bust: server sends max-age=86400, so a stale 500 can stick in disk cache
  const url = `${API_BASE}/${file}${file.includes("?") ? "&" : "?"}_ts=${Date.now()}`;
  const isPost = init?.method === "POST";
  const res = await fetch(url, {
    cache: "no-store",
    mode: "cors",
    // GET stays a "simple request" (no Content-Type header) so no preflight is needed
    ...(isPost ? { headers: { "Content-Type": "application/json" } } : {}),
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
