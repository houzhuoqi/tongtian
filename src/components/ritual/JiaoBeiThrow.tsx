import { useState } from "react";
import { RitualButton } from "./RitualButton";
import { RitualCard, RitualOverlay } from "./RitualOverlay";
import { BEI_INFO, throwBei, type BeiResult } from "@/lib/jiaobei";

interface JiaoBeiThrowProps {
  title: string; // 顶部说明
  hint?: string; // 副说明
  onResult: (bei: BeiResult) => void;
  showCount?: { current: number; total: number }; // 签号确认时显示进度
  onCancel?: () => void;
  cancelLabel?: string;
}

export function JiaoBeiThrow({
  title,
  hint,
  onResult,
  showCount,
  onCancel,
  cancelLabel = "放棄",
}: JiaoBeiThrowProps) {
  const [phase, setPhase] = useState<"idle" | "throwing" | "result">("idle");
  const [result, setResult] = useState<BeiResult | null>(null);

  function doThrow() {
    setPhase("throwing");
    setResult(null);
    setTimeout(() => {
      const r = throwBei();
      setResult(r);
      setPhase("result");
    }, 1500);
  }

  function next() {
    if (result) {
      onResult(result);
      setPhase("idle");
      setResult(null);
    }
  }

  return (
    <RitualOverlay position="center" className="w-[88%] max-w-md">
      <RitualCard className="space-y-5">
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

        {/* 筊 */}
        <div
          className="relative mx-auto flex h-44 w-full items-center justify-center"
          style={{ perspective: "800px" }}
        >
          {phase === "idle" && (
            <div className="flex gap-6">
              <BeiVisual flipped={false} static />
              <BeiVisual flipped={true} static />
            </div>
          )}
          {phase === "throwing" && (
            <div className="flex gap-6">
              <div
                className="animate-bei-tumble"
                style={{ ["--end-x" as string]: "720deg", ["--end-y" as string]: "540deg" }}
              >
                <BeiVisual flipped={false} static />
              </div>
              <div
                className="animate-bei-tumble"
                style={{
                  ["--end-x" as string]: "900deg",
                  ["--end-y" as string]: "720deg",
                  animationDelay: "0.1s",
                }}
              >
                <BeiVisual flipped={true} static />
              </div>
            </div>
          )}
          {phase === "result" && result && <BeiResultDisplay result={result} />}
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
          {phase === "throwing" && (
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

function BeiVisual({ flipped, static: isStatic }: { flipped: boolean; static?: boolean }) {
  return (
    <svg
      viewBox="0 0 80 100"
      className="h-32 w-24 drop-shadow-[0_8px_18px_oklch(0.05_0_0/0.7)]"
    >
      <defs>
        <linearGradient id={`beiFlat-${flipped}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.45 0.13 30)" />
          <stop offset="100%" stopColor="oklch(0.28 0.09 25)" />
        </linearGradient>
        <radialGradient id={`beiCurve-${flipped}`} cx="0.5" cy="0.4" r="0.7">
          <stop offset="0%" stopColor="oklch(0.55 0.14 35)" />
          <stop offset="100%" stopColor="oklch(0.22 0.07 25)" />
        </radialGradient>
      </defs>
      {flipped ? (
        // 凸面（曲面朝上）
        <path
          d="M 10 60 Q 40 0 70 60 Q 40 90 10 60 Z"
          fill={`url(#beiCurve-${flipped})`}
          stroke="oklch(0.18 0.04 25)"
          strokeWidth={1}
        />
      ) : (
        // 平面（平面朝上）
        <path
          d="M 10 60 Q 40 0 70 60 Q 40 80 10 60 Z"
          fill={`url(#beiFlat-${flipped})`}
          stroke="oklch(0.18 0.04 25)"
          strokeWidth={1}
        />
      )}
      {!isStatic && null}
    </svg>
  );
}

function BeiResultDisplay({ result }: { result: BeiResult }) {
  const info = BEI_INFO[result];
  const showFlat = result === "xiao" || result === "sheng";
  const showCurve = result === "yin" || result === "sheng";
  return (
    <div className="flex flex-col items-center gap-3 animate-scale-in">
      <div className="flex gap-6">
        {showFlat && <BeiVisual flipped={false} static />}
        {showCurve && <BeiVisual flipped={true} static />}
        {result === "xiao" && <BeiVisual flipped={false} static />}
        {result === "yin" && <BeiVisual flipped={true} static />}
      </div>
      <div className={`font-display text-2xl tracking-[0.5em] ${info.tone}`}>
        {info.name}
      </div>
      <div className="text-xs tracking-widest text-muted-foreground">{info.desc}</div>
    </div>
  );
}
