"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Zap, Landmark, CreditCard, Shield, User } from "lucide-react";
import Shell from "@/components/onboarding/Shell";
import { StepHeader, StepNav } from "@/components/onboarding/StepLayout";
import Dropzone from "@/components/ui/Dropzone";
import FileRow from "@/components/ui/FileRow";
import Badge from "@/components/ui/Badge";
import { api, type Application } from "@/lib/api";

type DocKey = "passport" | "utility_bill" | "bank_statement" | "national_id" | "aadhaar" | "photo";
type DocDef = { key: DocKey; label: string; Icon: any; desc: string; naOption?: boolean };
const DOCS: DocDef[] = [
  { key: "passport",       label: "Passport",                Icon: BookOpen,  desc: "Valid passport — photo page clearly visible" },
  { key: "utility_bill",   label: "Utility bill",            Icon: Zap,       desc: "Latest 3 months of bills (electricity, gas, water, or phone)" },
  { key: "bank_statement", label: "Bank statement",          Icon: Landmark,  desc: "Last 3 months — must be signed and stamped by the bank" },
  { key: "national_id",    label: "National identity card",  Icon: CreditCard,desc: "Government-issued national ID (both sides if applicable)" },
  { key: "aadhaar",        label: "Aadhaar card",            Icon: Shield,    desc: "Front and back of your Aadhaar card", naOption: true },
  { key: "photo",          label: "Passport-size photograph",Icon: User,      desc: "Recent photo against a plain white or light background" },
];

type FileState = { name: string; meta: string; status: "uploading" | "review" };

export default function DocumentsPage() {
  const router = useRouter();
  const [files, setFiles]   = useState<Partial<Record<DocKey, FileState>>>({});
  const [naKeys, setNaKeys] = useState<Set<string>>(new Set());
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    api.get<Application>("/api/applications/me").then(app => {
      const pre: Partial<Record<DocKey, FileState>> = {};
      const na = new Set<string>();
      for (const doc of app.documents) {
        if (doc.status === "NA") {
          na.add(doc.docKey);
        } else {
          pre[doc.docKey as DocKey] = { name: doc.fileName, meta: "previously uploaded", status: "review" };
        }
      }
      setFiles(pre);
      setNaKeys(na);
    }).catch(() => {});
  }, []);

  function isComplete(key: string) {
    return !!files[key as DocKey] || naKeys.has(key);
  }
  const allDone = DOCS.every(d => isComplete(d.key));

  async function handleFile(docKey: DocKey, file: File) {
    if (file.size > 10 * 1024 * 1024) { setError(`${file.name} exceeds 10 MB.`); return; }
    if (!["application/pdf","image/jpeg","image/png"].includes(file.type)) { setError("Only PDF, JPG, or PNG allowed."); return; }
    setError(null);
    setFiles(f => ({ ...f, [docKey]: { name: file.name, meta: "Uploading…", status: "uploading" } }));
    try {
      const token = api.getToken();
      const form = new FormData();
      form.append("file", file);
      form.append("docKey", docKey);
      const res = await fetch("/api/documents/upload", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      const size = file.size < 1024*1024 ? `${Math.round(file.size/1024)} KB` : `${(file.size/1024/1024).toFixed(1)} MB`;
      setFiles(f => ({ ...f, [docKey]: { name: file.name, meta: `${size} · uploaded`, status: "review" } }));
    } catch (e: any) {
      setFiles(f => { const n={...f}; delete n[docKey]; return n; });
      setError(e.message ?? "Upload failed. Please try again.");
    }
  }

  async function toggleNA(docKey: string, checked: boolean) {
    if (checked) {
      // Mark as N/A in backend
      try {
        const token = api.getToken();
        await fetch("/api/documents/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ docKey, fileName: "N/A", status: "NA" }),
        });
        setNaKeys(s => new Set([...s, docKey]));
        setFiles(f => { const n={...f}; delete n[docKey as DocKey]; return n; });
      } catch {}
    } else {
      // Remove N/A
      try {
        await api.del(`/api/documents/${docKey}`);
      } catch {}
      setNaKeys(s => { const n = new Set(s); n.delete(docKey); return n; });
    }
  }

  function handleRemove(docKey: DocKey) {
    setFiles(f => { const n={...f}; delete n[docKey]; return n; });
    api.del(`/api/documents/${docKey}`).catch(() => {});
  }

  return (
    <Shell stepIndex={2}>
      <div className="max-w-[600px] mx-auto animate-fade-in">
        <StepHeader
          overline="Step 3 · Documents"
          title="Upload your documents"
          lead="PDF, JPG, or PNG — up to 10 MB each. All documents are stored securely."
        />

        {error && (
          <div className="mb-4 px-4 py-3 rounded-[var(--r-lg)] bg-[var(--danger-bg)] border border-[var(--danger-border)] text-[var(--danger)] text-[13px]">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          {DOCS.map(({ key, label, desc, Icon, naOption }) => {
            const f = files[key];
            const isNA = naKeys.has(key);
            return (
              <div key={key} className="bg-white border border-[var(--slate-200)] rounded-[var(--r-lg)] p-[22px]"
                style={{ boxShadow: "var(--shadow-xs)" }}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-[9px] bg-[var(--cyan-50)] text-[var(--cyan-600)] flex items-center justify-center flex-shrink-0">
                    <Icon size={20} strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-[10px] flex-wrap">
                      <span className="text-[14.5px] font-semibold">{label}</span>
                      {isNA
                        ? <span className="text-[11.5px] font-semibold px-2 py-[2px] rounded-full bg-[var(--slate-100)] text-[var(--fg3)]">N/A</span>
                        : f ? <Badge status="review" /> : <Badge status="pending">Required</Badge>}
                    </div>
                    <span className="text-[11.5px] text-[var(--fg3)]">{desc}</span>
                  </div>
                </div>

                {naOption && (
                  <label className="flex items-center gap-2 mb-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isNA}
                      onChange={e => toggleNA(key, e.target.checked)}
                      className="w-4 h-4 accent-[var(--cyan-600)]"
                    />
                    <span className="text-[12.5px] text-[var(--fg2)]">Not applicable — I don't have an Aadhaar card</span>
                  </label>
                )}

                {!isNA && (
                  f ? (
                    <FileRow name={f.name} meta={f.meta} status={f.status}
                      onRemove={f.status !== "uploading" ? () => handleRemove(key) : undefined} />
                  ) : (
                    <Dropzone label={label} onFile={file => handleFile(key, file)} />
                  )
                )}
              </div>
            );
          })}
        </div>

        <StepNav
          onBack={() => router.push("/onboarding/kyc")}
          onNext={() => router.push("/onboarding/bank")}
          nextDisabled={!allDone}
          nextLabel={allDone ? "Continue" : "Complete all documents to continue"}
        />
      </div>
    </Shell>
  );
}
