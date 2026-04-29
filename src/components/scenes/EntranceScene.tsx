import { useEffect, useState } from "react";
import { IncenseParticles } from "@/components/ritual/IncenseParticles";

// 入场动画：第一人称走入山中通天大圣坛庙
export function EntranceScene({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 1500),
      setTimeout(() => setPhase(2), 3500),
      setTimeout(() => setPhase(3), 5500),
      setTimeout(onDone, 6800),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      {/* 远景天光 */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 35%, oklch(0.45 0.1 60 / 0.5), oklch(0.08 0.01 250) 70%)",
        }}
      />

      {/* 远山竹林剪影 */}
      <BambooSilhouette
        layer={0}
        opacity={0.4}
        scale={1}
        y="60%"
        animate={phase >= 1}
      />
      <BambooSilhouette
        layer={1}
        opacity={0.6}
        scale={1.2}
        y="65%"
        animate={phase >= 1}
      />

      {/* 庙宇剪影 — 从远到近 */}
      <div
        className="absolute left-1/2 -translate-x-1/2 transition-all duration-[3000ms] ease-out"
        style={{
          bottom: "20%",
          width: "70%",
          opacity: phase >= 1 ? 1 : 0,
          transform: `translateX(-50%) scale(${phase >= 2 ? 1.6 : 1})`,
          transformOrigin: "center bottom",
        }}
      >
        <TempleSilhouette />
      </div>

      {/* 红布条 */}
      {phase >= 2 && (
        <div className="absolute left-0 right-0 top-[28%] flex justify-around opacity-90 animate-fade-in">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 w-2 origin-top animate-cloth-wave bg-gradient-to-b from-accent/90 via-accent/70 to-accent/40"
              style={{
                animationDelay: `${i * 0.3}s`,
                animationDuration: `${3 + i * 0.4}s`,
                filter: "drop-shadow(0 0 8px oklch(0.45 0.18 30 / 0.6))",
              }}
            />
          ))}
        </div>
      )}

      {/* 前景地面石阶 */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[30%]"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.18 0.02 60 / 0) 0%, oklch(0.12 0.015 60 / 0.95) 100%)",
        }}
      />

      <IncenseParticles density={12} />

      {/* 暗角 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 120% 100% at 50% 50%, transparent 30%, oklch(0.05 0 0 / 0.85) 100%)",
        }}
      />

      {/* 文案 */}
      <div className="absolute inset-x-0 bottom-[18%] flex flex-col items-center gap-3">
        <div
          className="font-display text-2xl tracking-[0.5em] text-gold/90 transition-opacity duration-1000"
          style={{ opacity: phase >= 0 && phase < 3 ? 1 : 0 }}
        >
          {phase === 0 && "山風起，竹影深"}
          {phase === 1 && "見一古庙，隱於林中"}
          {phase === 2 && "步入庙中"}
        </div>
        <div className="text-xs tracking-[0.3em] text-foreground/40">
          通 天 大 聖 靈 籤
        </div>
      </div>

      {/* 末段过渡黑场 */}
      <div
        className="pointer-events-none absolute inset-0 bg-black transition-opacity duration-1000"
        style={{ opacity: phase >= 3 ? 1 : 0 }}
      />
    </div>
  );
}

function BambooSilhouette({
  layer,
  opacity,
  scale,
  y,
  animate,
}: {
  layer: number;
  opacity: number;
  scale: number;
  y: string;
  animate: boolean;
}) {
  return (
    <div
      className={animate ? "animate-fade-in" : "opacity-0"}
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: y,
        height: "50%",
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: "center top",
      }}
    >
      <svg
        viewBox="0 0 400 300"
        preserveAspectRatio="none"
        className="h-full w-full animate-bamboo-sway"
        style={{ animationDelay: `${layer * 0.5}s` }}
      >
        {Array.from({ length: 24 }).map((_, i) => {
          const x = (i / 24) * 400 + (Math.sin(i * 1.3) * 8 + layer * 4);
          const h = 180 + Math.sin(i * 2.1 + layer) * 60;
          return (
            <g key={i}>
              <line
                x1={x}
                y1={300}
                x2={x + Math.sin(i) * 4}
                y2={300 - h}
                stroke="oklch(0.18 0.04 145)"
                strokeWidth={2.4 + layer * 0.6}
                opacity={0.85}
              />
              {Array.from({ length: 4 }).map((_, j) => (
                <ellipse
                  key={j}
                  cx={x + Math.sin(i + j) * 8}
                  cy={300 - (h * (j + 1)) / 5}
                  rx={6 + layer}
                  ry={2}
                  fill="oklch(0.22 0.05 145)"
                  opacity={0.7}
                />
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function TempleSilhouette() {
  return (
    <svg viewBox="0 0 400 240" className="h-auto w-full">
      <defs>
        <linearGradient id="templeFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.16 0.02 30)" />
          <stop offset="100%" stopColor="oklch(0.08 0.012 30)" />
        </linearGradient>
        <linearGradient id="roofGlow" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.45 0.1 50 / 0.5)" />
          <stop offset="100%" stopColor="oklch(0.1 0.01 30 / 0)" />
        </linearGradient>
      </defs>
      {/* 上层飞檐 */}
      <path
        d="M 60 80 Q 200 30 340 80 L 320 100 Q 200 60 80 100 Z"
        fill="url(#templeFill)"
      />
      <path d="M 60 80 Q 200 30 340 80 L 340 70 Q 200 25 60 70 Z" fill="url(#roofGlow)" />
      {/* 中段 */}
      <rect x="80" y="100" width="240" height="20" fill="oklch(0.13 0.018 30)" />
      {/* 下层飞檐 */}
      <path
        d="M 30 130 Q 200 90 370 130 L 350 150 Q 200 115 50 150 Z"
        fill="url(#templeFill)"
      />
      {/* 庙身 */}
      <rect x="70" y="150" width="260" height="90" fill="oklch(0.1 0.012 30)" />
      {/* 柱子 */}
      {[100, 160, 240, 300].map((x) => (
        <rect key={x} x={x} y="150" width="10" height="90" fill="oklch(0.07 0.01 30)" />
      ))}
      {/* 中央门洞 */}
      <rect x="180" y="175" width="40" height="65" fill="oklch(0.04 0.005 30)" />
      {/* 门洞内微光 */}
      <ellipse cx="200" cy="220" rx="18" ry="20" fill="oklch(0.5 0.15 50 / 0.4)" />
    </svg>
  );
}
