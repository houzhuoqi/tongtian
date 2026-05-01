import { IncenseParticles } from "@/components/ritual/IncenseParticles";
import tombBg from "@/assets/scene-tomb.jpg";

// 通天大圣墓前场景背景层 — 写实背景
export function TombScene({ children }: { children?: React.ReactNode }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      {/* 写实背景图：墓碑「通天大聖」+ 香炉 */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${tombBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* 顶部雾气压暗 */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[35%]"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.05 0.01 250 / 0.85) 0%, transparent 100%)",
        }}
      />

      {/* 香烟粒子 */}
      <IncenseParticles density={22} />

      {/* 香火暖光 */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 78%, oklch(0.6 0.16 40 / 0.22) 0%, transparent 55%)",
        }}
      />

      {/* 底部加深 — 给 UI 让位 */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[40%]"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, oklch(0.04 0.005 250 / 0.85) 80%, oklch(0.03 0 250 / 0.95) 100%)",
        }}
      />

      {/* 暗角 */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 130% 100% at 50% 50%, transparent 40%, oklch(0.03 0 0 / 0.85) 100%)",
        }}
      />

      {/* 旧氛围叠层 */}
      <div className="aged-overlay" />

      {children}
    </div>
  );
}
