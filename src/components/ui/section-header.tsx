import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Eyebrow } from "./eyebrow";

type SectionHeaderProps = {
  eyebrow?: string;
  title?: React.ReactNode;
  action?: { label: string; href: string };
  className?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("mb-6 flex items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        {eyebrow && (
          <Eyebrow className="mb-2" tone="yellow">
            <span>▸</span> {eyebrow}
          </Eyebrow>
        )}
        {title && (
          <h2 className="text-xl font-bold tracking-tight text-zinc-100 md:text-2xl">
            {title}
          </h2>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className="shrink-0 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500 transition-colors hover:text-yellow-400"
        >
          {action.label} →
        </Link>
      )}
    </div>
  );
}
