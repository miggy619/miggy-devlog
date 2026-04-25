import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      "flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-100 transition-colors",
      "placeholder:text-zinc-600",
      "focus:border-yellow-400/60 focus:outline-none focus:ring-2 focus:ring-yellow-400/30",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "file:mr-3 file:h-8 file:rounded file:border-0 file:bg-zinc-900 file:px-3 file:text-xs file:font-mono file:uppercase file:tracking-widest file:text-zinc-300 hover:file:bg-zinc-800",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
