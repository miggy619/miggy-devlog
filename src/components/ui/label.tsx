import * as React from "react";
import { cn } from "@/lib/utils";

export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement> & { hint?: string }
>(({ className, children, hint, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "mb-1.5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400",
      className,
    )}
    {...props}
  >
    <span>{children}</span>
    {hint && <span className="text-zinc-600 normal-case tracking-normal">{hint}</span>}
  </label>
));
Label.displayName = "Label";
