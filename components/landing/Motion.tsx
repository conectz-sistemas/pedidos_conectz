"use client";

import { MotionConfig, useReducedMotion } from "framer-motion";

export function LandingMotionProvider({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <MotionConfig reducedMotion={reduce ? "always" : "never"}>
      {children}
    </MotionConfig>
  );
}

