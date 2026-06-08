"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Shell from "@/components/onboarding/Shell";
import { StepHeader, StepNav } from "@/components/onboarding/StepLayout";
import TextField from "@/components/ui/TextField";
import SelectField from "@/components/ui/SelectField";
import { api, type Application } from "@/lib/api";

const ID_TYPES = ["Passport", "Aadhaar card", "National identity card", "Driver's licence", "Other government ID"];

export default function NomineePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploadingId, setUploadingId] = useState(false);
  const [data, setData] = useState({
    nomineeName: "",
    nomineeDob: "",
    nomineeRelationship: "",
    nomineeIdType: "Passport",
    nomineeIdFile: "" as string,
    nomineeIdFileName: "",
  });
  const set = (patch: Partial<typeof data>) => setData(d => ({ ...d, ...patch }));

  useEffect(() => {
    api.get<Application>("/api/applications/me")
      .then(app => {
        const a = app as any;
        if (a.nomineeName) set({
          nomineeName:        a.nomineeName ?? "",
          nomineeDob:         a.nomineeDob ?? "",
          nomineeRelationship:a.nomineeRelationship ?? "",
          nomineeIdType:      a.nomineeIdType ?? "Passport",
          nomineeIdFile:      a.nomineeIdFile ?? "",
          nomineeIdFileName:  a.nomineeIdFileName ?? "",
        });
      })
      .catch(() => router.push("/onboarding/signin"))
      .finally(() => setFetching(false));
  }, [router]);

  async function handleIdFile(file: File) {
    if (file.size > 10 * 1024 * 1024) return;
    if (!["application/pdf","image/jpeg","image/png"].includes(file.type)) return;
    setUploadingId(true);
    try {
      const token = api.getToken();
      const form = new FormData();
      form.append("file", file);
      form.append("docKey", "nominee_id");
      const res = await fetch("/api/documents/upload", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      const json = await res.json();
      if (res.ok) set({ nomineeIdFile: json.url, nomineeIdFileName: file.name });
    } finally {
      setUploadingId(false);
    }
  }

  const ok = data.nomineeName.trim() && data.nomineeDob && data.nomineeIdType;

  async function handleNext() {
    setLoading(true);
    try {
      await api.put("/api/applications/me/step/4", {
        nomineeName:         data.nomineeName.trim(),
        nomineeDob:          data.nomineeDob,
        nomineeRelationship: data.nomineeRelationship || undefined,
        nomineeIdType:       data.nomineeIdType,
        nomineeIdFile:       data.nomineeIdFile || undefined,
      });
      router.push("/onboarding/review");
    } catch (e: any) {
      if (e.status === 401) router.push("/onboarding/signin");
    } finally {
      setLoading(false);
    }
  }

  if (fetching) return (
    <Shell stepIndex={4}>
      <div className="max-w-[560px] mx-auto">
        <div className="h-8 w-48 bg-[var(--slate-100)] rounded animate-pulse mb-4" />
        <div className="h-64 bg-[var(--slate-100)] rounded animate-pulse" />
      </div>
    </Shell>
  );

  return (
    <Shell stepIndex={4}>
      <div className="max-w-[560px] mx-auto animate-fade-in">
        <StepHeader
          overline="Step 5 · Nominee"
          title="Nominee details"
          lead="Your nominee will receive the investment proceeds in the event of your passing."
        />
        <div className="flex flex-col gap-5">
          <TextField
            label="Nominee full name"
            placeholder="As per their identity document"
            value={data.nomineeName}
            onChange={e => set({ nomineeName: e.target.value })}
          />

          <div className="flex gap-4">
            <div className="flex-1">
              <TextField
                label="Date of birth"
                type="date"
                value={data.nomineeDob}
                onChange={e => set({ nomineeDob: e.target.value })}
              />
            </div>
            <div className="flex-1">
              <TextField
                label="Relationship"
                optional
                placeholder="e.g. Spouse, Child, Parent"
                value={data.nomineeRelationship}
                onChange={e => set({ nomineeRelationship: e.target.value })}
              />
            </div>
          </div>

          <SelectField
            label="Identity document type"
            value={data.nomineeIdType}
            onChange={e => set({ nomineeIdType: e.target.value })}
          >
            {ID_TYPES.map(t => <option key={t}>{t}</option>)}
          </SelectField>

          {/* ID file upload */}
          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-semibold text-[var(--fg1)]">
              Upload nominee's identity document <span className="font-normal text-[var(--fg3)]">· optional</span>
            </label>
            {data.nomineeIdFileName ? (
              <div className="flex items-center justify-between gap-3 border border-[var(--slate-200)] rounded-[var(--r-lg)] px-4 py-3 bg-white">
                <span className="text-[13.5px] font-semibold truncate">{data.nomineeIdFileName}</span>
                <button
                  onClick={() => set({ nomineeIdFile: "", nomineeIdFileName: "" })}
                  className="text-[12px] text-[var(--danger)] hover:underline flex-shrink-0"
                >Remove</button>
              </div>
            ) : (
              <label className="border-[1.5px] border-dashed border-[var(--slate-300)] bg-[var(--slate-50)] rounded-[var(--r-xl)] p-5 flex flex-col items-center gap-2 text-center cursor-pointer hover:border-[var(--cyan-400)] hover:bg-[var(--cyan-50)] transition-all">
                <span className="text-[13.5px] font-semibold text-[var(--fg1)]">
                  {uploadingId ? "Uploading…" : <><span className="text-[var(--cyan-700)]">Browse</span> or drag file here</>}
                </span>
                <span className="text-[11.5px] text-[var(--fg3)]">PDF, JPG or PNG · up to 10 MB</span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && handleIdFile(e.target.files[0])}
                />
              </label>
            )}
          </div>
        </div>

        <StepNav
          onBack={() => router.push("/onboarding/bank")}
          onNext={handleNext}
          nextDisabled={!ok}
          loading={loading}
        />
      </div>
    </Shell>
  );
}
