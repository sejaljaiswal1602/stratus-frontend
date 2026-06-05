"use client";
import { ReactNode } from "react";
import Link from "next/link";
import { LogOut, Check } from "lucide-react";
import BrandLockup from "./BrandLockup";
import RailStepper, { STEPS } from "./RailStepper";
import Button from "@/components/ui/Button";

interface ShellProps {
  children: ReactNode;
  stepIndex?: number;
  showStepper?: boolean;
  showResume?: boolean;
  onResume?: () => void;
  onSave?: () => void;
}

export default function Shell({
  children,
  stepIndex = 0,
  showStepper = true,
  showResume = false,
  onResume,
  onSave,
}: ShellProps) {
  return (
    <div className="min-h-screen bg-[var(--slate-150)] flex items-start justify-center">
      <div
        className="w-full max-w-[1180px] min-h-screen flex bg-white"
        style={{ boxShadow: "var(--shadow-lg)" }}
      >
        {/* Rail */}
        <aside
          className="w-[336px] flex-shrink-0 flex flex-col p-[30px_28px] relative overflow-hidden"
          style={{
            background: "var(--ink-800)",
            backgroundImage: "linear-gradient(178deg,#16374d 0%,#0C2030 62%)",
          }}
        >
          <BrandLockup />
          {showStepper && (
            <div className="flex flex-col gap-[14px] mt-[34px]">
              <div className="text-[11.5px] font-semibold tracking-[.08em] uppercase text-[var(--cyan-300)]">
                Onboarding
              </div>
              <RailStepper currentIndex={stepIndex} />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-[160px] pointer-events-none"
               style={{ background: "linear-gradient(180deg,transparent,rgba(0,178,219,.06))" }} />
        </aside>

        {/* Work area */}
        <main className="flex-1 flex flex-col min-w-0 bg-white">
          {/* Top bar */}
          <header
            className="h-16 flex-shrink-0 border-b border-[var(--slate-200)] flex items-center justify-between px-9 sticky top-0 z-10"
            style={{ background: "rgba(255,255,255,.85)", backdropFilter: "blur(8px)" }}
          >
            <div className="flex items-center gap-3">
              {/* iRage logo with text fallback */}
              <img
                src="https://www.irage.in/img/logo.png"
                alt="iRage"
                className="h-[22px]"
                onError={(e) => {
                  const el = e.currentTarget;
                  el.style.display = "none";
                  el.nextElementSibling?.removeAttribute("hidden");
                }}
              />
              <span hidden style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--ink-800)" }}>iRage</span>

              {showStepper && (
                <>
                  <div className="w-px h-[22px] bg-[var(--slate-200)]" />
                  <span className="text-[13px] text-[var(--fg2)]">
                    Step {stepIndex + 1} of {STEPS.length} ·{" "}
                    <b className="text-[var(--fg1)]">{STEPS[stepIndex]?.title}</b>
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-[14px]">
              {showStepper && (
                <>
                  <span className="text-[11.5px] text-[var(--fg3)] flex items-center gap-[6px]">
                    <Check size={14} strokeWidth={2} color="var(--success)" />
                    Saved
                  </span>
                  <Button
                    variant="secondary"
                    onClick={onSave}
                    style={{ padding: "9px 16px", fontSize: 13.5 }}
                    leading={<LogOut size={14} strokeWidth={1.75} />}
                  >
                    Save &amp; exit
                  </Button>
                </>
              )}
              {!showStepper && showResume && (
                <span className="text-[13px] text-[var(--fg2)]">
                  Already started?{" "}
                  <button onClick={onResume} className="font-bold text-[var(--cyan-700)] cursor-pointer">
                    Resume
                  </button>
                </span>
              )}
            </div>
          </header>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-14 py-11 pb-16">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
