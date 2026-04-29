import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

// 半透明墨黑浮层，统一仪式 UI 表面
export function RitualOverlay({
  children,
  className,
  position = "bottom",
}: {
  children: ReactNode;
  className?: string;
  position?: "bottom" | "center" | "full";
}) {
  return (
    <div
      className={cn(
        "pointer-events-auto absolute z-30 animate-fade-in",
        position === "bottom" && "bottom-0 left-0 right-0",
        position === "center" &&
          "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
        position === "full" && "inset-0",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function RitualCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative border border-gold/30 bg-ink/85 px-6 py-5 backdrop-blur-md",
        "before:pointer-events-none before:absolute before:inset-[3px] before:border before:border-gold/15",
        className,
      )}
    >
      {children}
    </div>
  );
}
