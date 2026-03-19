"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useMouseParallax } from "./useMouseParallax";

export function LandingHero() {
  const ref = useMouseParallax<HTMLDivElement>(16);

  return (
    <section ref={ref} className="relative overflow-hidden rounded-2xl border border-white/10">
      <div className="absolute inset-0 bg-[radial-gradient(800px_circle_at_20%_0%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(700px_circle_at_80%_20%,rgba(56,189,248,0.18),transparent_55%)]" />

      <div className="relative mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
              Onboarding simples + cozinha em tempo real
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.04 }}
              className="mt-5 text-3xl font-semibold leading-tight tracking-tight md:text-5xl"
            >
              Pedidos online para lanchonetes, sem erro e sem dor de cabeça.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
              className="mt-4 text-base text-white/70 md:text-lg"
            >
              O cliente monta o lanche e a cozinha recebe o pedido com trocas autorizadas. Sem ligações, sem retrabalho.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link className="btn btn-primary btn-glow" href="/start">
                Começar agora
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
            className="relative"
            style={{
              transform: "translate3d(var(--px, 0px), var(--py, 0px), 0)",
              transition: "transform 250ms ease",
            }}
          >
            <div className="glass rounded-2xl border border-white/10 p-5">
              <div className="flex items-center justify-between text-xs text-white/70">
                <div className="font-medium text-white/85">Mockup do painel</div>
                <div className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
                  em tempo real
                </div>
              </div>
              <div className="mt-4 grid gap-3">
                {[
                  { status: "Recebido" },
                  { status: "Preparando" },
                  { status: "Pronto" },
                ].map((o, idx) => (
                  <div key={idx} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold tracking-wider">Pedido</div>
                        <div className="mt-1 text-xs text-white/60">{o.status}</div>
                      </div>
                      <div className="text-sm text-white/80">—</div>
                    </div>
                    <div className="mt-3 h-1.5 w-full rounded-full bg-white/5">
                      <div className="h-1.5 w-2/3 rounded-full bg-gradient-to-r from-indigo-400/80 to-sky-400/80" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

