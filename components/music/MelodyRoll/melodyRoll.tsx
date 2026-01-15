
//components/music/MelodyRoll/melodyRoll.tsx

"use client";

import React, { useEffect, useMemo, useRef, useState, useLayoutEffect } from "react";
import styles from "./melodyRoll.module.scss";
import { createPortal } from "react-dom";

import PianoRail from "@/components/music/MelodyRoll/PianoRail/pianoRail";

export type RollNote = {
    bar: number; // 1..bars
    step: number; // 0..sub-1
    dur: number; // steps
    row: number; // 0..rows-1 (0 = низ)
    label?: string;
};

type DragMode = "move" | "resizeL" | "resizeR";

type DragState = {
    id: number; // index in array
    mode: DragMode;
    startClientX: number;
    startClientY: number;

    startAbsStep: number; // note start in absolute steps
    startDur: number;
    startRow: number;
};

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

function absStepFrom(n: RollNote, sub: number) {
    return (n.bar - 1) * sub + n.step;
}
function toBarStep(abs: number, sub: number) {
    const bar = Math.floor(abs / sub) + 1;
    const step = abs % sub;
    return { bar, step };
}

const START_NOTES: RollNote[] = [
    { bar: 3, step: 2, dur: 2, row: 1, label: "61" },
    { bar: 3, step: 4, dur: 2, row: 3, label: "63" },
    { bar: 3, step: 6, dur: 2, row: 6, label: "66" },
    { bar: 3, step: 8, dur: 2, row: 8, label: "68" },
    { bar: 3, step: 10, dur: 2, row: 10, label: "70" },

    { bar: 4, step: 6, dur: 3, row: 6, label: "66" },
    { bar: 4, step: 10, dur: 3, row: 3, label: "63" },

    { bar: 5, step: 4, dur: 10, row: 8, label: "68" },

    { bar: 6, step: 0, dur: 2, row: 1, label: "61" },
    { bar: 6, step: 0, dur: 2, row: 3, label: "63" },
    { bar: 6, step: 0, dur: 2, row: 6, label: "66" },
    { bar: 6, step: 0, dur: 2, row: 8, label: "68" },
    { bar: 6, step: 0, dur: 2, row: 10, label: "70" },

    { bar: 6, step: 2, dur: 8, row: 8, label: "68" },
    { bar: 6, step: 2, dur: 10, row: 6, label: "66" },
];

export default function MelodyRoll(props: {
    bars: number;
    barW: number;
    sub: number;
    height: number;
    paletteAnchorRef: React.RefObject<HTMLElement | null>;
}) {
    const { bars, barW, sub, height, paletteAnchorRef } = props;

    // ✅ две октавы = 24 полутона
    const rows = 24;
    const rowH = Math.max(10, Math.floor(height / rows));
    const pxPerStep = barW / sub;
    const totalSteps = bars * sub;

    const hostRef = useRef<HTMLDivElement | null>(null);

    const [notes, setNotes] = useState<RollNote[]>(START_NOTES);
    const [selected, setSelected] = useState<number | null>(null);

    const dragRef = useRef<DragState | null>(null);

    const [palPos, setPalPos] = useState<{ left: number; top: number; ready: boolean }>(
        { left: 0, top: 0, ready: false }
    );
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useLayoutEffect(() => {
        let raf = 0;

        const OFFSET_X = 180;
        const OFFSET_Y = 125;

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


    function deleteNote(idx: number) {
        setNotes(prev => prev.filter((_, i) => i !== idx));
        setSelected(prev => (prev === idx ? null : prev !== null && prev > idx ? prev - 1 : prev));
    }

    // ✅ Delete / Backspace удаляют выделенную ноту
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (selected === null) return;
            if (e.key === "Delete" || e.key === "Backspace") {
                e.preventDefault();
                deleteNote(selected);
            }
            if (e.key === "Escape") {
                setSelected(null);
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [selected]);

    function pointerDownNote(e: React.PointerEvent, idx: number, mode: DragMode) {
        e.preventDefault();
        e.stopPropagation();

        const n = notes[idx];
        setSelected(idx);

        const st: DragState = {
            id: idx,
            mode,
            startClientX: e.clientX,
            startClientY: e.clientY,
            startAbsStep: absStepFrom(n, sub),
            startDur: n.dur,
            startRow: n.row,
        };

        dragRef.current = st;
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }

    function pointerMove(e: React.PointerEvent) {
        const st = dragRef.current;
        if (!st) return;

        const dx = e.clientX - st.startClientX;
        const dy = e.clientY - st.startClientY;

        const dSteps = Math.round(dx / pxPerStep);
        const dRows = -Math.round(dy / rowH); // вверх = +row

        setNotes(prev => {
            const cur = prev[st.id];
            if (!cur) return prev;

            const curStart = st.startAbsStep;
            const curDur = st.startDur;

            let newStart = curStart;
            let newDur = curDur;

            if (st.mode === "move") {
                newStart = clamp(curStart + dSteps, 0, totalSteps - 1);
            } else if (st.mode === "resizeL") {
                // двигаем левую границу, правая остаётся
                const right = curStart + curDur;
                newStart = clamp(curStart + dSteps, 0, right - 1);
                newDur = clamp(right - newStart, 1, totalSteps);
            } else if (st.mode === "resizeR") {
                // двигаем правую границу, левая остаётся
                const right = clamp(curStart + curDur + dSteps, curStart + 1, totalSteps);
                newDur = clamp(right - curStart, 1, totalSteps);
            }

            // ограничим, чтобы нота не вылезала
            if (newStart + newDur > totalSteps) {
                newDur = Math.max(1, totalSteps - newStart);
            }

            const { bar, step } = toBarStep(newStart, sub);
            const newRow = clamp(st.startRow + dRows, 0, rows - 1);

            const next = [...prev];
            next[st.id] = { ...cur, bar, step, dur: newDur, row: newRow };
            return next;
        });
    }

    function pointerUp(e: React.PointerEvent) {
        const st = dragRef.current;
        if (!st) return;

        dragRef.current = null;

        setNotes(prev => {
            const cur = prev[st.id];
            if (!cur) return prev;

            // финальный snap (вдруг где-то накопилась погрешность)
            const abs = clamp(absStepFrom(cur, sub), 0, totalSteps - 1);
            const { bar, step } = toBarStep(abs, sub);

            const dur = clamp(Math.round(cur.dur), 1, totalSteps - abs);
            const row = clamp(Math.round(cur.row), 0, rows - 1);

            const next = [...prev];
            next[st.id] = { ...cur, bar, step, dur, row };
            return next;
        });

        try {
            (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
        } catch { }
    }


    function onHostPointerDown() {
        setSelected(null);
    }
    const paletteNode = (
        <div className={styles.palette}
            style={{
                position: "fixed",
                left: palPos.left-1,
                top: palPos.top,
                zIndex: 1,
                height: height,
                // border: "1px solid rgba(5, 5, 5, 0.8)"
                // outline: "1px solid rgba(0, 0, 0, 0.25)"
                borderLeft: "1px solid rgba(0, 0, 0, 0.25)",

            }}
        >
            <div className={styles.paletteRow}
                style={{
                    // background:"red", 
                    width: 10, height: 360
                }}>
                <PianoRail height={height} rows={24} keyW={pxPerStep} />
            </div>
        </div>
    );
    const paletteRendered =
        mounted && typeof document !== "undefined"
            ? createPortal(paletteNode, document.body)
            : null;
    return (
        <div
            ref={hostRef}
            className={styles.melodyRoll}
            style={{ height, ["--rowH" as any]: `${rowH}px` }}   // ✅ добавили
            onPointerDown={onHostPointerDown}
            onPointerMove={pointerMove}
            onPointerUp={pointerUp}
        >

            {/* горизонтальная сетка */}
            <div className={styles.melodyGrid} />

            {/* ✅ линии октав */}
            {/* ✅ тонкая линия между октавами (между 12 и 13 рядом) */}
            <div
                className={styles.octaveDivider}
                style={{ top: height - 12 * rowH }}
                aria-hidden
            />



            {/* ноты */}
            {notes.map((n, i) => {
                const left = (n.bar - 1) * barW + n.step * pxPerStep;
                const width = Math.max(10, n.dur * pxPerStep - 2);
                const top = height - (n.row + 1) * rowH; // 0 = низ

                const isSel = selected === i;

                return (
                    <div
                        key={i}
                        className={`${styles.melodyNote} ${isSel ? styles.selected : ""}`}
                        style={{
                            left,
                            top,
                            width,
                            height: Math.max(14, rowH - 3),
                        }}
                        title={n.label ?? ""}
                        onPointerDown={(e) => pointerDownNote(e, i, "move")}
                        onDoubleClick={() => deleteNote(i)}
                        onContextMenu={(e) => {
                            e.preventDefault();
                            deleteNote(i);
                        }}
                    >
                        {/* ручка ресайза слева */}
                        <div
                            className={`${styles.resizeHandle} ${styles.left}`}
                            onPointerDown={(e) => pointerDownNote(e, i, "resizeL")}
                            title="Тянуть — изменить начало"
                        />
                        {/* ручка ресайза справа */}
                        <div
                            className={`${styles.resizeHandle} ${styles.right}`}
                            onPointerDown={(e) => pointerDownNote(e, i, "resizeR")}
                            title="Тянуть — изменить конец"
                        />

                        <span className={styles.melodyNoteLabel}>{n.label}</span>
                    </div>
                );
            })}
            {/* ВОТ ТУТ */}
            {paletteRendered}
        </div>
    );
}
