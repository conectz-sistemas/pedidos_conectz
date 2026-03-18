"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useMouseParallax } from "./useMouseParallax";
import { useCallback } from "react";

function Highlight({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative">
      <span className="absolute -inset-x-2 -inset-y-1 rounded-2xl bg-gradient-to-r from-indigo-500/20 via-fuchsia-500/20 to-sky-500/20 blur" />
      <span className="relative bg-gradient-to-r from-indigo-200 via-fuchsia-200 to-sky-200 bg-clip-text text-transparent">
        {children}
      </span>
    </span>
  );
}

export function LandingHero() {
  const ref = useMouseParallax<HTMLDivElement>(16);
  const onSpotlight = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const sx = ((e.clientX - rect.left) / rect.width) * 100;
    const sy = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--sx", `${sx}%`);
    el.style.setProperty("--sy", `${sy}%`);
  }, []);

  return (
    <section
      ref={ref}
      onMouseMove={onSpotlight}
      className="relative overflow-hidden rounded-[28px] border border-white/10"
    >
      <div className="absolute inset-0 bg-black/30" />
      <div className="bg-mesh mesh-animate" />
      <div className="noise" />
      <div className="spotlight" />

      <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
              MVP pronto para vender • foco em lanchonetes
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
              className="mt-5 text-4xl font-semibold leading-tight tracking-tight md:text-5xl"
            >
              Pedidos online com <Highlight>trocas justas</Highlight> — sem ligações, sem confusão.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
              className="mt-4 text-base text-white/75 md:text-lg"
            >
              O cliente monta o lanche, paga e acompanha. Você recebe na cozinha e controla equivalentes para evitar prejuízo.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link className="btn btn-glow" href="/start">
                Começar agora
              </Link>
              <Link className="btn" href="/t/demo">
                Ver demo do cliente
              </Link>
              <Link className="btn" href="/admin">
                Ver painel
              </Link>
            </motion.div>

            <div className="mt-6 flex flex-wrap gap-4 text-xs text-white/60">
              <div className="inline-flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-white/40" />
                Mobile-first
              </div>
              <div className="inline-flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-white/40" />
                Checkout + acompanhamento
              </div>
              <div className="inline-flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-white/40" />
                Multi-tenant por slug
              </div>
            </div>
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
            <div className="glass glow-ring rounded-[24px] p-5">
              <div className="flex items-center justify-between text-xs text-white/70">
                <div className="font-medium text-white/85">Prévia do painel</div>
                <div className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
                  tempo real
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                {[
                  { code: "JO1234", status: "Preparando", total: "R$ 29,90" },
                  { code: "MA9876", status: "Recebido", total: "R$ 18,90" },
                  { code: "CA4321", status: "Pronto", total: "R$ 24,90" },
                ].map((o) => (
                  <div
                    key={o.code}
                    className="rounded-2xl border border-white/10 bg-black/30 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold tracking-wider">#{o.code}</div>
                        <div className="mt-1 text-xs text-white/60">{o.status}</div>
                      </div>
                      <div className="text-sm text-white/80">{o.total}</div>
                    </div>
                    <div className="mt-3 h-1.5 w-full rounded-full bg-white/5">
                      <div className="h-1.5 w-2/3 rounded-full bg-gradient-to-r from-indigo-400/80 to-sky-400/80" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <motion.div
              aria-hidden
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-5 -left-5 hidden md:block"
            >
              <div className="glass glow-ring rounded-2xl px-4 py-3 text-xs text-white/80">
                Trocas controladas: bacon → calabresa/frango
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

