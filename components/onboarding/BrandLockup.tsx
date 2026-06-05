export default function BrandLockup() {
  return (
    <div className="flex flex-col gap-[6px]">
      <div className="flex items-center gap-[11px]">
        <div className="flex flex-col gap-[3.5px]">
          <div className="h-[3px] w-[22px] rounded-[2px] bg-[var(--cyan-300)] opacity-60" />
          <div className="h-[3px] w-[30px] rounded-[2px] bg-[var(--cyan-400)] opacity-90" />
          <div className="h-[3px] w-[26px] rounded-[2px] bg-[var(--cyan-300)] opacity-60" />
        </div>
        <div
          className="text-[23px] font-semibold text-white tracking-[-0.02em]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Stratus<span className="text-[var(--cyan-400)]">.</span>
        </div>
      </div>
      <div className="text-[10.5px] tracking-[.05em] text-[var(--fg-on-dark-2)] pl-[34px]">
        A QUANT AIF BY iRAGE
      </div>
    </div>
  );
}
