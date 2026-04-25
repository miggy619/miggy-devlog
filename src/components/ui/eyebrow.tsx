import * as React from "react";
import { cn } from "@/lib/utils";

type EyebrowProps = React.HTMLAttributes<HTMLSpanElement> & {
  icon?: React.ReactNode;
  pulse?: boolean;
  tone?: "yellow" | "zinc" | "emerald";
};

const TONES = {
  yellow: "text-yellow-400",
  zinc: "text-zinc-500",
  emerald: "text-emerald-400",
} as const;

export function Eyebrow({
  className,
  children,
  icon,
  pulse = false,
  tone = "yellow",
  ...props
}: EyebrowProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em]",
        TONES[tone],
        className,
      )}
      {...props}
    >
      {pulse && (
        <span className="relative flex h-1.5 w-1.5" aria-hidden>
          <span className="absolute inset-0 animate-ping rounded-full bg-current opacity-60" />
          <span className="relative h-1.5 w-1.5 rounded-full bg-current" />
        </span>
      )}
      {icon}
      {children}
    </span>
  );
}
