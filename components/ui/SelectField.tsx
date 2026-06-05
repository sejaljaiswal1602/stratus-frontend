"use client";
import { SelectHTMLAttributes, ReactNode } from "react";

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  help?: string;
  children: ReactNode;
}

export default function SelectField({ label, help, children, className = "", ...rest }: Props) {
  return (
    <div className="flex flex-col gap-[7px]">
      {label && <label className="text-[13px] font-semibold text-[var(--fg1)]">{label}</label>}
      <select
        className={[
          "w-full text-[14.5px] text-[var(--fg1)] bg-white border border-[var(--slate-200)] rounded-[var(--r-lg)] px-[14px] py-3 appearance-none cursor-pointer transition-[border-color,box-shadow] duration-150 focus:outline-none focus:border-[var(--cyan-400)] focus:shadow-[var(--ring-brand)]",
          "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' fill='none' stroke='%238A99A4' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")] bg-no-repeat bg-[right_13px_center] pr-10",
          className,
        ].join(" ")}
        {...rest}
      >
        {children}
      </select>
      {help && <span className="text-[12px] leading-[1.45] text-[var(--fg3)]">{help}</span>}
    </div>
  );
}
