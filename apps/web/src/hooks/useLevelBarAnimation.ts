import { useEffect, useRef, useState } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AnimationStage {
  displayLevel: number;
  xpToNext: number;
  fromPct: number;
  toPct: number;
  fromXp: number;
  toXp: number;
  durationMs: number;
  pauseAfterMs: number;
}

interface XpLevelEntry {
  level: number;
  xpToNext: number | null;
  cumulativeXp: number;
}

interface LevelBarAnimationResult {
  pct: number;
  displayLevel: number;
  displayXp: number;
  displayXpToNext: number;
  isMaxLevel: boolean;
  isAnimating: boolean;
}

interface LevelState {
  level: number;
  xpInLevel: number;
  xpToNext: number;
  pct: number;
  isMaxLevel: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BASE_FULL_FILL_MS = 800;
const MIN_STAGE_MS = 80;
const PAUSE_AT_FULL_MS = 200;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function stageDuration(fromPct: number, toPct: number): number {
  const delta = Math.abs(toPct - fromPct);
  return Math.max(Math.round((delta / 100) * BASE_FULL_FILL_MS), MIN_STAGE_MS);
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

function deriveLevelState(
  level: number,
  xp: number,
  xpLevels: XpLevelEntry[],
): LevelState {
  const entry = xpLevels.find((e) => e.level === level);
  const xpToNext = entry?.xpToNext ?? 0;
  const isMaxLevel = xpToNext === 0;
  const xpInLevel = entry ? xp - entry.cumulativeXp : 0;
  const pct = isMaxLevel ? 100 : Math.min((xpInLevel / xpToNext) * 100, 100);
  return { level, xpInLevel, xpToNext, pct, isMaxLevel };
}

// ---------------------------------------------------------------------------
// Stage queue builder
// ---------------------------------------------------------------------------

function buildStageQueue(
  prev: LevelState,
  next: LevelState,
  xpLevels: XpLevelEntry[],
): AnimationStage[] {
  // Same level — single stage
  if (next.level === prev.level) {
    return [
      {
        displayLevel: next.level,
        xpToNext: next.xpToNext,
        fromPct: prev.pct,
        toPct: next.pct,
        fromXp: prev.xpInLevel,
        toXp: next.xpInLevel,
        durationMs: BASE_FULL_FILL_MS,
        pauseAfterMs: 0,
      },
    ];
  }

  const stages: AnimationStage[] = [];

  // Stage 1: fill current level to 100%
  stages.push({
    displayLevel: prev.level,
    xpToNext: prev.xpToNext,
    fromPct: prev.pct,
    toPct: 100,
    fromXp: prev.xpInLevel,
    toXp: prev.xpToNext,
    durationMs: stageDuration(prev.pct, 100),
    pauseAfterMs: PAUSE_AT_FULL_MS,
  });

  // Intermediate levels: 0% → 100%
  for (let l = prev.level + 1; l < next.level; l++) {
    const entry = xpLevels.find((e) => e.level === l);
    const intermediateXpToNext = entry?.xpToNext ?? 0;
    stages.push({
      displayLevel: l,
      xpToNext: intermediateXpToNext,
      fromPct: 0,
      toPct: 100,
      fromXp: 0,
      toXp: intermediateXpToNext,
      durationMs: BASE_FULL_FILL_MS,
      pauseAfterMs: PAUSE_AT_FULL_MS,
    });
  }

  // Final stage: settle at new level
  stages.push({
    displayLevel: next.level,
    xpToNext: next.xpToNext,
    fromPct: 0,
    toPct: next.pct,
    fromXp: 0,
    toXp: next.xpInLevel,
    durationMs: stageDuration(0, next.pct),
    pauseAfterMs: 0,
  });

  return stages;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export default function useLevelBarAnimation(
  level: number,
  xp: number,
  xpLevels: XpLevelEntry[] | undefined,
): LevelBarAnimationResult {
  const [animDisplay, setAnimDisplay] = useState<{
    pct: number;
    level: number;
    xp: number;
    xpToNext: number;
    isMaxLevel: boolean;
    animating: boolean;
  } | null>(null);

  const prevStateRef = useRef<LevelState | null>(null);
  const rafRef = useRef(0);

  // Derive current state from props (used as static fallback before any animation)
  const currentState = xpLevels ? deriveLevelState(level, xp, xpLevels) : null;

  // Lazy-init prevStateRef when data first becomes available (safe ref init during render)
  if (currentState && prevStateRef.current === null) {
    prevStateRef.current = currentState;
  }

  useEffect(() => {
    if (!xpLevels) return;

    const next = deriveLevelState(level, xp, xpLevels);
    const prev = prevStateRef.current;
    if (!prev) return;

    // No change
    if (prev.level === next.level && prev.pct === next.pct) return;

    // Build stages and animate
    const stages = buildStageQueue(prev, next, xpLevels);
    prevStateRef.current = next;

    // Cancel any running animation
    cancelAnimationFrame(rafRef.current);

    let stageIndex = 0;
    let stageStart = 0;
    let pauseUntil = 0;

    function tick(now: number) {
      // Initialise stageStart on the very first frame
      if (stageStart === 0) stageStart = now;

      // Pause phase
      if (pauseUntil > 0) {
        if (now < pauseUntil) {
          rafRef.current = requestAnimationFrame(tick);
          return;
        }
        // Pause over — advance to next stage
        stageIndex++;
        if (stageIndex >= stages.length) {
          setAnimDisplay((d) => (d ? { ...d, animating: false } : d));
          return;
        }
        stageStart = now;
        pauseUntil = 0;
      }

      // Fill phase
      const cur = stages[stageIndex];
      const elapsed = now - stageStart;
      const progress = Math.min(elapsed / cur.durationMs, 1);
      const eased = easeOutCubic(progress);
      const currentPct = cur.fromPct + (cur.toPct - cur.fromPct) * eased;
      const currentXp = Math.round(
        cur.fromXp + (cur.toXp - cur.fromXp) * eased,
      );

      setAnimDisplay({
        pct: currentPct,
        xp: currentXp,
        level: cur.displayLevel,
        xpToNext: cur.xpToNext,
        isMaxLevel: next.isMaxLevel && stageIndex === stages.length - 1,
        animating: true,
      });

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else if (cur.pauseAfterMs > 0) {
        pauseUntil = now + cur.pauseAfterMs;
        rafRef.current = requestAnimationFrame(tick);
      } else {
        stageIndex++;
        if (stageIndex >= stages.length) {
          setAnimDisplay((d) => (d ? { ...d, animating: false } : d));
          return;
        }
        stageStart = now;
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [level, xp, xpLevels]);

  // Use animated display if available, otherwise derive from current state
  const display = animDisplay ?? {
    pct: currentState?.pct ?? 0,
    level: currentState?.level ?? 0,
    xp: currentState?.xpInLevel ?? 0,
    xpToNext: currentState?.xpToNext ?? 0,
    isMaxLevel: currentState?.isMaxLevel ?? false,
    animating: false,
  };

  return {
    pct: display.pct,
    displayLevel: display.level,
    displayXp: display.xp,
    displayXpToNext: display.xpToNext,
    isMaxLevel: display.isMaxLevel,
    isAnimating: display.animating,
  };
}
