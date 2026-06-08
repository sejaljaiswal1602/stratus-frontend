"use client";
import { useState } from "react";
import { Search, FileText, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";

const DOC_LABELS: Record<string, string> = {
  passport:       "Passport",
  utility_bill:   "Utility bill",
  bank_statement: "Bank statement",
  national_id:    "National ID",
  aadhaar:        "Aadhaar card",
  photo:          "Photograph",
};

const STATUS_STYLE: Record<string, string> = {
  DRAFT:       "bg-[var(--slate-100)] text-[var(--fg2)]",
  SUBMITTED:   "bg-[var(--cyan-50)] text-[var(--cyan-700)] border border-[var(--cyan-100)]",
  UNDER_REVIEW:"bg-[var(--warning-bg)] text-[var(--warning)] border border-[var(--warning-border)]",
  APPROVED:    "bg-[var(--success-bg)] text-[var(--success)] border border-[var(--success-border)]",
  REJECTED:    "bg-[var(--danger-bg)] text-[var(--danger)] border border-[var(--danger-border)]",
};

type App = {
  id: string; referenceNo: string; status: string; mobile: string;
  fullName?: string; pan?: string; dob?: string; investorType?: string;
  email?: string; addr1?: string; addr2?: string; city?: string; pincode?: string;
  occupation?: string; income?: string;
  acctName?: string; acctNoLast4?: string; ifsc?: string; acctType?: string;
  fatca?: boolean; pep?: boolean;
  submittedAt?: string; createdAt: string;
  documents: { docKey: string; fileName: string; blobUrl?: string }[];
};

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex gap-4 py-[7px] border-b border-[var(--slate-100)] last:border-0">
      <span className="text-[12px] text-[var(--fg3)] w-36 flex-shrink-0">{label}</span>
      <span className="text-[13px] text-[var(--fg1)] font-medium">{value}</span>
    </div>
  );
}

function Card({ app }: { app: App }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white border border-[var(--slate-200)] rounded-[var(--r-lg)] overflow-hidden" style={{ boxShadow: "var(--shadow-sm)" }}>
      {/* Header row */}
      <button
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[var(--slate-50)] transition-colors text-left"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-semibold text-[14.5px] text-[var(--fg1)]">{app.fullName || "—"}</span>
            <span className={`text-[11.5px] font-semibold px-2 py-[2px] rounded-full ${STATUS_STYLE[app.status] ?? STATUS_STYLE.DRAFT}`}>
              {app.status}
            </span>
          </div>
          <div className="flex gap-4 mt-[3px] text-[12px] text-[var(--fg3)]">
            <span>{app.referenceNo}</span>
            <span>{app.mobile}</span>
            {app.submittedAt && <span>Submitted {new Date(app.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 text-[var(--fg3)]">
          <span className="text-[12px]">{app.documents.length}/6 docs</span>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {open && (
        <div className="border-t border-[var(--slate-200)] px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Identity & KYC */}
          <div>
            <div className="text-[11px] font-semibold tracking-[.07em] uppercase text-[var(--fg-brand)] mb-2">Identity & KYC</div>
            <Row label="Investor type"  value={app.investorType} />
            <Row label="Full name"      value={app.fullName} />
            <Row label="PAN"            value={app.pan} />
            <Row label="Date of birth"  value={app.dob ? new Date(app.dob).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : null} />
            <Row label="Email"          value={app.email} />
            <Row label="Address"        value={[app.addr1, app.addr2, app.city, app.pincode].filter(Boolean).join(", ")} />
            <Row label="Occupation"     value={app.occupation} />
            <Row label="Annual income"  value={app.income} />
          </div>

          {/* Bank & FATCA */}
          <div>
            <div className="text-[11px] font-semibold tracking-[.07em] uppercase text-[var(--fg-brand)] mb-2">Bank & FATCA</div>
            <Row label="Account name"   value={app.acctName} />
            <Row label="Account (last 4)" value={app.acctNoLast4 ? `••••${app.acctNoLast4}` : null} />
            <Row label="IFSC"           value={app.ifsc} />
            <Row label="Account type"   value={app.acctType} />
            <Row label="India tax resident?" value={app.fatca === true ? "Yes" : app.fatca === false ? "No" : null} />
            <Row label="PEP?"           value={app.pep === true ? "Yes" : app.pep === false ? "No" : null} />

            {/* Documents */}
            <div className="text-[11px] font-semibold tracking-[.07em] uppercase text-[var(--fg-brand)] mb-2 mt-4">Documents</div>
            {app.documents.length === 0 && <p className="text-[12px] text-[var(--fg3)]">No documents uploaded</p>}
            <div className="flex flex-col gap-[6px]">
              {app.documents.map(doc => (
                <div key={doc.docKey} className="flex items-center justify-between gap-2 py-[5px] border-b border-[var(--slate-100)] last:border-0">
                  <div className="flex items-center gap-2">
                    <FileText size={13} strokeWidth={1.75} color="var(--cyan-600)" />
                    <span className="text-[12.5px] text-[var(--fg1)]">{DOC_LABELS[doc.docKey] ?? doc.docKey}</span>
                  </div>
                  {doc.blobUrl ? (
                    <a href={doc.blobUrl} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1 text-[12px] text-[var(--cyan-700)] hover:underline">
                      View <ExternalLink size={11} strokeWidth={1.75} />
                    </a>
                  ) : (
                    <span className="text-[12px] text-[var(--fg3)]">{doc.fileName}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  async function load(adminKey: string) {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/admin/applications", {
        headers: { "x-admin-key": adminKey },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unauthorized");
      setApps(data.applications);
      setAuthed(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const filtered = apps.filter(a => {
    const q = search.toLowerCase();
    return !q
      || a.fullName?.toLowerCase().includes(q)
      || a.referenceNo?.toLowerCase().includes(q)
      || a.mobile?.includes(q)
      || a.email?.toLowerCase().includes(q)
      || a.pan?.toLowerCase().includes(q);
  });

  if (!authed) {
    return (
      <div className="min-h-screen bg-[var(--slate-150)] flex items-center justify-center">
        <div className="bg-white rounded-[var(--r-xl)] p-8 w-full max-w-sm" style={{ boxShadow: "var(--shadow-md)" }}>
          <div className="text-[11px] font-semibold tracking-[.07em] uppercase text-[var(--fg-brand)] mb-1">iRage</div>
          <h1 className="text-[22px] font-semibold mb-1" style={{ fontFamily: "var(--font-display)" }}>Admin</h1>
          <p className="text-[13px] text-[var(--fg2)] mb-6">Stratus Fund applications</p>
          <div className="flex flex-col gap-3">
            <input
              type="password"
              placeholder="Admin key"
              value={key}
              onChange={e => setKey(e.target.value)}
              onKeyDown={e => e.key === "Enter" && key && load(key)}
              className="w-full px-4 py-3 text-[14px] border border-[var(--slate-200)] rounded-[var(--r-lg)] focus:outline-none focus:border-[var(--cyan-400)] focus:shadow-[var(--ring-brand)]"
              autoFocus
            />
            {error && <p className="text-[12px] text-[var(--danger)]">{error}</p>}
            <button
              onClick={() => load(key)}
              disabled={!key || loading}
              className="w-full py-3 rounded-[var(--r-md)] bg-[var(--cyan-600)] text-white font-semibold text-[14px] hover:bg-[var(--cyan-700)] disabled:opacity-50 transition-colors"
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
      <div className="max-w-[960px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-[11px] font-semibold tracking-[.07em] uppercase text-[var(--fg-brand)] mb-1">iRage · Stratus Fund</div>
            <h1 className="text-[24px] font-semibold" style={{ fontFamily: "var(--font-display)" }}>Applications</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[13px] text-[var(--fg2)]">
              {apps.filter(a => a.status === "SUBMITTED").length} submitted · {apps.length} total
            </span>
            <button onClick={() => load(key)} className="text-[13px] text-[var(--cyan-700)] hover:underline">Refresh</button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search size={15} strokeWidth={1.75} color="var(--slate-400)"
            className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, reference, mobile, email or PAN…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-[10px] text-[13.5px] bg-white border border-[var(--slate-200)] rounded-[var(--r-lg)] focus:outline-none focus:border-[var(--cyan-400)] focus:shadow-[var(--ring-brand)]"
          />
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-[var(--fg3)] text-[14px]">
            {apps.length === 0 ? "No applications yet." : "No results for that search."}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(app => <Card key={app.id} app={app} />)}
          </div>
        )}
      </div>
    </div>
  );
}
