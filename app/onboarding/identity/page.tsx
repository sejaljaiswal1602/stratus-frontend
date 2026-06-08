"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Shell from "@/components/onboarding/Shell";
import { StepHeader, StepNav } from "@/components/onboarding/StepLayout";
import TextField from "@/components/ui/TextField";
import SelectField from "@/components/ui/SelectField";
import { api, type Application } from "@/lib/api";

const PAN_RE = /^[A-Z]{5}\d{4}[A-Z]$/;

export default function IdentityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [data, setData] = useState({
    investorType: "Individual",
    fullName: "",
    pan: "",
    dob: "",
  });

  const set = (patch: Partial<typeof data>) => setData(d => ({ ...d, ...patch }));

  // Pre-fill from saved application
  useEffect(() => {
    api.get<Application>("/api/applications/me")
      .then(app => {
        setData({
          investorType: app.identity.investorType ?? "Individual",
          fullName: app.identity.fullName ?? "",
          pan: app.identity.pan ?? "",
          dob: app.identity.dob ? app.identity.dob.toString().slice(0, 10) : "",
        });
      })
      .catch(() => router.push("/onboarding/signin"))
      .finally(() => setFetching(false));
  }, [router]);

  const panVal = data.pan.toUpperCase();
  const panErr = data.pan && !PAN_RE.test(panVal) ? "Enter a valid 10-character PAN." : null;
  const ok = data.fullName.trim() && PAN_RE.test(panVal) && data.dob;

  async function handleNext() {
    setLoading(true);
    try {
      await api.put("/api/applications/me/step/0", {
        investorType: data.investorType,
        fullName: data.fullName.trim(),
        pan: panVal,
        dob: data.dob,
      });
      router.push("/onboarding/kyc");
    } catch (e: any) {
      if (e.status === 401) router.push("/onboarding/signin");
    } finally {
      setLoading(false);
    }
  }

  if (fetching) return <Shell stepIndex={0}><div className="max-w-[560px]"><div className="h-8 w-48 bg-[var(--slate-100)] rounded animate-pulse mb-4" /><div className="h-64 bg-[var(--slate-100)] rounded animate-pulse" /></div></Shell>;

  return (
    <Shell stepIndex={0}>
      <div className="max-w-[560px] mx-auto animate-fade-in">
        <StepHeader
          overline="Step 1 · Identity"
          title="Confirm your identity"
          lead="As registered with the income-tax department. We verify your PAN against the NSDL database."
        />
        <div className="flex flex-col gap-5">
          <SelectField
            label="I am onboarding as"
            value={data.investorType}
            onChange={e => set({ investorType: e.target.value })}
          >
            <option>Individual</option>
            <option>HUF</option>
            <option>Partnership / LLP</option>
            <option>Company</option>
            <option>Trust</option>
          </SelectField>

          <TextField
            label="Full name"
            placeholder="Rahul Mehta"
            value={data.fullName}
            onChange={e => set({ fullName: e.target.value })}
            help="Exactly as printed on your PAN card."
          />

          <div className="flex gap-4">
            <div className="flex-1">
              <TextField
                label="PAN"
                mono
                placeholder="ABCDE1234F"
                maxLength={10}
                value={data.pan}
                onChange={e => set({ pan: e.target.value.toUpperCase() })}
                error={panErr}
              />
            </div>
            <div className="flex-1">
              <TextField
                label="Date of birth"
                type="date"
                value={data.dob}
                onChange={e => set({ dob: e.target.value })}
              />
            </div>
          </div>
        </div>

        <StepNav onNext={handleNext} nextDisabled={!ok} loading={loading} />
      </div>
    </Shell>
  );
}
