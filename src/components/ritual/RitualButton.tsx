import * as React from "react";
import { cn } from "@/lib/utils";

interface RitualButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger";
}

export const RitualButton = React.forwardRef<HTMLButtonElement, RitualButtonProps>(
  ({ className, variant = "primary", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "group relative inline-flex min-w-[7.5rem] items-center justify-center px-6 py-3",
          "font-display text-sm tracking-[0.4em] transition-all duration-300",
          "border backdrop-blur-sm select-none",
          "before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-500",
          "before:bg-[radial-gradient(ellipse_at_center,oklch(0.72_0.12_82/0.2),transparent_70%)]",
          "hover:before:opacity-100 active:scale-[0.98]",
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:before:opacity-0",
          variant === "primary" &&
            "border-gold/60 bg-ink/70 text-gold hover:border-gold hover:text-foreground hover:shadow-[0_0_20px_oklch(0.72_0.12_82/0.3)]",
          variant === "ghost" &&
            "border-foreground/20 bg-ink/40 text-muted-foreground hover:border-foreground/50 hover:text-foreground",
          variant === "danger" &&
            "border-stone/40 bg-ink/60 text-stone hover:border-stone/70 hover:text-foreground",
          className,
        )}
        {...props}
      >
        <span className="relative z-10">{children}</span>
      </button>
    );
  },
);
RitualButton.displayName = "RitualButton";
