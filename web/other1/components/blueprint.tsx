"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Fingerprint,
  Music4,
  ShieldCheck,
  Timer,
} from "lucide-react";
import type { Dependency } from "@/data/dependencies";
import Reveal from "@/components/reveal";
import { Infrastructure, AIPipeline, Budgets } from "@/components/architecture";
import Explorer from "@/components/explorer";

function Clock() {
  const [now, setNow] = useState("--:--:--");
  useEffect(() => {
    const tick = () => setNow(new Date().toISOString().slice(11, 19));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="tabular-nums">{now}Z</span>;
}

const NAV = [
  { href: "#architecture", label: "STACK" },
  { href: "#registry", label: "REGISTRY" },
  { href: "#ai", label: "AI PIPELINE" },
  { href: "#budget", label: "LATENCY" },
];

function HUD() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#060708]/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-6 px-5 lg:px-10">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="grid h-6 w-6 place-items-center border border-[#c8f94e]/60">
            <Music4 className="h-3.5 w-3.5 text-[#c8f94e]" />
          </span>
          <span className="font-mono text-[13px] font-semibold tracking-[0.18em] text-zinc-100">
            VECTOR-ONE
          </span>
          <span className="hidden font-mono text-[10px] tracking-[0.22em] text-zinc-500 sm:block">
            // DAW ENGINE
          </span>
        </a>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="px-3 py-1.5 font-mono text-[10px] tracking-[0.24em] text-zinc-500 transition-colors hover:text-[#c8f94e]"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-4 md:ml-6">
          <span className="hidden items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-zinc-500 lg:flex">
            <span className="anim-pulse-dot h-1.5 w-1.5 rounded-full bg-[#c8f94e]" />
            <Clock />
          </span>
          <span className="hidden items-center gap-1.5 border border-[#c8f94e]/30 px-2.5 py-1 font-mono text-[10px] tracking-[0.2em] text-[#c8f94e] sm:flex">
            <ShieldCheck className="h-3 w-3" />
            0 TRACKERS
          </span>
          <span className="font-mono text-[10px] tracking-[0.2em] text-zinc-600">REV 4.2.0</span>
        </div>
      </div>
    </header>
  );
}

const METER_HEIGHTS = [42, 68, 34, 80, 55, 92, 47, 74, 38, 88, 60, 30, 70, 52, 96, 44, 64, 78, 36, 84, 58, 48, 72, 40];

function Hero({ count }: { count: number }) {
  return (
    <section id="top" className="bg-blueprint relative overflow-hidden border-b border-white/10 pt-14">
      <div className="pointer-events-none absolute inset-0 opacity-20 mix-blend-screen">
        <Image src="/images/signal-field.jpg" alt="" fill priority className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#060708]/70 via-transparent to-[#060708]" />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_70%_10%,rgba(200,249,78,0.07),transparent_65%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#060708] to-transparent" />

      <div className="relative mx-auto max-w-[1440px] px-5 pb-16 pt-14 lg:px-10 lg:pb-24 lg:pt-20">
        <div className="grid gap-14 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <Reveal>
              <p className="flex flex-wrap items-center gap-3 font-mono text-[10px] tracking-[0.32em] text-zinc-500">
                <span className="text-[#c8f94e]">SYSTEMS SPECIFICATION</span>
                <span className="h-px w-10 bg-zinc-700" />
                CROSS-PLATFORM PRO DAW
                <span className="h-px w-10 bg-zinc-700" />
                MOBILE × WEB
              </p>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="mt-8 text-[13.5vw] font-bold leading-[0.88] tracking-[-0.05em] text-zinc-100 sm:text-7xl lg:text-[6.6rem]">
                THE ARCHITECTURE
                <br />
                <span className="text-outline">OF A PROFESSIONAL</span>
                <br />
                <span className="text-[#c8f94e]">DAW ENGINE.</span>
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="mt-8 max-w-xl text-[15px] leading-relaxed text-zinc-400">
                A definitive, exhaustive dependency registry for a next-generation digital audio
                workstation — native audio generation, custom beat making, lossless importing, and an
                on-device AI tracking system that dissects audio second-by-second into structured
                note, pitch, onset and velocity JSON.{" "}
                <span className="text-zinc-200">All inference local. No user tracking, anywhere.</span>
              </p>
            </Reveal>

            <Reveal delay={220}>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <a
                  href="#architecture"
                  className="group flex items-center gap-2 bg-[#c8f94e] px-5 py-3 font-mono text-[11px] font-semibold tracking-[0.22em] text-[#060708] transition-transform hover:-translate-y-0.5"
                >
                  READ THE STACK
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
                <a
                  href="#registry"
                  className="border border-white/20 px-5 py-3 font-mono text-[11px] tracking-[0.22em] text-zinc-300 transition-colors hover:border-[#c8f94e]/60 hover:text-[#c8f94e]"
                >
                  BROWSE {count} PACKAGES
                </a>
                <a
                  href="/api/dependencies"
                  target="_blank"
                  className="border border-white/10 px-5 py-3 font-mono text-[11px] tracking-[0.22em] text-zinc-500 transition-colors hover:border-white/30 hover:text-zinc-200"
                >
                  GET /api/dependencies
                </a>
              </div>
            </Reveal>

            <Reveal delay={300}>
              <div className="mt-14 grid grid-cols-2 gap-px border border-white/10 bg-white/10 sm:grid-cols-5">
                {[
                  { v: String(count).padStart(2, "0"), k: "PACKAGES", icon: Activity },
                  { v: "08", k: "STRATA", icon: Fingerprint },
                  { v: "04", k: "TARGETS", icon: ArrowUpRight },
                  { v: "00", k: "TRACKERS", icon: ShieldCheck },
                  { v: "<6ms", k: "RT BUDGET", icon: Timer },
                ].map((s) => (
                  <div key={s.k} className="group bg-[#0a0c0e] px-4 py-5 transition-colors hover:bg-[#0d1013]">
                    <s.icon className="h-3.5 w-3.5 text-zinc-600 transition-colors group-hover:text-[#c8f94e]" />
                    <div className="mt-3 text-3xl font-bold tracking-tight text-zinc-100">{s.v}</div>
                    <div className="mt-1 font-mono text-[9px] tracking-[0.28em] text-zinc-500">{s.k}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* right rail — build manifest + live meters */}
          <div className="relative hidden flex-col justify-end lg:flex">
            <Reveal delay={200}>
              <div className="flex h-44 items-end gap-[3px] border-b border-white/15 pb-0">
                {METER_HEIGHTS.map((h, i) => (
                  <div key={i} className="flex-1 bg-gradient-to-t from-[#1a2013] via-[#c8f94e]/40 to-[#c8f94e]/90">
                    <div
                      className="anim-meter w-full bg-[#c8f94e]/25"
                      style={{ height: "100%", animationDelay: `${(i % 8) * 0.14}s`, opacity: h / 100 }}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-between font-mono text-[9px] tracking-[0.2em] text-zinc-600">
                <span>MASTER BUS — LUFS -14</span>
                <span>PEAK -1.0 dBFS</span>
              </div>
            </Reveal>

            <Reveal delay={320}>
              <div className="mt-8 border border-white/12 bg-[#0a0c0e]/90 p-6">
                <p className="font-mono text-[10px] tracking-[0.3em] text-zinc-500">BUILD MANIFEST</p>
                <dl className="mt-4 space-y-2.5 font-mono text-[11.5px] leading-relaxed">
                  {[
                    ["engine", "vector-one.core v4.2.0", "#c8f94e"],
                    ["shell", "next.js 16 · wasm host", "#e4e7e9"],
                    ["targets", "web · ios · android · desktop", "#e4e7e9"],
                    ["rt path", "lock-free · sharedarraybuffer", "#e4e7e9"],
                    ["ai stack", "basic-pitch · crepe · flan-t5/8bit", "#7dd6ff"],
                    ["nlp core", "llama.cpp gguf · wink grammar", "#b79bff"],
                    ["timeline", "zod-validated · msgpack frames", "#ffb454"],
                    ["store", "postgres · automerge · idb", "#e4e7e9"],
                    ["tracking", "disabled — hard-wired", "#c8f94e"],
                  ].map(([k, v, c]) => (
                    <div key={k} className="flex justify-between gap-4">
                      <dt className="text-zinc-600">{k}</dt>
                      <dd style={{ color: c }}>{v}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-5 font-mono text-[11px] text-zinc-500">
                  <span className="text-[#c8f94e]">$</span> engine --boot --targets=all
                  <span className="anim-caret ml-1 inline-block h-3.5 w-2 translate-y-0.5 bg-[#c8f94e]" />
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function Marquee({ deps }: { deps: Dependency[] }) {
  const items = [...deps, ...deps];
  return (
    <div className="overflow-hidden border-b border-white/10 bg-[#08090b] py-3">
      <div className="anim-marquee flex w-max items-center gap-8 whitespace-nowrap">
        {items.map((d, i) => (
          <span key={i} className="flex items-center gap-8 font-mono text-[11px] tracking-[0.14em] text-zinc-600">
            <span className="text-zinc-700">{String(d.ordinal).padStart(3, "0")}</span>
            {d.pkg}
            <span className="text-[#c8f94e]/50">//</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10">
      <div className="bg-grid absolute inset-0 opacity-60" />
      <div className="relative mx-auto max-w-[1440px] px-5 py-16 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="text-outline font-mono text-5xl font-bold tracking-tight lg:text-7xl">VECTOR-ONE</p>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-zinc-400">
              All 88 components execute on-device or on the local machine. There are no analytics
              SDKs, no telemetry endpoints and no fingerprinting — privacy here is an architectural
              property, not a settings toggle.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["NO ANALYTICS", "NO TELEMETRY", "NO FINGERPRINTING", "OFFLINE-CAPABLE"].map((t) => (
                <span key={t} className="flex items-center gap-1.5 border border-[#c8f94e]/25 px-2.5 py-1 font-mono text-[9px] tracking-[0.2em] text-[#c8f94e]">
                  <ShieldCheck className="h-3 w-3" />
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="font-mono text-[10px] tracking-[0.3em] text-zinc-500">DOCUMENTS</p>
            <ul className="mt-4 space-y-2.5 font-mono text-[11px] tracking-[0.12em]">
              {NAV.map((n) => (
                <li key={n.href}>
                  <a href={n.href} className="text-zinc-400 transition-colors hover:text-[#c8f94e]">
                    {n.label}
                  </a>
                </li>
              ))}
              <li>
                <a href="/api/dependencies" target="_blank" className="text-zinc-400 transition-colors hover:text-[#c8f94e]">
                  REGISTRY JSON API
                </a>
              </li>
              <li>
                <a href="/api/health" target="_blank" className="text-zinc-400 transition-colors hover:text-[#c8f94e]">
                  HEALTHCHECK
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-mono text-[10px] tracking-[0.3em] text-zinc-500">STRATA</p>
            <ul className="mt-4 space-y-2.5 font-mono text-[11px] tracking-[0.12em] text-zinc-400">
              {["01 DSP CORE", "02 ML SIGNAL", "03 NLP ENGINE", "04 DATA BUS", "05 UI / WASM", "06 SYNC BUS", "07 CODEC I/O", "08 QA / TOOLS"].map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 font-mono text-[10px] tracking-[0.24em] text-zinc-600">
          <span>VECTOR-ONE ENGINE — DEPENDENCY BLUEPRINT REV 4.2.0</span>
          <span>REGISTRY OF 110 // ALL INFERENCE LOCAL // NO TRACKING BY DESIGN</span>
        </div>
      </div>
    </footer>
  );
}

export default function Blueprint({ deps }: { deps: Dependency[] }) {
  return (
    <main className="relative">
      <HUD />
      <Hero count={deps.length} />
      <Marquee deps={deps} />
      <Infrastructure />
      <Explorer deps={deps} />
      <AIPipeline />
      <Budgets />
      <Footer />
    </main>
  );
}
