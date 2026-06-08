"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Search, PenLine, Wallet } from "lucide-react";
import Shell from "@/components/onboarding/Shell";
import Badge from "@/components/ui/Badge";
import { api, type Application } from "@/lib/api";

type TimelineItem = { icon: React.FC<any>; label: string; sub: string; done?: boolean; active?: boolean };
const TIMELINE: TimelineItem[] = [
  { icon: Check,    label: "Application received",             sub: "Just now",                      done: true },
  { icon: Search,   label: "Document verification",            sub: "In progress · ~1 business day", active: true },
  { icon: PenLine,  label: "Sign the contribution agreement",  sub: "Emailed once verified" },
  { icon: Wallet,   label: "Fund your first contribution",     sub: "After signing" },
];

export default function SubmittedPage() {
  const router = useRouter();
  const [app, setApp] = useState<Application | null>(null);

  useEffect(() => {
    api.get<Application>("/api/applications/me").then(setApp).catch(() => {});
  }, []);

  const firstName = app?.identity.fullName?.split(" ")[0] ?? "Investor";

  return (
    <Shell showStepper={false}>
      <div className="max-w-[540px] mx-auto mt-[4vh] animate-fade-in">
        {/* Success badge */}
        <div className="flex flex-col items-center text-center gap-[18px] mb-7">
          <div
            className="animate-pop w-[76px] h-[76px] rounded-full flex items-center justify-center text-[var(--success)]"
            style={{ background: "var(--success-bg)", border: "1px solid var(--success-border)" }}
          >
            <Check size={30} strokeWidth={2} />
          </div>
          <div className="flex flex-col gap-[10px]">
            <h1
              className="text-[34px] font-semibold leading-[1.12] tracking-[-0.018em] m-0"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Application submitted.
            </h1>
            <p className="text-[17px] leading-[1.55] text-[var(--fg2)] m-0">
              Thanks, {firstName}. Your documents are in review — we'll email you the moment they're verified, usually within one business day.
            </p>
          </div>
        </div>

        {/* Reference number */}
        <div className="bg-white border border-[var(--slate-200)] rounded-[var(--r-lg)] p-[22px] flex items-center justify-between mb-4"
             style={{ boxShadow: "var(--shadow-xs)" }}>
          <div className="flex flex-col gap-[3px]">
            <span className="text-[11.5px] text-[var(--fg3)]">Reference number</span>
            <span className="text-[17px] font-semibold font-mono text-[var(--fg1)]">
              {app?.referenceNo ?? "—"}
            </span>
          </div>
          <Badge status="review" />
        </div>

        {/* What happens next */}
        <div className="bg-white border border-[var(--slate-200)] rounded-[var(--r-lg)] p-[20px_22px]"
             style={{ boxShadow: "var(--shadow-xs)" }}>
          <div className="text-[11.5px] font-semibold tracking-[.08em] uppercase text-[var(--fg-brand)] mb-4">
            What happens next
          </div>
          <div className="flex flex-col">
            {TIMELINE.map(({ icon: Icon, label, sub, done, active }, i) => (
              <div key={label} className="flex items-start gap-[13px]">
                <div className="flex flex-col items-center">
                  <div
                    className="w-[30px] h-[30px] rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: done ? "var(--cyan-600)" : (active ? "var(--cyan-50)" : "var(--slate-100)"),
                      color: done ? "#fff" : (active ? "var(--cyan-600)" : "var(--slate-400)"),
                      border: active ? "1.5px solid var(--cyan-400)" : "none",
                    }}
                  >
                    <Icon size={14} strokeWidth={1.75} />
                  </div>
                  {i < TIMELINE.length - 1 && (
                    <div className="w-[2px] h-[26px]" style={{ background: done ? "var(--cyan-500)" : "var(--slate-200)" }} />
                  )}
                </div>
                <div className="flex flex-col gap-[1px] pb-[18px]">
                  <span
                    className="text-[13.5px] font-semibold"
                    style={{ color: (!done && !active) ? "var(--fg3)" : "var(--fg1)" }}
                  >{label}</span>
                  <span className="text-[11.5px] text-[var(--fg3)]">{sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}
