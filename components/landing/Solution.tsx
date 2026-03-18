"use client";

import { Reveal } from "./Reveal";

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/80">
      {children}
    </div>
  );
}

export function LandingSolution() {
  return (
    <section className="mt-14">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <div className="max-w-2xl">
            <div className="text-sm text-white/60">Solução</div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
              Personalização com regra e transparência.
            </h2>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Reveal>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 transition-transform duration-200 hover:scale-[1.02]">
              <Icon>⇄</Icon>
              <div className="mt-4 text-lg font-semibold">Trocas inteligentes</div>
              <p className="mt-2 text-sm text-white/70">
                O comerciante define quais equivalentes são permitidos para evitar troca injusta.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 transition-transform duration-200 hover:scale-[1.02]">
              <Icon>✍︎</Icon>
              <div className="mt-4 text-lg font-semibold">Pedido guiado</div>
              <p className="mt-2 text-sm text-white/70">
                Fluxo simples e rápido para o cliente montar sem ficar em dúvida.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 transition-transform duration-200 hover:scale-[1.02]">
              <Icon>▣</Icon>
              <div className="mt-4 text-lg font-semibold">Painel da cozinha</div>
              <p className="mt-2 text-sm text-white/70">
                Atualiza em tempo real e organiza a operação sem “correria” de última hora.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

