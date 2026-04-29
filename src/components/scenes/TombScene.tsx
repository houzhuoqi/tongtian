import { IncenseParticles } from "@/components/ritual/IncenseParticles";

// 通天大圣墓前场景背景层
export function TombScene({ children }: { children?: React.ReactNode }) {
  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* 天光背景 */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 30%, oklch(0.22 0.05 130 / 0.45), oklch(0.08 0.012 250) 70%)",
        }}
      />

      {/* 远处竹林模糊 */}
      <div className="absolute inset-x-0 top-[10%] h-[55%] opacity-50 blur-[2px]">
        <svg viewBox="0 0 400 300" preserveAspectRatio="none" className="h-full w-full">
          {Array.from({ length: 18 }).map((_, i) => {
            const x = (i / 18) * 400 + Math.sin(i * 1.7) * 6;
            const h = 220 + Math.sin(i * 2.3) * 50;
            return (
              <line
                key={i}
                x1={x}
                y1={300}
                x2={x + Math.sin(i) * 6}
                y2={300 - h}
                stroke="oklch(0.2 0.05 145)"
                strokeWidth={2}
              />
            );
          })}
        </svg>
      </div>

      {/* 远处庙宇暗影 */}
      <div className="absolute inset-x-0 top-[18%] flex justify-center opacity-30">
        <svg viewBox="0 0 200 80" className="h-20 w-3/4 blur-[1px]">
          <path
            d="M 30 30 Q 100 5 170 30 L 165 38 Q 100 18 35 38 Z"
            fill="oklch(0.08 0.01 30)"
          />
          <rect x="50" y="38" width="100" height="40" fill="oklch(0.06 0.01 30)" />
        </svg>
      </div>

      {/* 主墓碑 — 居中偏上 */}
      <div className="absolute left-1/2 top-[24%] -translate-x-1/2">
        <Tombstone />
      </div>

      {/* 两侧小碑 */}
      <div className="absolute left-[8%] top-[40%] opacity-70">
        <SmallStele rotation={-3} />
      </div>
      <div className="absolute right-[8%] top-[40%] opacity-70">
        <SmallStele rotation={4} />
      </div>

      {/* 香灰台 + 香 */}
      <div className="absolute inset-x-0 bottom-[8%] flex justify-center">
        <Altar />
      </div>

      {/* 落叶 */}
      <FallenLeaves />

      {/* 香烟粒子 */}
      <IncenseParticles density={20} />

      {/* 暗角 + 香火暖光 */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% 78%, oklch(0.6 0.15 40 / 0.18) 0%, transparent 50%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 130% 100% at 50% 50%, transparent 35%, oklch(0.04 0 0 / 0.85) 100%)",
        }}
      />

      {children}
    </div>
  );
}

function Tombstone() {
  return (
    <div
      className="relative"
      style={{ filter: "drop-shadow(0 24px 40px oklch(0.02 0 0 / 0.85))" }}
    >
      <svg viewBox="0 0 200 320" className="h-72 w-44">
        <defs>
          <linearGradient id="stoneFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.42 0.01 230)" />
            <stop offset="50%" stopColor="oklch(0.32 0.012 230)" />
            <stop offset="100%" stopColor="oklch(0.22 0.01 230)" />
          </linearGradient>
          <pattern id="stoneTex" patternUnits="userSpaceOnUse" width="40" height="40">
            <rect width="40" height="40" fill="transparent" />
            <circle cx="10" cy="14" r="0.6" fill="oklch(0.18 0 0 / 0.5)" />
            <circle cx="28" cy="22" r="0.4" fill="oklch(0.18 0 0 / 0.4)" />
            <circle cx="20" cy="34" r="0.5" fill="oklch(0.18 0 0 / 0.5)" />
            <path
              d="M 5 8 L 12 10"
              stroke="oklch(0.2 0 0 / 0.3)"
              strokeWidth={0.4}
            />
          </pattern>
        </defs>

        {/* 碑顶弧 */}
        <path
          d="M 30 50 Q 100 0 170 50 L 170 290 L 30 290 Z"
          fill="url(#stoneFill)"
          stroke="oklch(0.15 0 0)"
          strokeWidth={1.5}
        />
        <path
          d="M 30 50 Q 100 0 170 50 L 170 290 L 30 290 Z"
          fill="url(#stoneTex)"
          opacity={0.6}
        />
        {/* 苔痕 */}
        <ellipse cx="40" cy="280" rx="22" ry="10" fill="oklch(0.35 0.06 140 / 0.7)" />
        <ellipse cx="160" cy="270" rx="14" ry="6" fill="oklch(0.35 0.06 140 / 0.6)" />
        <path
          d="M 30 80 Q 38 88 32 100"
          stroke="oklch(0.4 0.07 140 / 0.6)"
          strokeWidth={3}
          fill="none"
        />
        {/* 字迹凹陷 */}
        <g
          fontFamily='"Noto Serif TC", serif'
          fontWeight="900"
          textAnchor="middle"
          fill="oklch(0.08 0 0)"
          style={{ filter: "drop-shadow(1px 1px 0 oklch(0.55 0.01 230 / 0.6))" }}
        >
          <text x="100" y="115" fontSize="36" letterSpacing="2">
            通
          </text>
          <text x="100" y="160" fontSize="36" letterSpacing="2">
            天
          </text>
          <text x="100" y="205" fontSize="36" letterSpacing="2">
            大
          </text>
          <text x="100" y="250" fontSize="36" letterSpacing="2">
            聖
          </text>
        </g>
        {/* 字迹斑驳遮罩 */}
        <rect
          x="30"
          y="50"
          width="140"
          height="240"
          fill="url(#stoneTex)"
          opacity={0.35}
          style={{ mixBlendMode: "overlay" }}
        />
      </svg>
    </div>
  );
}

function SmallStele({ rotation }: { rotation: number }) {
  return (
    <svg
      viewBox="0 0 80 140"
      className="h-32 w-20"
      style={{ transform: `rotate(${rotation}deg)`, filter: "drop-shadow(0 12px 20px oklch(0 0 0 / 0.7))" }}
    >
      <path
        d="M 18 30 Q 40 10 62 30 L 62 130 L 18 130 Z"
        fill="oklch(0.28 0.012 230)"
        stroke="oklch(0.12 0 0)"
        strokeWidth={1}
      />
      <ellipse cx="40" cy="125" rx="20" ry="6" fill="oklch(0.32 0.06 140 / 0.6)" />
    </svg>
  );
}

function Altar() {
  return (
    <div
      className="relative"
      style={{ filter: "drop-shadow(0 -10px 30px oklch(0.6 0.16 40 / 0.4))" }}
    >
      <svg viewBox="0 0 320 160" className="h-44 w-[26rem] max-w-full">
        <defs>
          <linearGradient id="altarStone" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.32 0.015 60)" />
            <stop offset="100%" stopColor="oklch(0.18 0.012 60)" />
          </linearGradient>
        </defs>
        {/* 石供台 */}
        <path d="M 30 70 L 290 70 L 310 100 L 10 100 Z" fill="url(#altarStone)" />
        <rect x="10" y="100" width="300" height="50" fill="oklch(0.14 0.008 60)" />
        {/* 香灰 */}
        <ellipse cx="160" cy="70" rx="100" ry="10" fill="oklch(0.55 0.02 60)" opacity={0.7} />
        {/* 香 */}
        {[
          { x: 110, h: 60, lit: true },
          { x: 130, h: 75, lit: true },
          { x: 150, h: 50, lit: false },
          { x: 165, h: 80, lit: true },
          { x: 185, h: 65, lit: true },
          { x: 210, h: 45, lit: false },
        ].map((s, i) => (
          <g key={i}>
            <line
              x1={s.x}
              y1={70}
              x2={s.x}
              y2={70 - s.h}
              stroke="oklch(0.42 0.12 30)"
              strokeWidth={1.2}
            />
            {s.lit && (
              <>
                <circle
                  cx={s.x}
                  cy={70 - s.h}
                  r={2.5}
                  fill="oklch(0.78 0.2 50)"
                  className="animate-flicker"
                />
                <circle
                  cx={s.x}
                  cy={70 - s.h}
                  r={5}
                  fill="oklch(0.78 0.2 50 / 0.4)"
                  className="animate-flicker"
                />
              </>
            )}
          </g>
        ))}
        {/* 蜡痕 */}
        <path
          d="M 50 100 Q 55 115 50 130 Q 48 135 52 140"
          stroke="oklch(0.85 0.03 70)"
          strokeWidth={3}
          fill="none"
          opacity={0.6}
        />
        <path
          d="M 270 100 Q 275 118 271 138"
          stroke="oklch(0.6 0.12 35)"
          strokeWidth={2.5}
          fill="none"
          opacity={0.7}
        />
      </svg>
    </div>
  );
}

function FallenLeaves() {
  const leaves = [
    { x: "8%", y: "82%", r: 12, c: "oklch(0.4 0.1 50)" },
    { x: "18%", y: "90%", r: -20, c: "oklch(0.45 0.12 45)" },
    { x: "78%", y: "85%", r: 30, c: "oklch(0.38 0.09 55)" },
    { x: "88%", y: "92%", r: -8, c: "oklch(0.42 0.1 50)" },
    { x: "32%", y: "94%", r: 60, c: "oklch(0.35 0.08 60)" },
    { x: "62%", y: "93%", r: -45, c: "oklch(0.4 0.1 48)" },
  ];
  return (
    <div className="pointer-events-none absolute inset-0">
      {leaves.map((l, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className="absolute h-4 w-4"
          style={{
            left: l.x,
            top: l.y,
            transform: `rotate(${l.r}deg)`,
            filter: "drop-shadow(0 2px 3px oklch(0 0 0 / 0.6))",
          }}
        >
          <path
            d="M 12 2 Q 4 12 12 22 Q 20 12 12 2 Z"
            fill={l.c}
            opacity={0.9}
          />
          <line x1="12" y1="2" x2="12" y2="22" stroke="oklch(0.2 0.04 40)" strokeWidth={0.5} />
        </svg>
      ))}
    </div>
  );
}
