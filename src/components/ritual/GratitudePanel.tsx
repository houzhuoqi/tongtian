import { RitualButton } from "./RitualButton";
import { RitualCard, RitualOverlay } from "./RitualOverlay";

export function GratitudePanel({
  onPalms,
  onIncense,
}: {
  onPalms: () => void;
  onIncense: () => void;
}) {
  return (
    <RitualOverlay position="bottom" className="px-4 pb-6">
      <RitualCard className="mx-auto max-w-md space-y-4 text-center">
        <div className="font-display text-lg tracking-[0.4em] text-gold">
          解籤已畢 · 謝神
        </div>
        <div className="text-xs tracking-widest text-muted-foreground">
          神明垂憐 · 弟子感恩 · 願以何種方式致謝？
        </div>
        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-center">
          <RitualButton variant="ghost" onClick={onPalms}>
            合掌感謝
          </RitualButton>
          <RitualButton onClick={onIncense}>付費上香感謝</RitualButton>
        </div>
      </RitualCard>
    </RitualOverlay>
  );
}

export function PalmsThanks({ onDone }: { onDone: () => void }) {
  return (
    <RitualOverlay position="center" className="w-[88%] max-w-md">
      <RitualCard className="space-y-5 text-center">
        <div className="font-display text-xl tracking-[0.4em] text-gold">
          合 掌 感 謝
        </div>
        <div className="mx-auto h-40 w-40">
          <svg viewBox="0 0 100 100" className="h-full w-full animate-glow-pulse">
            <defs>
              <radialGradient id="palmGlow" cx="0.5" cy="0.5" r="0.6">
                <stop offset="0%" stopColor="oklch(0.72 0.14 82 / 0.7)" />
                <stop offset="100%" stopColor="oklch(0.72 0.14 82 / 0)" />
              </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="46" fill="url(#palmGlow)" />
            <path
              d="M 35 80 Q 30 50 38 25 Q 42 20 46 25 Q 48 50 48 80 Z"
              fill="oklch(0.78 0.05 60)"
              opacity={0.95}
            />
            <path
              d="M 65 80 Q 70 50 62 25 Q 58 20 54 25 Q 52 50 52 80 Z"
              fill="oklch(0.78 0.05 60)"
              opacity={0.95}
            />
            <path
              d="M 50 22 Q 50 18 50 22"
              stroke="oklch(0.72 0.12 82)"
              strokeWidth={2}
              fill="none"
            />
          </svg>
        </div>
        <div className="text-sm leading-relaxed text-paper/90">
          心 誠 則 靈
          <br />
          願 大 聖 護 佑 弟 子
        </div>
        <RitualButton onClick={onDone}>禮畢</RitualButton>
      </RitualCard>
    </RitualOverlay>
  );
}
