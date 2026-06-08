const BASE = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_API_URL ?? "");

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("stratus_access");
}

function setTokens(access: string, refresh: string) {
  localStorage.setItem("stratus_access", access);
  localStorage.setItem("stratus_refresh", refresh);
}

function clearTokens() {
  localStorage.removeItem("stratus_access");
  localStorage.removeItem("stratus_refresh");
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...init, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw Object.assign(new Error(err.error ?? "Request failed"), { status: res.status, data: err });
  }

  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  setTokens,
  clearTokens,
  getToken,
};

export type Application = {
  id: string;
  referenceNo: string;
  status: string;
  stepIndex: number;
  identity: { investorType: string | null; fullName: string | null; pan: string | null; dob: string | null };
  kyc: { email: string | null; addr1: string | null; addr2: string | null; city: string | null; pincode: string | null; occupation: string | null; income: string | null };
  bank: { acctName: string | null; acctMasked: string | null; ifsc: string | null; acctType: string | null; fatca: boolean; pep: boolean };
  documents: { docKey: string; fileName: string; status: string }[];
  nomineeName?: string; nomineeDob?: string; nomineeRelationship?: string; nomineeIdType?: string;
};
