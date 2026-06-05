"use client";
import { useRef } from "react";
import { UploadCloud } from "lucide-react";

interface Props {
  label: string;
  onFile: (file: File) => void;
}

export default function Dropzone({ label, onFile }: Props) {
  const ref = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    if (files?.[0]) onFile(files[0]);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => ref.current?.click()}
      onKeyDown={(e) => e.key === "Enter" && ref.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
      className="border-[1.5px] border-dashed border-[var(--slate-300)] bg-[var(--slate-50)] rounded-[var(--r-xl)] p-[26px] flex flex-col items-center gap-[9px] text-center cursor-pointer transition-all duration-150 hover:border-[var(--cyan-400)] hover:bg-[var(--cyan-50)] focus-visible:outline-none focus-visible:shadow-[var(--ring-brand)]"
    >
      <div className="w-[46px] h-[46px] rounded-[11px] bg-white border border-[var(--slate-200)] flex items-center justify-center text-[var(--cyan-600)]">
        <UploadCloud size={24} strokeWidth={1.75} />
      </div>
      <div className="text-[14px] font-semibold text-[var(--fg1)]">
        Drop your {label.toLowerCase()} here, or{" "}
        <span className="text-[var(--cyan-700)]">browse files</span>
      </div>
      <div className="text-[11.5px] text-[var(--fg3)]">PDF, JPG or PNG · up to 10 MB</div>
      <input
        ref={ref}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
