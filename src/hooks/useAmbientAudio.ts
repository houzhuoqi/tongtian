import { useEffect, useRef } from "react";

type PlayOpts = { targetVolume?: number; fadeMs?: number; loop?: boolean };

export interface AmbientAudioHandle {
  play: (opts?: PlayOpts) => void;
  fadeOut: (ms?: number) => void;
  stop: () => void;
}

/**
 * 通用环境音 hook：循环播放 + 音量淡入淡出 + 自动播放兜底。
 * 第一次 play 若被浏览器拦截，会挂一次性 pointerdown，用户首个交互后启动。
 */
export function useAmbientAudio(src: string): AmbientAudioHandle {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeTimerRef = useRef<number | null>(null);
  const pendingHandlerRef = useRef<(() => void) | null>(null);

  if (typeof window !== "undefined" && !audioRef.current) {
    const a = new Audio(src);
    a.preload = "auto";
    a.loop = true;
    a.volume = 0;
    audioRef.current = a;
  }

  const clearFade = () => {
    if (fadeTimerRef.current != null) {
      window.clearInterval(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
  };

  const fadeTo = (target: number, ms: number) => {
    const a = audioRef.current;
    if (!a) return;
    clearFade();
    const start = a.volume;
    const startT = performance.now();
    fadeTimerRef.current = window.setInterval(() => {
      const t = Math.min(1, (performance.now() - startT) / Math.max(1, ms));
      a.volume = Math.max(0, Math.min(1, start + (target - start) * t));
      if (t >= 1) {
        clearFade();
        if (target === 0) a.pause();
      }
    }, 33);
  };

  const tryPlay = (target: number, ms: number) => {
    const a = audioRef.current;
    if (!a) return;
    const p = a.play();
    if (p && typeof p.then === "function") {
      p.then(() => fadeTo(target, ms)).catch(() => {
        // 自动播放被拦截：等首个用户手势
        const handler = () => {
          window.removeEventListener("pointerdown", handler);
          pendingHandlerRef.current = null;
          a.play().then(() => fadeTo(target, ms)).catch(() => {});
        };
        pendingHandlerRef.current = handler;
        window.addEventListener("pointerdown", handler, { once: true });
      });
    } else {
      fadeTo(target, ms);
    }
  };

  useEffect(() => {
    return () => {
      clearFade();
      if (pendingHandlerRef.current) {
        window.removeEventListener("pointerdown", pendingHandlerRef.current);
      }
      const a = audioRef.current;
      if (a) {
        a.pause();
        a.src = "";
        audioRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    play: ({ targetVolume = 0.5, fadeMs = 1000, loop = true } = {}) => {
      const a = audioRef.current;
      if (!a) return;
      a.loop = loop;
      tryPlay(targetVolume, fadeMs);
    },
    fadeOut: (ms = 800) => fadeTo(0, ms),
    stop: () => {
      clearFade();
      const a = audioRef.current;
      if (a) {
        a.pause();
        a.volume = 0;
      }
    },
  };
}

/* ============== 跨场景共享的环境音（全局单例） ============== */

type GlobalAmbient = {
  audio: HTMLAudioElement;
  fadeTimer: number | null;
};

declare global {
  interface Window {
    __tt_ambient?: GlobalAmbient;
  }
}

function fadeGlobal(target: number, ms: number, onZero?: () => void) {
  if (typeof window === "undefined" || !window.__tt_ambient) return;
  const g = window.__tt_ambient;
  if (g.fadeTimer != null) window.clearInterval(g.fadeTimer);
  const start = g.audio.volume;
  const startT = performance.now();
  g.fadeTimer = window.setInterval(() => {
    const t = Math.min(1, (performance.now() - startT) / Math.max(1, ms));
    g.audio.volume = Math.max(0, Math.min(1, start + (target - start) * t));
    if (t >= 1) {
      if (g.fadeTimer != null) window.clearInterval(g.fadeTimer);
      g.fadeTimer = null;
      if (target === 0) {
        g.audio.pause();
        onZero?.();
      }
    }
  }, 33);
}

export function startGlobalAmbient(src: string, targetVolume = 0.32, fadeMs = 1500) {
  if (typeof window === "undefined") return;
  if (!window.__tt_ambient) {
    const audio = new Audio(src);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0;
    window.__tt_ambient = { audio, fadeTimer: null };
  }
  const g = window.__tt_ambient;
  const tryStart = () => {
    const p = g.audio.play();
    if (p && typeof p.then === "function") {
      p.then(() => fadeGlobal(targetVolume, fadeMs)).catch(() => {
        const handler = () => {
          window.removeEventListener("pointerdown", handler);
          g.audio.play().then(() => fadeGlobal(targetVolume, fadeMs)).catch(() => {});
        };
        window.addEventListener("pointerdown", handler, { once: true });
      });
    } else {
      fadeGlobal(targetVolume, fadeMs);
    }
  };
  tryStart();
}

export function stopGlobalAmbient(fadeMs = 1200) {
  if (typeof window === "undefined" || !window.__tt_ambient) return;
  fadeGlobal(0, fadeMs, () => {
    if (window.__tt_ambient) {
      window.__tt_ambient.audio.src = "";
      window.__tt_ambient = undefined;
    }
  });
}
