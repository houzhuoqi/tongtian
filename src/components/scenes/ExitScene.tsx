import { useEffect, useRef, useState } from "react";
import exitBg from "@/assets/scene-exit.jpg";

// 离场：镜头反向远去 — 远景缓慢缩小变暗，近景叶片快速向后掠过
export function ExitScene({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0);
  const phaseRef = useRef(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const tiltRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  useEffect(() => {
    const timers = [
      setTimeout(() => { setPhase(1); phaseRef.current = 1; }, 1200),
      setTimeout(() => { setPhase(2); phaseRef.current = 2; }, 3000),
      setTimeout(() => { setPhase(3); phaseRef.current = 3; }, 4800),
      setTimeout(onDone, 6200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const r = rootRef.current?.getBoundingClientRect();
      if (!r) return;
      tiltRef.current.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      tiltRef.current.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // 运镜常量（与帧率无关：所有相位以 dt 秒累积）
  const STEP_HZ = 1.4;            // 步频：1.4Hz ≈ 行走节奏
  const STEP_PEAK_SHARPNESS = 1.8; // 双峰落地的锐度（越大越"咚")
  const LOOK_BACK_HZ = 0.22;       // 回头一瞥频率：~4.5s 一次
  const LOOK_BACK_AMP = 0.22;      // 回头幅度
  const BREATH_HZ_X = 0.135;       // 呼吸（横向）
  const BREATH_HZ_Y = 0.088;       // 呼吸（纵向）

  // 主循环：呼吸 + 沉重脚步 + 微抖 + 镜头前进（背景放大 / 近景擦边掠出）
  useEffect(() => {
    let raf = 0;
    let stepPhase = 0;   // 累积相位（与帧率无关）
    let breathPhaseX = 0;
    let breathPhaseY = 0;
    let lookPhase = 0;
    let t = 0;
    let last = performance.now();
    const TWO_PI = Math.PI * 2;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;

      // 累积相位 —— 不依赖 t * Hz，避免长时间漂移和高刷设备手感不同
      stepPhase = (stepPhase + dt * STEP_HZ * TWO_PI) % TWO_PI;
      breathPhaseX = (breathPhaseX + dt * BREATH_HZ_X * TWO_PI) % TWO_PI;
      breathPhaseY = (breathPhaseY + dt * BREATH_HZ_Y * TWO_PI) % TWO_PI;
      lookPhase = (lookPhase + dt * LOOK_BACK_HZ * TWO_PI) % TWO_PI;

      tiltRef.current.x += (tiltRef.current.tx - tiltRef.current.x) * 0.08;
      tiltRef.current.y += (tiltRef.current.ty - tiltRef.current.y) * 0.08;

      const breathX = Math.sin(breathPhaseX) * 0.12;
      const breathY = Math.cos(breathPhaseY) * 0.09;

      // 双峰落地：|sin|^k 越大越锐利
      const stepBob = Math.pow(Math.abs(Math.sin(stepPhase)), STEP_PEAK_SHARPNESS);
      const stepSway = Math.sin(stepPhase * 0.5);
      // 离场过程中脚步只缓慢减弱
      const intensity = Math.max(0.55, 1.05 - phaseRef.current * 0.15);

      // 回头一瞥
      const lookBack = Math.sin(lookPhase) * LOOK_BACK_AMP;

      // 微抖：用 dt 归一化，让 60Hz / 120Hz 设备总幅度一致
      const jScale = Math.sqrt(dt * 60); // 60Hz 基准
      const jitterX = (Math.random() - 0.5) * 0.55 * jScale;
      const jitterY = (Math.random() - 0.5) * 0.55 * jScale;

      // 关键：镜头"向外走" —— 背景在视野中放大、近景往两侧擦出画面
      // 远景（depth=0）：从 1.0 缓慢推近到 1.22（人在远离庙宇，但庙宇在画面里因镜头前推而变大？
      // 不 —— 真正"走出去"是观察者前进，远景在视野中其实稳定/微缩；前景由小变大并掠过镜头边缘。
      // 这里采用电影常用做法：远景轻微推近（1.0→1.18）保留"被庙宇目送"的留恋感，
      // 近景大幅放大（1.2→3.2）模拟竹叶贴脸掠过。
      const p = phaseRef.current;
      const farScale = 1.0 + p * 0.06;       // 1.0 → 1.18
      const nearScale = 1.2 + p * 0.65;      // 1.2 → 3.15

      layerRefs.current.forEach((el, depthKey) => {
        const depth = depthKey / 100;
        const scale = farScale * (1 - depth) + nearScale * depth;

        const parX =
          -(tiltRef.current.x + breathX + lookBack) * (4 + depth * 32);
        const parY = -(tiltRef.current.y + breathY) * (3 + depth * 18);

        const stepAmpY = (1.6 + depth * 9.0) * intensity;
        const stepAmpX = (0.9 + depth * 5.0) * intensity;
        const stepX = stepSway * stepAmpX;
        const stepY = -stepBob * stepAmpY;

        const jX = jitterX * (0.8 + depth * 2.6);
        const jY = jitterY * (0.8 + depth * 2.6);

        const tx = parX + stepX + jX;
        const ty = parY + stepY + jY;

        el.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
      });

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const registerLayer = (depth: number) => (el: HTMLDivElement | null) => {
    const key = Math.round(depth * 100);
    if (el) layerRefs.current.set(key, el);
    else layerRefs.current.delete(key);
  };

  return (
    <div ref={rootRef} className="relative h-full w-full overflow-hidden bg-black">
      {/* 远景：庙宇渐远 */}
      <div
        ref={registerLayer(0)}
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${exitBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: `brightness(${0.85 - phase * 0.2}) blur(${phase * 2}px)`,
          willChange: "transform, filter",
          transition: "filter 2000ms ease-in",
        }}
      />

      {/* 中景：山雾层 */}
      <div
        ref={registerLayer(0.2)}
        className="absolute inset-0 pointer-events-none mix-blend-screen"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 45%, oklch(0.5 0.04 70 / 0.25), transparent 65%)",
          filter: "blur(20px)",
          willChange: "transform",
        }}
      />

      {/* 中近景：远处竹林剪影 */}
      <div
        ref={registerLayer(0.45)}
        className="absolute inset-0 pointer-events-none"
        style={{ filter: "blur(3px)", opacity: 0.6, willChange: "transform" }}
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

      {/* 近景：左右竹竿 */}
      <div
        ref={registerLayer(0.85)}
        className="absolute inset-0 pointer-events-none"
        style={{ filter: "blur(10px)", willChange: "transform" }}
      >
        <ExitBamboo opacity={0.85} count={5} sideOnly tall />
      </div>

      {/* 最前景：模糊叶簇 */}
      <div
        ref={registerLayer(1)}
        className="absolute inset-0 pointer-events-none"
        style={{ filter: "blur(16px)", opacity: 0.55, willChange: "transform" }}
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

      {/* 旧氛围叠层 */}
      <div className="aged-overlay" />

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
