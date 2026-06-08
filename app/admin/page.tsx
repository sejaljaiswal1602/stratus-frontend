"use client";
import { useState, useEffect, useCallback } from "react";
import { Search, FileText, ExternalLink, ChevronDown, ChevronUp, RefreshCw, LogOut } from "lucide-react";

const STORAGE_KEY = "stratus_admin_key";

const DOC_LABELS: Record<string, string> = {
  passport:       "Passport",
  utility_bill:   "Utility bill",
  bank_statement: "Bank statement",
  national_id:    "National ID",
  aadhaar:        "Aadhaar card",
  photo:          "Photograph",
};

const STATUS_STYLE: Record<string, string> = {
  DRAFT:        "bg-[var(--slate-100)] text-[var(--slate-600)]",
  SUBMITTED:    "bg-[var(--cyan-50)] text-[var(--cyan-700)] border border-[var(--cyan-200)]",
  UNDER_REVIEW: "bg-[var(--warning-bg)] text-[var(--warning)] border border-[var(--warning-border)]",
  APPROVED:     "bg-[var(--success-bg)] text-[var(--success)] border border-[var(--success-border)]",
  REJECTED:     "bg-[var(--danger-bg)] text-[var(--danger)] border border-[var(--danger-border)]",
};

type Doc = { docKey: string; fileName: string; blobUrl?: string };
type App = {
  id: string; referenceNo: string; status: string; mobile: string;
  fullName?: string; pan?: string; dob?: string; investorType?: string;
  email?: string; addr1?: string; addr2?: string; city?: string; pincode?: string;
  occupation?: string; income?: string;
  acctName?: string; acctNoLast4?: string; ifsc?: string; acctType?: string;
  fatca?: boolean; pep?: boolean;
  submittedAt?: string; createdAt: string;
  documents: Doc[];
};

function Field({ label, value }: { label: string; value?: string | null }) {
  if (value == null || value === "" || value === "—") return null;
  return (
    <div className="py-2 border-b border-[var(--slate-100)] last:border-0 flex gap-3">
      <span className="text-[11.5px] text-[var(--fg3)] w-[130px] flex-shrink-0 pt-px">{label}</span>
      <span className="text-[13px] text-[var(--fg1)]">{value}</span>
    </div>
  );
}

function AppCard({ app }: { app: App }) {
  const [open, setOpen] = useState(false);

  const date = app.submittedAt
    ? new Date(app.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : new Date(app.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="border border-[var(--slate-200)] rounded-[var(--r-lg)] bg-white overflow-hidden" style={{ boxShadow: "var(--shadow-xs)" }}>
      <button
        className="w-full flex items-center justify-between gap-4 px-5 py-[14px] text-left hover:bg-[var(--slate-50)] transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-[14px]">{app.fullName || "Unnamed investor"}</span>
              <span className={`text-[11px] font-semibold px-2 py-[2px] rounded-full ${STATUS_STYLE[app.status] ?? STATUS_STYLE.DRAFT}`}>
                {app.status}
              </span>
            </div>
            <div className="flex gap-3 mt-[2px] text-[12px] text-[var(--fg3)] flex-wrap">
              <span className="font-mono">{app.referenceNo}</span>
              <span>{app.mobile}</span>
              {app.email && <span>{app.email}</span>}
              <span>{date}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[var(--fg3)] flex-shrink-0">
          <span className="text-[12px]">{app.documents.length}/6 docs</span>
          {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </div>
      </button>

      {open && (
        <div className="border-t border-[var(--slate-200)] p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Identity */}
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-[.07em] text-[var(--fg-brand)] mb-2">Identity</p>
            <Field label="Investor type"  value={app.investorType} />
            <Field label="Full name"      value={app.fullName} />
            <Field label="PAN"            value={app.pan} />
            <Field label="Date of birth"  value={app.dob ? new Date(app.dob).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : null} />
            <Field label="Mobile"         value={app.mobile} />
            <Field label="Email"          value={app.email} />
            <Field label="Address"        value={[app.addr1, app.addr2].filter(Boolean).join(", ")} />
            <Field label="City / PIN"     value={[app.city, app.pincode].filter(Boolean).join(" – ")} />
            <Field label="Occupation"     value={app.occupation} />
            <Field label="Annual income"  value={app.income} />
          </div>

          {/* Bank */}
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-[.07em] text-[var(--fg-brand)] mb-2">Bank & FATCA</p>
            <Field label="Account holder" value={app.acctName} />
            <Field label="Account no."    value={app.acctNoLast4 ? `••••${app.acctNoLast4}` : null} />
            <Field label="IFSC"           value={app.ifsc} />
            <Field label="Account type"   value={app.acctType} />
            <Field label="India tax res." value={app.fatca === true ? "Yes" : app.fatca === false ? "No" : null} />
            <Field label="PEP"            value={app.pep   === true ? "Yes" : app.pep   === false ? "No" : null} />
          </div>

          {/* Documents */}
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-[.07em] text-[var(--fg-brand)] mb-2">Documents ({app.documents.length}/6)</p>
            {app.documents.length === 0
              ? <p className="text-[12px] text-[var(--fg3)]">None uploaded yet</p>
              : app.documents.map(doc => (
                <div key={doc.docKey} className="flex items-center justify-between py-[7px] border-b border-[var(--slate-100)] last:border-0">
                  <div className="flex items-center gap-2">
                    <FileText size={13} strokeWidth={1.75} color="var(--cyan-600)" />
                    <span className="text-[12.5px]">{DOC_LABELS[doc.docKey] ?? doc.docKey}</span>
                  </div>
                  {doc.blobUrl
                    ? <a href={doc.blobUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[12px] text-[var(--cyan-700)] hover:underline">
                        View <ExternalLink size={11} />
                      </a>
                    : <span className="text-[11px] text-[var(--fg3)] truncate max-w-[100px]">{doc.fileName}</span>}
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  const [key, setKey]     = useState("");
  const [authed, setAuthed] = useState(false);
  const [apps, setApps]   = useState<App[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");

  const load = useCallback(async (adminKey: string) => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/admin/applications", {
        headers: { "x-admin-key": adminKey },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Wrong key");
      setApps(data.applications);
      setAuthed(true);
      // Persist key so page reloads don't require re-login
      localStorage.setItem(STORAGE_KEY, adminKey);
    } catch (e: any) {
      setError(e.message);
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-login from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) load(saved);
  }, [load]);

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setAuthed(false);
    setApps([]);
    setKey("");
  }

  const filtered = apps.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = !q
      || a.fullName?.toLowerCase().includes(q)
      || a.referenceNo?.toLowerCase().includes(q)
      || a.mobile?.includes(q)
      || a.email?.toLowerCase().includes(q)
      || a.pan?.toLowerCase().includes(q);
    const matchStatus = status === "ALL" || a.status === status;
    return matchSearch && matchStatus;
  });

  const counts = {
    ALL: apps.length,
    SUBMITTED: apps.filter(a => a.status === "SUBMITTED").length,
    DRAFT: apps.filter(a => a.status === "DRAFT").length,
    APPROVED: apps.filter(a => a.status === "APPROVED").length,
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-[var(--slate-150)] flex items-center justify-center p-4">
        <div className="bg-white rounded-[var(--r-xl)] p-8 w-full max-w-sm" style={{ boxShadow: "var(--shadow-md)" }}>
          <div className="text-[11px] font-semibold tracking-[.07em] uppercase text-[var(--fg-brand)] mb-1">iRage · Stratus Fund</div>
          <h1 className="text-[22px] font-semibold mb-5" style={{ fontFamily: "var(--font-display)" }}>Admin login</h1>
          <div className="flex flex-col gap-3">
            <input
              type="password"
              placeholder="Admin key"
              value={key}
              autoFocus
              onChange={e => setKey(e.target.value)}
              onKeyDown={e => e.key === "Enter" && key && load(key)}
              className="w-full px-4 py-3 text-[14px] border border-[var(--slate-200)] rounded-[var(--r-lg)] focus:outline-none focus:border-[var(--cyan-400)] focus:shadow-[var(--ring-brand)]"
            />
            {error && <p className="text-[12px] text-[var(--danger)]">{error}</p>}
            <button
              onClick={() => load(key)}
              disabled={!key || loading}
              className="w-full py-3 rounded-[var(--r-md)] bg-[var(--cyan-600)] text-white font-semibold text-[14px] hover:bg-[var(--cyan-700)] disabled:opacity-40 transition-colors"
            >
              {loading ? "Loading…" : "Sign in"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--slate-150)] p-6">
      <div className="max-w-[1000px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="text-[11px] font-semibold tracking-[.07em] uppercase text-[var(--fg-brand)]">iRage · Stratus Fund</div>
            <h1 className="text-[24px] font-semibold mt-[2px]" style={{ fontFamily: "var(--font-display)" }}>Applications</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { const k = localStorage.getItem(STORAGE_KEY); if (k) load(k); }}
              className="flex items-center gap-2 text-[13px] text-[var(--fg2)] hover:text-[var(--fg1)] transition-colors"
            >
              <RefreshCw size={14} strokeWidth={1.75} className={loading ? "animate-spin-slow" : ""} />
              Refresh
            </button>
            <button onClick={logout} className="flex items-center gap-2 text-[13px] text-[var(--fg3)] hover:text-[var(--danger)] transition-colors">
              <LogOut size={14} strokeWidth={1.75} />
              Sign out
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search size={14} strokeWidth={1.75} color="var(--slate-400)" className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, reference, mobile, email, PAN…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-[10px] text-[13px] bg-white border border-[var(--slate-200)] rounded-[var(--r-lg)] focus:outline-none focus:border-[var(--cyan-400)] focus:shadow-[var(--ring-brand)]"
            />
          </div>
          <div className="flex gap-2">
            {(["ALL","SUBMITTED","DRAFT","APPROVED"] as const).map(s => (
              <button key={s}
                onClick={() => setStatus(s)}
                className={[
                  "px-3 py-[9px] rounded-[var(--r-md)] text-[12px] font-semibold border transition-colors",
                  status === s
                    ? "bg-[var(--cyan-600)] text-white border-[var(--cyan-600)]"
                    : "bg-white text-[var(--fg2)] border-[var(--slate-200)] hover:border-[var(--slate-300)]",
                ].join(" ")}
              >
                {s} <span className="opacity-70">({counts[s]})</span>
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {loading && !apps.length ? (
          <div className="flex flex-col gap-3">
            {[1,2,3].map(i => <div key={i} className="h-[70px] bg-white border border-[var(--slate-200)] rounded-[var(--r-lg)] animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-[var(--fg3)] text-[14px]">
            {apps.length === 0 ? "No applications yet." : "No results."}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(app => <AppCard key={app.id} app={app} />)}
          </div>
        )}
      </div>
    </div>
  );
}
