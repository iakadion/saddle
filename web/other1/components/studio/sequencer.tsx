"use client";

/**
 * SEQUENCER — piano roll + drum grid rendered on canvas.
 * Horizontally scrollable: long songs (up to 128 bars) lay out fully instead
 * of being squashed — section shading every 2 bars mirrors the chained
 * variation structure. Playhead is driven by the audio clock via rAF.
 * @module components/studio/sequencer
 */

import { useEffect, useRef } from "react";
import { transport, useStudio } from "@/lib/studio-store";
import { NOTE_NAMES } from "@/lib/audio/dsp";

const LOW = 48;
const HIGH = 84;
const CELL_W = 12;
const LANES = ["kick", "snare", "hat", "clap"] as const;
const LANE_COLORS: Record<(typeof LANES)[number], string> = {
  kick: "#ff8a3d",
  snare: "#7dd6ff",
  hat: "#c8f94e",
  clap: "#ff6fb3",
};

export default function Sequencer() {
  const doc = useStudio((s) => s.doc);
  const toggleNote = useStudio((s) => s.toggleNote);
  const toggleDrum = useStudio((s) => s.toggleDrum);
  const rollRef = useRef<HTMLCanvasElement>(null);
  const drumRef = useRef<HTMLCanvasElement>(null);
  const docRef = useRef(doc);
  docRef.current = doc;

  useEffect(() => {
    let raf = 0;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      drawRoll(rollRef.current, docRef.current);
      drawDrums(drumRef.current, docRef.current);
    };
    draw();
    const onResize = () => {
      drawRoll(rollRef.current, docRef.current);
      drawDrums(drumRef.current, docRef.current);
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fit = (cv: HTMLCanvasElement | null, cssW: number, cssH: number) => {
    if (!cv) return null;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (cv.width !== Math.round(cssW * dpr) || cv.height !== Math.round(cssH * dpr)) {
      cv.width = Math.round(cssW * dpr);
      cv.height = Math.round(cssH * dpr);
      cv.style.width = `${cssW}px`;
      cv.style.height = `${cssH}px`;
    }
    const g = cv.getContext("2d");
    if (!g) return null;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { g, w: cssW, h: cssH };
  };

  function playheadX(totalSteps: number, cw: number, bpm: number): number | null {
    if (!transport.playing) return null;
    const stepDur = 60 / bpm / 4;
    return ((transport.playheadSeconds / stepDur) % totalSteps) * cw;
  }

  const rollDims = (d: typeof doc, containerW: number) => {
    const totalSteps = (d?.bars ?? 2) * 16;
    const w = Math.max(containerW, totalSteps * CELL_W);
    return { totalSteps, w };
  };

  const drawRoll = (cv: HTMLCanvasElement | null, d: typeof doc) => {
    if (!cv) return;
    const containerW = cv.parentElement?.clientWidth ?? 600;
    const { totalSteps, w } = rollDims(d, containerW);
    const ctx = fit(cv, w, 260);
    if (!ctx) return;
    const { g, h } = ctx;
    const rows = HIGH - LOW + 1;
    const cw = w / totalSteps;
    const ch = 260 / rows;

    g.fillStyle = "#0b0d10";
    g.fillRect(0, 0, w, h);

    // section shading (2-bar chunks = generated sections)
    for (let s = 0; s < totalSteps; s += 32) {
      if ((s / 32) % 2 === 1) {
        g.fillStyle = "rgba(255,255,255,0.02)";
        g.fillRect(s * cw, 0, 32 * cw, h);
      }
    }
    for (let r = 0; r < rows; r++) {
      const midi = HIGH - r;
      const pc = ((midi % 12) + 12) % 12;
      if ([1, 3, 6, 8, 10].includes(pc)) {
        g.fillStyle = "rgba(255,255,255,0.022)";
        g.fillRect(0, r * ch, w, ch);
      }
      if (midi % 12 === 0) {
        g.fillStyle = "rgba(125,214,255,0.35)";
        g.font = "8px 'JetBrains Mono', monospace";
        g.fillText(`${NOTE_NAMES[pc]}${Math.floor(midi / 12) - 1}`, 4, r * ch + ch - 3);
      }
    }
    for (let s = 0; s <= totalSteps; s++) {
      g.fillStyle = s % 16 === 0 ? "rgba(255,255,255,0.12)" : s % 4 === 0 ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.025)";
      g.fillRect(s * cw, 0, 1, h);
    }

    if (d) {
      for (const n of d.notes) {
        const row = HIGH - Math.round(n.pitch);
        if (row < 0 || row >= rows) continue;
        const x = (n.step % totalSteps) * cw;
        const color = n.voice === "lead" ? "#c8f94e" : n.voice === "bass" ? "#ff8a3d" : "#b79bff";
        g.fillStyle = color + (n.voice === "pad" ? "50" : "d0");
        const bw = Math.max(cw * 0.8, cw * n.dur * 0.9);
        g.beginPath();
        g.roundRect(x + 0.5, row * ch + 1, bw - 1.5, ch - 2.5, 3);
        g.fill();
      }
    } else {
      g.fillStyle = "rgba(255,255,255,0.28)";
      g.font = "11px 'JetBrains Mono', monospace";
      g.textAlign = "center";
      g.fillText("clique p/ desenhar · ou gere à esquerda", w / 2, h / 2);
      g.textAlign = "left";
    }

    const px = d ? playheadX(totalSteps, cw, d.bpm) : null;
    if (px !== null) {
      g.fillStyle = "#7dd6ff";
      g.shadowColor = "rgba(125,214,255,0.8)";
      g.shadowBlur = 8;
      g.fillRect(px, 0, 1.5, h);
      g.shadowBlur = 0;
    }
  };

  const drawDrums = (cv: HTMLCanvasElement | null, d: typeof doc) => {
    if (!cv) return;
    const containerW = cv.parentElement?.clientWidth ?? 600;
    const { totalSteps, w } = rollDims(d, containerW);
    const cssH = 4 * 24 + 6;
    const ctx = fit(cv, w, cssH);
    if (!ctx) return;
    const { g } = ctx;
    const cw = w / totalSteps;
    const ch = 24;

    g.fillStyle = "#0b0d10";
    g.fillRect(0, 0, w, cssH);

    LANES.forEach((lane, li) => {
      const y = li * ch + 2;
      g.fillStyle = "rgba(255,255,255,0.4)";
      g.font = "8px 'JetBrains Mono', monospace";
      g.fillText(lane[0].toUpperCase(), 3, y + 12);
      for (let s = 0; s < totalSteps; s++) {
        const on = d ? d.drums[lane][s % 16] === 1 : false;
        const x = s * cw + 2.5 + 8;
        g.beginPath();
        g.roundRect(x, y, Math.max(4, cw - 5.5 - 8), ch - 5, 5);
        if (on) {
          g.fillStyle = LANE_COLORS[lane];
          g.shadowColor = LANE_COLORS[lane];
          g.shadowBlur = 5;
          g.fill();
          g.shadowBlur = 0;
        } else {
          g.fillStyle = s % 4 === 0 ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.025)";
          g.fill();
        }
      }
    });

    const px = d ? playheadX(totalSteps, cw, d.bpm) : null;
    if (px !== null) {
      g.fillStyle = "#7dd6ff";
      g.fillRect(px, 0, 1.5, cssH);
    }
  };

  const locate = (e: React.MouseEvent<HTMLCanvasElement>, cv: HTMLCanvasElement | null, d: typeof doc) => {
    if (!cv) return null;
    const rect = cv.getBoundingClientRect();
    const totalSteps = (d?.bars ?? 2) * 16;
    const cw = cv.clientWidth / totalSteps;
    const step = Math.floor((e.clientX - rect.left) / cw);
    return { step, totalSteps, cw, y: e.clientY - rect.top, height: rect.height };
  };

  const onRollClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const p = locate(e, rollRef.current, doc);
    if (!p) return;
    const rows = HIGH - LOW + 1;
    const ch = p.height / rows;
    const row = Math.floor(p.y / ch);
    const pitch = HIGH - row;
    if (p.step >= 0 && p.step < p.totalSteps && pitch >= LOW && pitch <= HIGH) toggleNote(p.step, pitch);
  };

  const onDrumClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const p = locate(e, drumRef.current, doc);
    if (!p) return;
    const laneIdx = Math.floor(p.y / 24);
    if (laneIdx >= 0 && laneIdx < 4 && p.step >= 0 && p.step < p.totalSteps) toggleDrum(LANES[laneIdx], p.step % 16);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-x-auto rounded-2xl border border-white/10" style={{ scrollbarWidth: "thin" }}>
        <canvas ref={rollRef} onClick={onRollClick} className="block cursor-crosshair" />
      </div>
      <div className="overflow-x-auto rounded-2xl border border-white/10" style={{ scrollbarWidth: "thin" }}>
        <canvas ref={drumRef} onClick={onDrumClick} className="block cursor-pointer" />
      </div>
    </div>
  );
}
