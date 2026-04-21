import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[120px] w-full rounded-md border border-zinc-800 bg-zinc-950/70 px-3 py-2 font-mono text-sm leading-relaxed text-zinc-100 transition-colors",
      "placeholder:text-zinc-600",
      "focus:border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/30",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
