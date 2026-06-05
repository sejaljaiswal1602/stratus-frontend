"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronDown } from "lucide-react";
import Shell from "@/components/onboarding/Shell";
import { StepHeader } from "@/components/onboarding/StepLayout";
import Button from "@/components/ui/Button";
import { api } from "@/lib/api";

const COUNTRIES = [
  { code: "+91",  flag: "🇮🇳", name: "India" },
  { code: "+971", flag: "🇦🇪", name: "UAE" },
  { code: "+65",  flag: "🇸🇬", name: "Singapore" },
  { code: "+44",  flag: "🇬🇧", name: "United Kingdom" },
  { code: "+1",   flag: "🇺🇸", name: "United States" },
  { code: "+230", flag: "🇲🇺", name: "Mauritius" },
  { code: "+357", flag: "🇨🇾", name: "Cyprus" },
  { code: "+352", flag: "🇱🇺", name: "Luxembourg" },
  { code: "+41",  flag: "🇨🇭", name: "Switzerland" },
  { code: "+31",  flag: "🇳🇱", name: "Netherlands" },
  { code: "+49",  flag: "🇩🇪", name: "Germany" },
  { code: "+33",  flag: "🇫🇷", name: "France" },
  { code: "+7",   flag: "🇷🇺", name: "Russia" },
  { code: "+380", flag: "🇺🇦", name: "Ukraine" },
  { code: "+48",  flag: "🇵🇱", name: "Poland" },
  { code: "+420", flag: "🇨🇿", name: "Czech Republic" },
  { code: "+36",  flag: "🇭🇺", name: "Hungary" },
  { code: "+40",  flag: "🇷🇴", name: "Romania" },
];

function CountryPicker({
  value, onChange,
}: {
  value: typeof COUNTRIES[number];
  onChange: (c: typeof COUNTRIES[number]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-[6px] h-full px-[12px] border-r border-[var(--slate-200)] text-[14px] font-medium text-[var(--fg1)] hover:bg-[var(--slate-50)] transition-colors rounded-l-[9px] focus-visible:outline-none focus-visible:shadow-[var(--ring-brand)]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        <span className="text-[16px]">{value.flag}</span>
        <span>{value.code}</span>
        <ChevronDown size={13} strokeWidth={2} color="var(--slate-400)" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-[6px] w-[240px] bg-white border border-[var(--slate-200)] rounded-[var(--r-lg)] shadow-[var(--shadow-md)] z-50 overflow-hidden">
          <div className="max-h-[260px] overflow-y-auto py-1">
            {COUNTRIES.map((c) => (
              <button
                key={c.code + c.name}
                type="button"
                onClick={() => { onChange(c); setOpen(false); }}
                className={[
                  "w-full flex items-center gap-3 px-3 py-[9px] text-left text-[13.5px] hover:bg-[var(--slate-50)] transition-colors",
                  c.code === value.code && c.name === value.name ? "bg-[var(--cyan-50)] text-[var(--cyan-700)] font-semibold" : "text-[var(--fg1)]",
                ].join(" ")}
              >
                <span className="text-[16px] w-6 text-center">{c.flag}</span>
                <span className="flex-1">{c.name}</span>
                <span className="font-mono text-[var(--fg3)]">{c.code}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SignInPage() {
  const router = useRouter();
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [number, setNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasProgress = typeof window !== "undefined" && !!localStorage.getItem("stratus_has_progress");

  // Basic check: at least 6 digits
  const valid = /^\d{6,15}$/.test(number);

  async function handleContinue() {
    setLoading(true); setError(null);
    try {
      const res = await api.post<{ accessToken: string; refreshToken: string }>(
        "/auth/signin", { countryCode: country.code, mobile: number }
      );
      api.setTokens(res.accessToken, res.refreshToken);
      router.push("/onboarding/identity");
    } catch (e: any) {
      setError(e.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell showStepper={false} showResume={hasProgress} onResume={() => router.push("/onboarding/identity")}>
      <div className="max-w-[460px] mx-auto mt-[6vh] animate-fade-in">
        <StepHeader
          overline="Investor onboarding"
          title="Let's get you onboarded to Stratus."
          lead="Five steps, about 15 minutes. You can save and resume any time."
        />

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-semibold text-[var(--fg1)]">Mobile number</label>
            <div
              className={[
                "flex items-stretch border rounded-[var(--r-lg)] bg-white transition-[border-color,box-shadow] duration-150",
                error ? "border-[var(--danger-border)] bg-[var(--danger-bg)]" : "border-[var(--slate-200)] focus-within:border-[var(--cyan-400)] focus-within:shadow-[var(--ring-brand)]",
              ].join(" ")}
            >
              <CountryPicker value={country} onChange={(c) => { setCountry(c); setError(null); }} />
              <input
                type="tel"
                inputMode="numeric"
                placeholder="98765 43210"
                maxLength={15}
                value={number}
                autoFocus
                onChange={(e) => { setNumber(e.target.value.replace(/\D/g, "")); setError(null); }}
                onKeyDown={(e) => e.key === "Enter" && valid && !loading && handleContinue()}
                className="flex-1 min-w-0 px-[14px] py-3 text-[14.5px] bg-transparent outline-none placeholder:text-[var(--slate-400)] rounded-r-[9px]"
                style={{ fontFamily: "var(--font-mono)", letterSpacing: ".02em" }}
              />
            </div>
            {error ? (
              <span className="text-[12px] text-[var(--danger)]">{error}</span>
            ) : (
              <span className="text-[12px] text-[var(--fg3)]">We'll use this to keep you updated on your application.</span>
            )}
          </div>

          <Button
            variant="primary"
            size="lg"
            block
            disabled={!valid || loading}
            onClick={handleContinue}
            trailing={<ArrowRight size={16} strokeWidth={1.75} />}
          >
            {loading ? "Continuing…" : "Continue"}
          </Button>

          <p className="text-[11.5px] text-[var(--fg3)] text-center leading-[1.5]">
            By continuing you agree to the Stratus Fund{" "}
            <strong className="text-[var(--cyan-700)]">terms</strong> and{" "}
            <strong className="text-[var(--cyan-700)]">privacy policy</strong>.
            iRage is SEBI-registered.
          </p>
        </div>
      </div>
    </Shell>
  );
}
