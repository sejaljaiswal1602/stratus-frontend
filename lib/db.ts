import Redis from "ioredis";

let client: Redis | null = null;

function getClient() {
  if (!client) {
    client = new Redis(process.env.REDIS_URL!, {
      tls: { rejectUnauthorized: false },
      lazyConnect: false,
      maxRetriesPerRequest: 3,
    });
  }
  return client;
}

// ── Types ────────────────────────────────────────────────────────────────────
export interface Investor { id: string; mobile: string; createdAt: string }
export interface Application {
  id: string; referenceNo: string; investorId: string;
  status: string; stepIndex: number;
  investorType?: string; fullName?: string; pan?: string; dob?: string;
  email?: string; addr1?: string; addr2?: string; city?: string;
  pincode?: string; occupation?: string; income?: string;
  acctName?: string; acctNoLast4?: string; ifsc?: string; acctType?: string;
  fatca?: boolean; pep?: boolean;
  submittedAt?: string; createdAt: string; updatedAt: string;
}
export interface Document {
  appId: string; docKey: string; fileName: string; blobUrl?: string; status: string; uploadedAt: string;
}

// ── Investor ─────────────────────────────────────────────────────────────────
export async function upsertInvestor(mobile: string): Promise<Investor> {
  const r = getClient();
  const existing = await r.get(`mobile:${mobile}`);
  if (existing) return JSON.parse(existing);
  const investor: Investor = { id: crypto.randomUUID(), mobile, createdAt: new Date().toISOString() };
  await r.set(`mobile:${mobile}`, JSON.stringify(investor));
  await r.set(`investor:${investor.id}`, JSON.stringify(investor));
  return investor;
}

export async function getInvestorById(id: string): Promise<Investor | null> {
  const r = getClient();
  const v = await r.get(`investor:${id}`);
  return v ? JSON.parse(v) : null;
}

// ── Application ───────────────────────────────────────────────────────────────
function refNo() {
  return `STR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999999)).padStart(6, "0")}`;
}

export async function getOrCreateApplication(investorId: string): Promise<Application> {
  const r = getClient();
  const appId = await r.get(`activeApp:${investorId}`);
  if (appId) {
    const app = await r.get(`app:${appId}`);
    if (app) return JSON.parse(app);
  }
  const app: Application = {
    id: crypto.randomUUID(), referenceNo: refNo(), investorId,
    status: "DRAFT", stepIndex: 0,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  };
  await r.set(`app:${app.id}`, JSON.stringify(app));
  await r.set(`activeApp:${investorId}`, app.id);
  // Add to global index (sorted by creation timestamp)
  await r.zadd("all_apps", Date.now(), app.id);
  return app;
}

export async function updateApplication(appId: string, patch: Partial<Application>) {
  const r = getClient();
  const raw = await r.get(`app:${appId}`);
  if (!raw) throw new Error("Application not found");
  const app = { ...JSON.parse(raw), ...patch, updatedAt: new Date().toISOString() };
  await r.set(`app:${appId}`, JSON.stringify(app));
  return app as Application;
}

export async function getAllApplications(): Promise<Application[]> {
  const r = getClient();
  // Get all app IDs ordered by newest first
  const ids = await r.zrevrange("all_apps", 0, -1);
  if (!ids.length) return [];
  const raws = await Promise.all(ids.map(id => r.get(`app:${id}`)));
  return raws.filter(Boolean).map(v => JSON.parse(v!));
}

// ── Documents ─────────────────────────────────────────────────────────────────
export async function upsertDocument(appId: string, docKey: string, fileName: string, blobUrl?: string): Promise<Document> {
  const r = getClient();
  const doc: Document = { appId, docKey, fileName, blobUrl, status: "UPLOADED", uploadedAt: new Date().toISOString() };
  await r.hset(`docs:${appId}`, docKey, JSON.stringify(doc));
  return doc;
}

export async function getDocuments(appId: string): Promise<Document[]> {
  const r = getClient();
  const hash = await r.hgetall(`docs:${appId}`);
  return Object.values(hash ?? {}).map(v => JSON.parse(v));
}
