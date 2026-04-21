"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: React.ElementType;
};

export function Reveal({
  children,
  delay = 0,
  className,
  as: As = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -48px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <As
      ref={ref}
      data-reveal
      data-reveal-visible={visible || undefined}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn("reveal", className)}
    >
      {children}
    </As>
  );
}
