import { IncenseParticles } from "@/components/ritual/IncenseParticles";
import shrineBg from "@/assets/scene-shrine.jpg";

// 庙中签诗柜场景 — 写实背景
export function ShrineScene({ children }: { children?: React.ReactNode }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      {/* 写实背景：签诗柜 + 油灯 */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${shrineBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* 油灯暖光呼吸 */}
      <div
        className="pointer-events-none absolute inset-0 animate-flicker"
        style={{
          background:
            "radial-gradient(ellipse 45% 35% at 48% 70%, oklch(0.7 0.18 55 / 0.18) 0%, transparent 60%)",
        }}
      />

      <IncenseParticles density={8} />

      {/* 底部加深 — 给签纸/按钮让位 */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%]"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, oklch(0.04 0.005 30 / 0.85) 70%, oklch(0.02 0 30 / 0.95) 100%)",
        }}
      />

      {/* 暗角 */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 100% 80% at 50% 50%, transparent 30%, oklch(0.02 0 0 / 0.92) 100%)",
        }}
      />

      {/* 旧氛围叠层 */}
      <div className="aged-overlay" />

      {children}
    </div>
  );
}
