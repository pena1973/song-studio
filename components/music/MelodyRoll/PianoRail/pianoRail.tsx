
//components/music/MelodyRoll/PianoRail/pianoRail.tsx
"use client";

import React, { useMemo } from "react";
import styles from "./pianoRail.module.scss";

export default function PianoRail(props: {
  height: number;
  rows?: number;        // по умолчанию 24 (2 октавы)
  keyW?: number; // ✅ ширина rail
  basePc?: number;      // 0=C (по умолчанию), если захочешь сместить
  labelMode?: "none" | "octave"; // подписи
}) {
  const { height, rows = 24, keyW, basePc = 0, labelMode = "octave" } = props;

  const rowH = Math.max(10, Math.floor(height / rows));

  // C C# D D# E F F# G G# A A# B
  const isBlack = useMemo(
    () => [false, true, false, true, false, false, true, false, true, false, true, false],
    []
  );

  return (
    // <div className={styles.pianoRail} style={{ height, ["--rowH" as any]: `${rowH}px` }}>
      <div
    className={styles.pianoRail}
    style={{
      height,
      width:10,
      flex: `0 0 ${keyW ?? 10}px`,
      ["--rowH" as any]: `${rowH}px`,
    }}
  >
      {/* тонкая линия между октавами */}
      <div className={styles.octaveDivider} style={{ top: height - 12 * rowH }} />

      {Array.from({ length: rows }).map((_, r) => {
        // row=0 снизу. Для визуала: снизу → вверх.
        const rowFromBottom = r;
        const top = (rows - 1 - rowFromBottom) * rowH;

        const pc = (basePc + rowFromBottom) % 12;
        const black = isBlack[pc];

        const showOctLabel =
          labelMode === "octave" && (rowFromBottom === 0 || rowFromBottom === 12);

        return (
          <div
            key={r}
            className={`${styles.key} ${black ? styles.black : styles.white}`}
            style={{ top, height: rowH }}
            
            title={black ? "black key" : "white key"}
          >
            {showOctLabel && <span className={styles.octLabel}>{rowFromBottom === 0 ? "1" : "2"}</span>}
          </div>
        );
      })}
    </div>
  );
}
