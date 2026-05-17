import { useEffect, useMemo, useRef, useState } from "react";
import { RitualButton } from "./RitualButton";
import { RitualCard, RitualOverlay } from "./RitualOverlay";
import { BEI_INFO, throwBei, type BeiResult } from "@/lib/jiaobei";
import view0 from "@/assets/bei-real/view-0.png"; // 0°   平面朝上 (flat-back)
import view1 from "@/assets/bei-real/view-1.png"; // 135° 红凸朝上 (red dome)
import view2 from "@/assets/bei-real/view-2.png"; // 90°  侧立 A
import view3 from "@/assets/bei-real/view-3.png"; // 270° 侧立 B
import throwSfx from "@/assets/audio/jiaobei-throw.mp3";

interface JiaoBeiThrowProps {
  title: string;
  hint?: string;
  onResult: (bei: BeiResult) => void;
  showCount?: { current: number; total: number };
  onCancel?: () => void;
  cancelLabel?: string;
}

type Phase = "idle" | "throwing" | "landed" | "result";

const ALL_FRAMES = [view0, view1, view2, view3];
const FLAT_REST = 0; // 平面朝上
const RED_REST = 1; // 红凸朝上
const EDGE_A = 2;
const EDGE_B = 3;

// 单只筊最终落到的"面"：true = 凸面朝上，false = 平面朝上
function facesForResult(r: BeiResult): [boolean, boolean] {
  if (r === "sheng") return [false, true];
  if (r === "xiao") return [false, false];
  return [true, true];
}

if (typeof window !== "undefined") {
  ALL_FRAMES.forEach((src) => {
    const img = new Image();
    img.src = src;
  });
}

// 整套动画的关键时间
const FLIGHT_MS = 950;   // 起手 → 落地
const SLIDE_MS = 260;    // 落地后滑行 + 小翻
const SETTLE_MS = 220;   // 微微晃动 → 停
const TOTAL_MS = FLIGHT_MS + SLIDE_MS + SETTLE_MS;

export function JiaoBeiThrow({
  title,
  hint,
  onResult,
  showCount,
  onCancel,
  cancelLabel = "放棄",
}: JiaoBeiThrowProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<BeiResult | null>(null);
  const [shake, setShake] = useState(false);
  const [showDust, setShowDust] = useState<null | { lx: number; rx: number; lDelay: number; rDelay: number }>(null);
  const [tossKey, setTossKey] = useState(0);
  const [landPoints, setLandPoints] = useState<{ lx: number; rx: number }>({ lx: -46, rx: 46 });

  const throwAudioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    const a = new Audio(throwSfx);
    a.preload = "auto";
    a.volume = 0.7;
    throwAudioRef.current = a;
    return () => {
      a.pause();
      throwAudioRef.current = null;
    };
  }, []);

  function doThrow() {
    if (phase !== "idle") return;
    const r = throwBei();
    setResult(r);
    setPhase("throwing");
    const key = tossKey + 1;
    setTossKey(key);

    // 随机落点（非镜像）
    const seedL = key * 13 + 1;
    const seedR = key * 13 + 7;
    const rndL = mulberry32(seedL);
    const rndR = mulberry32(seedR);
    const lx = -30 - rndL() * 45;          // -30 ~ -75
    const rx = 25 + rndR() * 50;           // 25 ~ 75
    setLandPoints({ lx, rx });

    // 错峰落地的两次冲击
    const lLand = FLIGHT_MS;
    const rLand = FLIGHT_MS + 70 + rndR() * 70;

    const a = throwAudioRef.current;
    if (a) {
      window.setTimeout(() => {
        try {
          a.currentTime = 0;
          a.volume = 0.7;
          a.play().catch(() => {});
        } catch {}
      }, lLand - 50);
    }

    // 灰尘 / 冲击在各自落地瞬间触发
    window.setTimeout(() => {
      setShowDust({ lx, rx, lDelay: 0, rDelay: rLand - lLand });
      setPhase("landed");
    }, lLand);

    // 屏幕震动只在两次落地之后触发一次，幅度小
    window.setTimeout(() => setShake(true), rLand + 30);
    window.setTimeout(() => setShake(false), rLand + 580);
    window.setTimeout(() => setShowDust(null), rLand + 900);
    window.setTimeout(() => setPhase("result"), TOTAL_MS + 200);
  }

  function next() {
    if (!result) return;
    onResult(result);
    setPhase("idle");
    setResult(null);
  }

  return (
    <RitualOverlay position="center" className="w-[88%] max-w-md">
      <RitualCard className={`space-y-5 ${shake ? "animate-screen-shake" : ""}`}>
        <div className="text-center">
          <div className="font-display text-xl tracking-[0.4em] text-gold">{title}</div>
          {hint && (
            <div className="mt-2 text-xs tracking-widest text-muted-foreground">{hint}</div>
          )}
          {showCount && (
            <div className="mt-3 flex items-center justify-center gap-2">
              {Array.from({ length: showCount.total }).map((_, i) => (
                <span
                  key={i}
                  className={`h-2.5 w-2.5 rounded-full border ${
                    i < showCount.current
                      ? "border-gold bg-gold shadow-[0_0_8px_oklch(0.72_0.12_82/0.6)]"
                      : "border-foreground/30 bg-transparent"
                  }`}
                />
              ))}
              <span className="ml-2 text-xs text-muted-foreground">
                聖筊 {showCount.current} / {showCount.total}
              </span>
            </div>
          )}
        </div>

        <div
          className="relative mx-auto h-72 w-full overflow-hidden rounded-md"
          style={{ perspective: "900px" }}
        >
          {/* 供桌台面：透视面 + 木色渐变 */}
          <AltarSurface />

          {phase === "idle" && (
            <div className="absolute inset-x-0 bottom-6 flex items-end justify-center">
              {/* 双手捧筊的姿态：略微重叠 */}
              <div className="relative h-24 w-40">
                <img
                  src={ALL_FRAMES[FLAT_REST]}
                  alt=""
                  draggable={false}
                  className="absolute left-2 bottom-0 h-20 w-auto select-none animate-bei-breath"
                  style={{
                    transform: "rotate(-8deg)",
                    filter:
                      "drop-shadow(0 10px 14px oklch(0.04 0 0 / 0.55)) drop-shadow(0 2px 3px oklch(0.05 0 0 / 0.4))",
                  }}
                />
                <img
                  src={ALL_FRAMES[RED_REST]}
                  alt=""
                  draggable={false}
                  className="absolute right-2 bottom-1 h-20 w-auto select-none animate-bei-breath"
                  style={{
                    transform: "rotate(7deg)",
                    animationDelay: "0.6s",
                    filter:
                      "drop-shadow(0 10px 14px oklch(0.04 0 0 / 0.55)) drop-shadow(0 2px 3px oklch(0.05 0 0 / 0.4))",
                  }}
                />
              </div>
            </div>
          )}

          {phase !== "idle" && result && (
            <>
              <BeiPhysicsToss
                key={`L-${tossKey}`}
                seed={tossKey * 13 + 1}
                landFace={facesForResult(result)[0]}
                startX={-10}
                landX={landPoints.lx}
                landDelay={0}
              />
              <BeiPhysicsToss
                key={`R-${tossKey}`}
                seed={tossKey * 13 + 7}
                landFace={facesForResult(result)[1]}
                startX={10}
                landX={landPoints.rx}
                landDelay={90}
              />

              {showDust && (
                <>
                  <DustPuff originX={`calc(50% + ${showDust.lx}px)`} seed={tossKey} delay={showDust.lDelay} />
                  <DustPuff originX={`calc(50% + ${showDust.rx}px)`} seed={tossKey + 99} delay={showDust.rDelay} />
                  <ImpactRing originX={`calc(50% + ${showDust.lx}px)`} delay={showDust.lDelay} />
                  <ImpactRing originX={`calc(50% + ${showDust.rx}px)`} delay={showDust.rDelay} />
                </>
              )}
            </>
          )}

          {phase === "result" && result && (
            <div className="pointer-events-none absolute inset-x-0 bottom-1 text-center animate-fade-in">
              <div className={`font-display text-xl tracking-[0.5em] ${BEI_INFO[result].tone}`}>
                {BEI_INFO[result].name}
              </div>
              <div className="mt-1 text-[11px] tracking-widest text-muted-foreground">
                {BEI_INFO[result].desc}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center gap-3">
          {phase === "idle" && (
            <>
              {onCancel && (
                <RitualButton variant="ghost" onClick={onCancel}>
                  {cancelLabel}
                </RitualButton>
              )}
              <RitualButton onClick={doThrow}>擲筊</RitualButton>
            </>
          )}
          {(phase === "throwing" || phase === "landed") && (
            <div className="text-xs tracking-widest text-muted-foreground">筊落塵中…</div>
          )}
          {phase === "result" && result && (
            <RitualButton onClick={next}>{result === "sheng" ? "領旨" : "再擲"}</RitualButton>
          )}
        </div>
      </RitualCard>
    </RitualOverlay>
  );
}

/* —— 供桌台面 —— */
function AltarSurface() {
  return (
    <>
      {/* 远端淡入背景，营造深度 */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2"
        style={{
          background:
            "linear-gradient(to bottom, oklch(0.18 0.02 40 / 0) 0%, oklch(0.18 0.02 40 / 0.25) 100%)",
        }}
      />
      {/* 木质台面：透视倾斜 */}
      <div
        className="pointer-events-none absolute left-1/2 bottom-0 h-40 w-[140%] -translate-x-1/2"
        style={{
          transform: "translateX(-50%) perspective(420px) rotateX(58deg)",
          transformOrigin: "center bottom",
          background:
            "radial-gradient(ellipse at 50% 30%, oklch(0.34 0.05 55) 0%, oklch(0.22 0.04 50) 55%, oklch(0.14 0.03 45) 100%)",
          boxShadow: "inset 0 20px 40px oklch(0.05 0 0 / 0.6)",
        }}
      />
      {/* 台面边缘高光 */}
      <div
        className="pointer-events-none absolute inset-x-0"
        style={{
          bottom: "78px",
          height: "1px",
          background:
            "linear-gradient(to right, transparent 0%, oklch(0.55 0.08 60 / 0.5) 50%, transparent 100%)",
        }}
      />
    </>
  );
}

/* —— rAF 物理抛掷：抛物线 + 帧切换 + 滑行 + 微晃 —— */
function BeiPhysicsToss({
  seed,
  landFace,
  startX,
  landX,
  landDelay,
}: {
  seed: number;
  landFace: boolean;
  startX: number;
  landX: number;
  landDelay: number;
}) {
  const rnd = useMemo(() => mulberry32(seed), [seed]);
  const finalFrame = landFace ? RED_REST : FLAT_REST;

  // 飞行中的翻面序列：4~7 次翻面，保证最后一次落到 finalFrame
  const flipPlan = useMemo(() => {
    const flips = 4 + Math.floor(rnd() * 4); // 4~7
    const order = [EDGE_A, FLAT_REST, EDGE_B, RED_REST];
    const seq: number[] = [];
    let i = Math.floor(rnd() * order.length);
    let dir = rnd() > 0.5 ? 1 : -1;
    for (let k = 0; k < flips; k++) {
      seq.push(order[((i % order.length) + order.length) % order.length]);
      i += dir;
      if (rnd() < 0.15) dir = -dir;
    }
    // 倒数第二帧给一个相邻的 edge 过度，最后一帧锁定到 finalFrame
    seq[seq.length - 1] = rnd() > 0.5 ? EDGE_A : EDGE_B;
    seq.push(finalFrame);
    return seq;
  }, [rnd, finalFrame]);

  // 飞行参数
  const peakY = 110 + rnd() * 40;        // 最高点上抬像素
  const restRotZ = (rnd() * 30 - 15);    // 静止后平面随机角度
  const slideDx = (landX > 0 ? 1 : -1) * (4 + rnd() * 8);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [frame, setFrame] = useState<number>(flipPlan[0]);

  useEffect(() => {
    let rafId = 0;
    const start = performance.now() + landDelay;
    const totalDuration = FLIGHT_MS + SLIDE_MS + SETTLE_MS;

    const tick = (now: number) => {
      const t = now - start;
      const el = wrapperRef.current;
      if (!el) {
        rafId = requestAnimationFrame(tick);
        return;
      }

      let x = startX;
      let y = 0;
      let scale = 1;
      let rz = restRotZ;
      let scaleY = 1;

      if (t < 0) {
        // 准备拍：略微下蹲
        x = startX;
        y = 2;
        scale = 0.97;
      } else if (t < FLIGHT_MS) {
        // 空中：抛物线（u 从 0→1）
        const u = t / FLIGHT_MS;
        x = startX + (landX - startX) * u;
        // 抛物线：u(1-u)*4 → 峰值 1
        y = -peakY * (u * (1 - u) * 4);
        // 近大远小：抛到最高点最小
        scale = 1 - 0.18 * (u * (1 - u) * 4);

        // 翻面：在飞行段均匀分布 flipPlan（最后一帧锁在飞行末尾前 60ms）
        const lockBefore = 0.94;
        const flipU = Math.min(u / lockBefore, 1);
        const idx = Math.min(
          flipPlan.length - 1,
          Math.floor(flipU * flipPlan.length)
        );
        if (idx !== (frameRef.current ?? -1)) {
          frameRef.current = idx;
          setFrame(flipPlan[idx]);
        }
        // 旋转：起手 → 落地从一个角度滑向 restRotZ
        rz = restRotZ + (1 - u) * (rnd() > 0.5 ? 25 : -25);
        // scaleY 抖动：靠近 edge 帧时压扁
        const current = flipPlan[idx];
        if (current === EDGE_A || current === EDGE_B) scaleY = 0.7 + (u * 0.2);
      } else if (t < FLIGHT_MS + SLIDE_MS) {
        // 滑行 + 小回弹
        const u = (t - FLIGHT_MS) / SLIDE_MS;
        x = landX + slideDx * (1 - (1 - u) * (1 - u));
        // 落地小回弹两下
        y = -Math.max(0, Math.sin(u * Math.PI) * 6) - (u < 0.3 ? Math.sin(u * Math.PI / 0.3) * 4 : 0);
        scale = 1 + 0.04 * Math.sin(u * Math.PI);
        rz = restRotZ;
        if (frameRef.current !== flipPlan.length - 1) {
          frameRef.current = flipPlan.length - 1;
          setFrame(finalFrame);
        }
      } else if (t < totalDuration) {
        // 微微摇晃收敛
        const u = (t - FLIGHT_MS - SLIDE_MS) / SETTLE_MS;
        x = landX + slideDx;
        y = 0;
        rz = restRotZ + Math.sin(u * Math.PI * 3) * 1.8 * (1 - u);
      } else {
        x = landX + slideDx;
        y = 0;
        rz = restRotZ;
      }

      el.style.transform =
        `translate3d(calc(-50% + ${x}px), calc(${y}px), 0) ` +
        `scale(${scale}) scaleY(${scaleY}) rotate(${rz}deg)`;

      if (t < totalDuration) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const frameRef = useRef<number | null>(null);

  return (
    <div
      ref={wrapperRef}
      className="absolute left-1/2"
      style={{
        bottom: "62px",
        width: 96,
        height: 96,
        transformOrigin: "50% 80%",
        willChange: "transform",
      }}
    >
      {ALL_FRAMES.map((src, idx) => (
        <img
          key={idx}
          src={src}
          alt=""
          draggable={false}
          className="absolute left-1/2 top-1/2 h-24 w-auto -translate-x-1/2 -translate-y-1/2 select-none"
          style={{
            opacity: idx === frame ? 1 : 0,
            transition: "opacity 30ms linear",
            filter:
              "drop-shadow(0 6px 10px oklch(0.05 0 0 / 0.55)) drop-shadow(0 1px 2px oklch(0.05 0 0 / 0.4))",
          }}
        />
      ))}
    </div>
  );
}

function DustPuff({ originX, seed, delay = 0 }: { originX: string; seed: number; delay?: number }) {
  const particles = useMemo(() => {
    const rnd = mulberry32(seed);
    return Array.from({ length: 7 }).map((_, i) => {
      const angle = (Math.PI * (0.15 + rnd() * 0.7)) * (rnd() > 0.5 ? 1 : -1);
      const dist = 18 + rnd() * 26;
      return {
        i,
        dx: Math.cos(angle) * dist,
        dy: -Math.abs(Math.sin(angle)) * (dist * 0.55) - 4,
        size: 2 + rnd() * 3,
        delay: delay + rnd() * 80,
        op: 0.18 + rnd() * 0.2,
      };
    });
  }, [seed, delay]);

  return (
    <div
      className="pointer-events-none absolute"
      style={{ left: originX, bottom: "60px", transform: "translateX(-50%)" }}
    >
      {particles.map((p) => (
        <span
          key={p.i}
          className="absolute block rounded-full"
          style={{
            width: p.size,
            height: p.size,
            background:
              "radial-gradient(circle, oklch(0.55 0.04 55 / 0.7) 0%, oklch(0.35 0.04 50 / 0) 70%)",
            animation: `dust-puff 1s cubic-bezier(0.16,0.84,0.44,1) ${p.delay}ms forwards`,
            ["--dx" as string]: `${p.dx}px`,
            ["--dy" as string]: `${p.dy}px`,
            ["--dust-op" as string]: `${p.op}`,
            left: 0,
            top: 0,
          }}
        />
      ))}
    </div>
  );
}

function ImpactRing({ originX, delay = 0 }: { originX: string; delay?: number }) {
  return (
    <>
      <span
        className="pointer-events-none absolute"
        style={{
          left: originX,
          bottom: "60px",
          width: 50,
          height: 12,
          borderRadius: "50%",
          border: "1px solid oklch(0.5 0.08 55 / 0.5)",
          animation: `impact-ring 0.45s cubic-bezier(0.16,0.84,0.44,1) ${delay}ms forwards`,
          transform: "translate(-50%, -50%)",
        }}
      />
      <span
        className="pointer-events-none absolute"
        style={{
          left: originX,
          bottom: "60px",
          width: 70,
          height: 16,
          borderRadius: "50%",
          border: "1px solid oklch(0.45 0.06 50 / 0.3)",
          animation: `impact-ring 0.75s cubic-bezier(0.16,0.84,0.44,1) ${delay + 80}ms forwards`,
          transform: "translate(-50%, -50%)",
        }}
      />
    </>
  );
}

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
