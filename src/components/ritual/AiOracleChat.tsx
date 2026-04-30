import { useState, useRef, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { askOracle } from "@/server/oracle.functions";
import { RitualButton } from "./RitualButton";
import type { SignPoem } from "@/lib/signs";
import { toast } from "sonner";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

export function AiOracleChat({
  sign,
  wish,
  onBack,
}: {
  sign: SignPoem;
  wish: string;
  onBack: () => void;
}) {
  const ask = useServerFn(askOracle);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        `信眾既得【${sign.numberCn} · ${sign.title}】（${sign.fortune}），老朽在此。\n\n所求之事，但問無妨。可問：此籤對我此事有何指示？宜如何行？忌何事？`,
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);
  const composingRef = useRef(false);
  const inflightRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  const safeSet = <T,>(setter: (v: T) => void, v: T) => {
    if (mountedRef.current) setter(v);
  };

  async function send() {
    const text = input.trim();
    if (!text || loading || inflightRef.current) return;
    inflightRef.current = true;
    safeSet(setInput, "");
    const next: Msg[] = [...messages, { role: "user", content: text }];
    safeSet(setMessages, next);
    safeSet(setLoading, true);

    try {
      let result: Awaited<ReturnType<typeof ask>>;
      try {
        result = await ask({
          data: {
            signNumber: sign.number,
            signTitle: sign.title,
            signFortune: sign.fortune,
            signPoem: sign.poem,
            signHint: sign.hint,
            signClassic: sign.classic,
            wish,
            history: next,
          },
        });
      } catch (err) {
        console.error("askOracle network error:", err);
        if (mountedRef.current) {
          toast.error("與山中信使失聯，請稍後再試");
          setMessages((m) => [
            ...m,
            { role: "assistant", content: "（與山中信使失聯，請稍後再試）" },
          ]);
        }
        return;
      }

      if (!mountedRef.current) return;

      if (result && result.ok) {
        const content =
          typeof result.content === "string" && result.content.trim().length > 0
            ? result.content
            : "（神明沉默不語）";
        setMessages((m) => [...m, { role: "assistant", content }]);
      } else {
        const errMsg = (result && "error" in result && result.error) || "神諭未達，請稍後再問。";
        toast.error(errMsg);
        setMessages((m) => [
          ...m,
          { role: "assistant", content: `（${errMsg}）` },
        ]);
      }
    } catch (e) {
      // 兜底：任何同步异常都不让组件崩溃
      console.error("AiOracleChat send unexpected:", e);
      if (mountedRef.current) {
        toast.error("解籤失敗，請稍後再試");
      }
    } finally {
      inflightRef.current = false;
      if (mountedRef.current) setLoading(false);
    }
  }

  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-ink/95 backdrop-blur-xl animate-fade-in">
      {/* 顶栏 */}
      <div className="flex items-center justify-between border-b border-gold/20 px-5 py-4">
        <button
          onClick={onBack}
          className="text-sm tracking-widest text-muted-foreground hover:text-gold"
        >
          ← 返回籤文
        </button>
        <div className="text-center">
          <div className="font-display text-sm tracking-[0.3em] text-gold">
            解籤助手
          </div>
          <div className="text-[10px] tracking-widest text-muted-foreground">
            {sign.numberCn} · {sign.title}
          </div>
        </div>
        <div className="w-12" />
      </div>

      {/* 消息流 */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] whitespace-pre-wrap break-words px-4 py-3 text-sm leading-relaxed ${
                m.role === "user"
                  ? "border border-gold/40 bg-gold/10 text-foreground"
                  : "border border-foreground/10 bg-card/80 text-paper/95"
              }`}
            >
              {m.role === "assistant" && (
                <div className="mb-1 text-[10px] tracking-widest text-gold/70">
                  庙祝
                </div>
              )}
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="border border-foreground/10 bg-card/80 px-4 py-3 text-sm text-muted-foreground">
              <span className="inline-flex gap-1">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold/70" />
                <span
                  className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold/70"
                  style={{ animationDelay: "0.2s" }}
                />
                <span
                  className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold/70"
                  style={{ animationDelay: "0.4s" }}
                />
              </span>
              <span className="ml-2">庙祝凝神…</span>
            </div>
          </div>
        )}
      </div>

      {/* 输入栏 */}
      <div className="border-t border-gold/20 bg-ink/90 px-4 py-3">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="請問此籤……"
            disabled={loading}
            className="flex-1 border border-gold/30 bg-ink/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-gold focus:outline-none disabled:opacity-50"
          />
          <RitualButton onClick={send} disabled={loading || !input.trim()}>
            問
          </RitualButton>
        </div>
      </div>
    </div>
  );
}
