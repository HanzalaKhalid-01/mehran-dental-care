"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * The clinic's signature mark: a single smile-shaped curve, reused throughout
 * the site as a structural device (section dividers, card accents) rather
 * than as one-off decoration. When it scrolls into view it draws itself in,
 * left to right — a small, literal "smile" moment.
 */
export function SmileArc({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();

  return (
    <svg
      viewBox="0 0 600 200"
      fill="none"
      className={className}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <motion.path
        d="M0 20 C 150 180, 450 180, 600 20"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        initial={reduce ? undefined : { pathLength: 0, opacity: 0 }}
        whileInView={reduce ? undefined : { pathLength: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 1.1, ease: [0.65, 0, 0.35, 1] }}
      />
    </svg>
  );
}

/**
 * Full-width wave divider between sections — the smile motif used as
 * literal page structure, not just an ornament. Fill should match the
 * section that follows it.
 */
export function SmileDivider({ className = "", flip = false }: { className?: string; flip?: boolean }) {
  return (
    <div className={`w-full overflow-hidden leading-[0] ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 1200 80"
        preserveAspectRatio="none"
        className={`w-full h-10 md:h-16 ${flip ? "-scale-y-100" : ""}`}
      >
        <path d="M0 0 C 300 90, 900 90, 1200 0 L1200 80 L0 80 Z" fill="currentColor" />
      </svg>
    </div>
  );
}
