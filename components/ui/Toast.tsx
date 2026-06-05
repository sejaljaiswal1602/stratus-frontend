"use client";
import { CheckCircle2 } from "lucide-react";

export default function Toast({ message }: { message: string }) {
  return (
    <div className="animate-toast fixed left-1/2 bottom-7 z-50 flex items-center gap-[9px] bg-[var(--ink-800)] text-white text-[13.5px] font-medium px-[18px] py-3 rounded-full shadow-[var(--shadow-lg)]">
      <CheckCircle2 size={16} strokeWidth={1.75} color="var(--success)" />
      <span>{message}</span>
    </div>
  );
}
