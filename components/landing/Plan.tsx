"use client";

import Link from "next/link";
import { Reveal } from "./Reveal";

export function LandingPlan() {
  return (
    <section className="mt-14">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <div className="max-w-2xl">
            <div className="text-sm text-white/60">Plano</div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
              Um plano. Tudo para vender sem dor de cabeça.
            </h2>
            <p className="mt-3 text-sm text-white/70 md:text-base">
              R$49,90/mês com o essencial para começar hoje.
            </p>
          </div>
        </Reveal>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
          <div className="grid gap-6 md:grid-cols-2 md:items-start">
            <div>
              <div className="text-sm text-white/60">Pedidos ConectZ SaaS</div>
              <div className="mt-2 text-4xl font-semibold tracking-tight">
                R$49,90<span className="text-base font-medium text-white/60">/mês</span>
              </div>
              <ul className="mt-4 grid gap-2 text-sm text-white/70">
                <li>- Trocas inteligentes (equivalentes do comerciante)</li>
                <li>- Pedido guiado para reduzir erros</li>
                <li>- Painel da cozinha em tempo real</li>
                <li>- Acompanhamento do cliente</li>
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/start" className="btn btn-primary btn-glow w-full text-center">
                Começar agora
              </Link>
              <div className="text-xs text-white/60">Sem cobrança agora (fase de validação).</div>
              <div className="divider-fade" />
              <div className="text-sm text-white/70">
                Você configura em poucos passos e já publica seu catálogo.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

