import Image from "next/image";

export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="relative grid place-items-center rounded-2xl border border-white/15 bg-white/5 overflow-hidden"
      aria-label="Pedidos ConectZ"
    >
      <Image
        src="/logo.png"
        alt="Pedidos ConectZ"
        width={size}
        height={size}
        className="object-cover"
      />
    </div>
  );
}

