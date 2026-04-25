import * as React from "react";
import { cn } from "@/lib/utils";

type StatProps = {
  label: string;
  value: React.ReactNode;
  accent?: boolean;
  className?: string;
};

export function Stat({ label, value, accent = false, className }: StatProps) {
  return (
    <div className={cn("relative px-5 py-6", className)}>
      <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </div>
      <div
        className={cn(
          "font-mono text-2xl font-bold tabular-nums md:text-3xl",
          accent ? "text-yellow-400" : "text-zinc-100",
        )}
      >
        {value}
      </div>
    </div>
  );
}
