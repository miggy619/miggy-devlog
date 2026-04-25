"use client";

import { useEffect, useRef } from "react";

/**
 * Ambient page background:
 *   1) static grid + dot overlay (CSS-only, low GPU cost)
 *   2) cursor-follow cyan glow (brittanychiang.com-inspired) — desktop only
 *
 * Fixed to viewport, z-0, pointer-events-none.
 */
export function AmbientBackground() {
  const glowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 3;
    let currX = targetX;
    let currY = targetY;

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const tick = () => {
      currX += (targetX - currX) * 0.08;
      currY += (targetY - currY) * 0.08;
      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${currX - 300}px, ${currY - 300}px, 0)`;
      }
      raf = window.requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    raf = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* Base gradient wash */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(250,204,21,0.08),transparent_60%)]" />

      {/* Subtle grid lines */}
      <div className="absolute inset-0 grid-lines opacity-60" />

      {/* Dot grid near top */}
      <div className="absolute inset-x-0 top-0 h-[700px] dot-grid" />

      {/* Cursor-follow glow */}
      <div
        ref={glowRef}
        className="absolute h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(250,204,21,0.08),transparent_60%)] blur-2xl will-change-transform"
        style={{ transform: "translate3d(-50%, -50%, 0)" }}
      />

      {/* Bottom violet glow */}
      <div className="absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(253,224,71,0.06),transparent_60%)] blur-3xl" />

      {/* Noise */}
      <div className="absolute inset-0 noise-overlay" />
    </div>
  );
}
