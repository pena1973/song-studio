// lib/music/rhythmPatterns.ts

export type RhythmPatternHit = {
  /** позиция внутри такта: 0..1 */
  pos: number;
  /** 0..1 громкость/сила удара (для акцентов) */
  vel: number;
};

export type RhythmPattern = {
  id: string;
  title: string;
  /** Под какую сетку это “естественно” (информативно) */
  feel?: "4/4" | "3/4" | "6/8" | "custom";
  hits: RhythmPatternHit[];
};

/**
 * Набор базовых рисунков (под ударный трек/перкуссию).
 * vel >= 0.85 будем считать акцентом в UI.
 */
export const RHYTHM_PATTERNS: RhythmPattern[] = [
  {
    id: "four_on_the_floor",
    title: "4-on-floor",
    feel: "4/4",
    hits: [
      { pos: 0 / 4, vel: 0.95 },
      { pos: 1 / 4, vel: 0.90 },
      { pos: 2 / 4, vel: 0.92 },
      { pos: 3 / 4, vel: 0.90 },
    ],
  },
  {
    id: "backbeat_2_4",
    title: "Backbeat",
    feel: "4/4",
    hits: [
      // условно “kick” на 1 и 3 (сильнее), “snare” на 2 и 4 (акцентнее)
      { pos: 0 / 4, vel: 0.90 },
      { pos: 1 / 4, vel: 0.98 }, // акцент
      { pos: 2 / 4, vel: 0.88 },
      { pos: 3 / 4, vel: 0.98 }, // акцент
    ],
  },
  {
    id: "eight_drive",
    title: "8ths",
    feel: "4/4",
    hits: [
      { pos: 0 / 8, vel: 0.92 },
      { pos: 1 / 8, vel: 0.55 },
      { pos: 2 / 8, vel: 0.75 },
      { pos: 3 / 8, vel: 0.55 },
      { pos: 4 / 8, vel: 0.86 },
      { pos: 5 / 8, vel: 0.55 },
      { pos: 6 / 8, vel: 0.75 },
      { pos: 7 / 8, vel: 0.55 },
    ],
  },
  {
    id: "syncopation_a",
    title: "Sync A",
    feel: "4/4",
    hits: [
      { pos: 0 / 16, vel: 0.92 },
      { pos: 3 / 16, vel: 0.60 },
      { pos: 4 / 16, vel: 0.95 }, // акцент
      { pos: 7 / 16, vel: 0.60 },
      { pos: 8 / 16, vel: 0.86 },
      { pos: 10 / 16, vel: 0.65 },
      { pos: 12 / 16, vel: 0.92 },
      { pos: 15 / 16, vel: 0.58 },
    ],
  },
  {
    id: "tresillo",
    title: "Tresillo",
    feel: "4/4",
    hits: [
      // классический 3-3-2 (в восьмых): 0, 3/8, 6/8
      { pos: 0 / 8, vel: 0.98 }, // акцент
      { pos: 3 / 8, vel: 0.90 },
      { pos: 6 / 8, vel: 0.92 },
    ],
  },
  {
    id: "six_eight_roll",
    title: "6/8",
    feel: "6/8",
    hits: [
      // 6/8: 1 (акцент), 4 (акцент)
      { pos: 0 / 6, vel: 0.98 },
      { pos: 1 / 6, vel: 0.55 },
      { pos: 2 / 6, vel: 0.60 },
      { pos: 3 / 6, vel: 0.92 },
      { pos: 4 / 6, vel: 0.55 },
      { pos: 5 / 6, vel: 0.60 },
    ],
  },
];
