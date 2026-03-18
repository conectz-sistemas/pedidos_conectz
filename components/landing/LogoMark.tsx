export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="relative grid place-items-center rounded-2xl border border-white/15 bg-white/5 overflow-hidden"
      aria-label="iUai"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/25 via-fuchsia-500/15 to-sky-500/20" />
      <div className="absolute inset-0 opacity-70 blur-xl bg-gradient-to-r from-indigo-500/25 to-sky-500/20" />
      <div className="relative text-[11px] font-semibold tracking-wider text-white/90">
        IU
      </div>
    </div>
  );
}

