"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, PenLine } from "lucide-react";
import Shell from "@/components/onboarding/Shell";
import { StepHeader, StepNav } from "@/components/onboarding/StepLayout";
import Button from "@/components/ui/Button";
import Toast from "@/components/ui/Toast";
import { api, type Application } from "@/lib/api";

function ReviewRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-start justify-between py-[11px] border-b border-[var(--slate-150)] gap-4 last:border-0">
      <span className="text-[11.5px] text-[var(--fg3)] flex-shrink-0">{label}</span>
      <span className="text-[13px] font-medium text-[var(--fg1)] text-right">{value || "—"}</span>
    </div>
  );
}

function ReviewCard({
  title, onEdit, children,
}: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[var(--slate-200)] rounded-[var(--r-lg)] p-[22px] mb-4"
         style={{ boxShadow: "var(--shadow-xs)" }}>
      <div className="flex items-center justify-between mb-[6px]">
        <span className="text-[18px] font-semibold" style={{ fontFamily: "var(--font-display)", letterSpacing: "-.01em" }}>{title}</span>
        <button
          onClick={onEdit}
          className="flex items-center gap-[6px] text-[13px] font-medium text-[var(--cyan-700)] hover:bg-[var(--cyan-50)] px-[10px] py-1 rounded-[var(--r-md)] transition-colors"
        >
          <PenLine size={13} strokeWidth={1.75} /> Edit
        </button>
      </div>
      {children}
    </div>
  );
}

export default function ReviewPage() {
  const router = useRouter();
  const [app, setApp] = useState<Application | null>(null);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    api.get<Application>("/api/applications/me")
      .then(setApp)
      .catch(() => router.push("/onboarding/signin"));
  }, [router]);

  async function handleSubmit() {
    setLoading(true);
    try {
      await api.post("/api/applications/me/submit", {});
      router.push("/onboarding/submitted");
    } catch (e: any) {
      setToast(e.message ?? "Submission failed. Please try again.");
      setTimeout(() => setToast(null), 3500);
    } finally {
      setLoading(false);
    }
  }

  const docCount = app?.documents.length ?? 0;

  return (
    <Shell stepIndex={4}>
      <div className="max-w-[600px] animate-fade-in">
        <StepHeader
          overline="Step 5 · Review"
          title="Review & submit"
          lead="Check everything is correct. After you submit, our team verifies your application."
        />

        <ReviewCard title="Identity & KYC" onEdit={() => router.push("/onboarding/identity")}>
          <ReviewRow label="Investor type" value={app?.identity.investorType} />
          <ReviewRow label="Name" value={app?.identity.fullName} />
          <ReviewRow label="PAN" value={app?.identity.pan} />
          <ReviewRow label="Email" value={app?.kyc.email} />
          <ReviewRow label="City" value={app?.kyc.city ? `${app.kyc.city} · ${app.kyc.pincode}` : null} />
        </ReviewCard>

        <ReviewCard title="Documents" onEdit={() => router.push("/onboarding/documents")}>
          <div className="flex items-center gap-[8px] mt-1 text-[var(--success)]">
            <CheckCircle2 size={16} strokeWidth={1.75} />
            <span className="text-[13px] text-[var(--fg1)]">{docCount} of 6 documents uploaded</span>
          </div>
        </ReviewCard>

        <ReviewCard title="Bank account" onEdit={() => router.push("/onboarding/bank")}>
          <ReviewRow label="Account" value={app?.bank.acctMasked ? `${app.bank.acctMasked} · ${app.bank.acctType}` : null} />
          <ReviewRow label="IFSC" value={app?.bank.ifsc} />
        </ReviewCard>

        <label className="flex items-start gap-3 cursor-pointer p-[2px]">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="mt-[2px] w-[18px] h-[18px] flex-shrink-0 accent-[var(--cyan-600)]"
          />
          <span className="text-[13px] leading-[1.5] text-[var(--fg1)]">
            I confirm the information above is accurate and I've read the Stratus Fund{" "}
            <strong className="text-[var(--cyan-700)]">private placement memorandum</strong> and risk disclosures.
          </span>
        </label>

        <StepNav
          onBack={() => router.push("/onboarding/bank")}
          onNext={handleSubmit}
          nextDisabled={!agree || !app}
          nextLabel="Submit application"
          loading={loading}
        />
      </div>
      {toast && <Toast message={toast} />}
    </Shell>
  );
}
