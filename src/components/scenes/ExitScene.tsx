import { useEffect, useRef, useState } from "react";
import exitBg from "@/assets/scene-exit.jpg";

// 离场：镜头反向远去 — 远景缓慢缩小变暗，近景叶片快速向后掠过
export function ExitScene({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 1200),
      setTimeout(() => setPhase(2), 3000),
      setTimeout(() => setPhase(3), 4800),
      setTimeout(onDone, 6200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  useEffect(() => {
    let raf = 0;
    let t = 0;
    const tick = () => {
      t += 0.01;
      setTilt((cur) => ({
        x: cur.x * 0.92 + Math.sin(t) * 0.08,
        y: cur.y * 0.92 + Math.cos(t * 0.6) * 0.05,
      }));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onMove = (e: PointerEvent) => {
      const r = rootRef.current?.getBoundingClientRect();
      if (!r) return;
      const nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      const ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
      setTilt({ x: nx, y: ny });
    };
    window.addEventListener("pointermove", onMove);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  // 离场：远景缩小（scale 1.15 → 0.6），近景反向（先压近 → 快速掠后）
  const layer = (depth: number) => {
    // depth 0 远 → 1 近
    const farScale = 1.15 - phase * 0.18;
    const nearScale = 1.4 - phase * 0.35; // 近景缩得更快 = 后退感
    const scale = farScale * (1 - depth) + nearScale * depth;
    const tx = -tilt.x * (3 + depth * 24);
    const ty = -tilt.y * (2 + depth * 16);
    return {
      transform: `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`,
      transition: "transform 3500ms ease-in",
    } as const;
  };

  return (
    <div ref={rootRef} className="relative h-full w-full overflow-hidden bg-black">
      {/* 远景：庙宇渐远 */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${exitBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: `brightness(${0.85 - phase * 0.2}) blur(${phase * 2}px)`,
          ...layer(0),
          transition: "transform 3500ms ease-in, filter 2000ms ease-in",
        }}
      />

      {/* 中景：山雾层 */}
      <div
        className="absolute inset-0 pointer-events-none mix-blend-screen"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 45%, oklch(0.5 0.04 70 / 0.25), transparent 65%)",
          filter: "blur(20px)",
          ...layer(0.2),
        }}
      />

      {/* 中近景：远处竹林剪影 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ filter: "blur(3px)", opacity: 0.6, ...layer(0.45) }}
      >
        <ExitBamboo opacity={0.5} count={10} />
      </div>

      {/* 雾气加重 */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-[2000ms]"
        style={{
          background: "var(--gradient-fog)",
          opacity: 0.5 + phase * 0.2,
        }}
      />

      {/* 近景：左右竹竿快速向两侧后退（强景深前虚） */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ filter: "blur(10px)", ...layer(0.85) }}
      >
        <ExitBamboo opacity={0.85} count={5} sideOnly tall />
      </div>

      {/* 最前景：模糊叶簇 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ filter: "blur(16px)", opacity: 0.55, ...layer(1) }}
      >
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          <g fill="oklch(0.14 0.04 145)">
            <ellipse cx="6" cy="14" rx="16" ry="6" transform="rotate(-20 6 14)" />
            <ellipse cx="94" cy="18" rx="15" ry="5.5" transform="rotate(22 94 18)" />
            <ellipse cx="22" cy="98" rx="28" ry="6" />
            <ellipse cx="80" cy="99" rx="30" ry="6" />
          </g>
        </svg>
      </div>

      {/* 暗角 */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 110% 90% at 50% 55%, transparent 30%, oklch(0.03 0 0 / 0.92) 100%)",
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

function ExitBamboo({
  opacity = 0.6,
  count = 8,
  sideOnly = false,
  tall = false,
}: {
  opacity?: number;
  count?: number;
  sideOnly?: boolean;
  tall?: boolean;
}) {
  const stalks = Array.from({ length: count }, (_, i) => {
    const t = i / Math.max(1, count - 1);
    let x: number;
    if (sideOnly) {
      x = i % 2 === 0 ? 3 + (i / count) * 12 : 97 - (i / count) * 12;
    } else {
      x = 5 + t * 90 + Math.sin(i * 5.7) * 3;
    }
    const w = 0.5 + Math.sin(i * 2.3) * 0.2 + (sideOnly ? 0.7 : 0);
    return { x, w, key: i };
  });
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 100 160"
      preserveAspectRatio="none"
      aria-hidden
    >
      {stalks.map((s) => (
        <g key={s.key} style={{ opacity }}>
          <rect
            x={s.x}
            y={tall ? -10 : 10}
            width={s.w}
            height={tall ? 180 : 150}
            fill="oklch(0.14 0.04 150)"
          />
          {Array.from({ length: 8 }).map((_, n) => (
            <rect
              key={n}
              x={s.x - 0.15}
              y={20 + n * 18}
              width={s.w + 0.3}
              height={0.7}
              fill="oklch(0.07 0.02 150)"
            />
          ))}
        </g>
      ))}
    </svg>
  );
}
