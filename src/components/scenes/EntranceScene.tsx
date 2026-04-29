import { useEffect, useState } from "react";
import { IncenseParticles } from "@/components/ritual/IncenseParticles";
import entranceBg from "@/assets/scene-entrance.jpg";

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
      {/* 写实背景 — 缓慢推进 */}
      <div
        className="absolute inset-0 transition-transform duration-[6500ms] ease-out"
        style={{
          backgroundImage: `url(${entranceBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transform: `scale(${1 + phase * 0.18})`,
          filter: phase >= 3 ? "brightness(0.4) blur(2px)" : "brightness(0.85)",
          transition: "transform 6500ms ease-out, filter 1200ms ease-out",
        }}
      />

      {/* 雾气覆层 */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "var(--gradient-fog)" }}
      />

      {/* 红布条飘动（第二阶段叠加在远庙前） */}
      {phase >= 2 && (
        <div className="absolute left-0 right-0 top-[18%] flex justify-around opacity-70 animate-fade-in">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 w-1.5 origin-top animate-cloth-wave bg-gradient-to-b from-accent/80 via-accent/60 to-accent/20"
              style={{
                animationDelay: `${i * 0.3}s`,
                animationDuration: `${3 + i * 0.4}s`,
                filter: "drop-shadow(0 0 8px oklch(0.45 0.18 30 / 0.6))",
              }}
            />
          ))}
        </div>
      )}

      <IncenseParticles density={10} />

      {/* 暗角 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 110% 90% at 50% 55%, transparent 35%, oklch(0.04 0 0 / 0.9) 100%)",
        }}
      />

      {/* 文案 */}
      <div className="absolute inset-x-0 bottom-[14%] flex flex-col items-center gap-3">
        <div
          className="font-display text-2xl tracking-[0.5em] text-gold/95 transition-opacity duration-1000"
          style={{
            opacity: phase < 3 ? 1 : 0,
            textShadow: "0 2px 12px oklch(0 0 0 / 0.9)",
          }}
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
