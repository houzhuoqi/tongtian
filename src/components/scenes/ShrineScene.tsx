import { IncenseParticles } from "@/components/ritual/IncenseParticles";

// 庙中签诗柜场景
export function ShrineScene({ children }: { children?: React.ReactNode }) {
  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ background: "var(--gradient-shrine)" }}
    >
      {/* 顶部梁柱 */}
      <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black to-transparent" />
      <div className="absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-black/95 via-black/60 to-transparent" />
      <div className="absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-black/95 via-black/60 to-transparent" />

      {/* 签柜木格 */}
      <div className="absolute inset-x-8 top-[8%] bottom-[28%] opacity-90">
        <CabinetGrid />
      </div>

      {/* 案台 */}
      <div className="absolute inset-x-0 bottom-0 h-[28%]">
        <svg viewBox="0 0 400 200" preserveAspectRatio="none" className="h-full w-full">
          <defs>
            <linearGradient id="deskWood" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.22 0.05 35)" />
              <stop offset="100%" stopColor="oklch(0.1 0.02 30)" />
            </linearGradient>
          </defs>
          <path d="M 0 30 L 400 30 L 400 200 L 0 200 Z" fill="url(#deskWood)" />
          <line x1="0" y1="30" x2="400" y2="30" stroke="oklch(0.05 0 0)" strokeWidth={2} />
          <line x1="0" y1="50" x2="400" y2="50" stroke="oklch(0.4 0.08 50 / 0.3)" strokeWidth={0.5} />
        </svg>
      </div>

      {/* 案上烛火 */}
      <div className="absolute bottom-[28%] left-[14%]">
        <Candle />
      </div>
      <div className="absolute bottom-[28%] right-[14%]">
        <Candle />
      </div>

      <IncenseParticles density={10} />

      {/* 暗角 */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% 50%, transparent 25%, oklch(0.03 0 0 / 0.92) 100%)",
        }}
      />

      {children}
    </div>
  );
}

function CabinetGrid() {
  const rows = 4;
  const cols = 6;
  return (
    <svg viewBox="0 0 360 240" preserveAspectRatio="none" className="h-full w-full">
      <defs>
        <linearGradient id="cabWood" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.18 0.04 30)" />
          <stop offset="100%" stopColor="oklch(0.1 0.02 30)" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="360" height="240" fill="url(#cabWood)" />
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((_, c) => {
          const x = (c / cols) * 360 + 4;
          const y = (r / rows) * 240 + 4;
          const w = 360 / cols - 8;
          const h = 240 / rows - 8;
          return (
            <g key={`${r}-${c}`}>
              <rect
                x={x}
                y={y}
                width={w}
                height={h}
                fill="oklch(0.06 0.01 30)"
                stroke="oklch(0.25 0.05 35)"
                strokeWidth={1}
              />
              {/* 抽屉拉环 */}
              <circle
                cx={x + w / 2}
                cy={y + h / 2}
                r={3}
                fill="oklch(0.55 0.1 75 / 0.7)"
              />
              {/* 抽屉编号 */}
              <text
                x={x + w / 2}
                y={y + h / 2 - 8}
                textAnchor="middle"
                fontSize="9"
                fill="oklch(0.45 0.06 75 / 0.8)"
                fontFamily='"Noto Serif TC", serif'
              >
                {r * cols + c + 1}
              </text>
            </g>
          );
        }),
      )}
    </svg>
  );
}

function Candle() {
  return (
    <div className="relative" style={{ filter: "drop-shadow(0 0 16px oklch(0.7 0.18 50 / 0.6))" }}>
      <svg viewBox="0 0 30 80" className="h-20 w-8">
        <rect x="11" y="20" width="8" height="55" fill="oklch(0.68 0.04 60)" />
        <ellipse cx="15" cy="20" rx="4" ry="2" fill="oklch(0.55 0.04 60)" />
        <line x1="15" y1="22" x2="15" y2="14" stroke="oklch(0.1 0 0)" strokeWidth={0.8} />
        <ellipse
          cx="15"
          cy="10"
          rx="3"
          ry="6"
          fill="oklch(0.85 0.18 60)"
          className="animate-flicker"
        />
        <ellipse
          cx="15"
          cy="9"
          rx="6"
          ry="9"
          fill="oklch(0.7 0.18 50 / 0.3)"
          className="animate-flicker"
        />
      </svg>
    </div>
  );
}
