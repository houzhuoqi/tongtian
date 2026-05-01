import { useEffect, useRef } from "react";

// 香烟粒子 / 林间薄雾
// variant="incense": 从画面底部中心一点升起（适合有香炉的场景）
// variant="mist":    遍布画面横向漂移（适合户外/林中，没有香源）
export function IncenseParticles({
  density = 24,
  variant = "incense",
}: {
  density?: number;
  variant?: "incense" | "mist";
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = (canvas.width = canvas.offsetWidth * devicePixelRatio);
    let h = (canvas.height = canvas.offsetHeight * devicePixelRatio);

    const onResize = () => {
      w = canvas.width = canvas.offsetWidth * devicePixelRatio;
      h = canvas.height = canvas.offsetHeight * devicePixelRatio;
    };
    window.addEventListener("resize", onResize);

    type P = {
      x: number;
      y: number;
      vy: number;
      vx: number;
      r: number;
      life: number;
      max: number;
      hue: number;
    };

    const particles: P[] = [];
    function spawn(): P {
      if (variant === "mist") {
        // 林间薄雾：横铺画面，缓慢横向漂移、轻微上浮
        return {
          x: w * Math.random(),
          y: h * (0.35 + Math.random() * 0.6),
          vy: -(0.04 + Math.random() * 0.08) * devicePixelRatio,
          vx: (Math.random() - 0.3) * 0.18 * devicePixelRatio,
          r: (40 + Math.random() * 70) * devicePixelRatio,
          life: 0,
          max: 320 + Math.random() * 320,
          hue: 220 + Math.random() * 30, // 偏冷青灰
        };
      }
      // 香炉烟：底部中心升起
      return {
        x: w * (0.4 + Math.random() * 0.2),
        y: h * (0.78 + Math.random() * 0.08),
        vy: -(0.3 + Math.random() * 0.4) * devicePixelRatio,
        vx: (Math.random() - 0.5) * 0.15 * devicePixelRatio,
        r: (8 + Math.random() * 18) * devicePixelRatio,
        life: 0,
        max: 200 + Math.random() * 200,
        hue: 30 + Math.random() * 20,
      };
    }
    for (let i = 0; i < density; i++) {
      const p = spawn();
      p.life = Math.random() * p.max;
      particles.push(p);
    }

    function tick() {
      ctx!.clearRect(0, 0, w, h);
      ctx!.globalCompositeOperation = variant === "mist" ? "screen" : "lighter";
      for (const p of particles) {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vx += (Math.random() - 0.5) * 0.02;
        p.r += 0.08 * devicePixelRatio;
        const t = p.life / p.max;
        const alpha = Math.sin(t * Math.PI) * 0.18;
        const grad = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        grad.addColorStop(0, `oklch(0.85 0.04 ${p.hue} / ${alpha})`);
        grad.addColorStop(1, `oklch(0.6 0.02 ${p.hue} / 0)`);
        ctx!.fillStyle = grad;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fill();
        if (p.life >= p.max) {
          Object.assign(p, spawn());
        }
      }
      raf = requestAnimationFrame(tick);
    }
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    />
  );
}
