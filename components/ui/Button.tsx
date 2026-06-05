"use client";
import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "default" | "lg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  leading?: ReactNode;
  trailing?: ReactNode;
}

const base =
  "inline-flex items-center justify-center gap-[9px] font-semibold leading-none whitespace-nowrap cursor-pointer border transition-all duration-[170ms] focus-visible:outline-none active:translate-y-px disabled:cursor-not-allowed disabled:transform-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--cyan-600)] text-white border-transparent hover:bg-[var(--cyan-700)] disabled:bg-[var(--slate-200)] disabled:text-[var(--slate-400)] focus-visible:shadow-[var(--ring-brand)]",
  secondary:
    "bg-white text-[var(--slate-900)] border-[var(--slate-200)] hover:bg-[var(--slate-50)] hover:border-[var(--slate-300)] focus-visible:shadow-[var(--ring-brand)]",
  ghost:
    "bg-transparent text-[var(--cyan-700)] border-transparent hover:bg-[var(--cyan-50)] focus-visible:shadow-[var(--ring-brand)]",
};

const sizes: Record<Size, string> = {
  default: "text-[14.5px] rounded-[var(--r-md)] px-5 py-3",
  lg: "text-[15px] rounded-[var(--r-md)] px-6 py-[14px]",
};

export default function Button({
  variant = "primary",
  size = "default",
  block,
  leading,
  trailing,
  children,
  className = "",
  ...rest
}: Props) {
  return (
    <button
      className={[base, variants[variant], sizes[size], block ? "w-full" : "", className].join(" ")}
      {...rest}
    >
      {leading}
      {children}
      {trailing}
    </button>
  );
}
