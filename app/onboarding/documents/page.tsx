"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Zap, Landmark, CreditCard, Shield, User } from "lucide-react";
import Shell from "@/components/onboarding/Shell";
import { StepHeader, StepNav } from "@/components/onboarding/StepLayout";
import Dropzone from "@/components/ui/Dropzone";
import FileRow from "@/components/ui/FileRow";
import Badge from "@/components/ui/Badge";
import { api } from "@/lib/api";

const DOCS = [
  {
    key: "passport",
    label: "Passport",
    desc: "Valid passport — photo page clearly visible",
    Icon: BookOpen,
  },
  {
    key: "utility_bill",
    label: "Utility bill",
    desc: "Latest bill — dated within the last 2 months (electricity, gas, water, or phone)",
    Icon: Zap,
  },
  {
    key: "bank_statement",
    label: "Bank statement",
    desc: "Last 3 months — must show your name, account number, and address",
    Icon: Landmark,
  },
  {
    key: "national_id",
    label: "National identity card",
    desc: "Government-issued national ID (both sides if applicable)",
    Icon: CreditCard,
  },
  {
    key: "aadhaar",
    label: "Aadhaar card",
    desc: "Front and back of your Aadhaar card",
    Icon: Shield,
  },
  {
    key: "photo",
    label: "Passport-size photograph",
    desc: "Recent photo against a plain white or light background",
    Icon: User,
  },
] as const;

type DocKey = typeof DOCS[number]["key"];
type FileState = { name: string; meta: string; status: "uploading" | "review" };

export default function DocumentsPage() {
  const router = useRouter();
  const [files, setFiles] = useState<Partial<Record<DocKey, FileState>>>({});
  const [error, setError] = useState<string | null>(null);

  const allUploaded = DOCS.every((d) => files[d.key]);

  async function handleFile(docKey: DocKey, file: File) {
    if (file.size > 10 * 1024 * 1024) { setError(`${file.name} exceeds 10 MB.`); return; }
    if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type)) {
      setError("Only PDF, JPG, or PNG allowed."); return;
    }
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

      const size = file.size < 1024 * 1024
        ? `${Math.round(file.size / 1024)} KB`
        : `${(file.size / 1024 / 1024).toFixed(1)} MB`;
      setFiles(f => ({ ...f, [docKey]: { name: file.name, meta: `${size} · uploaded`, status: "review" } }));
    } catch (e: any) {
      setFiles(f => { const n = { ...f }; delete n[docKey]; return n; });
      setError(e.message ?? "Upload failed. Please try again.");
    }
  }

  function handleRemove(docKey: DocKey) {
    setFiles(f => { const n = { ...f }; delete n[docKey]; return n; });
  }

  return (
    <Shell stepIndex={2}>
      <div className="max-w-[620px] animate-fade-in">
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
          {DOCS.map(({ key, label, desc, Icon }) => {
            const f = files[key];
            return (
              <div key={key} className="bg-white border border-[var(--slate-200)] rounded-[var(--r-lg)] p-[22px]"
                style={{ boxShadow: "var(--shadow-xs)" }}>
                <div className="flex items-start gap-3 mb-[14px]">
                  <div className="w-9 h-9 rounded-[9px] bg-[var(--cyan-50)] text-[var(--cyan-600)] flex items-center justify-center flex-shrink-0">
                    <Icon size={20} strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-[10px]">
                      <span className="text-[14.5px] font-semibold">{label}</span>
                      {f ? <Badge status="review" /> : <Badge status="pending">Required</Badge>}
                    </div>
                    <span className="text-[11.5px] text-[var(--fg3)]">{desc}</span>
                  </div>
                </div>
                {f
                  ? <FileRow name={f.name} meta={f.meta} status={f.status}
                      onRemove={f.status !== "uploading" ? () => handleRemove(key) : undefined} />
                  : <Dropzone label={label} onFile={file => handleFile(key, file)} />}
              </div>
            );
          })}
        </div>

        <StepNav
          onBack={() => router.push("/onboarding/kyc")}
          onNext={() => router.push("/onboarding/bank")}
          nextDisabled={!allUploaded}
          nextLabel={allUploaded ? "Continue" : "Upload all documents to continue"}
        />
      </div>
    </Shell>
  );
}
