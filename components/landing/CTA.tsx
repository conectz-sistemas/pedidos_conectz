"use client";

import Link from "next/link";
import { Reveal } from "./Reveal";

export function LandingCTA() {
  return (
    <section className="mt-14">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-8 md:p-10">
            <div className="absolute inset-0 -z-10">
              <div className="bg-mesh" />
              <div className="noise" />
            </div>

            <div className="grid gap-6 md:grid-cols-2 md:items-center">
              <div>
                <div className="text-sm text-white/60">Pronto para vender mais?</div>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
                  Coloque seu cardápio no ar em minutos.
                </h2>
                <p className="mt-3 text-sm text-white/70 md:text-base">
                  Crie sua conta, configure ingredientes e equivalentes, e comece a receber pedidos.
                </p>
              </div>
              <div className="flex flex-col items-start gap-3 md:items-end">
                <div className="flex flex-wrap gap-3">
                  <Link className="btn btn-primary" href="/start">
                    Criar conta agora
                  </Link>
                </div>
                <div className="text-xs text-white/60">
                  Um domínio só basta. Você pode usar `www` + `app` ou tudo no mesmo.
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

