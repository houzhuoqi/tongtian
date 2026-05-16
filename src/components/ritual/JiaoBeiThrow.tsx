import { useEffect, useMemo, useRef, useState } from "react";
import { RitualButton } from "./RitualButton";
import { RitualCard, RitualOverlay } from "./RitualOverlay";
import { BEI_INFO, throwBei, type BeiResult } from "@/lib/jiaobei";
import view0 from "@/assets/bei-real/view-0.png"; // 0°   flat-back top-down
import view1 from "@/assets/bei-real/view-1.png"; // 135° red dome 3/4 (≈ red up)
import view2 from "@/assets/bei-real/view-2.png"; // 90°  edge view A
import view3 from "@/assets/bei-real/view-3.png"; // 270° edge view B (mirror)
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

// 单只筊最终落到的"面"：true = 凸面朝上，false = 平面朝上
function facesForResult(r: BeiResult): [boolean, boolean] {
  if (r === "sheng") return [false, true];
  if (r === "xiao") return [false, false];
  return [true, true];
}

// 围绕长轴翻滚：flat → edgeA → red → edgeB → flat（一周 360°）
const ALL_FRAMES = [view0, view1, view2, view3];
const FLIP_FORWARD = [0, 2, 1, 3] as const;
const FLIP_REVERSE = [0, 3, 1, 2] as const;
const FLAT_REST = 0;
const RED_REST = 1;

// 预解码所有帧，避免首帧切换时的解码卡顿
if (typeof window !== "undefined") {
  ALL_FRAMES.forEach((src) => {
    const img = new Image();
    img.src = src;
  });
}

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
  const [showDust, setShowDust] = useState(false);
  const [tossKey, setTossKey] = useState(0);

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
    setTossKey((k) => k + 1);

    const LAND_MS = 1150;
    const TOTAL_MS = 1600;

    const a = throwAudioRef.current;
    if (a) {
      window.setTimeout(() => {
        try {
          a.currentTime = 0;
          a.volume = 0.7;
          a.play().catch(() => {});
        } catch {}
      }, LAND_MS - 60);
    }

    setTimeout(() => {
      setShake(true);
      setShowDust(true);
      setPhase("landed");
    }, LAND_MS);

    setTimeout(() => setShake(false), LAND_MS + 550);
    setTimeout(() => setShowDust(false), LAND_MS + 1100);
    setTimeout(() => setPhase("result"), TOTAL_MS + 250);
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
          <div className="font-display text-xl tracking-[0.4em] text-gold">
            {title}
          </div>
          {hint && (
            <div className="mt-2 text-xs tracking-widest text-muted-foreground">
              {hint}
            </div>
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
          className="relative mx-auto h-72 w-full overflow-hidden"
          style={{ perspective: "900px" }}
        >
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-20"
            style={{
              background:
                "radial-gradient(ellipse at 50% 100%, oklch(0.52 0.16 30 / 0.22) 0%, transparent 70%)",
            }}
          />

          {phase === "idle" && (
            <div className="absolute inset-0 flex items-end justify-center gap-8 pb-3">
              <BeiStill src={ALL_FRAMES[FLAT_REST]} rot={-6} />
              <BeiStill src={ALL_FRAMES[RED_REST]} rot={5} />
            </div>
          )}

          {phase !== "idle" && result && (
            <>
              <BeiToss
                key={`L-${tossKey}`}
                seed={tossKey * 13 + 1}
                landFace={facesForResult(result)[0]}
                offsetX={-44}
                landX={-46}
              />
              <BeiToss
                key={`R-${tossKey}`}
                seed={tossKey * 13 + 7}
                landFace={facesForResult(result)[1]}
                offsetX={44}
                landX={46}
                delay={80}
              />

              {showDust && (
                <>
                  <DustPuff originX="calc(50% - 46px)" seed={tossKey} />
                  <DustPuff originX="calc(50% + 46px)" seed={tossKey + 99} />
                  <ImpactRing originX="calc(50% - 46px)" />
                  <ImpactRing originX="calc(50% + 46px)" delay={80} />
                </>
              )}
            </>
          )}

          {phase === "result" && result && (
            <div className="pointer-events-none absolute inset-x-0 bottom-1 text-center animate-fade-in">
              <div
                className={`font-display text-xl tracking-[0.5em] ${BEI_INFO[result].tone}`}
              >
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
            <div className="text-xs tracking-widest text-muted-foreground">
              筊落塵中…
            </div>
          )}
          {phase === "result" && result && (
            <RitualButton onClick={next}>
              {result === "sheng" ? "領旨" : "再擲"}
            </RitualButton>
          )}
        </div>
      </RitualCard>
    </RitualOverlay>
  );
}

/* —— 静态预览 —— */
function BeiStill({ src, rot }: { src: string; rot: number }) {
  return (
    <img
      src={src}
      alt=""
      className="h-24 w-auto select-none"
      draggable={false}
      style={{
        transform: `rotate(${rot}deg)`,
        filter:
          "drop-shadow(0 14px 18px oklch(0.04 0 0 / 0.55)) drop-shadow(0 2px 4px oklch(0.05 0 0 / 0.45))",
      }}
    />
  );
}

/* —— 抛掷中的一只筊：sprite 帧序列 + 抛物线轨迹 —— */
function BeiToss({
  seed,
  landFace,
  offsetX,
  landX,
  delay = 0,
}: {
  seed: number;
  landFace: boolean; // true=凸面朝上 / false=平面朝上
  offsetX: number;
  landX: number;
  delay?: number;
}) {
  const rnd = useMemo(() => mulberry32(seed), [seed]);

  // 该次抛掷使用的帧池：随机选 alt/正
  const framePool = useMemo(() => (rnd() > 0.5 ? FLIP_FORWARD : FLIP_REVERSE), [rnd]);
  const finalFrame = landFace ? RED_REST : FLAT_REST;

  // 生成 sprite 时间表：在 0~LAND_MS 之间切换帧，越接近落地间隔越大（减速）
  const LAND_MS = 1150;
  const schedule = useMemo(() => {
    const arr: { t: number; idx: number }[] = [];
    let t = 0;
    let i = Math.floor(rnd() * framePool.length);
    let dir = rnd() > 0.5 ? 1 : -1;
    while (t < LAND_MS - 90) {
      const progress = t / LAND_MS;
      const interval = 55 + progress * progress * 135;
      const poolIdx = ((i % framePool.length) + framePool.length) % framePool.length;
      arr.push({ t, idx: framePool[poolIdx] });
      i += dir;
      if (rnd() < 0.06) dir = -dir;
      t += interval;
    }
    arr.push({ t: LAND_MS, idx: finalFrame });
    return arr;
  }, [rnd, framePool, finalFrame]);

  const [activeIdx, setActiveIdx] = useState<number>(schedule[0].idx);

  useEffect(() => {
    let rafId = 0;
    const start = performance.now() + delay;
    let cursor = 0;
    const tick = (now: number) => {
      const elapsed = now - start;
      while (cursor < schedule.length && schedule[cursor].t <= elapsed) {
        setActiveIdx(schedule[cursor].idx);
        cursor++;
      }
      if (cursor < schedule.length) {
        rafId = requestAnimationFrame(tick);
      }
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [schedule, delay]);

  // 每只筊小幅随机平面旋转（非翻面，仅落地姿态）
  const endRotZ = Math.floor(rnd() * 30) - 15;
  // 抛掷过程中的平面自旋角度（飞行中的方向变化）
  const spinFrom = Math.floor(rnd() * 40) - 60;
  const spinTo = Math.floor(rnd() * 40) + 20;

  return (
    <div
      className="absolute bottom-3 left-1/2"
      style={{
        transform: "translateX(-50%)",
        width: 96,
        height: 96,
      }}
    >
      <div
        className="relative h-24 w-24"
        style={{
          animation: `bei-toss 1.6s cubic-bezier(0.33,0,0.4,1) ${delay}ms forwards`,
          ["--tx0" as string]: `${offsetX}px`,
          ["--tx-land" as string]: `${landX}px`,
          ["--rot-z" as string]: `${endRotZ}deg`,
          ["--spin-from" as string]: `${spinFrom}deg`,
          ["--spin-to" as string]: `${spinTo}deg`,
          willChange: "transform",
        }}
      >
        <span
          className="absolute left-1/2 top-full h-3 w-20 rounded-[50%] -translate-x-1/2"
          style={{
            background: "oklch(0.18 0.02 40 / 0.55)",
            animation: `bei-shadow 1.6s cubic-bezier(0.33,0,0.4,1) ${delay}ms forwards`,
            transformOrigin: "center center",
          }}
        />
        {/* 所有帧叠加，靠 opacity 切换，避免每次解码 PNG */}
        {ALL_FRAMES.map((src, idx) => (
          <img
            key={idx}
            src={src}
            alt=""
            draggable={false}
            className="absolute left-1/2 top-1/2 h-24 w-auto -translate-x-1/2 -translate-y-1/2 select-none"
            style={{
              opacity: idx === activeIdx ? 1 : 0,
              filter:
                "drop-shadow(0 6px 10px oklch(0.05 0 0 / 0.55)) drop-shadow(0 1px 2px oklch(0.05 0 0 / 0.4))",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function DustPuff({ originX, seed }: { originX: string; seed: number }) {
  const particles = useMemo(() => {
    const rnd = mulberry32(seed);
    return Array.from({ length: 14 }).map((_, i) => {
      const angle = (Math.PI * (0.15 + rnd() * 0.7)) * (rnd() > 0.5 ? 1 : -1);
      const dist = 24 + rnd() * 38;
      return {
        i,
        dx: Math.cos(angle) * dist,
        dy: -Math.abs(Math.sin(angle)) * (dist * 0.7) - 6,
        size: 2 + rnd() * 4,
        delay: rnd() * 90,
        op: 0.35 + rnd() * 0.45,
      };
    });
  }, [seed]);

  return (
    <div
      className="pointer-events-none absolute bottom-3"
      style={{ left: originX, transform: "translateX(-50%)" }}
    >
      {particles.map((p) => (
        <span
          key={p.i}
          className="absolute block rounded-full"
          style={{
            width: p.size,
            height: p.size,
            background:
              "radial-gradient(circle, oklch(0.72 0.02 220 / 0.85) 0%, oklch(0.45 0.02 230 / 0) 70%)",
            animation: `dust-puff 1.1s cubic-bezier(0.16,0.84,0.44,1) ${p.delay}ms forwards`,
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
    <span
      className="pointer-events-none absolute"
      style={{
        left: originX,
        bottom: "12px",
        width: 80,
        height: 18,
        borderRadius: "50%",
        border: "1px solid oklch(0.55 0.16 30 / 0.55)",
        animation: `impact-ring 0.7s cubic-bezier(0.16,0.84,0.44,1) ${delay}ms forwards`,
        transform: "translate(-50%, -50%)",
      }}
    />
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
