import { Check } from "lucide-react";

const STEPS = [
  { key: "identity",  title: "Identity",    sub: "Verify it's you" },
  { key: "kyc",       title: "KYC details", sub: "Personal & entity info" },
  { key: "documents", title: "Documents",   sub: "Upload & verify" },
  { key: "bank",      title: "Bank & FATCA",sub: "Account & declarations" },
  { key: "review",    title: "Review",      sub: "Confirm & submit" },
];

export { STEPS };

export default function RailStepper({ currentIndex }: { currentIndex: number }) {
  return (
    <div className="flex flex-col">
      {STEPS.map((s, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        const last = i === STEPS.length - 1;

        const dotCls = done
          ? "bg-[var(--cyan-500)] text-white"
          : active
          ? "bg-[rgba(0,178,219,.12)] text-white border-2 border-[var(--cyan-400)]"
          : "bg-transparent text-[var(--fg-on-dark-2)] border border-[rgba(255,255,255,.22)]";

        const titleCls = active ? "text-white" : done ? "text-[var(--fg-on-dark)]" : "text-[var(--fg-on-dark-2)]";
        const subCls = active ? "text-[var(--cyan-300)]" : "text-[var(--fg-on-dark-2)] opacity-70";
        const lineCls = done ? "bg-[var(--cyan-500)]" : "bg-[rgba(255,255,255,.14)]";

        return (
          <div key={s.key} className="flex gap-[14px] items-start">
            <div className="flex flex-col items-center flex-shrink-0">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12.5px] font-semibold transition-all duration-200 ${dotCls}`}
                   style={{ fontFamily: "var(--font-mono)" }}>
                {done ? <Check size={14} strokeWidth={2.5} /> : i + 1}
              </div>
              {!last && <div className={`w-[2px] flex-1 min-h-[26px] my-[3px] ${lineCls}`} />}
            </div>
            <div className="pt-[4px] pb-[18px]">
              <div className={`text-[14px] font-semibold leading-[1.2] ${titleCls}`}>{s.title}</div>
              <div className={`text-[11.5px] mt-[2px] ${subCls}`}>{s.sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
