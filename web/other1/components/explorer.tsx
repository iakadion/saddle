"use client";

import { useMemo, useState } from "react";
import {
  AudioWaveform,
  BrainCircuit,
  Braces,
  FileAudio,
  Gauge,
  ListFilter,
  MonitorSmartphone,
  Network,
  PackageCheck,
  Search,
  SquareTerminal,
  X,
  type LucideIcon,
} from "lucide-react";
import { CATEGORIES, type CategoryKey, type Dependency } from "@/data/dependencies";
import Reveal from "@/components/reveal";

const ICONS: Record<CategoryKey, LucideIcon> = {
  dsp: AudioWaveform,
  ml: BrainCircuit,
  nlp: SquareTerminal,
  data: Braces,
  ui: MonitorSmartphone,
  sync: Network,
  io: FileAudio,
  qa: Gauge,
};

const PLATFORM_STYLE: Record<string, string> = {
  WEB: "text-[#7dd6ff] border-[#7dd6ff]/30",
  WASM: "text-[#b79bff] border-[#b79bff]/30",
  IOS: "text-[#e4e7e9] border-white/25",
  AND: "text-[#c8f94e] border-[#c8f94e]/30",
  NATIVE: "text-[#ff8a3d] border-[#ff8a3d]/30",
  TOOL: "text-[#9aa7ff] border-[#9aa7ff]/30",
};

function DependencyCard({ dep, accent, delay }: { dep: Dependency; accent: string; delay: number }) {
  return (
    <Reveal delay={delay}>
      <article
        className="group relative flex h-full flex-col overflow-hidden border border-white/10 bg-[#0a0c0e] p-5 transition-all duration-300 hover:bg-[#0c0f12]"
        style={{ borderTop: `2px solid ${accent}` }}
      >
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: `linear-gradient(180deg, ${accent}0d, transparent 45%)` }} />
        <div className="relative flex items-center justify-between font-mono text-[9px] tracking-[0.2em] text-zinc-600">
          <span className="tabular-nums">PKG·{String(dep.ordinal).padStart(3, "0")}</span>
          <span>{dep.license.toUpperCase()}</span>
        </div>

        <h3 className="relative mt-3.5 text-[19px] font-bold leading-tight tracking-[-0.01em] text-zinc-100 transition-colors duration-300 group-hover:text-zinc-50">
          {dep.name}
        </h3>
        <p className="relative mt-1 break-all font-mono text-[10.5px] leading-relaxed text-zinc-500">
          {dep.pkg}
          <span className="mx-1.5 text-zinc-700">@</span>
          <span style={{ color: accent }}>{dep.version}</span>
        </p>

        <p className="relative mt-4 font-mono text-[10px] font-medium uppercase leading-relaxed tracking-[0.14em]" style={{ color: accent }}>
          {dep.purpose}
        </p>
        <p className="relative mt-2.5 flex-1 text-[13px] leading-relaxed text-zinc-400">{dep.description}</p>

        <div className="relative mt-5 flex flex-wrap gap-1.5">
          {dep.platforms.map((p) => (
            <span key={p} className={`border px-2 py-0.5 font-mono text-[9px] tracking-[0.18em] ${PLATFORM_STYLE[p] ?? "text-zinc-400 border-white/20"}`}>
              {p}
            </span>
          ))}
        </div>
      </article>
    </Reveal>
  );
}

export default function Explorer({ deps }: { deps: Dependency[] }) {
  const [active, setActive] = useState<"all" | CategoryKey>("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    let list = deps;
    if (active !== "all") list = list.filter((d) => d.category === active);
    const needle = q.trim().toLowerCase();
    if (needle) {
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(needle) ||
          d.pkg.toLowerCase().includes(needle) ||
          d.purpose.toLowerCase().includes(needle) ||
          d.description.toLowerCase().includes(needle) ||
          d.license.toLowerCase().includes(needle) ||
          d.platforms.some((p) => p.toLowerCase().includes(needle)),
      );
    }
    return list;
  }, [deps, active, q]);

  const groups = useMemo(
    () =>
      CATEGORIES.map((c) => ({
        meta: c,
        items: filtered.filter((d) => d.category === c.key),
      })).filter((g) => g.items.length > 0),
    [filtered],
  );

  return (
    <section id="registry" className="relative border-b border-white/10 bg-[#07080a] py-20 lg:py-28">
      <div className="mx-auto max-w-[1440px] px-5 lg:px-10">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="flex items-center gap-3 font-mono text-[10px] tracking-[0.32em] text-[#c8f94e]">
                <PackageCheck className="h-3.5 w-3.5" />
                SECTION 01 — DEFINITIVE REGISTRY
              </p>
              <h2 className="mt-4 text-4xl font-bold tracking-[-0.03em] text-zinc-100 sm:text-5xl lg:text-6xl">
                {filtered.length}
                <span className="text-zinc-600"> / </span>
                {deps.length} PACKAGES
              </h2>
            </div>
            <p className="max-w-sm text-[13px] leading-relaxed text-zinc-500">
              Every package pinned, purposed and platform-tagged. Search the manifest or slice it by
              architectural stratum — this is the exact bill of materials the engine compiles against.
            </p>
          </div>
        </Reveal>

        {/* toolbar */}
        <Reveal delay={80}>
          <div className="sticky top-14 z-30 mt-10 border border-white/12 bg-[#0a0c0e]/95 backdrop-blur-md">
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
              <Search className="h-4 w-4 shrink-0 text-zinc-600" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="SEARCH THE MANIFEST — e.g. wasm, onnx, midi, ring buffer…"
                className="w-full bg-transparent font-mono text-[12px] tracking-[0.08em] text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
              />
              {q && (
                <button onClick={() => setQ("")} className="text-zinc-600 transition-colors hover:text-zinc-300" aria-label="Clear search">
                  <X className="h-4 w-4" />
                </button>
              )}
              <span className="hidden shrink-0 font-mono text-[10px] tabular-nums tracking-[0.2em] text-zinc-600 sm:block">
                {filtered.length} HITS
              </span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto px-3 py-2.5" style={{ scrollbarWidth: "none" }}>
              <ListFilter className="mr-1 h-3.5 w-3.5 shrink-0 text-zinc-600" />
              <button
                onClick={() => setActive("all")}
                className={`shrink-0 border px-3 py-1.5 font-mono text-[10px] tracking-[0.18em] transition-colors ${
                  active === "all"
                    ? "border-[#c8f94e] bg-[#c8f94e] text-[#060708]"
                    : "border-white/15 text-zinc-400 hover:border-white/40 hover:text-zinc-200"
                }`}
              >
                ALL · {deps.length}
              </button>
              {CATEGORIES.map((c) => {
                const n = deps.filter((d) => d.category === c.key).length;
                const on = active === c.key;
                return (
                  <button
                    key={c.key}
                    onClick={() => setActive(on ? "all" : c.key)}
                    className={`shrink-0 border px-3 py-1.5 font-mono text-[10px] tracking-[0.18em] transition-colors ${
                      on ? "text-[#060708]" : "text-zinc-400 hover:text-zinc-200"
                    }`}
                    style={
                      on
                        ? { borderColor: c.accent, background: c.accent }
                        : { borderColor: "rgba(255,255,255,0.15)" }
                    }
                  >
                    {c.index} {c.short} · {n}
                  </button>
                );
              })}
            </div>
          </div>
        </Reveal>

        {/* groups */}
        {groups.length === 0 ? (
          <div className="mt-16 border border-dashed border-white/15 p-16 text-center">
            <p className="font-mono text-[12px] tracking-[0.24em] text-zinc-500">NO PACKAGES MATCH THE QUERY</p>
            <button
              onClick={() => { setQ(""); setActive("all"); }}
              className="mt-5 border border-[#c8f94e]/40 px-4 py-2 font-mono text-[10px] tracking-[0.24em] text-[#c8f94e] transition-colors hover:bg-[#c8f94e] hover:text-[#060708]"
            >
              RESET FILTERS
            </button>
          </div>
        ) : (
          groups.map(({ meta, items }) => {
            const Icon = ICONS[meta.key];
            return (
              <div key={meta.key} className="mt-16 first:mt-14">
                <Reveal>
                  <div className="grid gap-6 border-b border-white/10 pb-6 lg:grid-cols-[1fr_1.6fr]">
                    <div className="flex items-start gap-5">
                      <span className="font-mono text-6xl font-bold leading-none tracking-tighter lg:text-7xl" style={{ color: meta.accent }}>
                        {meta.index}
                      </span>
                      <div className="pt-2">
                        <p className="flex items-center gap-2 font-mono text-[11px] font-semibold tracking-[0.24em] text-zinc-100">
                          <Icon className="h-4 w-4" style={{ color: meta.accent }} />
                          {meta.short}
                        </p>
                        <h3 className="mt-2 text-xl font-bold tracking-tight text-zinc-100 lg:text-2xl">{meta.title}</h3>
                        <p className="mt-1 font-mono text-[10px] tabular-nums tracking-[0.2em] text-zinc-600">
                          {items.length} OF {deps.filter((d) => d.category === meta.key).length} SHOWN
                        </p>
                      </div>
                    </div>
                    <p className="self-end text-[13px] leading-relaxed text-zinc-500 lg:pl-10">{meta.blurb}</p>
                  </div>
                </Reveal>

                <div className="mt-7 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {items.map((dep, i) => (
                    <DependencyCard key={dep.ordinal} dep={dep} accent={meta.accent} delay={Math.min(i, 8) * 30} />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
