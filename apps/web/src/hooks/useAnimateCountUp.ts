import { useEffect, useRef, useState } from 'react';

/** Animates a number from `initialValue` to `target` over `duration` ms with ease-out. */
export default function useAnimateCountUp(
  target: number,
  duration = 800,
  initialValue = 0,
): number {
  const [value, setValue] = useState(initialValue);
  const prev = useRef(initialValue);

  useEffect(() => {
    const start = prev.current;
    const delta = target - start;
    if (delta === 0) return;

    const t0 = performance.now();
    let raf: number;

    const step = (now: number) => {
      const elapsed = now - t0;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - (1 - progress) ** 3;
      const current = Math.round(start + delta * eased);
      setValue(current);

      if (progress < 1) {
        raf = requestAnimationFrame(step);
      } else {
        prev.current = target;
      }
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}
