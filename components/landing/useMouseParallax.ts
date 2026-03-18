"use client";

import { useEffect, useRef } from "react";

export function useMouseParallax<T extends HTMLElement>(strength = 10) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    function onMove(e: MouseEvent) {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const node = ref.current;
        if (!node) return;
        const rect = node.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        node.style.setProperty("--px", `${x * strength}px`);
        node.style.setProperty("--py", `${y * strength}px`);
      });
    }

    el.addEventListener("mousemove", onMove);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      el.removeEventListener("mousemove", onMove);
    };
  }, [strength]);

  return ref;
}

