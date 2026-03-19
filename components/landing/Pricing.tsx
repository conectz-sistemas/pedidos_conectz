"use client";

import Link from "next/link";
import { Reveal } from "./Reveal";
import { GlowCard } from "./GlowCard";

export function LandingPricing() {
  return (
    <section className="mt-14">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <div className="text-sm text-white/60">Preço simples</div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
                Um plano. Tudo que você precisa para vender.
              </h2>
              <p className="mt-3 max-w-2xl text-sm text-white/70 md:text-base">
                Comece hoje. Ajuste cardápio, trocas e receba pedidos na cozinha.
              </p>
            </div>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Reveal delay={0.05}>
              <GlowCard className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm text-white/60">Inclui</div>
                    <div className="mt-2 grid gap-2 text-sm text-white/80">
                      <div>- Loja pública por link (slug)</div>
                      <div>- Personalização com equivalentes</div>
                      <div>- Painel da cozinha + alerta</div>
                      <div>- Acompanhamento do cliente</div>
                      <div>- Upload de imagem do produto</div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-right">
                    <div className="text-sm text-white/60">Mensal</div>
                    <div className="mt-1 text-3xl font-semibold">
                      R$ 49,90
                      <span className="text-base font-medium text-white/60">/mês</span>
                    </div>
                    <div className="mt-3">
                      <Link className="btn btn-primary w-full" href="/start">
                        Criar conta
                      </Link>
                    </div>
                    <div className="mt-2 text-xs text-white/60">
                      Sem cobrança agora (fase de validação).
                    </div>
                  </div>
                </div>
              </GlowCard>
            </Reveal>
          </div>

          <Reveal delay={0.12}>
            <GlowCard className="p-6">
              <div className="text-sm text-white/60">Para quem é</div>
              <div className="mt-2 text-lg font-semibold">Lanchonetes</div>
              <p className="mt-2 text-sm text-white/70">
                Ideal para quem recebe pedidos pelo WhatsApp e quer organizar a cozinha e reduzir ligações.
              </p>
              <div className="mt-5 flex flex-col gap-2">
                <Link className="btn" href="/admin">
                  Já tenho conta
                </Link>
              </div>
            </GlowCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

