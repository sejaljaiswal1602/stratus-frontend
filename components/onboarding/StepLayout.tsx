"use client";
import { ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";

export function StepHeader({
  overline, title, lead,
}: { overline?: string; title: string; lead?: string }) {
  return (
    <div className="flex flex-col gap-[10px] mb-[30px]">
      {overline && (
        <div className="text-[11.5px] font-semibold tracking-[.08em] uppercase text-[var(--fg-brand)]">
          {overline}
        </div>
      )}
      <h1
        className="text-[34px] font-semibold leading-[1.12] tracking-[-0.018em] text-[var(--fg1)] m-0"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {title}
      </h1>
      {lead && (
        <p className="text-[17px] leading-[1.55] text-[var(--fg2)] m-0">{lead}</p>
      )}
    </div>
  );
}

interface StepNavProps {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  backLabel?: string;
  loading?: boolean;
}

export function StepNav({
  onBack, onNext, nextLabel = "Continue", nextDisabled, backLabel = "Back", loading,
}: StepNavProps) {
  return (
    <div className="flex items-center justify-between mt-9 pt-6 border-t border-[var(--slate-200)]">
      {onBack ? (
        <Button variant="ghost" onClick={onBack} leading={<ArrowLeft size={16} strokeWidth={1.75} />}>
          {backLabel}
        </Button>
      ) : <span />}
      <Button
        variant="primary"
        size="lg"
        onClick={onNext}
        disabled={nextDisabled || loading}
        trailing={<ArrowRight size={16} strokeWidth={1.75} />}
      >
        {loading ? "Saving…" : nextLabel}
      </Button>
    </div>
  );
}
