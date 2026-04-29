import { useEffect, useState } from "react";
import exitBg from "@/assets/scene-exit.jpg";

export function ExitScene({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 1200),
      setTimeout(() => setPhase(2), 3000),
      setTimeout(() => setPhase(3), 4800),
      setTimeout(onDone, 6200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      {/* 写实背景 — 镜头反向远去（缩小 + 模糊 + 变暗） */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${exitBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transform: `scale(${1.15 - phase * 0.18})`,
          filter: `brightness(${0.85 - phase * 0.2}) blur(${phase * 2}px)`,
          transition: "transform 3500ms ease-in, filter 2000ms ease-in",
        }}
      />

      {/* 雾气加重 */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-[2000ms]"
        style={{
          background: "var(--gradient-fog)",
          opacity: 0.5 + phase * 0.2,
        }}
      />

      {/* 暗角 */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 110% 90% at 50% 55%, transparent 30%, oklch(0.03 0 0 / 0.9) 100%)",
        }}
      />

      {/* 渐黑 */}
      <div
        className="pointer-events-none absolute inset-0 bg-black transition-opacity duration-[1500ms]"
        style={{ opacity: phase >= 2 ? 0.78 : 0 }}
      />

      {/* 题字 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="text-center font-display tracking-[0.5em] text-gold transition-opacity duration-1000"
          style={{
            opacity: phase >= 2 ? 1 : 0,
            textShadow: "0 2px 16px oklch(0 0 0 / 0.95)",
          }}
        >
          <div className="mb-3 text-3xl">下次再來</div>
          <div className="text-xs tracking-[0.3em] text-foreground/55">
            山中歸路，竹影自開
          </div>
        </div>
      </div>
    </div>
  );
}
