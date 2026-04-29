import { useEffect, useState } from "react";

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
      <div
        className="absolute inset-0 transition-all duration-[2000ms]"
        style={{
          background:
            "radial-gradient(ellipse 100% 80% at 50% 60%, oklch(0.22 0.06 130 / 0.5), oklch(0.05 0.01 250) 70%)",
          transform: `scale(${1 + phase * 0.4})`,
        }}
      />

      {/* 山路远去 */}
      <div
        className="absolute left-1/2 -translate-x-1/2 transition-all duration-[3500ms] ease-in"
        style={{
          bottom: "10%",
          width: "60%",
          opacity: 1 - phase * 0.3,
          transform: `translateX(-50%) translateY(${phase * 60}px) scale(${1 - phase * 0.25})`,
        }}
      >
        <svg viewBox="0 0 400 300" className="h-auto w-full">
          {/* 石阶逐级缩小 */}
          {Array.from({ length: 12 }).map((_, i) => {
            const w = 280 - i * 20;
            const y = 280 - i * 20;
            return (
              <rect
                key={i}
                x={(400 - w) / 2}
                y={y}
                width={w}
                height={6}
                fill={`oklch(0.22 0.02 60 / ${0.9 - i * 0.06})`}
              />
            );
          })}
          {/* 远处山影 */}
          <path
            d="M 0 100 L 100 60 L 180 90 L 260 50 L 340 80 L 400 60 L 400 200 L 0 200 Z"
            fill="oklch(0.1 0.012 250)"
            opacity={0.9}
          />
        </svg>
      </div>

      {/* 渐黑 */}
      <div
        className="pointer-events-none absolute inset-0 bg-black transition-opacity duration-[1500ms]"
        style={{ opacity: phase >= 2 ? 0.85 : 0 }}
      />

      {/* 题字 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="text-center font-display tracking-[0.5em] text-gold transition-opacity duration-1000"
          style={{ opacity: phase >= 2 ? 1 : 0 }}
        >
          <div className="mb-3 text-3xl">下次再來</div>
          <div className="text-xs tracking-[0.3em] text-foreground/50">
            山中歸路，竹影自開
          </div>
        </div>
      </div>
    </div>
  );
}
