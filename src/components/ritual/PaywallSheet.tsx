import { useState } from "react";
import { RitualButton } from "./RitualButton";
import { RitualCard, RitualOverlay } from "./RitualOverlay";
import { toast } from "sonner";

export type PaywallKind = "redeem" | "incense";

interface Option {
  value: number;
  label: string;
  amount: number;
  desc: string;
}

const REDEEM_OPTIONS: Option[] = [
  { value: 9.9, label: "薄禮", amount: 9.9, desc: "心意一份" },
  { value: 19.9, label: "敬奉", amount: 19.9, desc: "謝神之願" },
  { value: 66, label: "厚酬", amount: 66, desc: "酬謝神恩" },
  { value: 168, label: "盛謝", amount: 168, desc: "大聖庇佑滿盈" },
];

const INCENSE_OPTIONS: Option[] = [
  { value: 1, label: "一炷清香", amount: 6.6, desc: "誠意一炷" },
  { value: 3, label: "三炷敬香", amount: 18.8, desc: "天地神三敬" },
  { value: 9, label: "九炷盛香", amount: 66, desc: "九炷大圣" },
];

export function PaywallSheet({
  kind,
  onPaid,
  onCancel,
}: {
  kind: PaywallKind;
  onPaid: (sticks: number) => void;
  onCancel: () => void;
}) {
  const isRedeem = kind === "redeem";
  const opts = isRedeem ? REDEEM_OPTIONS : INCENSE_OPTIONS;
  const [selected, setSelected] = useState<Option>(opts[isRedeem ? 1 : 1]);
  const [paying, setPaying] = useState(false);

  function pay() {
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      toast.success(
        isRedeem
          ? `已奉還願 ¥${selected.amount.toFixed(2)}（原型模擬）`
          : `已上 ${selected.value} 炷香 ¥${selected.amount.toFixed(2)}（原型模擬）`,
      );
      onPaid(isRedeem ? 0 : selected.value);
    }, 900);
  }

  return (
    <RitualOverlay position="center" className="w-[90%] max-w-md">
      <RitualCard className="space-y-5">
        <div className="text-center">
          <div className="font-display text-xl tracking-[0.4em] text-gold">
            {isRedeem ? "付費還願" : "付費上香感謝"}
          </div>
          <div className="mt-2 text-xs tracking-widest text-muted-foreground">
            {isRedeem
              ? "前次所許之願既已遂，請以心意還願"
              : "於大聖案前焚香 · 表弟子感恩"}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {opts.map((o) => (
            <button
              key={o.value}
              onClick={() => setSelected(o)}
              className={`group relative border px-3 py-4 text-left transition-all ${
                selected.value === o.value
                  ? "border-gold bg-gold/10 shadow-[0_0_18px_oklch(0.72_0.12_82/0.25)]"
                  : "border-foreground/15 bg-ink/40 hover:border-gold/50"
              }`}
            >
              <div className="font-display text-base tracking-widest text-foreground">
                {o.label}
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">{o.desc}</div>
              <div className="mt-2 font-display text-sm text-gold">
                ¥ {o.amount.toFixed(2)}
              </div>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-gold/15 pt-3">
          <div className="text-xs text-muted-foreground">
            合計
            <span className="ml-2 font-display text-lg text-gold">
              ¥ {selected.amount.toFixed(2)}
            </span>
          </div>
          <div className="flex gap-2">
            <RitualButton variant="ghost" onClick={onCancel}>
              退下
            </RitualButton>
            <RitualButton onClick={pay} disabled={paying}>
              {paying ? "焚香中…" : "確認"}
            </RitualButton>
          </div>
        </div>

        <div className="text-center text-[10px] tracking-widest text-muted-foreground/60">
          原型階段 · 模擬支付 · 不接入真實微信支付
        </div>
      </RitualCard>
    </RitualOverlay>
  );
}
