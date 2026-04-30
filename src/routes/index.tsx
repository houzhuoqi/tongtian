import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useRitualMachine } from "@/lib/ritual-machine";
import { EntranceScene } from "@/components/scenes/EntranceScene";
import { ExitScene } from "@/components/scenes/ExitScene";
import { TombScene } from "@/components/scenes/TombScene";
import { ShrineScene } from "@/components/scenes/ShrineScene";
import { WishPanel } from "@/components/ritual/WishPanel";
import { JiaoBeiThrow } from "@/components/ritual/JiaoBeiThrow";
import { SignShake } from "@/components/ritual/SignShake";
import { SignPoemView } from "@/components/ritual/SignPoemView";
import { AiOracleChat } from "@/components/ritual/AiOracleChat";
import { ChatErrorBoundary } from "@/components/ritual/ChatErrorBoundary";
import {
  GratitudePanel,
  PalmsThanks,
} from "@/components/ritual/GratitudePanel";
import {
  PaywallSheet,
  type PaywallKind,
} from "@/components/ritual/PaywallSheet";
import { RitualButton } from "@/components/ritual/RitualButton";
import { RitualCard, RitualOverlay } from "@/components/ritual/RitualOverlay";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const m = useRitualMachine();
  const [paywall, setPaywall] = useState<PaywallKind | null>(null);

  const inTomb =
    m.ctx.state === "TOMB_IDLE" ||
    m.ctx.state === "WISHING" ||
    m.ctx.state === "JIAO_PERMIT" ||
    m.ctx.state === "SHAKING_SIGN" ||
    m.ctx.state === "CONFIRM_SIGN" ||
    m.ctx.state === "TOMB_GRATITUDE" ||
    m.ctx.state === "GRATITUDE_PALMS" ||
    m.ctx.state === "POST_RITUAL";
  const inShrine = m.ctx.state === "SHRINE_POEM" || m.ctx.state === "AI_ORACLE";

  return (
    <main className="fixed inset-0 flex items-center justify-center bg-black">
      {/* 移动端竖屏画布 */}
      <div
        className="relative h-full w-full overflow-hidden bg-background sm:h-[min(100vh,900px)] sm:w-[min(100vw,440px)] sm:rounded-md sm:shadow-[0_0_60px_oklch(0.72_0.12_82/0.15)]"
      >
        {/* 场景层 */}
        {m.ctx.state === "ENTRANCE" && <EntranceScene onDone={m.enterDone} />}
        {m.ctx.state === "EXITING" && (
          <ExitScene
            onDone={() => {
              m.exitDone();
              setPaywall(null);
            }}
          />
        )}
        {inTomb && <TombScene />}
        {inShrine && <ShrineScene />}

        {/* 顶部签号横幅 */}
        {m.ctx.drawnSign && (inTomb || inShrine) && m.ctx.state !== "TOMB_IDLE" && (
          <div className="absolute inset-x-0 top-0 z-20 px-4 pt-3 pointer-events-none">
            <div className="mx-auto inline-flex w-full items-center justify-center gap-3 border-b border-gold/20 bg-ink/60 py-2 text-xs tracking-[0.4em] text-gold backdrop-blur-sm">
              <span>{m.ctx.drawnSign.numberCn}</span>
              <span className="text-foreground/50">·</span>
              <span>{m.ctx.drawnSign.title}</span>
              <span className="text-foreground/50">·</span>
              <span>{m.ctx.drawnSign.fortune}</span>
            </div>
          </div>
        )}

        {/* 状态相关 UI */}
        {m.ctx.state === "TOMB_IDLE" && (
          <RitualOverlay position="bottom" className="px-4 pb-6">
            <RitualCard className="mx-auto max-w-md space-y-4 text-center">
              <div className="font-display text-lg tracking-[0.4em] text-gold">
                通天大聖墓前
              </div>
              <div className="text-xs tracking-widest text-muted-foreground">
                敬立香前 · 默念心事
              </div>
              <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:justify-center">
                <RitualButton onClick={m.startWishing}>請願</RitualButton>
                <RitualButton variant="ghost" onClick={() => setPaywall("redeem")}>
                  付費還願
                </RitualButton>
              </div>
            </RitualCard>
          </RitualOverlay>
        )}

        {m.ctx.state === "WISHING" && (
          <WishPanel
            initial={m.ctx.wish}
            rejectedByXiao={m.ctx.lastBei === "xiao"}
            onConfirm={(w) => {
              m.setWish(w);
              m.wishConfirmed();
            }}
            onCancel={m.endVisit}
          />
        )}

        {m.ctx.state === "JIAO_PERMIT" && (
          <JiaoBeiThrow
            title="擲筊問允"
            hint="求大聖示下 · 今日是否允我求籤"
            onResult={m.permitResult}
            onCancel={m.endVisit}
            cancelLabel="退下"
          />
        )}

        {m.ctx.state === "SHAKING_SIGN" && <SignShake onDrawn={m.signDrawn} />}

        {m.ctx.state === "CONFIRM_SIGN" && m.ctx.drawnSign && (
          <JiaoBeiThrow
            title="確認籤號"
            hint={`擲得 ${m.ctx.drawnSign.numberCn} · 須連得三聖筊以確認`}
            onResult={m.confirmResult}
            onCancel={m.giveUpConfirm}
            cancelLabel="放棄此籤"
            showCount={{ current: m.ctx.shengCount, total: 3 }}
          />
        )}

        {m.ctx.state === "SHRINE_POEM" && m.ctx.drawnSign && (
          <SignPoemView
            sign={m.ctx.drawnSign}
            onAi={m.openAi}
            onDone={m.finishPoem}
          />
        )}

        {m.ctx.state === "AI_ORACLE" && m.ctx.drawnSign && (
          <ChatErrorBoundary onBack={m.closeAi}>
            <AiOracleChat
              sign={m.ctx.drawnSign}
              wish={m.ctx.wish}
              onBack={m.closeAi}
            />
          </ChatErrorBoundary>
        )}

        {m.ctx.state === "TOMB_GRATITUDE" && (
          <GratitudePanel
            onPalms={m.palmsThanks}
            onIncense={() => setPaywall("incense")}
          />
        )}

        {m.ctx.state === "GRATITUDE_PALMS" && (
          <PalmsThanks
            onDone={() => {
              // 进入再次请愿/结束选择
              m.redeemDone();
            }}
          />
        )}

        {m.ctx.state === "POST_RITUAL" && (
          <RitualOverlay position="bottom" className="px-4 pb-6">
            <RitualCard className="mx-auto max-w-md space-y-4 text-center">
              <div className="font-display text-lg tracking-[0.4em] text-gold">
                禮 畢
              </div>
              <div className="text-xs tracking-widest text-muted-foreground">
                {m.ctx.redeemed && "願已還 · "}
                {m.ctx.incenseOffered > 0 &&
                  `已上 ${m.ctx.incenseOffered} 炷香 · `}
                可再請願 · 或就此別過
              </div>
              <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:justify-center">
                <RitualButton onClick={m.wishAgain}>再次請願</RitualButton>
                <RitualButton variant="ghost" onClick={m.endVisit}>
                  結束參拜
                </RitualButton>
              </div>
            </RitualCard>
          </RitualOverlay>
        )}

        {/* 阴筊离场前提示 */}
        {m.ctx.state === "EXITING" && m.ctx.permitDenied && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm pointer-events-none animate-fade-in">
            <div className="text-center">
              <div className="font-display text-2xl tracking-[0.5em] text-stone">
                陰 筊
              </div>
              <div className="mt-2 text-xs tracking-widest text-muted-foreground">
                神明示意 · 今日不宜求籤 · 請改日再來
              </div>
            </div>
          </div>
        )}

        {/* 付费弹窗 — 仅两处 */}
        {paywall && (
          <PaywallSheet
            kind={paywall}
            onPaid={(sticks) => {
              if (paywall === "redeem") {
                setPaywall(null);
                m.startRedeem();
              } else {
                setPaywall(null);
                m.incenseThanks(sticks);
              }
            }}
            onCancel={() => setPaywall(null)}
          />
        )}
      </div>
    </main>
  );
}
