"use client";
import { FileCheck2, FileX2, Clock, Loader, Trash2 } from "lucide-react";
import Badge from "./Badge";

type FileStatus = "uploading" | "review" | "verified" | "rejected";

interface Props {
  name: string;
  meta?: string;
  status?: FileStatus;
  onRemove?: () => void;
}

const stateConfig = {
  uploading: { icon: Loader,      bg: "var(--slate-100)", fg: "var(--slate-500)", spin: true },
  review:    { icon: Clock,       bg: "var(--cyan-50)",   fg: "var(--cyan-600)",  spin: false },
  verified:  { icon: FileCheck2,  bg: "var(--success-bg)",fg: "var(--success)",   spin: false },
  rejected:  { icon: FileX2,      bg: "var(--danger-bg)", fg: "var(--danger)",    spin: false },
};

export default function FileRow({ name, meta, status = "review", onRemove }: Props) {
  const cfg = stateConfig[status];
  const Icon = cfg.icon;
  const badgeStatus = status === "uploading" ? "pending" : status === "review" ? "review" : status === "verified" ? "verified" : "rejected";

  return (
    <div className="animate-fade-in flex items-center gap-[13px] border border-[var(--slate-200)] rounded-[var(--r-lg)] px-[15px] py-[13px] bg-white transition-colors hover:bg-[var(--slate-50)]">
      <div
        className="w-9 h-9 rounded-[9px] flex items-center justify-center flex-shrink-0"
        style={{ background: cfg.bg, color: cfg.fg }}
      >
        <Icon size={20} strokeWidth={1.75} className={cfg.spin ? "animate-spin-slow" : ""} />
      </div>
      <div className="flex flex-col gap-px flex-1 min-w-0">
        <div className="text-[13.5px] font-semibold truncate">{name}</div>
        {meta && <div className="text-[11.5px] text-[var(--fg3)] font-mono">{meta}</div>}
      </div>
      {status !== "uploading" && <Badge status={badgeStatus} />}
      {onRemove && status !== "uploading" && (
        <button
          onClick={onRemove}
          className="p-2 rounded-[var(--r-md)] text-[var(--slate-400)] hover:bg-[var(--slate-100)] transition-colors focus-visible:outline-none focus-visible:shadow-[var(--ring-brand)]"
          aria-label="Remove file"
        >
          <Trash2 size={16} strokeWidth={1.75} />
        </button>
      )}
    </div>
  );
}
