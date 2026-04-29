import { RitualButton } from "./RitualButton";
import { RitualCard, RitualOverlay } from "./RitualOverlay";
import type { SignPoem } from "@/lib/signs";

export function SignPoemView({
  sign,
  onAi,
  onDone,
}: {
  sign: SignPoem;
  onAi: () => void;
  onDone: () => void;
}) {
  return (
    <RitualOverlay position="center" className="w-[92%] max-w-md">
      <RitualCard className="space-y-5">
        <div className="text-center">
          <div className="text-xs tracking-[0.4em] text-muted-foreground">
            通天大聖靈籤
          </div>
          <div className="mt-1 font-display text-2xl tracking-[0.3em] text-gold">
            {sign.numberCn} · {sign.fortune}
          </div>
        </div>

        {/* 签纸 */}
        <div
          className="paper-bg relative origin-top animate-scroll-unfurl px-6 py-7"
          style={{
            boxShadow:
              "inset 0 0 30px oklch(0.5 0.08 50 / 0.25), 0 12px 30px oklch(0 0 0 / 0.5)",
          }}
        >
          {/* 朱印 */}
          <div className="absolute right-3 top-3 flex h-12 w-12 items-center justify-center border-2 border-accent/80 font-display text-[10px] leading-tight text-accent/90 rotate-[6deg]">
            <span className="text-center">大聖<br />靈籤</span>
          </div>

          <div className="font-display text-center text-xl text-ink tracking-[0.2em]">
            {sign.title}
          </div>

          <div className="mx-auto mt-5 flex justify-center gap-3 font-display text-base leading-loose text-ink">
            {sign.poem.map((line, i) => (
              <div key={i} className="text-vertical h-44">
                {line}
              </div>
            ))}
          </div>

          <div className="mt-5 border-t border-ink/30 pt-3">
            <div className="text-[11px] tracking-widest text-ink/70">
              典故 · {sign.classic}
            </div>
            <div className="mt-2 text-sm leading-relaxed text-ink">
              <span className="font-bold">籤意：</span>
              {sign.hint}
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-3">
          <RitualButton variant="ghost" onClick={onDone}>
            解籤完畢
          </RitualButton>
          <RitualButton onClick={onAi}>解籤助手</RitualButton>
        </div>
      </RitualCard>
    </RitualOverlay>
  );
}
