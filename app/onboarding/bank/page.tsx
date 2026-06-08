"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Shell from "@/components/onboarding/Shell";
import { StepHeader, StepNav } from "@/components/onboarding/StepLayout";
import TextField from "@/components/ui/TextField";
import SelectField from "@/components/ui/SelectField";
import { api, type Application } from "@/lib/api";

const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/;

function YesNo({ label, value, onChange }: {
  label: string;
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-[10px]">
      <span className="text-[13.5px] leading-[1.5] text-[var(--fg1)]">{label}</span>
      <div className="flex gap-3">
        {([true, false] as const).map(opt => {
          const selected = value === opt;
          return (
            <button
              key={String(opt)}
              type="button"
              onClick={() => onChange(opt)}
              className={[
                "flex-1 py-[10px] rounded-[var(--r-md)] text-[14px] font-semibold border transition-all duration-150 focus-visible:outline-none focus-visible:shadow-[var(--ring-brand)]",
                selected
                  ? "bg-[var(--cyan-600)] text-white border-[var(--cyan-600)]"
                  : "bg-white text-[var(--fg2)] border-[var(--slate-200)] hover:border-[var(--slate-300)] hover:bg-[var(--slate-50)]",
              ].join(" ")}
            >
              {opt ? "Yes" : "No"}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function BankPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [data, setData] = useState({
    acctName: "", acctNo: "", acctNo2: "", ifsc: "", acctType: "Savings",
    fatca: null as boolean | null,
    pep: null as boolean | null,
  });
  const set = (patch: Partial<typeof data>) => setData(d => ({ ...d, ...patch }));

  useEffect(() => {
    api.get<Application>("/api/applications/me")
      .then(app => {
        const b = app.bank;
        setData(d => ({
          ...d,
          acctName: b.acctName ?? "",
          ifsc:     b.ifsc ?? "",
          acctType: b.acctType ?? "Savings",
          // fatca/pep: null means unanswered, true/false means answered
          fatca: typeof b.fatca === "boolean" ? b.fatca : null,
          pep:   typeof b.pep   === "boolean" ? b.pep   : null,
          // Note: we only store last 4 digits, so don't pre-fill acctNo fields
        }));
      })
      .catch(() => router.push("/onboarding/signin"))
      .finally(() => setFetching(false));
  }, [router]);

  const ifscVal = data.ifsc.toUpperCase();
  const ifscErr = data.ifsc && !IFSC_RE.test(ifscVal) ? "Enter a valid IFSC code (e.g. HDFC0001234)." : null;
  const acctMismatch = data.acctNo2 && data.acctNo !== data.acctNo2;
  const ok = data.acctNo && !acctMismatch && IFSC_RE.test(ifscVal) && data.fatca !== null && data.pep !== null;

  async function handleNext() {
    setLoading(true);
    try {
      await api.put("/api/applications/me/step/3", {
        acctName: data.acctName, acctNo: data.acctNo, acctNo2: data.acctNo2,
        ifsc: ifscVal, acctType: data.acctType,
        fatca: data.fatca ?? false,
        pep:   data.pep   ?? false,
      });
      router.push("/onboarding/nominee");
    } catch (e: any) {
      if (e.status === 401) router.push("/onboarding/signin");
    } finally {
      setLoading(false);
    }
  }

  if (fetching) return <Shell stepIndex={3}><div className="max-w-[560px]"><div className="h-8 w-48 bg-[var(--slate-100)] rounded animate-pulse mb-4" /><div className="h-64 bg-[var(--slate-100)] rounded animate-pulse" /></div></Shell>;

  return (
    <Shell stepIndex={3}>
      <div className="max-w-[560px] mx-auto animate-fade-in">
        <StepHeader
          overline="Step 4 · Bank & FATCA"
          title="Bank account & declarations"
          lead="Subscriptions and redemptions for Stratus settle to this account only."
        />
        <div className="flex flex-col gap-5">
          <TextField label="Account holder name" placeholder="As per bank records"
            value={data.acctName} onChange={e => set({ acctName: e.target.value })} />

          <div className="flex gap-4">
            <div className="flex-1">
              <TextField label="Account number" mono placeholder="0000 0000 0000"
                value={data.acctNo} onChange={e => set({ acctNo: e.target.value.replace(/\D/g, "") })} />
            </div>
            <div className="flex-1">
              <TextField label="Re-enter account number" mono placeholder="0000 0000 0000"
                value={data.acctNo2} onChange={e => set({ acctNo2: e.target.value.replace(/\D/g, "") })}
                error={acctMismatch ? "Account numbers don't match." : null} />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <TextField label="IFSC code" mono maxLength={11} placeholder="HDFC0001234"
                value={data.ifsc} onChange={e => set({ ifsc: e.target.value.toUpperCase() })}
                error={ifscErr} />
            </div>
            <div className="flex-1">
              <SelectField label="Account type" value={data.acctType} onChange={e => set({ acctType: e.target.value })}>
                <option>Savings</option><option>Current</option>
              </SelectField>
            </div>
          </div>

          <hr className="border-0 h-px bg-[var(--slate-200)] my-1" />

          <div className="flex flex-col gap-[18px]">
            <div className="text-[11.5px] font-semibold tracking-[.08em] uppercase text-[var(--fg-brand)]">
              FATCA / CRS declaration
            </div>
            <YesNo
              label="Are you a tax resident of India only, and not of any other country?"
              value={data.fatca}
              onChange={v => set({ fatca: v })}
            />
            <YesNo
              label="Are you a politically exposed person (PEP), or related to one?"
              value={data.pep}
              onChange={v => set({ pep: v })}
            />
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
