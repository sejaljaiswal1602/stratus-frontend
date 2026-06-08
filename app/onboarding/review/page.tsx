"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, PenLine, AlertCircle } from "lucide-react";
import Shell from "@/components/onboarding/Shell";
import { StepHeader, StepNav } from "@/components/onboarding/StepLayout";
import { api, type Application } from "@/lib/api";

function ReviewRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-start justify-between py-[11px] border-b border-[var(--slate-150)] gap-4 last:border-0">
      <span className="text-[11.5px] text-[var(--fg3)] flex-shrink-0">{label}</span>
      <span className="text-[13px] font-medium text-[var(--fg1)] text-right">{value || "—"}</span>
    </div>
  );
}

function ReviewCard({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[var(--slate-200)] rounded-[var(--r-lg)] p-[22px] mb-4" style={{ boxShadow: "var(--shadow-xs)" }}>
      <div className="flex items-center justify-between mb-[6px]">
        <span className="text-[18px] font-semibold" style={{ fontFamily: "var(--font-display)", letterSpacing: "-.01em" }}>{title}</span>
        <button onClick={onEdit} className="flex items-center gap-[6px] text-[13px] font-medium text-[var(--cyan-700)] hover:bg-[var(--cyan-50)] px-[10px] py-1 rounded-[var(--r-md)] transition-colors">
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<Application>("/api/applications/me")
      .then(setApp)
      .catch(() => router.push("/onboarding/signin"));
  }, [router]);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      await api.post("/api/applications/me/submit", {});
      router.push("/onboarding/submitted");
    } catch (e: any) {
      setError(e.message ?? "Submission failed. Please try again.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  }

  const docCount = app?.documents.length ?? 0;
  const fatcaLabel = app?.bank.fatca === true ? "Yes" : app?.bank.fatca === false ? "No" : "—";
  const pepLabel   = app?.bank.pep   === true ? "Yes" : app?.bank.pep   === false ? "No" : "—";

  return (
    <Shell stepIndex={5}>
      <div className="max-w-[600px] mx-auto animate-fade-in">
        <StepHeader
          overline="Step 5 · Review"
          title="Review & submit"
          lead="Check everything is correct. After you submit, our team will be in touch within one business day."
        />

        {/* Error banner — visible, not a disappearing toast */}
        {error && (
          <div className="flex items-start gap-3 mb-5 p-4 rounded-[var(--r-lg)] bg-[var(--danger-bg)] border border-[var(--danger-border)]">
            <AlertCircle size={18} strokeWidth={1.75} color="var(--danger)" className="flex-shrink-0 mt-px" />
            <span className="text-[13px] text-[var(--danger)] leading-[1.5]">{error}</span>
          </div>
        )}

        <ReviewCard title="Identity & KYC" onEdit={() => router.push("/onboarding/identity")}>
          <ReviewRow label="Investor type"  value={app?.identity.investorType} />
          <ReviewRow label="Full name"      value={app?.identity.fullName} />
          <ReviewRow label="PAN"            value={app?.identity.pan} />
          <ReviewRow label="Email"          value={app?.kyc.email} />
          <ReviewRow label="Address"        value={[app?.kyc.addr1, app?.kyc.addr2, app?.kyc.city, app?.kyc.pincode].filter(Boolean).join(", ")} />
          <ReviewRow label="Occupation"     value={app?.kyc.occupation} />
          <ReviewRow label="Annual income"  value={app?.kyc.income} />
        </ReviewCard>

        <ReviewCard title="Documents" onEdit={() => router.push("/onboarding/documents")}>
          <div className="flex items-center gap-[8px] mt-1">
            <CheckCircle2 size={16} strokeWidth={1.75} color={docCount === 6 ? "var(--success)" : "var(--warning)"} />
            <span className="text-[13px] text-[var(--fg1)]">{docCount} of 6 documents uploaded</span>
            {docCount < 6 && (
              <span className="text-[12px] text-[var(--warning)] ml-1">— please upload all 6</span>
            )}
          </div>
        </ReviewCard>

        <ReviewCard title="Bank &amp; FATCA" onEdit={() => router.push("/onboarding/bank")}>
          <ReviewRow label="Account name"    value={app?.bank.acctName} />
          <ReviewRow label="Account"         value={app?.bank.acctMasked ? `${app.bank.acctMasked} · ${app.bank.acctType}` : null} />
          <ReviewRow label="IFSC"            value={app?.bank.ifsc} />
          <ReviewRow label="India tax resident?" value={fatcaLabel} />
          <ReviewRow label="PEP?"            value={pepLabel} />
        </ReviewCard>

        <ReviewCard title="Nominee" onEdit={() => router.push("/onboarding/nominee")}>
          <ReviewRow label="Name"            value={(app as any)?.nomineeName} />
          <ReviewRow label="Date of birth"   value={(app as any)?.nomineeDob ? new Date((app as any).nomineeDob).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}) : null} />
          <ReviewRow label="Relationship"    value={(app as any)?.nomineeRelationship} />
          <ReviewRow label="ID type"         value={(app as any)?.nomineeIdType} />
        </ReviewCard>

        <label className="flex items-start gap-3 cursor-pointer p-[2px] mb-2">
          <input
            type="checkbox"
            checked={agree}
            onChange={e => setAgree(e.target.checked)}
            className="mt-[2px] w-[18px] h-[18px] flex-shrink-0 accent-[var(--cyan-600)]"
          />
          <span className="text-[13px] leading-[1.5] text-[var(--fg1)]">
            I confirm the information above is accurate and I've read the Stratus Fund{" "}
            <strong className="text-[var(--cyan-700)]">private placement memorandum</strong> and risk disclosures.
          </span>
        </label>

        <StepNav
          onBack={() => router.push("/onboarding/nominee")}
          onNext={handleSubmit}
          nextDisabled={!agree || !app}
          nextLabel="Submit application"
          loading={loading}
        />
      </div>
    </Shell>
  );
}
