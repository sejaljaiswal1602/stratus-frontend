import { ReactNode } from "react";

type Status = "verified" | "review" | "action" | "rejected" | "pending";

const config: Record<Status, { cls: string; dot: string; label: string }> = {
  verified: { cls: "bg-[var(--success-bg)] border-[var(--success-border)] text-[var(--success)]", dot: "var(--success)", label: "Verified" },
  review:   { cls: "bg-[var(--cyan-50)] border-[var(--cyan-100)] text-[var(--cyan-700)]",         dot: "var(--cyan-600)", label: "In review" },
  action:   { cls: "bg-[var(--warning-bg)] border-[var(--warning-border)] text-[var(--warning)]", dot: "var(--warning)", label: "Action needed" },
  rejected: { cls: "bg-[var(--danger-bg)] border-[var(--danger-border)] text-[var(--danger)]",   dot: "var(--danger)", label: "Rejected" },
  pending:  { cls: "bg-[var(--slate-100)] border-[var(--slate-200)] text-[var(--fg2)]",           dot: "var(--slate-400)", label: "Not started" },
};

export default function Badge({ status, children }: { status: Status; children?: ReactNode }) {
  const c = config[status] ?? config.pending;
  return (
    <span className={`inline-flex items-center gap-[6px] text-[11.5px] font-semibold px-[10px] py-[4px] rounded-full border ${c.cls}`}>
      <span className="w-[6px] h-[6px] rounded-full flex-shrink-0" style={{ background: c.dot }} />
      {children ?? c.label}
    </span>
  );
}
