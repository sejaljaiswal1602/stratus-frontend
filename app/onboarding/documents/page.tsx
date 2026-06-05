"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Home, Landmark, User, Info } from "lucide-react";
import Shell from "@/components/onboarding/Shell";
import { StepHeader, StepNav } from "@/components/onboarding/StepLayout";
import Dropzone from "@/components/ui/Dropzone";
import FileRow from "@/components/ui/FileRow";
import Badge from "@/components/ui/Badge";
import { api } from "@/lib/api";

const DOCS = [
  { key: "pan",     label: "PAN card",        desc: "Clear scan or photo of your PAN card",         Icon: CreditCard },
  { key: "address", label: "Address proof",    desc: "Aadhaar, passport, or utility bill",           Icon: Home },
  { key: "bank",    label: "Cancelled cheque", desc: "Or bank statement showing IFSC & account no.", Icon: Landmark },
  { key: "photo",   label: "Photograph",       desc: "Recent passport-size photo",                   Icon: User },
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
    if (!["application/pdf","image/jpeg","image/png"].includes(file.type)) { setError("Only PDF, JPG, or PNG allowed."); return; }
    setError(null);
    setFiles(f => ({ ...f, [docKey]: { name: file.name, meta: "Uploading…", status: "uploading" } }));
    try {
      await api.post("/api/documents/confirm", { docKey, fileName: file.name });
      const size = file.size < 1024*1024 ? `${Math.round(file.size/1024)} KB` : `${(file.size/1024/1024).toFixed(1)} MB`;
      setFiles(f => ({ ...f, [docKey]: { name: file.name, meta: `${size} · uploaded`, status: "review" } }));
    } catch (e: any) {
      setFiles(f => { const n={...f}; delete n[docKey]; return n; });
      setError(e.message ?? "Upload failed.");
    }
  }

  function handleRemove(docKey: DocKey) {
    setFiles(f => { const n={...f}; delete n[docKey]; return n; });
  }

  return (
    <Shell stepIndex={2}>
      <div className="max-w-[620px] animate-fade-in">
        <StepHeader
          overline="Step 3 · Documents"
          title="Upload your documents"
          lead="Accepted: PDF, JPG or PNG, up to 10 MB each. Verification usually takes one business day."
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
                  ? <FileRow name={f.name} meta={f.meta} status={f.status} onRemove={f.status !== "uploading" ? () => handleRemove(key) : undefined} />
                  : <Dropzone label={label} onFile={file => handleFile(key, file)} />}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-start gap-[11px] bg-[var(--cyan-50)] border border-[var(--cyan-100)] rounded-[var(--r-lg)] px-[22px] py-[18px]">
          <Info size={20} strokeWidth={1.75} color="var(--cyan-600)" className="flex-shrink-0 mt-px" />
          <span className="text-[13px] text-[var(--cyan-800)]">
            We'll verify each document against official databases. You'll get an email the moment everything is approved.
          </span>
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
