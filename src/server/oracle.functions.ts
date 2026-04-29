import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

const inputSchema = z.object({
  signNumber: z.number(),
  signTitle: z.string(),
  signFortune: z.string(),
  signPoem: z.array(z.string()),
  signHint: z.string(),
  signClassic: z.string(),
  wish: z.string().optional(),
  history: z.array(messageSchema).max(40),
});

export const askOracle = createServerFn({ method: "POST" })
  .inputValidator((data) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { ok: false as const, error: "AI 服務尚未配置（LOVABLE_API_KEY 缺失）" };
    }

    const systemPrompt = [
      "你是「通天大聖坛庙」中的一位老庙祝，性情沉穩、語氣克制、半古半白、不誇張不諂媚。",
      "你的職責是為信眾解讀剛剛求得的神籤。請扣緊籤詩本身：意象、典故、卦意、吉凶、宜忌。",
      "回答需具體可行：點明形勢、指出宜做與不宜做之事、給出清晰可落地的建議。",
      "禁止：占卜以外的長篇雞湯；現代心理學術語堆砌；過於迷信的恫嚇；商業推薦。",
      "回答語言：中文（可用繁體與簡體混排），保持簡潔，每段不超過 4 行，必要時可分小節。",
      "若用戶詢問與當前籤詩無關之事，可溫和提醒：每次參拜對應一籤，本籤針對的是此次所求之事。",
      "",
      "—— 本次參拜資訊 ——",
      `籤號：第 ${data.signNumber} 籤 · ${data.signTitle}（${data.signFortune}）`,
      `籤詩：`,
      ...data.signPoem.map((l) => `  ${l}`),
      `典故：${data.signClassic}`,
      `籤意提示：${data.signHint}`,
      data.wish ? `信眾所求：${data.wish}` : "信眾未明示具體所求。",
    ].join("\n");

    try {
      const resp = await fetch(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: systemPrompt },
              ...data.history,
            ],
          }),
        },
      );

      if (resp.status === 429) {
        return { ok: false as const, error: "求籤之人太多，請稍候片刻再來。" };
      }
      if (resp.status === 402) {
        return {
          ok: false as const,
          error: "庙中燈油不足，請庙主於工作臺添置額度。",
        };
      }
      if (!resp.ok) {
        const t = await resp.text();
        console.error("AI gateway error:", resp.status, t);
        return { ok: false as const, error: "神諭未達，請稍後再問。" };
      }

      const json = await resp.json();
      const content: string =
        json?.choices?.[0]?.message?.content ?? "（神明沉默不語）";
      return { ok: true as const, content };
    } catch (e) {
      console.error("askOracle failed:", e);
      return { ok: false as const, error: "山中信使迷途，請再試一次。" };
    }
  });
