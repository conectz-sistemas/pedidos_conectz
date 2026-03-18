"use client";

import { Reveal } from "./Reveal";

export function LandingBenefits() {
  return (
    <section className="mt-14">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <div className="max-w-2xl">
            <div className="text-sm text-white/60">Benefícios</div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
              Clareza para o cliente, controle para você.
            </h2>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Reveal>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 transition-transform duration-200 hover:scale-[1.02]">
              <div className="text-sm text-white/60">Resultado</div>
              <div className="mt-2 text-lg font-semibold">Clareza</div>
              <p className="mt-2 text-sm text-white/70">O pedido sai correto e sem “achismos”.</p>
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 transition-transform duration-200 hover:scale-[1.02]">
              <div className="text-sm text-white/60">Resultado</div>
              <div className="mt-2 text-lg font-semibold">Economia de tempo</div>
              <p className="mt-2 text-sm text-white/70">
                Menos ajuste na hora e mais fluxo na cozinha.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 transition-transform duration-200 hover:scale-[1.02]">
              <div className="text-sm text-white/60">Resultado</div>
              <div className="mt-2 text-lg font-semibold">Redução de erros</div>
              <p className="mt-2 text-sm text-white/70">
                Trocas autorizadas e regras claras para evitar retrabalho.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

