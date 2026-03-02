/**
 * XP thresholds for each level. Index = level number.
 * Level 1 starts at 0 XP. Level 2 starts at 100 XP. Etc.
 */
export const LEVEL_THRESHOLDS = [
  0, // Level 1
  100, // Level 2
  300, // Level 3
  600, // Level 4
  1000, // Level 5
  1500, // Level 6
  2200, // Level 7
  3000, // Level 8
  4000, // Level 9
  5500, // Level 10
  7500, // Level 11
  10000, // Level 12
  13000, // Level 13
  17000, // Level 14
  22000, // Level 15
  28000, // Level 16
  35000, // Level 17
  44000, // Level 18
  55000, // Level 19
  70000, // Level 20
];

export const MAX_LEVEL = LEVEL_THRESHOLDS.length;

/**
 * Get the XP needed to reach the next level.
 * Returns Infinity if at max level.
 */
export function getXpForNextLevel(level: number): number {
  if (level >= MAX_LEVEL) return Infinity;
  return LEVEL_THRESHOLDS[level] ?? Infinity;
}

/**
 * Get progress (0–1) through the current level.
 */
export function getXpProgress(level: number, xpTotal: number): number {
  if (level >= MAX_LEVEL) return 1;

  const currentThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? currentThreshold;
  const range = nextThreshold - currentThreshold;

  if (range <= 0) return 1;
  return Math.min(1, Math.max(0, (xpTotal - currentThreshold) / range));
}

/**
 * Calculate level from total XP.
 */
export function getLevelFromXp(xpTotal: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xpTotal >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}
