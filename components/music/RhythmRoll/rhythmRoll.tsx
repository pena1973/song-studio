//components/music/RhythmRoll/rhythmRoll.tsx

"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./rhythmRoll.module.scss";

import { RHYTHM_PATTERNS, type RhythmPattern } from "@/lib/music/rhythmPatterns";

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function makeId() {
  return Math.random().toString(16).slice(2);
}

export type RhythmHit = {
  id: string;
  bar: number;   // 1..bars
  step: number;  // 0..sub-1
  vel: number;   // 0..1
  muted: boolean;
};

function stepKey(bar: number, step: number) {
  return `${bar}:${step}`;
}

function patternToHitsForBar(pattern: RhythmPattern, bar: number, sub: number): RhythmHit[] {
  const hits: RhythmHit[] = [];

  for (const h of pattern.hits) {
    const step = clamp(Math.round(h.pos * sub), 0, sub - 1);
    hits.push({
      id: makeId(),
      bar,
      step,
      vel: clamp(h.vel, 0, 1),
      muted: false,
    });
  }

  // если в паттерне попались дубликаты шага — сольём (оставим самый сильный)
  const bestByStep = new Map<number, RhythmHit>();
  for (const x of hits) {
    const prev = bestByStep.get(x.step);
    if (!prev || x.vel > prev.vel) bestByStep.set(x.step, x);
  }

  return Array.from(bestByStep.values()).sort((a, b) => a.step - b.step);
}

function buildTrack(bars: number, sub: number, pattern: RhythmPattern): RhythmHit[] {
  const out: RhythmHit[] = [];
  for (let bar = 1; bar <= bars; bar++) {
    out.push(...patternToHitsForBar(pattern, bar, sub));
  }
  return out;
}

export default function RhythmRoll(props: {
  bars: number;
  barW: number;
  sub: number;       // шагов в такте (например 16)
  height: number;

  /** библиотека паттернов (если не передали — RHYTHM_PATTERNS) */
  patterns?: RhythmPattern[];

  /** выбранный паттерн извне (из левой колонки) */
  patternId?: string;

  /** fallback если patternId не передали */
  defaultPatternId?: string;

  /** стартовое состояние (если хочешь восстановить из проекта) */
  initial?: RhythmHit[];

  /** отдаём текущее состояние дорожки */
  onChange?: (hits: RhythmHit[], meta: { patternId: string }) => void;

  /** дернуть звук по клику (потом Tone.js) */
  onPlayHit?: (hit: RhythmHit) => void;
}) {
  const {
    bars,
    barW,
    sub,
    height,
    patterns,
    patternId,
    defaultPatternId = "four_on_the_floor",
    initial,
    onChange,
    onPlayHit,
  } = props;

  const pxPerStep = barW / sub;
  const totalW = bars * barW;
  const HOST_H = 64;

  const patternList = patterns ?? RHYTHM_PATTERNS;

  // выберем активный patternId: внешний -> default -> первый
  const activePatternId = useMemo(() => {
    const wanted = patternId ?? defaultPatternId;
    const exists = patternList.some(p => p.id === wanted);
    return exists ? wanted : (patternList[0]?.id ?? wanted);
  }, [patternId, defaultPatternId, patternList]);

  const curPattern = useMemo(() => {
    return patternList.find(p => p.id === activePatternId) ?? patternList[0];
  }, [activePatternId, patternList]);

  const [track, setTrack] = useState<RhythmHit[]>(() => {
    // если initial есть — используем как старт
    if (initial && initial.length) return initial;
    return buildTrack(bars, sub, curPattern);
  });

  // карта muted, чтобы сохранять при изменениях bars/sub и при перестройках
  const mutedMapRef = useRef<Map<string, boolean>>(new Map());
  useEffect(() => {
    const m = new Map<string, boolean>();
    for (const h of track) m.set(stepKey(h.bar, h.step), h.muted);
    mutedMapRef.current = m;
  }, [track]);

  const commit = useCallback(
    (next: RhythmHit[]) => {
      setTrack(next);
      onChange?.(next, { patternId: activePatternId });
    },
    [onChange, activePatternId]
  );

  // ВАЖНО: пересборка при:
  // - смене bars/sub
  // - смене выбранного patternId извне
  useEffect(() => {
    const base = buildTrack(bars, sub, curPattern);

    const mm = mutedMapRef.current;
    const next = base.map(h => {
      const k = stepKey(h.bar, h.step);
      const muted = mm.get(k) ?? false;
      return { ...h, muted };
    });

    commit(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bars, sub, activePatternId]);

  const toggleMute = (id: string) => {
    const next = track.map(h => (h.id === id ? { ...h, muted: !h.muted } : h));
    commit(next);

    const hit = next.find(x => x.id === id);
    if (hit && !hit.muted) onPlayHit?.(hit);
  };

  return (
    <div className={styles.root} style={{ height }}>
      <div className={styles.rhythmWrap}>
        <div className={styles.stringHost} style={{ height: HOST_H }}>
          <div className={styles.stringCanvas} style={{ width: totalW }}>
            <div className={styles.stringLine} />

            {track.map((h) => {
              const cx = (h.bar - 1) * barW + h.step * pxPerStep;
              const isAccent = h.vel >= 0.85;

              const cls = [
                styles.hitBall,
                isAccent ? styles.hitAccent : "",
                h.muted ? styles.hitMuted : "",
              ].join(" ");

              return (
                <div
                  key={h.id}
                  className={cls}
                  style={{ left: cx }}
                  onClick={() => toggleMute(h.id)}
                  role="button"
                  tabIndex={0}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
