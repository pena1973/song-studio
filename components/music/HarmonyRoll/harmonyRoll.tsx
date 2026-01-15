
//components/music/HarmonyRoll/harmonyRoll.tsx
"use client";

import React, { useMemo, useRef, useState, useCallback, useLayoutEffect, useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./harmonyRoll.module.scss"; // или твой общий scss



type DragPayload =
  | { kind: "palette"; accord: Accord }
  | { kind: "placed"; id: string };

function isPlaced(p: DragPayload): p is { kind: "placed"; id: string } {
  return p.kind === "placed";
}
function isPalette(p: DragPayload): p is { kind: "palette"; accord: Accord } {
  return p.kind === "palette";
}

// ====== types ======
export type RollNote = { row: number; dur: number; step: number; bar: number; label?: string };

export type Accord = { title: string; notes: RollNote[] };

export type RollHarmony = {
  id: string;
  bar: number;   // 1..bars
  step: number;  // 0..sub-1
  dur: number;   // в шагах
  accord: Accord;
};


// ===== helpers =====
function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function makeId() {
  return Math.random().toString(16).slice(2);
}

export default function HarmonyRoll(props: {
  bars: number;
  barW: number;
  sub: number;          // шагов в такте (например 16)
  height: number;
  keyName?: string;     // "C", "Am" и т.п. (пока для подписи)
  palette?: Accord[];   // список аккордов для тональности
  initial?: RollHarmony[];
  onChange?: (h: RollHarmony[]) => void;
  onPlayChord?: (accord: Accord) => void; // заглушка (потом Tone.js)
  paletteAnchorRef: React.RefObject<HTMLElement|null>;
}) {
  const {
    bars,
    barW,
    sub,
    height,
    keyName = "C",
    palette,
    initial = [],
    onChange,
    onPlayChord,
    paletteAnchorRef
  } = props;

  const pxPerStep = barW / sub;

  // дефолтная палитра (если не передали)
  const defaultPalette: Accord[] = useMemo(
    () => [
      { title: "C", notes: [] },
      { title: "Dm", notes: [] },
      { title: "Em", notes: [] },
      { title: "F", notes: [] },
      { title: "G", notes: [] },
      { title: "Am", notes: [] },
      { title: "Bdim", notes: [] },
    ],
    []
  );

  const paletteAccords = palette ?? defaultPalette;

  const [harmony, setHarmony] = useState<RollHarmony[]>(initial);

  const hostRef = useRef<HTMLDivElement | null>(null);

  const rootRef = useRef<HTMLDivElement | null>(null);

  const dragRef = useRef<{
    payload: DragPayload;
    pointerId: number;
    startX: number;
    startY: number;
    offsetFromCenterX: number; // <-- ключ
    ghostW: number;
    started: boolean;
  } | null>(null);

  const [dragGhost, setDragGhost] = useState<{
    show: boolean;
    x: number;
    y: number;
    title: string;
    width: number;
  }>({ show: false, x: 0, y: 0, title: "", width: 60 });

  const [palPos, setPalPos] = useState<{ left: number; top: number; ready: boolean }>(
    { left: 0, top: 0, ready: false }
  );

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalW = bars * barW;

  const STEP_SHIFT = 2; // твой стабильный сдвиг сетки


  useLayoutEffect(() => {
  let raf = 0;

  const OFFSET_X = 190;
  const OFFSET_Y = 540;

  const computeAndSet = () => {
    const el = paletteAnchorRef?.current;
    if (!el) return false;

    const r = el.getBoundingClientRect();

    setPalPos(prev => ({
      left: r.left + OFFSET_X,
      top: r.top + OFFSET_Y,
      ready: true
    }));

    return true;
  };

  // 1) первая попытка сразу
  computeAndSet();

  // 2) если якоря ещё нет (часто при ресайзе/перестроении layout),
  //    попробуем несколько кадров подряд, пока он появится
  let tries = 0;
  const retry = () => {
    tries++;
    const ok = computeAndSet();
    if (!ok && tries < 30) {        // ~0.5 сек при 60fps
      raf = requestAnimationFrame(retry);
    }
  };
  raf = requestAnimationFrame(retry);

  // 3) на scroll/resize пересчитываем (и ВСЕГДА с OFFSET)
  const updateOnEvent = () => {
    // маленький троттлинг через rAF чтобы не дергать setState 200 раз
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      computeAndSet();
    });
  };

  window.addEventListener("scroll", updateOnEvent, true);
  window.addEventListener("resize", updateOnEvent);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("scroll", updateOnEvent, true);
    window.removeEventListener("resize", updateOnEvent);
  };
}, [paletteAnchorRef]);

  const commit = useCallback(
    (next: RollHarmony[]) => {
      setHarmony(next);
      onChange?.(next);
    },
    [onChange]
  );

  const canvasXToGrid = useCallback(
    (canvasX: number) => {
      const x = clamp(canvasX, 0, totalW);

      const barIndex0 = clamp(Math.floor(x / barW), 0, bars - 1);
      const withinBar = x - barIndex0 * barW;

      const step = clamp(Math.round(withinBar / pxPerStep), 0, sub - 1);
      return { bar: barIndex0 + 1, step };
    },
    [bars, barW, pxPerStep, sub, totalW]
  );

  const startDragPalette = (e: React.PointerEvent, accord: Accord) => {
    const root = rootRef.current;
    if (!root) return;

    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();

    // где схватили внутри элемента
    const offsetX = e.clientX - rect.left;
    const ghostW = rect.width;

    // offset от центра (чтобы под курсором оставалась та же точка)
    const offsetFromCenterX = offsetX - ghostW / 2;

    root.setPointerCapture(e.pointerId);

    dragRef.current = {
      payload: { kind: "palette", accord },
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      offsetFromCenterX,
      ghostW,
      started: false,
    };

    setDragGhost((s) => ({
      ...s,
      show: false,
      title: accord.title,
      width: ghostW,
    }));
  };

  const startDragPlaced = (e: React.PointerEvent, id: string, title: string) => {
    const root = rootRef.current;
    if (!root) return;

    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();

    const ghostW = rect.width;
    const offsetX = e.clientX - rect.left;
    const offsetFromCenterX = offsetX - ghostW / 2;

    root.setPointerCapture(e.pointerId);

    dragRef.current = {
      payload: { kind: "placed", id },
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      offsetFromCenterX,
      ghostW,
      started: false,
    };

    setDragGhost((s) => ({ ...s, show: false, title, width: ghostW }));
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    if (e.pointerId !== d.pointerId) return;

    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    const dist = Math.hypot(dx, dy);

    if (!d.started && dist < 3) return;

    if (!d.started) {
      d.started = true;
      setDragGhost((s) => ({ ...s, show: true }));
    }

    const gx = e.clientX - d.offsetFromCenterX; // <-- ключ
    setDragGhost((s) => ({ ...s, x: gx, y: e.clientY }));
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    if (e.pointerId !== d.pointerId) return;

    const payload = d.payload;

    if (!d.started) {
      // — это dblclick
      if (e.detail >= 2) { // второй клик 
        dragRef.current = null;
        setDragGhost((s) => ({ ...s, show: false }));
        return;
      }

      // это клик
      if (isPalette(payload)) onPlayChord?.(payload.accord);
      if (isPlaced(payload)) {
        const cur = harmony.find((h) => h.id === payload.id);
        if (cur) onPlayChord?.(cur.accord);
      }
      dragRef.current = null;
      setDragGhost((s) => ({ ...s, show: false }));
      return;
    }

    finishDrop(e.clientX, e.clientY);
  };

  const finishDrop = (clientX: number, clientY: number) => {

    const d = dragRef.current;
    dragRef.current = null;
    setDragGhost((s) => ({ ...s, show: false }));
    if (!d) return;

    const host = hostRef.current;
    if (!host) return;

    const rect = host.getBoundingClientRect();
    const isInside =
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom;

    if (!isInside) return;

    // центр элемента в координатах струны (canvas)
    const centerClientX = clientX - d.offsetFromCenterX;
    const centerCanvasX = (centerClientX - rect.left) + host.scrollLeft;

    // const { bar, step } = canvasXToGrid(centerCanvasX);
    const { bar, step: stepRaw } = canvasXToGrid(centerCanvasX);
    // единоразовая компенсация сдвига сетки
    const step = clamp(stepRaw - STEP_SHIFT, 0, sub - 1);

    const payload = d.payload;

    if (isPalette(payload)) {
      const newItem: RollHarmony = {
        id: makeId(),
        bar,
        step,
        dur: sub,
        accord: payload.accord,
      };
      commit([...harmony, newItem]);
      onPlayChord?.(payload.accord);
      return;
    }

    if (isPlaced(payload)) {
      const next = harmony.map((h) =>
        h.id === payload.id ? { ...h, bar, step } : h
      );
      commit(next);

      const moved = next.find((x) => x.id === payload.id);
      if (moved) onPlayChord?.(moved.accord);
    }
  };

  const removePlaced = (id: string) => {
    commit(harmony.filter((h) => h.id !== id));
  };

  // const paletteNode = (
  //   <div
  //     className={styles.paletteFloating}
  //     style={{
  //       position: "fixed",
  //       left: palPos.left,
  //       top: palPos.top,
  //       zIndex: 9999,
  //       opacity: palPos.ready ? 1 : 0,
  //       pointerEvents: palPos.ready ? "auto" : "none",
  //     }}

  //     onContextMenu={(e) => e.preventDefault()}
  //   >
  //     <div className={styles.paletteRow}>
  //       {paletteAccords.map((a) => (
  //         <div
  //           key={a.title}
  //           className={styles.paletteBall}
  //           onPointerDown={(e) => startDragPalette(e, a)}
  //         >
  //           {a.title}
  //         </div>
  //       ))}
  //     </div>
  //   </div>
  // );
 
  const HOST_H = 64;

  const paletteNode = (
    <div className={styles.palette} 
    style={{
       position: "fixed", 
       left: palPos.left,
       top: palPos.top, 
       zIndex: 99999, 
        height: height - HOST_H
     }}
    >
        <div className={styles.paletteRow}>
          {paletteAccords.map((a) => (
            <div
              key={a.title}
              className={styles.paletteBall}
              onPointerDown={(e) => startDragPalette(e, a)}
            >
              {a.title}
            </div>
          ))}
        </div>
      </div>    
  );

  const paletteRendered =
    mounted && typeof document !== "undefined"
      ? createPortal(paletteNode, document.body)
      : null;

  return (
    <div
      ref={rootRef}
      className={styles.root}
      style={{ height }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}

    >
      <div className={styles.harmonyWrap}>
        <div
          ref={hostRef}
          className={styles.stringHost}
          style={{ height: HOST_H }}
        >
          <div className={styles.stringCanvas} style={{ width: totalW }}>
            <div className={styles.stringLine} />

            {harmony.map((h) => {
              const cx = (h.bar - 1) * barW + h.step * pxPerStep;
              return (

                <div
                  key={h.id}
                  className={styles.chordBall}
                  style={{ left: cx }}
                  onPointerDown={(e) => startDragPlaced(e, h.id, h.accord.title)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removePlaced(h.id);
                  }}
                >
                  {h.accord.title}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ВОТ ТУТ */}
      {paletteRendered}

      {dragGhost.show && (
        <div
          className={styles.ghost}
          style={{ left: dragGhost.x, top: dragGhost.y, width: dragGhost.width }}
        >
          {dragGhost.title}
        </div>
      )}
    </div>
  );



}
