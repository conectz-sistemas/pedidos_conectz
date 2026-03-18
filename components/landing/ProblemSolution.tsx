"use client";

import { Reveal } from "./Reveal";
import { GlowCard } from "./GlowCard";

export function LandingProblemSolution() {
  return (
    <section className="mt-14">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <div className="grid gap-4 md:grid-cols-2">
            <GlowCard className="p-6">
              <div className="text-sm text-white/60">Problema</div>
              <h3 className="mt-2 text-xl font-semibold">“Pode trocar a salsicha por calabresa?”</h3>
              <p className="mt-3 text-sm text-white/70">
                Troca livre vira prejuízo e vira ligação no WhatsApp. O cliente quer personalizar, mas o comerciante precisa de regras claras.
              </p>
              <ul className="mt-4 grid gap-2 text-sm text-white/75">
                <li>- pedidos travados por dúvida</li>
                <li>- cozinha interrompida por ligação</li>
                <li>- troca injusta = margem indo embora</li>
              </ul>
            </GlowCard>

            <GlowCard className="p-6">
              <div className="text-sm text-white/60">Solução</div>
              <h3 className="mt-2 text-xl font-semibold">Equivalentes definidos pelo comerciante</h3>
              <p className="mt-3 text-sm text-white/70">
                Você aponta quais ingredientes podem ser substituídos por quais. O cliente escolhe só dentro do que você aprovou.
              </p>
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/75">
                <div className="font-medium text-white">Exemplo</div>
                <div className="mt-2 grid gap-1 text-white/70">
                  <div>Bacon → Calabresa / Frango</div>
                  <div>Salsicha → Frango / Presunto</div>
                  <div>Queijo → Cheddar</div>
                </div>
              </div>
            </GlowCard>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

