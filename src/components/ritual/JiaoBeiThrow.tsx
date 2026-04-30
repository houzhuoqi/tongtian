import { useMemo, useRef, useState } from "react";
import { RitualButton } from "./RitualButton";
import { RitualCard, RitualOverlay } from "./RitualOverlay";
import { BEI_INFO, throwBei, type BeiResult } from "@/lib/jiaobei";
import beiFlatImg from "@/assets/bei-flat.png";
import beiCurveImg from "@/assets/bei-curve.png";
import beiEdgeImg from "@/assets/bei-edge.png";

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
  if (r === "sheng") return [false, true]; // 一平一凸
  if (r === "xiao") return [false, false]; // 双平
  return [true, true]; // 双凸
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
  const stageRef = useRef<HTMLDivElement>(null);

  // 每次抛掷生成的随机种子（决定旋转角度/落点偏移/翻面次数）
  const [tossKey, setTossKey] = useState(0);

  function doThrow() {
    if (phase !== "idle") return;
    const r = throwBei();
    setResult(r);
    setPhase("throwing");
    setTossKey((k) => k + 1);

    // 落地时刻 ≈ 抛掷动画 72%（约 1150ms）
    const LAND_MS = 1150;
    const TOTAL_MS = 1600;

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

        {/* 舞台 */}
        <div
          ref={stageRef}
          className="relative mx-auto h-52 w-full overflow-hidden"
          style={{ perspective: "900px" }}
        >
          {/* 地面渐隐 */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-20"
            style={{
              background:
                "radial-gradient(ellipse at 50% 100%, oklch(0.62 0.16 40 / 0.18) 0%, transparent 70%)",
            }}
          />

          {/* idle：静态预览 */}
          {phase === "idle" && (
            <div className="absolute inset-0 flex items-end justify-center gap-6 pb-2">
              <BeiStill curved={false} />
              <BeiStill curved={true} />
            </div>
          )}

          {/* throwing / landed / result：两只筊各自完成抛掷 */}
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

              {/* 尘粒 + 冲击 */}
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

          {/* result 文案 */}
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

/* —— 静态筊（idle 预览） —— */
function BeiStill({ curved }: { curved: boolean }) {
  return (
    <img
      src={curved ? beiCurveImg : beiFlatImg}
      alt=""
      width={96}
      height={96}
      className="h-24 w-24 select-none drop-shadow-[0_10px_18px_oklch(0.05_0_0/0.7)]"
      draggable={false}
    />
  );
}

/* —— 一只飞行的筊：用两层卡片正反面（3D flip） —— */
function BeiToss({
  seed,
  landFace,
  offsetX,
  landX,
  delay = 0,
}: {
  seed: number;
  landFace: boolean; // true=凸面朝上 / false=平面朝上
  offsetX: number; // 起飞 X 偏移
  landX: number; // 落地 X 偏移
  delay?: number;
}) {
  // 伪随机
  const rnd = useMemo(() => mulberry32(seed), [seed]);
  const spinX = 540 + Math.floor(rnd() * 540); // 540~1080
  const spinY = 360 + Math.floor(rnd() * 540);
  const spinZ = 180 + Math.floor(rnd() * 360);

  // 落地时让旋转停在"正面/反面朝上"
  // 平面朝上：rotateX 0 / 凸面朝上：rotateX 180
  const endX = landFace ? 180 : 0;
  const endY = 0;
  const endZ = Math.floor(rnd() * 30) - 15; // 落地时小角度斜放

  const animDelay = `${delay}ms`;

  return (
    <div
      className="absolute bottom-3 left-1/2"
      style={{
        // 先把锚点平移到中线（-50% 居中），再叠加抛掷动画
        // 把锚点位移和动画分两层，避免动画 transform 覆盖居中
        transform: "translateX(-50%)",
        width: 96,
        height: 96,
      }}
    >
      <div
        className="relative h-24 w-24"
        style={{
          animation: `bei-toss 1.6s cubic-bezier(0.33,0,0.4,1) ${animDelay} forwards`,
          ["--tx0" as string]: `${offsetX}px`,
          ["--tx-land" as string]: `${landX}px`,
          transform: `translate3d(${offsetX}px, 0, 0)`,
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        {/* 阴影（独立元素，跟随地面） */}
        <span
          className="absolute left-1/2 top-full h-3 w-20 rounded-[50%] bg-black/70"
          style={{
            animation: `bei-shadow 1.6s cubic-bezier(0.33,0,0.4,1) ${animDelay} forwards`,
            transformOrigin: "center center",
          }}
        />
        {/* 旋转载体 */}
        <div
          className="relative h-24 w-24"
          style={{
            animation: `bei-spin 1.6s cubic-bezier(0.33,0,0.4,1) ${animDelay} forwards`,
            ["--spin-x" as string]: `${spinX}deg`,
            ["--spin-y" as string]: `${spinY}deg`,
            ["--spin-z" as string]: `${spinZ}deg`,
            ["--end-x" as string]: `${endX}deg`,
            ["--end-y" as string]: `${endY}deg`,
            ["--end-z" as string]: `${endZ}deg`,
            transformStyle: "preserve-3d",
            willChange: "transform",
          }}
        >
          {/* 正面（平面朝上 = 看到 flat 图） */}
          <img
            src={beiFlatImg}
            alt=""
            width={96}
            height={96}
            draggable={false}
            className="absolute inset-0 h-24 w-24 select-none drop-shadow-[0_4px_10px_oklch(0.05_0_0/0.6)]"
            style={{ backfaceVisibility: "hidden" }}
          />
          {/* 反面（凸面朝上 = 看到 curve 图） */}
          <img
            src={beiCurveImg}
            alt=""
            width={96}
            height={96}
            draggable={false}
            className="absolute inset-0 h-24 w-24 select-none drop-shadow-[0_4px_10px_oklch(0.05_0_0/0.6)]"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateX(180deg)",
            }}
          />
          {/* 侧面薄片：rotateX(90°) — 翻转过半圈时短暂出现，强化"立体厚度" */}
          <img
            src={beiEdgeImg}
            alt=""
            width={96}
            height={96}
            draggable={false}
            className="absolute inset-0 h-24 w-24 select-none"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateX(90deg) translateZ(0)",
              opacity: 0.95,
            }}
          />
          <img
            src={beiEdgeImg}
            alt=""
            width={96}
            height={96}
            draggable={false}
            className="absolute inset-0 h-24 w-24 select-none"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateX(-90deg) scaleY(-1) translateZ(0)",
              opacity: 0.95,
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* —— 尘粒爆发 —— */
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
              "radial-gradient(circle, oklch(0.78 0.04 70 / 0.9) 0%, oklch(0.55 0.04 60 / 0) 70%)",
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

/* —— 落地冲击波纹 —— */
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
        border: "1px solid oklch(0.72 0.12 82 / 0.55)",
        animation: `impact-ring 0.7s cubic-bezier(0.16,0.84,0.44,1) ${delay}ms forwards`,
        transform: "translate(-50%, -50%)",
      }}
    />
  );
}

/* —— 伪随机 —— */
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
