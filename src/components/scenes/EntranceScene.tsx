import { useEffect, useRef, useState } from "react";
import { IncenseParticles } from "@/components/ritual/IncenseParticles";
import entranceBg from "@/assets/scene-entrance.jpg";

// 入场动画：第一人称走入山中通天大圣坛庙
// 多层视差：远景背景（最慢）/ 中景雾光 / 近景竹影 / 前景叶片（最快）
export function EntranceScene({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0);
  const phaseRef = useRef(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const tiltRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  useEffect(() => {
    const timers = [
      setTimeout(() => { setPhase(1); phaseRef.current = 1; }, 1500),
      setTimeout(() => { setPhase(2); phaseRef.current = 2; }, 3500),
      setTimeout(() => { setPhase(3); phaseRef.current = 3; }, 5500),
      setTimeout(onDone, 6800),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  // 输入：指针 / 陀螺仪
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const r = rootRef.current?.getBoundingClientRect();
      if (!r) return;
      tiltRef.current.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      tiltRef.current.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      tiltRef.current.tx = Math.max(-1, Math.min(1, e.gamma / 30));
      tiltRef.current.ty = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("deviceorientation", onOrient);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("deviceorientation", onOrient);
    };
  }, []);

  // 主循环：呼吸 + 脚步抖动 + 高频微抖，统一驱动所有层
  useEffect(() => {
    let raf = 0;
    let t = 0;
    let last = performance.now();
    const noiseX = () => (Math.random() - 0.5);
    const noiseY = () => (Math.random() - 0.5);

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;

      // 平滑跟随用户输入
      tiltRef.current.x += (tiltRef.current.tx - tiltRef.current.x) * 0.08;
      tiltRef.current.y += (tiltRef.current.ty - tiltRef.current.y) * 0.08;

      // 呼吸（缓慢 sinus）
      const breathX = Math.sin(t * 1.1) * 0.12;
      const breathY = Math.cos(t * 0.8) * 0.08;

      // 脚步：左右脚交替（约 1.7 步/秒），纵向 sin² 双峰沉降，横向半频摆动
      const stepHz = 1.7;
      const stepPhase = t * stepHz * Math.PI * 2;
      const stepBob = Math.abs(Math.sin(stepPhase)); // 0..1 双峰
      const stepSway = Math.sin(stepPhase * 0.5);    // 左右脚不同侧
      // phase 越深步幅越实
      const intensity = 0.6 + phaseRef.current * 0.18;

      // 高频微抖（手持/呼吸不稳）
      const jitterX = noiseX() * 0.35;
      const jitterY = noiseY() * 0.35;

      // 每层根据 depth 计算 transform 并直接写 DOM（避免 React 重绘）
      const push = phaseRef.current * 0.06;
      layerRefs.current.forEach((el, depthKey) => {
        const depth = depthKey / 100;
        const scale = 1 + push * (1 + depth * 5);

        // 视差跟随
        const parX = -(tiltRef.current.x + breathX) * (4 + depth * 28);
        const parY = -(tiltRef.current.y + breathY) * (3 + depth * 18);

        // 脚步影响：近景更明显（depth 越大幅度越大）
        const stepAmpY = (1.2 + depth * 5.5) * intensity;
        const stepAmpX = (0.6 + depth * 3.5) * intensity;
        const stepX = stepSway * stepAmpX;
        const stepY = -stepBob * stepAmpY; // 落脚时下沉，腾空时上抬

        // 微抖
        const jX = jitterX * (0.6 + depth * 2.2);
        const jY = jitterY * (0.6 + depth * 2.2);

        const tx = parX + stepX + jX;
        const ty = parY + stepY + jY;

        el.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
      });

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // 注册 layer ref；depth 0..1，存为 0..100 整数键
  const layer = (depth: number) => {
    const key = Math.round(depth * 100);
    return {
      ref: (el: HTMLDivElement | null) => {
        if (el) layerRefs.current.set(key, el);
        else layerRefs.current.delete(key);
      },
      style: {
        willChange: "transform",
        transition: "scale 1200ms ease-out", // 仅 scale 走过渡，translate 由 RAF 接管
      } as React.CSSProperties,
    };
  };

  return (
    <div ref={rootRef} className="relative h-full w-full overflow-hidden bg-black">
      {/* 远景：写实背景图 */}
      <div className="absolute inset-0" style={{ perspective: "1200px" }}>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${entranceBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: phase >= 3 ? "brightness(0.4) blur(3px)" : "brightness(0.85)",
            ...layer(0),
            transition:
              "transform 6500ms ease-out, filter 1200ms ease-out",
          }}
        />

        {/* 中远景：远山雾光层（轻微模糊，制造空气感） */}
        <div
          className="absolute inset-0 pointer-events-none mix-blend-screen"
          style={{
            background:
              "radial-gradient(ellipse 70% 45% at 50% 38%, oklch(0.55 0.04 70 / 0.35), transparent 60%)",
            filter: "blur(18px)",
            ...layer(0.15),
          }}
        />

        {/* 中景：远处竹影剪影（SVG，轻微模糊） */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ filter: "blur(2.5px)", opacity: 0.55, ...layer(0.35) }}
        >
          <BambooSilhouette opacity={0.45} count={9} hue={150} />
        </div>

        {/* 中近景：庙宇飞檐剪影（仅前两阶段） */}
        {phase >= 1 && (
          <div
            className="absolute inset-x-0 top-[6%] flex justify-center pointer-events-none animate-fade-in"
            style={{ filter: "blur(1px)", ...layer(0.5) }}
          >
            <RoofSilhouette />
          </div>
        )}

        {/* 雾气覆层（不参与视差） */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "var(--gradient-fog)" }}
        />

        {/* 红布条飘动 */}
        {phase >= 2 && (
          <div
            className="absolute left-0 right-0 top-[18%] flex justify-around opacity-70 animate-fade-in pointer-events-none"
            style={layer(0.6)}
          >
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

        {/* 近景：左右两侧深色竹竿（强模糊景深前虚） */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ filter: "blur(8px)", ...layer(0.85) }}
        >
          <BambooSilhouette
            opacity={0.85}
            count={4}
            sideOnly
            hue={140}
            tall
          />
        </div>

        {/* 最前景：飘动叶片（重模糊 + 最强视差） */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ filter: "blur(14px)", opacity: 0.6, ...layer(1) }}
        >
          <FrontLeaves />
        </div>

        <IncenseParticles density={10} />

        {/* 暗角 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 110% 90% at 50% 55%, transparent 35%, oklch(0.04 0 0 / 0.92) 100%)",
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
    </div>
  );
}

// —— 视差用的剪影组件 ——

function BambooSilhouette({
  opacity = 0.6,
  count = 8,
  sideOnly = false,
  hue = 150,
  tall = false,
}: {
  opacity?: number;
  count?: number;
  sideOnly?: boolean;
  hue?: number;
  tall?: boolean;
}) {
  const stalks = Array.from({ length: count }, (_, i) => {
    const t = i / Math.max(1, count - 1);
    let x: number;
    if (sideOnly) {
      x = i % 2 === 0 ? 4 + (i / count) * 14 : 96 - (i / count) * 14;
    } else {
      x = 6 + t * 88 + (Math.sin(i * 7.3) * 4);
    }
    const w = 0.6 + Math.sin(i * 3.1) * 0.25 + (sideOnly ? 0.6 : 0);
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
            fill={`oklch(0.16 0.04 ${hue})`}
          />
          {/* 竹节 */}
          {Array.from({ length: 8 }).map((_, n) => (
            <rect
              key={n}
              x={s.x - 0.2}
              y={20 + n * 18}
              width={s.w + 0.4}
              height={0.8}
              fill={`oklch(0.08 0.02 ${hue})`}
            />
          ))}
        </g>
      ))}
    </svg>
  );
}

function RoofSilhouette() {
  return (
    <svg
      width="78%"
      viewBox="0 0 400 90"
      aria-hidden
      style={{ filter: "drop-shadow(0 6px 14px oklch(0 0 0 / 0.8))" }}
    >
      <path
        d="M0,70 Q40,50 90,55 L120,30 Q200,4 280,30 L310,55 Q360,50 400,70 L400,90 L0,90 Z"
        fill="oklch(0.08 0.02 30)"
      />
      <path
        d="M120,30 Q200,4 280,30 L268,38 Q200,18 132,38 Z"
        fill="oklch(0.05 0.02 30)"
      />
    </svg>
  );
}

function FrontLeaves() {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      {/* 左上叶簇 */}
      <g fill="oklch(0.18 0.05 145)">
        <ellipse cx="8" cy="10" rx="14" ry="5" transform="rotate(-22 8 10)" />
        <ellipse cx="14" cy="18" rx="11" ry="3.5" transform="rotate(-12 14 18)" />
        <ellipse cx="3" cy="22" rx="9" ry="3" transform="rotate(-30 3 22)" />
      </g>
      {/* 右上叶簇 */}
      <g fill="oklch(0.16 0.05 150)">
        <ellipse cx="92" cy="14" rx="13" ry="5" transform="rotate(20 92 14)" />
        <ellipse cx="86" cy="22" rx="10" ry="3.5" transform="rotate(10 86 22)" />
        <ellipse cx="98" cy="28" rx="9" ry="3" transform="rotate(28 98 28)" />
      </g>
      {/* 底部杂草 */}
      <g fill="oklch(0.1 0.03 145)">
        <ellipse cx="20" cy="98" rx="22" ry="4" />
        <ellipse cx="78" cy="99" rx="26" ry="5" />
      </g>
    </svg>
  );
}
