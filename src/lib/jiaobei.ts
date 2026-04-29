// 阴阳筊结果
export type BeiResult = "sheng" | "xiao" | "yin";

export const BEI_INFO: Record<BeiResult, { name: string; desc: string; tone: string }> = {
  sheng: {
    name: "聖筊",
    desc: "一平一凹 · 神明應允",
    tone: "text-gold",
  },
  xiao: {
    name: "笑筊",
    desc: "兩平面朝上 · 神明微笑，請再稟明",
    tone: "text-ember",
  },
  yin: {
    name: "陰筊",
    desc: "兩凸面朝上 · 此事神明不允",
    tone: "text-stone",
  },
};

// 加权随机：圣筊 50%，笑筊 30%，阴筊 20%
export function throwBei(): BeiResult {
  const r = Math.random();
  if (r < 0.5) return "sheng";
  if (r < 0.8) return "xiao";
  return "yin";
}
