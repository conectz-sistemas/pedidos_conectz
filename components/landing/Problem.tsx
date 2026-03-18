"use client";

import { Reveal } from "./Reveal";

export function LandingProblem() {
  return (
    <section className="mt-14">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <div className="max-w-2xl">
            <div className="text-sm text-white/60">Problemas reais</div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
              Erros em pedidos viram retrabalho e ligação no balcão.
            </h2>
            <p className="mt-3 text-sm text-white/70 md:text-base">
              O iUai transforma personalização em regra: claro para o cliente, controlado para o comerciante.
            </p>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Reveal>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 transition-transform duration-200 hover:scale-[1.02]">
              <div className="text-sm text-white/60">Dói</div>
              <div className="mt-2 text-lg font-semibold">Erros em pedidos</div>
              <div className="mt-2 text-sm text-white/70">
                Troca errada gera discussão e atraso — e ninguém quer isso.
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 transition-transform duration-200 hover:scale-[1.02]">
              <div className="text-sm text-white/60">Dói</div>
              <div className="mt-2 text-lg font-semibold">Retrabalho</div>
              <div className="mt-2 text-sm text-white/70">
                Ajustes manuais depois do pedido custam tempo e margem.
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 transition-transform duration-200 hover:scale-[1.02]">
              <div className="text-sm text-white/60">Dói</div>
              <div className="mt-2 text-lg font-semibold">Clientes ligando para ajustar</div>
              <div className="mt-2 text-sm text-white/70">
                A cozinha para. O telefone vira o “sistema”.
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

