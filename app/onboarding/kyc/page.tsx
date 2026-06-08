"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Shell from "@/components/onboarding/Shell";
import { StepHeader, StepNav } from "@/components/onboarding/StepLayout";
import TextField from "@/components/ui/TextField";
import SelectField from "@/components/ui/SelectField";
import { api } from "@/lib/api";

export default function KycPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    email: "", addr1: "", addr2: "", city: "", pincode: "",
    occupation: "", income: "₹1 Cr – ₹5 Cr",
  });
  const set = (patch: Partial<typeof data>) => setData((d) => ({ ...d, ...patch }));

  const ok = data.email && data.addr1 && data.city && /^\d{6}$/.test(data.pincode) && data.occupation;

  async function handleNext() {
    setLoading(true);
    try {
      await api.put("/api/applications/me/step/1", data);
      router.push("/onboarding/documents");
    } catch (e: any) {
      if (e.status === 401) router.push("/onboarding/signin");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell stepIndex={1}>
      <div className="max-w-[560px] animate-fade-in">
        <StepHeader
          overline="Step 2 · KYC details"
          title="Your contact & profile"
          lead="Required by SEBI for AIF onboarding. This stays private and is used only for KYC."
        />
        <div className="flex flex-col gap-5">
          <TextField label="Email address" type="email" placeholder="rahul@example.com"
            value={data.email} onChange={(e) => set({ email: e.target.value })} />
          <TextField label="Address line 1" placeholder="Flat / building / street"
            value={data.addr1} onChange={(e) => set({ addr1: e.target.value })} />
          <TextField label="Address line 2" optional placeholder="Area / landmark"
            value={data.addr2} onChange={(e) => set({ addr2: e.target.value })} />
          <div className="flex gap-4">
            <div style={{ flex: 1.4 }}>
              <TextField label="City" placeholder="Mumbai"
                value={data.city} onChange={(e) => set({ city: e.target.value })} />
            </div>
            <div className="flex-1">
              <TextField label="PIN code" mono maxLength={6} placeholder="400072"
                value={data.pincode} onChange={(e) => set({ pincode: e.target.value.replace(/\D/g, "") })} />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <SelectField label="Occupation" value={data.occupation} onChange={(e) => set({ occupation: e.target.value })}>
                <option value="">Select…</option>
                <option>Private sector</option><option>Public sector</option>
                <option>Business owner</option><option>Professional</option>
                <option>Retired</option><option>Other</option>
              </SelectField>
            </div>
            <div className="flex-1">
              <SelectField label="Annual income" value={data.income} onChange={(e) => set({ income: e.target.value })}>
                <option>₹25L – ₹1 Cr</option><option>₹1 Cr – ₹5 Cr</option>
                <option>₹5 Cr – ₹25 Cr</option><option>Above ₹25 Cr</option>
              </SelectField>
            </div>
          </div>
        </div>
        <StepNav onBack={() => router.push("/onboarding/identity")} onNext={handleNext} nextDisabled={!ok} loading={loading} />
      </div>
    </Shell>
  );
}
