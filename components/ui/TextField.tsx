"use client";
import { InputHTMLAttributes, forwardRef } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  optional?: boolean;
  help?: string;
  error?: string | null;
  mono?: boolean;
  prefix?: string;
}

const inputBase =
  "w-full text-[14.5px] text-[var(--fg1)] bg-white border border-[var(--slate-200)] rounded-[var(--r-lg)] px-[14px] py-3 transition-[border-color,box-shadow] duration-150 placeholder:text-[var(--slate-400)] focus:outline-none focus:border-[var(--cyan-400)] focus:shadow-[var(--ring-brand)]";

const TextField = forwardRef<HTMLInputElement, Props>(function TextField(
  { label, optional, help, error, mono, prefix, className = "", ...rest },
  ref
) {
  const monoClass = mono ? "font-mono tracking-[.02em]" : "";
  const errClass = error ? "border-[var(--danger-border)] bg-[var(--danger-bg)]" : "";

  return (
    <div className="flex flex-col gap-[7px]">
      {label && (
        <label className="text-[13px] font-semibold text-[var(--fg1)]">
          {label}
          {optional && <span className="font-normal text-[var(--fg3)]"> · optional</span>}
        </label>
      )}
      {prefix ? (
        <div className="relative flex items-center">
          <span
            className="absolute left-[14px] font-mono text-[14.5px] font-medium text-[var(--fg2)] pointer-events-none"
            style={{ zIndex: 1 }}
          >
            {prefix}
          </span>
          <span
            className="absolute top-[11px] bottom-[11px] w-px bg-[var(--slate-200)]"
            style={{ left: 14 + prefix.length * 9 + 10 }}
          />
          <input
            ref={ref}
            className={[inputBase, monoClass, errClass, className].join(" ")}
            style={{ paddingLeft: 14 + prefix.length * 9 + 22 }}
            {...rest}
          />
        </div>
      ) : (
        <input ref={ref} className={[inputBase, monoClass, errClass, className].join(" ")} {...rest} />
      )}
      {error ? (
        <span className="text-[12px] leading-[1.45] text-[var(--danger)]">{error}</span>
      ) : help ? (
        <span className="text-[12px] leading-[1.45] text-[var(--fg3)]">{help}</span>
      ) : null}
    </div>
  );
});

export default TextField;
