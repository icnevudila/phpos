import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_IDLE_MS = 120_000;

export function useKioskIdle(idleMs = DEFAULT_IDLE_MS): {
  idle: boolean;
  resetIdle: () => void;
} {
  const [idle, setIdle] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetIdle = useCallback(() => {
    setIdle(false);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setIdle(true), idleMs);
  }, [idleMs]);

  useEffect(() => {
    resetIdle();
    const events = ["pointerdown", "keydown", "touchstart", "mousemove"] as const;
    const onActivity = (): void => resetIdle();
    for (const e of events) {
      window.addEventListener(e, onActivity, { passive: true });
    }
    return () => {
      if (timer.current) clearTimeout(timer.current);
      for (const e of events) {
        window.removeEventListener(e, onActivity);
      }
    };
  }, [resetIdle]);

  return { idle, resetIdle };
}
