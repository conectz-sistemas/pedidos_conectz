"use client";

import Link from "next/link";
import { Reveal } from "./Reveal";

export function LandingFinalCTA() {
  return (
    <section className="mt-14">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 md:p-10">
            <div className="grid gap-6 md:grid-cols-2 md:items-center">
              <div>
                <div className="text-sm text-white/60">Pronto para começar?</div>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
                  Começar agora e publicar seu catálogo.
                </h2>
                <p className="mt-3 text-sm text-white/70 md:text-base">
                  Ative sua conta hoje — você configura rápido e já começa a receber pedidos.
                </p>
              </div>
              <div className="flex flex-col gap-3 md:items-end">
                <Link
                  href="/start"
                  className="btn btn-primary btn-glow w-full md:w-auto text-center text-base"
                >
                  Começar agora
                </Link>
                <div className="text-xs text-white/60">
                  Urgência leve: configure em poucos minutos e publique seu catálogo.
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

