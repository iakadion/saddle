import Link from "next/link";
import { ArrowRight, BrainCircuit, FileAudio, Music4, Network, ShieldCheck, Sparkles } from "lucide-react";

const FEATURES = [
  { icon: Sparkles, color: "#c8f94e", title: "GERA COM PROMPT", desc: "seções encadeadas por variações — 30s a 3min" },
  { icon: FileAudio, color: "#7dd6ff", title: "ÁUDIO → JSON", desc: "nota · pitch · onset · velocity por segundo" },
  { icon: Network, color: "#b79bff", title: "EMBEDDINGS 32-DIM", desc: "cosseno encontra padrões e similares" },
  { icon: BrainCircuit, color: "#5effc3", title: "APRENDE COM VOCÊ", desc: "markov + groove + centroide, 100% local" },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070809] font-sans text-zinc-200">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_circle_at_65%_-10%,rgba(200,249,78,0.08),transparent_60%),radial-gradient(600px_circle_at_10%_110%,rgba(125,214,255,0.06),transparent_60%)]" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[#c8f94e]">
            <Music4 className="h-4 w-4 text-[#060708]" />
          </span>
          <span className="font-mono text-[13px] font-semibold tracking-[0.16em] text-zinc-100">VECTOR-ONE</span>
        </Link>
        <nav className="flex items-center gap-2 font-mono text-[9px] tracking-[0.16em]">
          <Link href="/studio" className="rounded-full bg-white/[0.05] px-3.5 py-1.5 text-zinc-300 transition-colors hover:bg-white/[0.1]">ESTÚDIO</Link>
          <Link href="/registry" className="rounded-full bg-white/[0.05] px-3.5 py-1.5 text-zinc-500 transition-colors hover:bg-white/[0.1] hover:text-zinc-300">REGISTRY</Link>
          <span className="hidden items-center gap-1 rounded-full border border-[#c8f94e]/25 px-2.5 py-1.5 text-[#c8f94e] sm:flex">
            <ShieldCheck className="h-3 w-3" /> 0 TRACKERS
          </span>
        </nav>
      </header>

      <section className="relative z-10 mx-auto flex max-w-6xl flex-col items-start px-6 pb-24 pt-14 lg:pt-24">
        <p className="rounded-full border border-[#c8f94e]/30 bg-[#c8f94e]/8 px-3.5 py-1.5 font-mono text-[9px] tracking-[0.3em] text-[#c8f94e]">
          AI DAW · 100% LOCAL
        </p>
        <h1 className="mt-7 text-[13vw] font-bold leading-[0.92] tracking-[-0.045em] text-zinc-100 sm:text-7xl lg:text-[6rem]">
          CRIA. DESTRINCHA.
          <br />
          <span className="text-[#c8f94e]">APRENDE.</span>
        </h1>
        <p className="mt-6 max-w-md text-[15px] leading-relaxed text-zinc-400">
          FL Studio × Suno no navegador. Gera música por prompt com variações encadeadas,
          disseca qualquer áudio em JSON e vetoriza tudo em embeddings.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-2.5">
          <Link
            href="/studio"
            className="group flex items-center gap-2 rounded-full bg-[#c8f94e] px-6 py-3.5 font-mono text-[11px] font-semibold tracking-[0.2em] text-[#060708] shadow-[0_0_36px_rgba(200,249,78,0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_0_48px_rgba(200,249,78,0.42)]"
          >
            ABRIR ESTÚDIO
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/registry"
            className="rounded-full border border-white/15 px-6 py-3.5 font-mono text-[11px] tracking-[0.2em] text-zinc-300 transition-colors hover:border-[#c8f94e]/50 hover:text-[#c8f94e]"
          >
            110 PACOTES
          </Link>
        </div>

        <div className="mt-16 grid w-full gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <article
              key={f.title}
              className="group rounded-3xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.05]"
              style={{ borderTop: `1.5px solid ${f.color}55` }}
            >
              <f.icon className="h-4.5 w-4.5 h-5 w-5 transition-transform duration-300 group-hover:scale-110" style={{ color: f.color }} />
              <h3 className="mt-3.5 font-mono text-[10.5px] font-semibold tracking-[0.14em] text-zinc-100">{f.title}</h3>
              <p className="mt-1.5 text-[12px] leading-relaxed text-zinc-500">{f.desc}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-2">
          {["wav", "mp3", "mid", "json", "fft", "markov", "zod", "postgres"].map((t) => (
            <span key={t} className="rounded-full bg-white/[0.04] px-3 py-1 font-mono text-[8.5px] tracking-[0.18em] text-zinc-600">
              {t.toUpperCase()}
            </span>
          ))}
        </div>
      </section>

      <footer className="absolute inset-x-0 bottom-0 z-10 border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 font-mono text-[8.5px] tracking-[0.2em] text-zinc-700">
          <span>VECTOR-ONE — NODE.JS + WEB AUDIO + POSTGRES</span>
          <span className="hidden sm:block">SEM TELEMETRIA, POR ARQUITETURA</span>
        </div>
      </footer>
      <span className="hidden" />
    </main>
  );
}
