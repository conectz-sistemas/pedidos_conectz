"use client";

import { Reveal } from "./Reveal";
import { GlowCard } from "./GlowCard";

const testimonials = [
  {
    quote: "Menos ajustes e mais pedidos fechados sem retrabalho.",
    who: "Comerciante iUai",
    role: "Operação",
  },
  {
    quote: "Trocas dentro das regras evitam prejuízo e conversa longa.",
    who: "Gerência iUai",
    role: "Gestão",
  },
  {
    quote: "O pedido chega mais claro e a cozinha roda em ritmo melhor.",
    who: "Cozinha iUai",
    role: "Atendimento",
  },
];

export function LandingSocialProof() {
  return (
    <section className="mt-14">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-sm text-white/60">Prova social</div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
                Clareza no pedido. Fluidez na cozinha.
              </h2>
              <p className="mt-3 max-w-2xl text-sm text-white/70 md:text-base">
                O diferencial do iUai é transformar personalização em regra — sem perder conversão.
              </p>
            </div>
            <div className="glass glow-ring rounded-2xl px-4 py-3 text-xs text-white/70">
              “PDV vintage” + UX moderna
            </div>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {testimonials.map((t, idx) => (
            <Reveal key={t.who} delay={idx * 0.05}>
              <GlowCard className="p-6">
                <div className="text-sm text-white/80">“{t.quote}”</div>
                <div className="mt-4 divider-fade" />
                <div className="mt-4 text-xs text-white/60">
                  <div className="font-medium text-white/80">{t.who}</div>
                  <div>{t.role}</div>
                </div>
              </GlowCard>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.05}>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { k: "↓ ligações", v: "menos interrupções" },
              { k: "↑ conversão", v: "pedido mais claro" },
              { k: "↑ velocidade", v: "cozinha em fluxo" },
            ].map((s) => (
              <div key={s.k} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="text-sm text-white/60">{s.k}</div>
                <div className="mt-2 text-lg font-semibold">{s.v}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

