// pages/music.tsx
"use client";

import Layout from "@/components/Layout/layout";
import { useTranslation } from "react-i18next";
import HarmonyRoll from "@/components/music/HarmonyRoll/harmonyRoll";
import RhythmRoll from "@/components/music/RhythmRoll/rhythmRoll";
import MelodyRoll from "@/components/music/MelodyRoll/melodyRoll";


import { RHYTHM_PATTERNS } from "@/lib/music/rhythmPatterns";

import React, { useMemo, useState, useRef } from "react";
import type { NextPage } from "next";
import styles from "@/styles/pages/music.module.scss";


type TimeSig = { beats: 2 | 3 | 4; beatUnit: 4 };

// 16-е доли: 4 подпульса на четверть
function getSubdivisionsPerBar(ts: TimeSig) {
    // для 2/4, 3/4, 4/4: beats * 4 => 8 / 12 / 16
    return ts.beats * 4;
}

function SpeakerIcon({ muted }: { muted: boolean }) {
    // простые SVG-иконки без библиотек
    if (!muted) {
        return (
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path
                    d="M11 5 6.5 9H3v6h3.5L11 19V5z"
                    fill="currentColor"
                />
                <path
                    d="M14.5 8.5a5 5 0 0 1 0 7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
                <path
                    d="M16.8 6.2a8 8 0 0 1 0 11.6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    opacity="0.8"
                />
            </svg>
        );
    }

    return (
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M11 5 6.5 9H3v6h3.5L11 19V5z" fill="currentColor" />
            <path
                d="M16 9l5 5M21 9l-5 5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
}

const MusicPage: NextPage = () => {
    const { t } = useTranslation("common");
    // якорь для инструментов редактирования акордов
    const PaletteAnchorRef = useRef<HTMLDivElement | null>(null);

    // состояние
    const [tempo, setTempo] = useState<number>(120);
    const [bars, setBars] = useState<number>(16);

    const [melodyInstrument, setMelodyInstrument] = useState<string>("Piano");
    const [harmonyInstrument, setHarmonyInstrument] = useState<string>("Ambient");

    // ✅ выбранный паттерн — это id из RHYTHM_PATTERNS
    const [rhythmId, setRhythmId] = useState<string>(RHYTHM_PATTERNS[0]?.id ?? "four_on_the_floor");
    // const rhythm = useMemo(
    //     () => RHYTHM_PATTERNS.find(r => r.id === rhythmId) ?? RHYTHM_PATTERNS[0],
    //     [rhythmId]
    // );

    // ✅ размер такта теперь отдельный стейт (не из паттерна)
    const [timeSig, setTimeSig] = useState<TimeSig>({ beats: 4, beatUnit: 4 });

    const subdivisionsPerBar = useMemo(() => getSubdivisionsPerBar(timeSig), [timeSig]);

    const barNumbers = useMemo(
        () => Array.from({ length: bars }, (_, i) => i + 1),
        [bars]
    );

    // mute
    const [muteText, setMuteText] = useState(false);
    const [muteMelody, setMuteMelody] = useState(false);
    const [muteHarmony, setMuteHarmony] = useState(false);
    const [muteDrums, setMuteDrums] = useState(false);

    // заглушки действий
    const onPlay = () => { };
    const onStop = () => { };
    const onMetronome = () => { };
    const onUndo = () => { };
    const onRedo = () => { };
    const onQuantize = () => { };
    const onExportMidi = () => { };
    const onImportMidi = () => { };
    const onGenerateAI = () => { };
    const barW = 240;
    return (
        <Layout title={t("pages.music.title")}>
            <div className={styles.page}>
                {/* TOP TOOLBAR */}
                <div className={styles.topBar}>
                    <div className={styles.topBarLeft}>
                        <div className={styles.transport}>
                            <button className={styles.btn} onClick={onPlay} aria-label="Play">▶</button>
                            <button className={styles.btn} onClick={onStop} aria-label="Stop">■</button>
                            <button className={styles.btn} onClick={onMetronome} aria-label="Metronome">⏱</button>
                        </div>

                        <div className={styles.divider} />

                        <div className={styles.actions}>
                            <button className={styles.btnGhost} onClick={onUndo}>Undo</button>
                            <button className={styles.btnGhost} onClick={onRedo}>Redo</button>
                            <button className={styles.btnGhost} onClick={onQuantize}>Quantize</button>
                        </div>

                        <div className={styles.divider} />

                        <div className={styles.aiBlock}>
                            <button className={styles.btnPrimary} onClick={onGenerateAI}>
                                AI Generate
                            </button>
                            <span className={styles.hint}>Заглушка генерации</span>
                        </div>
                    </div>

                    <div className={styles.topBarRight}>
                        <div className={styles.field}>
                            <span className={styles.label}>Tempo</span>
                            <input
                                className={styles.input}
                                type="number"
                                min={30}
                                max={260}
                                value={tempo}
                                onChange={(e) => setTempo(Number(e.target.value || 0))}
                            />
                            <span className={styles.unit}>BPM</span>
                        </div>

                        <div className={styles.field}>
                            <span className={styles.label}>Bars</span>
                            <input
                                className={styles.input}
                                type="number"
                                min={1}
                                max={256}
                                value={bars}
                                onChange={(e) => setBars(Math.max(1, Number(e.target.value || 1)))}
                            />
                        </div>

                        <div className={styles.field}>
                            <span className={styles.label}>Rhythm</span>
                            <select
                                className={styles.selectTop}
                                value={rhythmId}
                                onChange={(e) => setRhythmId(e.target.value)}
                            >
                                {RHYTHM_PATTERNS.map(r => (
                                    <option key={r.id} value={r.id}>
                                        {r.title}
                                    </option>
                                ))}
                            </select>
                            <span className={styles.unit}>
                                {timeSig.beats}/{timeSig.beatUnit} • {subdivisionsPerBar} долей
                            </span>

                            <span className={styles.unit}>
                                {timeSig.beats}/{timeSig.beatUnit} • {subdivisionsPerBar} долей
                            </span>
                        </div>

                        <div className={styles.divider} />

                        <button className={styles.btnGhost} onClick={onImportMidi}>Import MIDI</button>
                        <button className={styles.btnGhost} onClick={onExportMidi}>Export MIDI</button>
                    </div>
                </div>

                {/* === MAIN TIMELINE AREA (занимает остаток высоты) === */}
                <div className={styles.timelineWrap}>
                    {/* LEFT: треки */}
                    <div className={styles.leftCol}>
                        <div ref={PaletteAnchorRef} className={styles.paletteAnchor} />
                        <div className={styles.leftHeader}>
                            <div className={styles.timelineTitle}>Timeline</div>
                        </div>

                        {/* TEXT */}
                        <div className={styles.trackLabel} style={{ ["--h" as any]: "90px" }}>
                            <div className={styles.trackTop}>
                                <div className={styles.trackName}>Текст</div>
                                <button
                                    className={styles.muteBtn}
                                    onClick={() => setMuteText(v => !v)}
                                    aria-label={muteText ? "Unmute text" : "Mute text"}
                                    title={muteText ? "Unmute" : "Mute"}
                                    data-muted={muteText ? "1" : "0"}
                                >
                                    <SpeakerIcon muted={muteText} />
                                </button>
                            </div>

                            <div className={styles.trackToolsInline}>
                                <button className={styles.btnSmallGhost}>Auto-syllables</button>
                            </div>
                        </div>

                        {/* MELODY */}
                        <div className={styles.trackLabel} style={{ ["--h" as any]: "360px" }}>
                            <div className={styles.trackTop}>
                                <div className={styles.trackName}>Мелодия</div>
                                <button
                                    className={styles.muteBtn}
                                    onClick={() => setMuteMelody(v => !v)}
                                    aria-label={muteMelody ? "Unmute melody" : "Mute melody"}
                                    title={muteMelody ? "Unmute" : "Mute"}
                                    data-muted={muteMelody ? "1" : "0"}
                                >
                                    <SpeakerIcon muted={muteMelody} />
                                </button>
                            </div>

                            <div className={styles.selectBlock}>
                                <div className={styles.selectLabel}>Инструмент</div>
                                <select
                                    className={styles.select}
                                    value={melodyInstrument}
                                    onChange={(e) => setMelodyInstrument(e.target.value)}
                                >
                                    <option>Piano</option>
                                    <option>Soft Pad</option>
                                    <option>Pluck</option>
                                    <option>String Ensemble</option>
                                    <option>Flute</option>
                                </select>
                            </div>

                            <div className={styles.trackToolsInline}>
                                <button className={styles.btnSmallGhost}>Erase</button>
                            </div>
                        </div>

                        {/* HARMONY */}
                        <div className={styles.trackLabel} style={{ ["--h" as any]: "120px" }}>
                            <div className={styles.trackTop}>
                                <div className={styles.trackName}>Гармония / Аккорды</div>
                                <button
                                    className={styles.muteBtn}
                                    onClick={() => setMuteHarmony(v => !v)}
                                    aria-label={muteHarmony ? "Unmute harmony" : "Mute harmony"}
                                    title={muteHarmony ? "Unmute" : "Mute"}
                                    data-muted={muteHarmony ? "1" : "0"}
                                >
                                    <SpeakerIcon muted={muteHarmony} />
                                </button>
                            </div>

                            <div className={styles.selectBlock}>
                                <div className={styles.selectLabel}>Инструмент</div>
                                <select
                                    className={styles.select}
                                    value={harmonyInstrument}
                                    onChange={(e) => setHarmonyInstrument(e.target.value)}
                                >
                                    <option>Ambient</option>
                                    <option>Ocean</option>
                                    <option>Air</option>
                                    <option>Strings</option>
                                </select>
                            </div>
                        </div>

                        {/* DRUMS */}
                        <div className={styles.trackLabel} style={{ ["--h" as any]: "120px" }}>
                            <div className={styles.trackTop}>
                                <div className={styles.trackName}>Барабаны</div>
                                <button
                                    className={styles.muteBtn}
                                    onClick={() => setMuteDrums(v => !v)}
                                    aria-label={muteDrums ? "Unmute drums" : "Mute drums"}
                                    title={muteDrums ? "Unmute" : "Mute"}
                                    data-muted={muteDrums ? "1" : "0"}
                                >
                                    <SpeakerIcon muted={muteDrums} />
                                </button>
                            </div>

                            <div className={styles.selectBlock}>
                                <div className={styles.selectLabel}>Ритм-паттерн</div>
                                <select
                                    className={styles.selectTop}
                                    value={rhythmId}
                                    onChange={(e) => setRhythmId(e.target.value)}
                                >
                                    {RHYTHM_PATTERNS.map(r => (
                                        <option key={r.id} value={r.id}>
                                            {r.title}
                                        </option>
                                    ))}
                                </select>
                                {/* <span className={styles.unit}>
                                    {timeSig.beats}/{timeSig.beatUnit} • {subdivisionsPerBar} долей
                                </span> */}

                            </div>
                        </div>
                    </div>
                    {/* RIGHT: единая временная сетка + дорожки */}
                    <div
                        className={styles.timeCol}
                        style={
                            {
                                ["--bars" as any]: bars,
                                ["--sub" as any]: subdivisionsPerBar,   // 8/12/16
                                ["--barW" as any]: "240px",             // масштаб (потом сделаем zoom)
                            } as React.CSSProperties
                        }
                        onContextMenu={(e) => e.preventDefault()}
                    >
                        {/* ВАЖНО: весь контент и разметка внутри timeCanvas */}
                        <div className={styles.timeCanvas}>
                            {/* Верхняя шапка тактов */}
                            <div className={styles.timeHeader}>
                                {barNumbers.map((n) => (
                                    <div key={n} className={styles.barCell}>
                                        {n}
                                    </div>
                                ))}
                            </div>

                            {/* Дорожки в одной временной области */}
                            <div className={styles.trackRow} style={{ ["--h" as any]: "90px" }}>
                                <div className={styles.trackContent}>Заглушка: текст по долям</div>
                            </div>

                            <div className={styles.trackRow} style={{ ["--h" as any]: "360px" }}>
                                <div className={styles.trackContent}>
                                    <MelodyRoll 
                                    bars={bars} 
                                    barW={barW} 
                                    sub={subdivisionsPerBar} 
                                    height={360} 
                                    paletteAnchorRef={PaletteAnchorRef}/>
                                  
                                </div>
                            </div>

                            <div className={styles.trackRow} style={{ ["--h" as any]: "120px" }}>
                                <HarmonyRoll
                                    bars={bars}
                                    barW={barW}
                                    sub={subdivisionsPerBar}
                                    height={120}
                                    paletteAnchorRef={PaletteAnchorRef}
                                    keyName={"C"}
                                    onChange={(h) => console.log("harmony", h)}
                                    onPlayChord={(acc) => console.log("play", acc.title)}
                                />


                            </div>

                            <div className={styles.trackRow} style={{ ["--h" as any]: "120px" }}>
                                <RhythmRoll
                                    bars={bars}
                                    barW={barW}
                                    sub={subdivisionsPerBar}
                                    height={120}
                                    patternId={rhythmId}   // <-- выбор из селекта слева
                                    onChange={(hits, meta) => {
                                        // сохрани hits (и meta.patternId) в документ проекта
                                    }}
                                />

                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </Layout>
    );
};

export default MusicPage;


