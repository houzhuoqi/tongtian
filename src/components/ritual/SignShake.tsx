import { useState } from "react";
import { RitualButton } from "./RitualButton";
import { RitualCard, RitualOverlay } from "./RitualOverlay";
import { drawSign, type SignPoem } from "@/lib/signs";

export function SignShake({ onDrawn }: { onDrawn: (sign: SignPoem) => void }) {
  const [shaking, setShaking] = useState(false);

  function shake() {
    setShaking(true);
    setTimeout(() => {
      const sign = drawSign();
      setShaking(false);
      onDrawn(sign);
    }, 1600);
  }

  return (
    <RitualOverlay position="center" className="w-[88%] max-w-md">
      <RitualCard className="space-y-5 text-center">
        <div className="font-display text-xl tracking-[0.4em] text-gold">求籤</div>
        <div className="text-xs tracking-widest text-muted-foreground">
          雙手捧籤筒 · 誠心搖動 · 待一籤自落
        </div>

        <div className="relative mx-auto flex h-56 items-end justify-center">
          {/* 签筒 */}
          <div
            className={`relative ${shaking ? "animate-shake-cup" : ""}`}
            style={{ filter: "drop-shadow(0 12px 24px oklch(0.04 0 0 / 0.7))" }}
          >
            <svg viewBox="0 0 140 200" className="h-52 w-36">
              <defs>
                <linearGradient id="cup" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="oklch(0.22 0.08 30)" />
                  <stop offset="50%" stopColor="oklch(0.32 0.1 30)" />
                  <stop offset="100%" stopColor="oklch(0.18 0.06 30)" />
                </linearGradient>
              </defs>
              <ellipse cx="70" cy="20" rx="55" ry="10" fill="oklch(0.1 0.02 30)" />
              <path d="M 15 20 L 22 195 L 118 195 L 125 20 Z" fill="url(#cup)" />
              <ellipse cx="70" cy="195" rx="48" ry="6" fill="oklch(0.08 0.02 30)" />
              {/* 签条 */}
              {[-12, -4, 4, 12, 0, -8, 8].map((dx, i) => (
                <rect
                  key={i}
                  x={68 + dx}
                  y={-10 + i * 2}
                  width={3}
                  height={36}
                  fill="oklch(0.55 0.04 70)"
                  opacity={0.85}
                />
              ))}
              {/* 描金纹 */}
              <path
                d="M 15 60 L 125 60"
                stroke="oklch(0.6 0.1 80 / 0.5)"
                strokeWidth={0.8}
              />
              <path
                d="M 18 130 L 122 130"
                stroke="oklch(0.6 0.1 80 / 0.4)"
                strokeWidth={0.8}
              />
              <text
                x="70"
                y="120"
                textAnchor="middle"
                fontSize="22"
                fill="oklch(0.7 0.12 75 / 0.7)"
                fontFamily="serif"
                style={{ writingMode: "vertical-rl" } as React.CSSProperties}
              >
                籤
              </text>
            </svg>
          </div>
        </div>

        <RitualButton onClick={shake} disabled={shaking}>
          {shaking ? "籤筒搖動…" : "搖籤"}
        </RitualButton>
        <div className="text-[10px] tracking-widest text-muted-foreground/70">
          （Web 原型 · 點擊模擬搖動手機）
        </div>
      </RitualCard>
    </RitualOverlay>
  );
}
