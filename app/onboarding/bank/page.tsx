"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Shell from "@/components/onboarding/Shell";
import { StepHeader, StepNav } from "@/components/onboarding/StepLayout";
import TextField from "@/components/ui/TextField";
import SelectField from "@/components/ui/SelectField";
import { api } from "@/lib/api";

const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/;

export default function BankPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    acctName: "", acctNo: "", acctNo2: "", ifsc: "", acctType: "Savings",
    fatca: false, pep: false,
  });
  const set = (patch: Partial<typeof data>) => setData((d) => ({ ...d, ...patch }));

  const ifscVal = data.ifsc.toUpperCase();
  const ifscErr = data.ifsc && !IFSC_RE.test(ifscVal) ? "Enter a valid IFSC code (e.g. HDFC0001234)." : null;
  const acctMismatch = data.acctNo2 && data.acctNo !== data.acctNo2;

  const ok = data.acctNo && !acctMismatch && IFSC_RE.test(ifscVal) && data.fatca;

  async function handleNext() {
    setLoading(true);
    try {
      await api.put("/api/applications/me/step/3", {
        acctName: data.acctName, acctNo: data.acctNo, acctNo2: data.acctNo2,
        ifsc: ifscVal, acctType: data.acctType, fatca: data.fatca, pep: data.pep,
      });
      router.push("/onboarding/review");
    } catch (e: any) {
      if (e.status === 401) router.push("/onboarding/signin");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell stepIndex={3}>
      <div className="max-w-[560px] animate-fade-in">
        <StepHeader
          overline="Step 4 · Bank & FATCA"
          title="Bank account & declarations"
          lead="Subscriptions and redemptions for Stratus settle to this account only."
        />
        <div className="flex flex-col gap-5">
          <TextField label="Account holder name" placeholder="As per bank records"
            value={data.acctName} onChange={(e) => set({ acctName: e.target.value })} />

          <div className="flex gap-4">
            <div className="flex-1">
              <TextField label="Account number" mono placeholder="0000 0000 0000"
                value={data.acctNo} onChange={(e) => set({ acctNo: e.target.value.replace(/\D/g, "") })} />
            </div>
            <div className="flex-1">
              <TextField label="Re-enter account number" mono placeholder="0000 0000 0000"
                value={data.acctNo2} onChange={(e) => set({ acctNo2: e.target.value.replace(/\D/g, "") })}
                error={acctMismatch ? "Account numbers don't match." : null} />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <TextField label="IFSC code" mono maxLength={11} placeholder="HDFC0001234"
                value={data.ifsc} onChange={(e) => set({ ifsc: e.target.value.toUpperCase() })}
                error={ifscErr} />
            </div>
            <div className="flex-1">
              <SelectField label="Account type" value={data.acctType} onChange={(e) => set({ acctType: e.target.value })}>
                <option>Savings</option><option>Current</option>
              </SelectField>
            </div>
          </div>

          <hr className="border-0 h-px bg-[var(--slate-200)] my-1" />

          <div className="flex flex-col gap-3">
            <div className="text-[11.5px] font-semibold tracking-[.08em] uppercase text-[var(--fg-brand)]">
              FATCA / CRS declaration
            </div>
            {([
              ["fatca", "I am a tax resident of India only, and not of any other country."],
              ["pep",   "I am not a politically exposed person (PEP) or related to one."],
            ] as const).map(([key, label]) => (
              <label key={key} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!data[key]}
                  onChange={(e) => set({ [key]: e.target.checked })}
                  className="mt-[2px] w-[18px] h-[18px] flex-shrink-0 accent-[var(--cyan-600)]"
                />
                <span className="text-[13px] leading-[1.5] text-[var(--fg1)]">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <StepNav
          onBack={() => router.push("/onboarding/documents")}
          onNext={handleNext}
          nextDisabled={!ok}
          loading={loading}
        />
      </div>
    </Shell>
  );
}
