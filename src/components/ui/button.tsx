import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-yellow-400 text-zinc-950 font-semibold shadow-[0_0_32px_-8px_rgba(250,204,21,0.5)] hover:bg-yellow-300 hover:shadow-[0_0_40px_-4px_rgba(250,204,21,0.6)]",
        secondary:
          "border border-zinc-800 bg-zinc-900/60 text-zinc-200 backdrop-blur-sm hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-100",
        ghost:
          "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100",
        outline:
          "border border-yellow-400/30 bg-yellow-400/5 text-yellow-400 hover:border-yellow-400/50 hover:bg-yellow-400/10",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-5",
        lg: "h-11 px-6 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
