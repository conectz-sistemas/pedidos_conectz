"use client";

import { Reveal } from "./Reveal";
import { GlowCard } from "./GlowCard";

const features = [
  {
    title: "Trocas justas por equivalentes",
    desc: "O comerciante define quais substituições são permitidas. O cliente escolhe só o que faz sentido.",
    icon: "⇄",
  },
  {
    title: "Cozinha em tempo real",
    desc: "Pedidos atualizam automaticamente e você muda status com um clique.",
    icon: "⏱",
  },
  {
    title: "Loja por link (slug)",
    desc: "Cada lanchonete tem seu catálogo público: /t/seu-slug. Sem app, sem instalação.",
    icon: "🔗",
  },
  {
    title: "Acompanhamento + histórico",
    desc: "Cliente acompanha por código e mantém histórico no dispositivo.",
    icon: "◎",
  },
  {
    title: "Mobile-first",
    desc: "Funciona bem no celular do cliente e no computador da cozinha.",
    icon: "▣",
  },
  {
    title: "Pronto para produção",
    desc: "Estrutura pronta para operar. Cobrança recorrente fica para a próxima fase.",
    icon: "⎈",
  },
];

export function LandingFeatures() {
  return (
    <section className="mt-14">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-sm text-white/60">Por que Pedidos ConectZ</div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
                Feito para reduzir ligações — e aumentar pedido.
              </h2>
              <p className="mt-3 max-w-2xl text-sm text-white/70 md:text-base">
                Troca de ingrediente é o ponto crítico: aqui ela vira uma regra clara, fácil para o cliente e justa para a lanchonete.
              </p>
            </div>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, idx) => (
            <Reveal key={f.title} delay={idx * 0.04}>
              <GlowCard className="p-6 transition-transform duration-200 hover:-translate-y-0.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/80">
                    {f.icon}
                  </div>
                  <div className="font-medium">{f.title}</div>
                </div>
                <div className="mt-3 text-sm text-white/70">{f.desc}</div>
              </GlowCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

