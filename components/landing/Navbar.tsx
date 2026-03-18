import Link from "next/link";
import { LogoMark } from "./LogoMark";

export function LandingNavbar() {
  return (
    <div className="sticky top-0 z-20">
      <div className="absolute inset-0 -z-10 bg-black/30 backdrop-blur border-b border-white/10" />
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <LogoMark />
          <span className="font-semibold tracking-wide">
            iUai{" "}
            <span className="hidden md:inline text-white/55 font-medium">
              — pedidos com trocas justas
            </span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link className="btn" href="/#demo">
            Ver demo
          </Link>
          <Link className="btn" href="/admin">
            Entrar
          </Link>
          <Link className="btn btn-glow" href="/start">
            Criar conta
          </Link>
        </div>
      </div>
    </div>
  );
}

