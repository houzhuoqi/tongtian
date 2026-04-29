import { useState } from "react";
import { RitualButton } from "./RitualButton";
import { RitualCard, RitualOverlay } from "./RitualOverlay";

const DEFAULT_WISH = "弟子今日誠心參拜通天大聖，所求一事，唯願大聖明示前路。";

export function WishPanel({
  initial,
  rejectedByXiao,
  onConfirm,
  onCancel,
}: {
  initial?: string;
  rejectedByXiao?: boolean;
  onConfirm: (wish: string) => void;
  onCancel: () => void;
}) {
  const [wish, setWish] = useState(initial || "");

  return (
    <RitualOverlay position="center" className="w-[88%] max-w-md">
      <RitualCard className="space-y-5">
        <div className="text-center">
          <div className="font-display text-xl tracking-[0.4em] text-gold">
            {rejectedByXiao ? "笑筊 · 請再稟明" : "請願"}
          </div>
          <div className="mt-2 text-xs tracking-widest text-muted-foreground">
            雙手合掌 · 心中默念所求之事
          </div>
        </div>

        <div className="rounded-sm border border-gold/20 bg-ink/60 p-3">
          <textarea
            value={wish}
            onChange={(e) => setWish(e.target.value)}
            placeholder={DEFAULT_WISH}
            rows={4}
            className="w-full resize-none bg-transparent text-sm leading-relaxed text-foreground/90 placeholder:text-muted-foreground/50 focus:outline-none"
          />
        </div>

        <div className="text-center font-display text-xs leading-relaxed text-paper/80">
          弟子 ◯◯◯ 今日參拜通天大聖
          <br />
          所求 ——
          <span className="text-gold">
            {wish.trim() ? wish.trim() : "（請於上方默念心事）"}
          </span>
          <br />
          唯願大聖明示
        </div>

        <div className="flex justify-center gap-3 pt-2">
          <RitualButton variant="ghost" onClick={onCancel}>
            退下
          </RitualButton>
          <RitualButton
            onClick={() => onConfirm(wish.trim() || DEFAULT_WISH)}
          >
            擲筊問允
          </RitualButton>
        </div>
      </RitualCard>
    </RitualOverlay>
  );
}
