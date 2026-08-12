// ─────────────────────────────────────────────────────────────────────────────
// VECTOR-ONE // DAW ENGINE — DEFINITIVE DEPENDENCY BLUEPRINT v4.2.0
// 88 production-grade packages across 8 architectural strata.
// Constraint: zero user tracking. All inference runs on-device / locally.
// ─────────────────────────────────────────────────────────────────────────────

export type CategoryKey = "dsp" | "ml" | "nlp" | "data" | "ui" | "sync" | "io" | "qa";

export interface Dependency {
  ordinal: number;
  category: CategoryKey;
  name: string;
  pkg: string;
  version: string;
  purpose: string;
  description: string;
  platforms: string[];
  license: string;
}

export interface CategoryMeta {
  key: CategoryKey;
  index: string;
  title: string;
  short: string;
  blurb: string;
  accent: string;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    key: "dsp",
    index: "01",
    title: "Low-Latency DSP & Audio Core",
    short: "DSP CORE",
    blurb:
      "C++/WASM/native audio engines, device I/O abstractions and render graphs. The deterministic real-time stratum: callback budgets guarded at the sample level across Web AudioWorklet, CoreAudio and AAudio.",
    accent: "#c8f94e",
  },
  {
    key: "ml",
    index: "02",
    title: "AI, Machine Learning & Signal Analysis",
    short: "ML SIGNAL",
    blurb:
      "On-device inference runtimes and MIR libraries performing onset detection, polyphonic pitch tracking and feature extraction. Every model executes locally — no telemetry, no cloud round-trips.",
    accent: "#7dd6ff",
  },
  {
    key: "nlp",
    index: "03",
    title: "NLP & Semantic Command Engines",
    short: "NLP ENGINE",
    blurb:
      "Local LLM runtimes and deterministic grammar parsers that interpret free-text producer prompts into structured DAW intents — then into timeline mutations constrained by schema grammars.",
    accent: "#b79bff",
  },
  {
    key: "data",
    index: "04",
    title: "Serialization & Timeline Data",
    short: "DATA BUS",
    blurb:
      "The JSON timeline contract: note, pitch, onset and velocity events serialized second-by-second, schema-validated at every boundary and transported as zero-copy binary frames.",
    accent: "#ffb454",
  },
  {
    key: "ui",
    index: "05",
    title: "Cross-Platform UI & WASM Bindings",
    short: "UI / WASM",
    blurb:
      "High-FPS waveform, piano-roll and mixing-console renderers feeding one visual identity into Web (WebGPU/WASM), iOS (SwiftUI/Metal) and Android (Compose/Skia) from a shared render core.",
    accent: "#ff6fb3",
  },
  {
    key: "sync",
    index: "06",
    title: "State & Real-Time Synchronization",
    short: "SYNC BUS",
    blurb:
      "Lock-free audio-thread messaging, transport state machines and offline-first CRDT stores. Engine to UI to autosave — coordinated without a single lock on the real-time path.",
    accent: "#5effc3",
  },
  {
    key: "io",
    index: "07",
    title: "Codecs, Formats & I/O Buffering",
    short: "CODEC I/O",
    blurb:
      "WAV, MP3, FLAC, OGG, AAC and SMF MIDI import/export with bit-exact interchange between web WASM build and native mobile builds. All transcoding happens client-side.",
    accent: "#ff8a3d",
  },
  {
    key: "qa",
    index: "08",
    title: "Testing, Benchmarking & Native Tooling",
    short: "QA / TOOLS",
    blurb:
      "Latency profilers, sanitizer gates, regression benchmarks and the compilation toolchain that turns one C++ audio codebase into WASM, .a and .so artifacts for every target.",
    accent: "#9aa7ff",
  },
];

export const DEPENDENCIES: Dependency[] = [
  // ── 01 · LOW-LATENCY DSP & AUDIO CORE ──────────────────────────────────────
  {
    ordinal: 1, category: "dsp", name: "JUCE 8", pkg: "juce-framework/JUCE", version: "8.0.4",
    purpose: "Unified C++ audio engine and plugin-host core",
    description: "AudioProcessorGraph mixing bus, device management, MIDI sequencing and AUv3/VST3 hosting form the shared DSP heart compiled to WASM for web, and statically linked into the iOS and Android shells.",
    platforms: ["WASM", "IOS", "AND"], license: "GPL-3 / Commercial",
  },
  {
    ordinal: 2, category: "dsp", name: "Superpowered SDK", pkg: "superpowered-audio/sdk", version: "2.7.2",
    purpose: "Ultra-low-latency mobile audio engine",
    description: "Sub-10ms round-trip mixer, decoders and effects written in hand-tuned C++; the performance path on devices whose AAudio backend cannot sustain safe burst sizes.",
    platforms: ["IOS", "AND"], license: "Commercial",
  },
  {
    ordinal: 3, category: "dsp", name: "Oboe", pkg: "com.google.oboe:oboe", version: "1.9.3",
    purpose: "Android low-latency stream management",
    description: "Google's C++ wrapper auto-selects AAudio (API 27+) or OpenSL ES with burst-tuned buffers, hardware timestamp sync and automatic stream-disconnect recovery.",
    platforms: ["AND"], license: "Apache-2.0",
  },
  {
    ordinal: 4, category: "dsp", name: "RtAudio", pkg: "thestk/rtaudio", version: "6.0.1",
    purpose: "Portable realtime audio I/O abstraction",
    description: "Single C++ callback API over CoreAudio, WASAPI, AAudio, ALSA and JACK with per-callback jitter diagnostics; drives the desktop audition harness and embedded web shells.",
    platforms: ["NATIVE"], license: "MIT-like",
  },
  {
    ordinal: 5, category: "dsp", name: "PortAudio", pkg: "portaudio/portaudio", version: "19.7.0",
    purpose: "Compatibility audio I/O layer",
    description: "Fallback capture and playback layer for CI runners, headless render farms and legacy desktop wrappers where RtAudio backends are unavailable.",
    platforms: ["NATIVE"], license: "MIT",
  },
  {
    ordinal: 6, category: "dsp", name: "AVAudioEngine", pkg: "Apple AVFoundation", version: "iOS 15+",
    purpose: "Hardware-accelerated iOS audio graph",
    description: "AUAudioUnit hosting, tap-based metering and mixer nodes driving the native iOS mixing console; render notifications are mirrored into the shared engine clock.",
    platforms: ["IOS"], license: "Apple SDK",
  },
  {
    ordinal: 7, category: "dsp", name: "The Amazing Audio Engine 2", pkg: "TheAmazingAudioEngine/TAAE2", version: "2.0",
    purpose: "Deterministic iOS render pipeline",
    description: "Message-passing architecture that isolates the realtime thread from UI work; guarantees sample-identical offline bounces between device and render farm.",
    platforms: ["IOS"], license: "MIT",
  },
  {
    ordinal: 8, category: "dsp", name: "Tone.js", pkg: "tone", version: "15.0.4",
    purpose: "Web Audio scheduling and instrument framework",
    description: "Sample-accurate Transport, buffer management and the preset synth/sampler fleet powering the in-browser beat-making instruments and metronome.",
    platforms: ["WEB"], license: "MIT",
  },
  {
    ordinal: 9, category: "dsp", name: "standardized-audio-context", pkg: "standardized-audio-context", version: "25.3.77",
    purpose: "Spec-compliant Web Audio across browsers",
    description: "Normalizes Safari, Chromium and Firefox AudioWorklet behaviour so the compiled WASM engine runs bit-identically in every supported browser.",
    platforms: ["WEB"], license: "MIT",
  },
  {
    ordinal: 10, category: "dsp", name: "Soundpipe", pkg: "PaulBatchelor/SoundPipe", version: "1.7.0",
    purpose: "Header-light DSP building blocks",
    description: "100+ portable oscillators, filters, reverbs and saturators compiled to WASM for rapid effect prototyping inside the browser render sandbox.",
    platforms: ["WASM"], license: "MIT",
  },
  {
    ordinal: 11, category: "dsp", name: "Rubber Band Library", pkg: "breakfastquay/rubberband", version: "3.3.0",
    purpose: "Studio-grade time-stretch and pitch-shift",
    description: "The R3 finer engine preserves transients when imported beat clips are warped to session tempo, with per-clip formant preservation for vocals.",
    platforms: ["WASM", "IOS", "AND"], license: "GPL-2 / Commercial",
  },
  {
    ordinal: 12, category: "dsp", name: "libsamplerate", pkg: "libsndfile/libsamplerate", version: "0.2.2",
    purpose: "Reference sample-rate conversion",
    description: "Sinc-based SRC aligns imports and live recordings to the session rate (44.1/48kHz) at engine load, with a linear-fast path for realtime preview.",
    platforms: ["NATIVE", "WASM"], license: "BSD-2",
  },

  // ── 02 · AI, MACHINE LEARNING & SIGNAL ANALYSIS ─────────────────────────────
  {
    ordinal: 13, category: "ml", name: "ONNX Runtime", pkg: "microsoft/onnxruntime", version: "1.19.2",
    purpose: "Unified on-device inference runtime (C++)",
    description: "Executes the transcription and detection graphs on CPU, CoreML and NNAPI with arena-tuned threading so analysis workers never contend with the audio callback.",
    platforms: ["IOS", "AND", "NATIVE"], license: "MIT",
  },
  {
    ordinal: 14, category: "ml", name: "onnxruntime-web", pkg: "onnxruntime-web", version: "1.19.2",
    purpose: "In-browser WASM/WebGPU inference",
    description: "SIMD+threads WASM kernels (with WebGPU EP where available) run Basic Pitch and onset networks inside a dedicated analysis worker next to the AudioWorklet.",
    platforms: ["WEB", "WASM"], license: "MIT",
  },
  {
    ordinal: 15, category: "ml", name: "onnxruntime-react-native", pkg: "onnxruntime-react-native", version: "1.19.2",
    purpose: "Mobile native inference bridge",
    description: "Runs the exact same .onnx graphs as the web build on CoreML/NNAPI execution providers, keeping AI timeline output numerically consistent across platforms.",
    platforms: ["IOS", "AND"], license: "MIT",
  },
  {
    ordinal: 16, category: "ml", name: "TensorFlow Lite", pkg: "org.tensorflow:tensorflow-lite", version: "2.17.0",
    purpose: "Embedded inference with hardware delegates",
    description: "XNNPACK and GPU delegates keep CREPE pitch tracking under a 3ms budget per analysis frame on mid-tier silicon; NNAPI path for certified Android devices.",
    platforms: ["AND", "IOS"], license: "Apache-2.0",
  },
  {
    ordinal: 17, category: "ml", name: "Core ML Tools", pkg: "apple/coremltools", version: "8.1",
    purpose: "Model conversion for Apple Neural Engine",
    description: "Compiles the note-transcription network to .mlpackage, yielding roughly 3x energy efficiency on A/M-series silicon during continuous analysis sessions.",
    platforms: ["IOS", "TOOL"], license: "BSD-3",
  },
  {
    ordinal: 18, category: "ml", name: "librosa", pkg: "librosa/librosa", version: "0.10.2",
    purpose: "Reference MIR feature extraction (offline)",
    description: "Offline analysis service computing chroma, MFCC, beat-frames and tempo priors; its outputs are the ground truth that CI uses to validate the realtime WASM pipeline.",
    platforms: ["TOOL"], license: "ISC",
  },
  {
    ordinal: 19, category: "ml", name: "aubio", pkg: "aubio/aubio", version: "0.4.9",
    purpose: "Streaming onset, pitch and tempo detection",
    description: "C library (also compiled to WASM) emitting per-buffer onset and tempo candidates that anchor the second-by-second transient lattice of the timeline JSON.",
    platforms: ["WASM", "NATIVE"], license: "GPL-3",
  },
  {
    ordinal: 20, category: "ml", name: "Meyda", pkg: "meyda", version: "5.6.3",
    purpose: "Browser realtime feature extraction",
    description: "MFCC, spectral centroid, RMS and zero-crossing features stream per frame into the semantic tagger that labels every second of the generated timeline.",
    platforms: ["WEB"], license: "MIT/AGPL",
  },
  {
    ordinal: 21, category: "ml", name: "essentia.js", pkg: "MTG/essentia.js", version: "2.1-beta6",
    purpose: "WASM music-analysis suite",
    description: "Key and scale estimation, beat tracking and spectral descriptors from the MTG Essentia library, rendered into the AI timeline schema as tonal metadata.",
    platforms: ["WEB", "WASM"], license: "AGPL-3",
  },
  {
    ordinal: 22, category: "ml", name: "CREPE", pkg: "marl/crepe (tflite)", version: "1.0.5",
    purpose: "Deep monophonic pitch tracking",
    description: "Frame-level fundamental frequency plus confidence, quantized to note numbers with cents drift — the vocal/mono-instrument lane of the tracking system.",
    platforms: ["WASM", "AND", "IOS"], license: "MIT",
  },
  {
    ordinal: 23, category: "ml", name: "Basic Pitch", pkg: "@spotify/basic-pitch", version: "0.4.0",
    purpose: "Polyphonic audio-to-MIDI transcription",
    description: "Spotify's lightweight network emits note events (pitch, onset, offset, amplitude→velocity) that are serialized directly into second-indexed DAW timeline JSON.",
    platforms: ["WEB", "NATIVE"], license: "Apache-2.0",
  },
  {
    ordinal: 24, category: "ml", name: "kissFFT", pkg: "mborgerding/kissfft", version: "131.1.0",
    purpose: "Deterministic FFT backbone",
    description: "Fixed-point-capable FFT shared by every analysis library, guaranteeing identical spectra — and therefore identical AI features — on all four build targets.",
    platforms: ["NATIVE", "WASM"], license: "BSD-3",
  },

  // ── 03 · NLP & SEMANTIC COMMAND ENGINES ────────────────────────────────────
  {
    ordinal: 25, category: "nlp", name: "Transformers.js", pkg: "@huggingface/transformers", version: "3.1.2",
    purpose: "Local seq2seq prompt-to-command parsing",
    description: "Quantized FLAN-T5 runs fully in WASM/WebGPU and converts prompts like 'add a dark sidechained pad at 92 BPM' into structured DAW intent objects — zero network egress.",
    platforms: ["WEB", "WASM"], license: "Apache-2.0",
  },
  {
    ordinal: 26, category: "nlp", name: "WebLLM", pkg: "@mlc-ai/web-llm", version: "0.2.74",
    purpose: "WebGPU local LLM runtime",
    description: "High-tier devices run a 3B instruct model entirely in-browser for conversational arrangement edits, with grammar-constrained decoding into the timeline schema.",
    platforms: ["WEB"], license: "Apache-2.0",
  },
  {
    ordinal: 27, category: "nlp", name: "llama.cpp", pkg: "ggml-org/llama.cpp", version: "b5209",
    purpose: "Portable GGUF inference core",
    description: "Metal, CUDA and NEON backends power the shared local command model; its embedding pass is reused for semantic search over the local sample library.",
    platforms: ["NATIVE", "IOS", "AND"], license: "MIT",
  },
  {
    ordinal: 28, category: "nlp", name: "node-llama-cpp", pkg: "node-llama-cpp", version: "3.5.1",
    purpose: "Desktop-side local model host",
    description: "Node bindings serve the desktop companion's offline assistant with chat templates, JSON-schema grammars and session state for multi-step arrangement commands.",
    platforms: ["NATIVE"], license: "MIT",
  },
  {
    ordinal: 29, category: "nlp", name: "llama.rn", pkg: "a-ghorbani/llama.rn", version: "0.6.1",
    purpose: "On-device LLM for React Native",
    description: "Bridge-free C++ binding runs the command model on iOS/Android inside airplane mode, streaming tokens into the intent validator as they decode.",
    platforms: ["IOS", "AND"], license: "MIT",
  },
  {
    ordinal: 30, category: "nlp", name: "wink-nlp", pkg: "wink-nlp", version: "2.3.1",
    purpose: "Deterministic command grammar engine",
    description: "POS-tagged pattern rules compile commands such as 'mute track 2 at bar 8' into exact timeline mutations with millisecond parse latency and zero model cost.",
    platforms: ["WEB", "NATIVE"], license: "MIT",
  },
  {
    ordinal: 31, category: "nlp", name: "compromise", pkg: "compromise", version: "14.14.1",
    purpose: "Fuzzy natural-language fallback parser",
    description: "Interprets slang-heavy producer prompts when the LLM path is unavailable on low-memory devices, normalizing verbs, numbers and bar/beat references.",
    platforms: ["WEB", "NATIVE"], license: "MIT",
  },
  {
    ordinal: 32, category: "nlp", name: "Natural", pkg: "natural", version: "8.0.1",
    purpose: "Classic NLP utility belt",
    description: "Tokenizer, stemmer and TF-IDF ranker power offline 'similar sound' retrieval across local sample packs — no indexing service, no analytics, fully on-device.",
    platforms: ["WEB", "NATIVE"], license: "MIT",
  },
  {
    ordinal: 33, category: "nlp", name: "spaCy", pkg: "explosion/spaCy", version: "3.8.2",
    purpose: "Offline entity extraction (authoring tool)",
    description: "Build-time pipeline that authors and verifies the intent taxonomy and the gold dataset for the natural-language to DAW-JSON command grammar.",
    platforms: ["TOOL"], license: "MIT",
  },

  // ── 04 · SERIALIZATION & TIMELINE DATA ─────────────────────────────────────
  {
    ordinal: 34, category: "data", name: "zod", pkg: "zod", version: "3.24.1",
    purpose: "Single source of truth for the timeline schema",
    description: "Note, pitch, onset, velocity and second-index frame schemas are validated at the AI boundary; TypeScript types are generated for every downstream consumer.",
    platforms: ["WEB", "NATIVE"], license: "MIT",
  },
  {
    ordinal: 35, category: "data", name: "zod-to-json-schema", pkg: "zod-to-json-schema", version: "3.23.5",
    purpose: "LLM grammar publishing",
    description: "Exports the zod timeline contract as JSON Schema so local models are constrained to emit only parseable, in-range DAW state — hallucinated keys are impossible.",
    platforms: ["WEB", "NATIVE"], license: "ISC",
  },
  {
    ordinal: 36, category: "data", name: "Ajv", pkg: "ajv", version: "8.17.1",
    purpose: "Hot-path JSON Schema validation",
    description: "Precompiled validators check AI frames inside the analysis worker in under 0.1ms per second-chunk, rejecting malformed inference output before it reaches state.",
    platforms: ["WEB", "NATIVE"], license: "MIT",
  },
  {
    ordinal: 37, category: "data", name: "protobufjs", pkg: "protobufjs", version: "7.4.0",
    purpose: "Typed timeline messaging contracts",
    description: ".proto definitions for NoteFrame, TransportState and AssetRef are shared by engine, workers and native bridges, versioned in the monorepo with buf lint.",
    platforms: ["WEB", "NATIVE"], license: "BSD-3",
  },
  {
    ordinal: 38, category: "data", name: "Buf Protobuf Runtime", pkg: "@bufbuild/protobuf", version: "2.2.3",
    purpose: "Modern ES-module protobuf runtime",
    description: "Generated-type runtime used by the web app; enables buf-managed codegen so the JSON timeline schema and binary wire format never drift apart.",
    platforms: ["WEB"], license: "Apache-2.0",
  },
  {
    ordinal: 39, category: "data", name: "MessagePack", pkg: "@msgpack/msgpack", version: "3.0.1",
    purpose: "Compact binary frame transport",
    description: "AI-analysis frames stream engine→worker→UI as msgpack payloads over SharedArrayBuffer and WebSocket without GC pressure or re-serialization cost.",
    platforms: ["WEB", "NATIVE"], license: "MIT",
  },
  {
    ordinal: 40, category: "data", name: "FlatBuffers", pkg: "google/flatbuffers", version: "24.3.25",
    purpose: "Zero-copy timeline ingestion",
    description: "Imported project files memory-map straight into the engine; playback can start without any parse or allocation step on the realtime path.",
    platforms: ["NATIVE", "WASM"], license: "Apache-2.0",
  },
  {
    ordinal: 41, category: "data", name: "cbor-x", pkg: "cbor-x", version: "1.6.0",
    purpose: "Binary project persistence",
    description: "Autosaves the project graph plus its AI timeline into IndexedDB as deterministic CBOR documents — compact, canonical and diff-friendly.",
    platforms: ["WEB"], license: "MIT",
  },
  {
    ordinal: 42, category: "data", name: "fast-json-patch", pkg: "fast-json-patch", version: "3.1.1",
    purpose: "Incremental project diffs",
    description: "RFC-6902 patches drive undo/redo and the autosave journal, so a 10,000-event arrangement persists in microseconds instead of full-document writes.",
    platforms: ["WEB", "NATIVE"], license: "MIT",
  },
  {
    ordinal: 43, category: "data", name: "devalue", pkg: "devalue", version: "5.1.1",
    purpose: "Safe structured hydration",
    description: "Transports project snapshots — Maps, Sets, typed arrays — into server-rendered views without eval hazards, keeping the SSR preview byte-identical to local state.",
    platforms: ["WEB"], license: "MIT",
  },

  // ── 05 · CROSS-PLATFORM UI & WASM BINDINGS ─────────────────────────────────
  {
    ordinal: 44, category: "ui", name: "React Native", pkg: "react-native", version: "0.76.5",
    purpose: "Native mobile shell (New Architecture)",
    description: "Fabric renderer plus JSI lets the shared C++ audio core mount directly into Swift and Kotlin view hierarchies without serialization bridges on the hot path.",
    platforms: ["IOS", "AND"], license: "MIT",
  },
  {
    ordinal: 45, category: "ui", name: "React Native Skia", pkg: "@shopify/react-native-skia", version: "1.5.6",
    purpose: "GPU waveform and piano-roll renderer",
    description: "120fps clip waveforms, playhead shader effects and mixer meters drawn through Skia on the UI GPU canvas, decoupled from the audio render thread.",
    platforms: ["IOS", "AND"], license: "MIT",
  },
  {
    ordinal: 46, category: "ui", name: "Reanimated", pkg: "react-native-reanimated", version: "3.16.5",
    purpose: "UI-thread motion system",
    description: "Gesture-coupled faders, knobs and zooms animate on the UI thread with worklets, so JS-thread hiccups never disturb touch response or the engine clock.",
    platforms: ["IOS", "AND"], license: "MIT",
  },
  {
    ordinal: 47, category: "ui", name: "Gesture Handler", pkg: "react-native-gesture-handler", version: "2.20.2",
    purpose: "Native multi-touch gesture engine",
    description: "Pinch-zoom timelines, rotation-scrubbing and simultaneous multi-fader drags resolve natively with per-platform physics, cancelation and hit-testing.",
    platforms: ["IOS", "AND"], license: "MIT",
  },
  {
    ordinal: 48, category: "ui", name: "SwiftUI", pkg: "Apple SwiftUI", version: "iOS 17+",
    purpose: "Declarative iOS interface layer",
    description: "Mixing console, settings and export surfaces; Canvas and Metal shaders mirror the WASM visual design system so both builds read as one product.",
    platforms: ["IOS"], license: "Apple SDK",
  },
  {
    ordinal: 49, category: "ui", name: "Jetpack Compose", pkg: "androidx.compose:compose-bom", version: "2024.12.01",
    purpose: "Declarative Android interface layer",
    description: "Compose canvas and graphics layers sit atop AAudio callbacks with frame pacing aligned to vsync, sustaining 60/120fps on gesture-heavy arrange views.",
    platforms: ["AND"], license: "Apache-2.0",
  },
  {
    ordinal: 50, category: "ui", name: "Skia", pkg: "google/skia", version: "m131",
    purpose: "Shared 2D vector graphics core",
    description: "One rendering codebase feeds CanvasKit (WASM), iOS and Android, making waveforms, spectrograms and piano-roll pixels identical on every target.",
    platforms: ["WASM", "IOS", "AND"], license: "BSD-3",
  },
  {
    ordinal: 51, category: "ui", name: "PixiJS", pkg: "pixi.js", version: "8.6.0",
    purpose: "WebGL/WebGPU timeline renderer",
    description: "Batched sprites and custom filters render 500-track arrangements, playhead glow and spectral overlays at a locked 60fps in the browser build.",
    platforms: ["WEB"], license: "MIT",
  },
  {
    ordinal: 52, category: "ui", name: "wavesurfer.js", pkg: "wavesurfer.js", version: "7.8.10",
    purpose: "Waveform and regions engine",
    description: "Zoomable multichannel waveforms, loop regions and click-free selection power the sample editor, with WebGL peak rendering for long stems.",
    platforms: ["WEB"], license: "BSD-3",
  },
  {
    ordinal: 53, category: "ui", name: "peaks.js", pkg: "bbc/peaks.js", version: "3.1.0",
    purpose: "Broadcast-grade zoomable peaks",
    description: "Precomputed peak pyramids render hour-long reference stems instantly in the arrange overview, with segment markers synced to the AI timeline grid.",
    platforms: ["WEB"], license: "LGPL-3",
  },
  {
    ordinal: 54, category: "ui", name: "wasm-bindgen", pkg: "rustwasm/wasm-bindgen", version: "0.2.95",
    purpose: "Rust-to-JS zero-cost bindings",
    description: "Rust-written metering, lookahead-limiter and dither modules compile to WASM with fully typed glue, so the browser engine reuses native-grade DSP code.",
    platforms: ["WASM", "TOOL"], license: "MIT/Apache-2",
  },
  {
    ordinal: 55, category: "ui", name: "Emscripten SDK", pkg: "emscripten-core/emsdk", version: "3.1.61",
    purpose: "C++-to-WASM compilation toolchain",
    description: "Compiles the JUCE/RubberBand graph with pthreads and SIMD into AudioWorklet-ready modules, emitting the loader glue consumed by standardized-audio-context.",
    platforms: ["TOOL", "WASM"], license: "MIT/NCSA",
  },

  // ── 06 · STATE & REAL-TIME SYNCHRONIZATION ─────────────────────────────────
  {
    ordinal: 56, category: "sync", name: "ringbuffer.js", pkg: "ringbuffer.js", version: "0.30.0",
    purpose: "Lock-free audio-thread messaging",
    description: "GoogleChromeLabs' SPSC ring buffer ships PCM blocks and AI frames over SharedArrayBuffer between AudioWorklet, analysis worker and UI with zero allocations.",
    platforms: ["WEB", "WASM"], license: "Apache-2.0",
  },
  {
    ordinal: 57, category: "sync", name: "Comlink", pkg: "comlink", version: "4.4.2",
    purpose: "Typed worker RPC layer",
    description: "Proxies expose the Essentia/ONNX analysis workers with structured-clone typed APIs, keeping inference orchestration readable and race-free.",
    platforms: ["WEB"], license: "Apache-2.0",
  },
  {
    ordinal: 58, category: "sync", name: "Zustand", pkg: "zustand", version: "5.0.2",
    purpose: "Atomic UI state store",
    description: "Track, mixer and transport state live outside the React tree; fine-grained selectors keep re-renders sub-millisecond during 60fps playback.",
    platforms: ["WEB", "IOS", "AND"], license: "MIT",
  },
  {
    ordinal: 59, category: "sync", name: "Immer", pkg: "immer", version: "10.1.1",
    purpose: "Immutable project-graph edits",
    description: "Structurally-shared updates let 10k-note projects undo/redo with O(log n) memory, and generate the patches consumed by fast-json-patch journaling.",
    platforms: ["WEB", "NATIVE"], license: "MIT",
  },
  {
    ordinal: 60, category: "sync", name: "XState", pkg: "xstate", version: "5.19.0",
    purpose: "Transport state machine",
    description: "Models play, record, punch-in and loop states with side-effect actors (metronome, count-in, autosave) so illegal engine transitions are unrepresentable.",
    platforms: ["WEB", "NATIVE"], license: "MIT",
  },
  {
    ordinal: 61, category: "sync", name: "Yjs", pkg: "yjs", version: "13.6.21",
    purpose: "CRDT conflict-free arrangement editing",
    description: "Multi-cursor clip moves merge deterministically across local sessions; operates fully offline — there is no telemetry channel to disable.",
    platforms: ["WEB", "NATIVE"], license: "MIT",
  },
  {
    ordinal: 62, category: "sync", name: "y-indexeddb", pkg: "y-indexeddb", version: "9.0.12",
    purpose: "Local CRDT durability",
    description: "Persists Yjs documents in-browser so sessions reopen instantly with zero server dependency and zero user data leaving the device.",
    platforms: ["WEB"], license: "MIT",
  },
  {
    ordinal: 63, category: "sync", name: "Automerge", pkg: "automerge/automerge", version: "2.2.8",
    purpose: "Local-first project documents",
    description: "Rust-cored CRDT stores whole projects across web and desktop with a cryptographic hash per edit — an auditable, offline document history.",
    platforms: ["WEB", "NATIVE", "WASM"], license: "MIT",
  },
  {
    ordinal: 64, category: "sync", name: "RxDB", pkg: "rxdb", version: "16.0.0",
    purpose: "Reactive local session store",
    description: "IndexedDB-backed collections stream query results — recent projects, presets, AI-analysis caches — reactively into stores, with encryption-at-rest support.",
    platforms: ["WEB"], license: "Apache-2.0",
  },
  {
    ordinal: 65, category: "sync", name: "EventEmitter3", pkg: "eventemitter3", version: "5.0.1",
    purpose: "Microsecond pub/sub bus",
    description: "Clock ticks, meter peaks and AI-frame arrivals fan out to subscribers at audio rate without Array-splice costs or listener leaks.",
    platforms: ["WEB", "NATIVE"], license: "MIT",
  },

  // ── 07 · CODECS, FORMATS & I/O BUFFERING ───────────────────────────────────
  {
    ordinal: 66, category: "io", name: "libsndfile", pkg: "libsndfile/libsndfile", version: "1.2.2",
    purpose: "Reference PCM container I/O",
    description: "Reads and writes WAV, AIFF, FLAC and OGG with RIFF chunk preservation — cue markers, loop points and tempo survive every import/export round-trip.",
    platforms: ["NATIVE", "WASM"], license: "LGPL-2.1",
  },
  {
    ordinal: 67, category: "io", name: "FFmpeg", pkg: "FFmpeg/FFmpeg", version: "7.1",
    purpose: "Universal transcode and render backend",
    description: "Final mixdowns render to AAC, MP3 and OPUS with EBU R128 loudness normalization, dithering and metadata embedding in the export presets.",
    platforms: ["NATIVE", "TOOL"], license: "LGPL-2.1/GPL-2",
  },
  {
    ordinal: 68, category: "io", name: "ffmpeg-kit", pkg: "arthenica/ffmpeg-kit", version: "6.0-2.LTS",
    purpose: "FFmpeg on mobile devices",
    description: "Shipping iOS and Android builds bundle hardware-accelerated encoders so the on-device export queue never thermally throttles the realtime engine.",
    platforms: ["IOS", "AND"], license: "LGPL-3",
  },
  {
    ordinal: 69, category: "io", name: "@ffmpeg/ffmpeg (WASM)", pkg: "@ffmpeg/ffmpeg", version: "0.12.10",
    purpose: "In-browser transcoding core",
    description: "Client-side MP3/AAC conversion of imported assets keeps the pipeline 100% local — no uploads, no server transcoding farm, no tracking surface.",
    platforms: ["WEB", "WASM"], license: "MIT",
  },
  {
    ordinal: 70, category: "io", name: "LAME (libmp3lame)", pkg: "lame", version: "3.100",
    purpose: "Reference MP3 encoder",
    description: "V0/VBR psychoacoustic encoding for draft bounces and share previews, linked into native builds and into the ffmpeg WASM core.",
    platforms: ["NATIVE", "WASM"], license: "LGPL-2",
  },
  {
    ordinal: 71, category: "io", name: "lamejs", pkg: "lamejs", version: "1.2.1",
    purpose: "Pure-JS MP3 encoding fallback",
    description: "Encodes AudioBuffers to MP3 inside the browser when the threaded ffmpeg WASM core cannot boot (cross-origin isolation absent on legacy embeds).",
    platforms: ["WEB"], license: "LGPL-2",
  },
  {
    ordinal: 72, category: "io", name: "libFLAC.js", pkg: "libflac.js", version: "5.4.0",
    purpose: "Lossless codec in WASM",
    description: "Bit-exact FLAC encode/decode for stem interchange between web and native builds — a bounced stem hashes identically on every platform.",
    platforms: ["WEB", "WASM"], license: "BSD-3",
  },
  {
    ordinal: 73, category: "io", name: "wasm-media-encoders", pkg: "wasm-media-encoders", version: "0.7.0",
    purpose: "Worker-based browser encoders",
    description: "MP3, OGG and WAV encoders run off-main-thread behind a worker pool so exporting the final mix never blocks playback or drops a single engine callback.",
    platforms: ["WEB", "WASM"], license: "MIT",
  },
  {
    ordinal: 74, category: "io", name: "@tonejs/midi", pkg: "@tonejs/midi", version: "2.0.28",
    purpose: "SMF read/write for the web stack",
    description: "Converts .mid imports directly into the timeline note JSON (pitch, ticks→seconds, velocity curves) and writes live arrangements back out as .mid files.",
    platforms: ["WEB", "NATIVE"], license: "MIT",
  },
  {
    ordinal: 75, category: "io", name: "midi-file", pkg: "midi-file", version: "1.2.2",
    purpose: "Low-level SMF parser",
    description: "Raw event access — meta events, tempo maps, SMPTE offsets, SysEx — for forensic MIDI import fidelity when third-party files misbehave.",
    platforms: ["WEB", "NATIVE"], license: "MIT",
  },
  {
    ordinal: 76, category: "io", name: "json-midi-message-encoder", pkg: "json-midi-message-encoder", version: "8.0.1",
    purpose: "JSON-to-MIDI byte bridge",
    description: "Encodes AI-generated note frames from the timeline into Web-MIDI-compatible bytes for immediate hardware synthesizer output.",
    platforms: ["WEB"], license: "MIT",
  },
  {
    ordinal: 77, category: "io", name: "WEBMIDI.js", pkg: "webmidi", version: "3.1.11",
    purpose: "Hardware MIDI I/O",
    description: "Controller mapping, MIDI clock sync and SysEx integration for pad controllers and keyboards on web builds, with hot-plug recovery.",
    platforms: ["WEB"], license: "Apache-2.0",
  },

  // ── 08 · TESTING, BENCHMARKING & NATIVE TOOLING ────────────────────────────
  {
    ordinal: 78, category: "qa", name: "GoogleTest", pkg: "google/googletest", version: "1.15.2",
    purpose: "C++ engine unit testing",
    description: "AudioProcessorGraph routing, mixer gain math and the MIDI scheduler are covered by fixture-rich tests with sample-exact assertions.",
    platforms: ["TOOL"], license: "BSD-3",
  },
  {
    ordinal: 79, category: "qa", name: "Google Benchmark", pkg: "google/benchmark", version: "1.9.1",
    purpose: "DSP microbenchmarks",
    description: "Per-effect CPU load is measured per sample-block; CI gates fail any pull request that regresses a DSP hot path by more than two percent.",
    platforms: ["TOOL"], license: "Apache-2.0",
  },
  {
    ordinal: 80, category: "qa", name: "Catch2", pkg: "catchorg/Catch2", version: "3.7.1",
    purpose: "Behaviour-level C++ specifications",
    description: "BDD specs validate that offline bounces are bit-exact across WASM, iOS and Android — the contract that makes cross-platform rendering trustworthy.",
    platforms: ["TOOL"], license: "BSL-1.0",
  },
  {
    ordinal: 81, category: "qa", name: "LLVM Sanitizers", pkg: "llvm.org ASan/UBSan/TSan", version: "19.1",
    purpose: "Memory and thread-safety gates",
    description: "The audio-callback code path runs under ThreadSanitizer in CI to prove the realtime route remains allocation-free and lock-free under contention.",
    platforms: ["TOOL"], license: "Apache-2.0",
  },
  {
    ordinal: 82, category: "qa", name: "Perfetto", pkg: "google/perfetto", version: "48.0",
    purpose: "Engine trace profiling",
    description: "AudioWorklet, CoreAudio and AAudio callback traces flow into Perfetto's timeline UI for latency budgeting, xrun forensics and scheduler analysis.",
    platforms: ["TOOL", "AND"], license: "Apache-2.0",
  },
  {
    ordinal: 83, category: "qa", name: "Vitest", pkg: "vitest", version: "2.1.8",
    purpose: "TS unit and component testing",
    description: "Serializer grammars, zod schemas, NLP intent mappers and store reducers are tested at thousands of blocks per second with property-based fuzzing.",
    platforms: ["TOOL"], license: "MIT",
  },
  {
    ordinal: 84, category: "qa", name: "Playwright", pkg: "playwright", version: "1.49.1",
    purpose: "Cross-browser end-to-end testing",
    description: "Headless Chromium and Firefox boot real AudioContexts, render a 32-track session and assert underrun-free playback plus correct AI timeline output.",
    platforms: ["TOOL"], license: "Apache-2.0",
  },
  {
    ordinal: 85, category: "qa", name: "mitata", pkg: "mitata", version: "1.0.34",
    purpose: "GC-aware JS microbenchmarks",
    description: "The AI-frame serializer and msgpack encode paths are profiled against V8 garbage-collection pauses to keep worst-case frame cost under 0.3ms.",
    platforms: ["TOOL"], license: "MIT",
  },
  {
    ordinal: 86, category: "qa", name: "CMake", pkg: "cmake", version: "3.30.5",
    purpose: "Cross-platform build orchestration",
    description: "One build graph emits the JUCE core as WASM modules, iOS static archives and Android shared libraries from a single source tree.",
    platforms: ["TOOL"], license: "BSD-3",
  },
  {
    ordinal: 87, category: "qa", name: "Ninja", pkg: "ninja-build/ninja", version: "1.12.1",
    purpose: "Parallel native build executor",
    description: "Sub-second incremental DSP rebuilds keep audio engineers in flow; the render farm replays identical graphs for reproducible artifacts.",
    platforms: ["TOOL"], license: "Apache-2.0",
  },
  {
    ordinal: 88, category: "qa", name: "Conan", pkg: "conan-io/conan", version: "2.9.2",
    purpose: "C/C++ dependency management",
    description: "Pins libsndfile, RubberBand, kissFFT and every native binary per-platform with lockfile hashes, so production builds are bit-reproducible.",
    platforms: ["TOOL"], license: "MIT",
  },

  // ── 09 · NODE.JS PLATFORM RING — packages running live in this build ───────
  {
    ordinal: 89, category: "ml", name: "ml-matrix", pkg: "ml-matrix", version: "6.12.0",
    purpose: "Linear algebra for embedding math",
    description: "Matrix ops behind centroid recomputation and covariance studies over the 32-dim embedding space when the analytics ring needs heavier math than vectors.",
    platforms: ["WEB", "NATIVE"], license: "MIT",
  },
  {
    ordinal: 90, category: "ml", name: "ml-pca", pkg: "ml-pca", version: "4.1.1",
    purpose: "Embedding projection and analysis",
    description: "PCA projects the 32-dim song embeddings down to 2D/3D for cluster inspection — spotting linear patterns between moods and genres learned from user projects.",
    platforms: ["WEB", "NATIVE"], license: "MIT",
  },
  {
    ordinal: 91, category: "ml", name: "compute-cosine-similarity", pkg: "compute-cosine-similarity", version: "1.2.2",
    purpose: "Vector similarity kernel (installed)",
    description: "The exact cosine kernel used by /api/similar: ranks projects against any imported-audio embedding to surface 'padrões lineares ou semelhantes' in real time.",
    platforms: ["WEB", "NATIVE"], license: "MIT",
  },
  {
    ordinal: 92, category: "ml", name: "Brain.js", pkg: "brain.js", version: "2.0.0-beta.24",
    purpose: "Small trainable neural nets",
    description: "Optional recurrent net experiments for next-note prediction as an upgrade path over the shipped Markov bigram model — trains on the same exported JSON timelines.",
    platforms: ["WEB", "NATIVE"], license: "MIT",
  },
  {
    ordinal: 93, category: "nlp", name: "Sentiment", pkg: "sentiment", version: "5.0.2",
    purpose: "Prompt mood polarity scoring",
    description: "AFINN-based polarity feeds the prompt parser's mood inference for Portuguese/English text when explicit mood keywords are absent (complements wink-nlp grammar).",
    platforms: ["WEB", "NATIVE"], license: "MIT",
  },
  {
    ordinal: 94, category: "nlp", name: "franc", pkg: "franc", version: "6.2.0",
    purpose: "Prompt language detection",
    description: "Detects whether the producer typed in pt-BR or en-US so the command grammar switches dictionaries and spelling rules (trap/trapzeiro, feliz/happy) correctly.",
    platforms: ["WEB", "NATIVE"], license: "MIT",
  },
  {
    ordinal: 95, category: "nlp", name: "remove-accents", pkg: "remove-accents", version: "0.5.0",
    purpose: "Accented-char normalization",
    description: "Normalizes 'sombrio / etéreo / dança' prompts before tokenization so Portuguese accents never fragment the intent grammar or the seed hash.",
    platforms: ["WEB", "NATIVE"], license: "MIT",
  },
  {
    ordinal: 96, category: "data", name: "JSON5", pkg: "json5", version: "2.2.3",
    purpose: "Tolerant LLM-output parsing",
    description: "Relaxed JSON parser used as a repair pass when local models emit slightly-off JSON (single quotes, trailing commas) before the strict zod gate runs.",
    platforms: ["WEB", "NATIVE"], license: "MIT",
  },
  {
    ordinal: 97, category: "data", name: "superjson", pkg: "superjson", version: "2.2.2",
    purpose: "Rich-value project transport",
    description: "Serializes Maps, typed arrays and Dates inside project documents between API routes and client stores without losing types across the wire.",
    platforms: ["WEB", "NATIVE"], license: "MIT",
  },
  {
    ordinal: 98, category: "ui", name: "CodeMirror", pkg: "codemirror", version: "6.0.1",
    purpose: "Timeline JSON editor pane",
    description: "Embeddable code editor powering the studio's JSON inspector — producers can hand-edit the dissected timeline and re-validate against the zod contract live.",
    platforms: ["WEB"], license: "MIT",
  },
  {
    ordinal: 99, category: "ui", name: "Shiki", pkg: "shiki", version: "1.24.0",
    purpose: "Grammar-accurate JSON highlighting",
    description: "TextMate-grammar highlighter for the exported timeline/embedding JSON in docs and share pages — same engine semantics as VS Code.",
    platforms: ["WEB"], license: "MIT",
  },
  {
    ordinal: 100, category: "sync", name: "nanostores", pkg: "nanostores", version: "0.11.3",
    purpose: "Cross-framework atomic stores",
    description: "Tiny atom store alternative used by embeddable widgets (mini-sequencer in marketing pages) that must share engine state outside a React root.",
    platforms: ["WEB"], license: "MIT",
  },
  {
    ordinal: 101, category: "sync", name: "BroadcastChannel API wrapper", pkg: "broadcast-channel", version: "7.0.0",
    purpose: "Cross-tab transport sync",
    description: "Keeps playhead, BPM and project selection synchronized across browser tabs and detached mixer windows via BroadcastChannel with fallbacks.",
    platforms: ["WEB"], license: "MIT",
  },
  {
    ordinal: 102, category: "io", name: "audio-decode", pkg: "audio-decode", version: "2.2.0",
    purpose: "Universal buffer-to-PCM decoding",
    description: "Decodes wav/mp3/ogg/flac ArrayBuffers to AudioBuffer-compatible PCM in Node pipelines — the server-side twin of the browser's decodeAudioData path.",
    platforms: ["NATIVE"], license: "MIT",
  },
  {
    ordinal: 103, category: "io", name: "music-metadata", pkg: "music-metadata", version: "10.6.2",
    purpose: "Audio tag forensics",
    description: "Reads ID3v2/Vorbis/MP4 metadata (BPM tags, keys, artwork) from imports so the JSON timeline can inherit embedded musical context before DSP analysis.",
    platforms: ["WEB", "NATIVE"], license: "MIT",
  },
  {
    ordinal: 104, category: "io", name: "fflate", pkg: "fflate", version: "0.8.2",
    purpose: "Fast project bundle compression",
    description: "Streaming gzip/zip for stem bundles and .vt1 project packages (doc + timeline + embeddings + wav renders) with tiny footprint and no native deps.",
    platforms: ["WEB", "NATIVE"], license: "MIT",
  },
  {
    ordinal: 105, category: "qa", name: "Vitest Coverage V8", pkg: "@vitest/coverage-v8", version: "2.1.8",
    purpose: "Test coverage accounting",
    description: "V8 coverage for serializer grammars, the composer engine and store actions; CI enforces 85% on the audio-dissociation module.",
    platforms: ["TOOL"], license: "MIT",
  },
  {
    ordinal: 106, category: "qa", name: "Mock Service Worker", pkg: "msw", version: "2.6.6",
    purpose: "API-layer virtualization in tests",
    description: "Intercepts fetch in Vitest/Playwright to replay golden /api/analyze and /api/generate payloads, keeping the AI rails deterministic under test.",
    platforms: ["TOOL", "WEB"], license: "MIT",
  },
  {
    ordinal: 107, category: "qa", name: "tsx", pkg: "tsx", version: "4.19.2",
    purpose: "TypeScript native script runner",
    description: "Executes seed, benchmark and corpus-builder scripts (the ones that pre-train models from project exports) straight as TypeScript on Node.",
    platforms: ["TOOL", "NATIVE"], license: "MIT",
  },
  {
    ordinal: 108, category: "dsp", name: "smplr", pkg: "smplr", version: "0.14.0",
    purpose: "SoundFont/sample playback engine (installed)",
    description: "Sample-accurate SoundFont samplers and drum machines for Web Audio; layers realistic instruments on top of the hand-built oscillator engine in the studio.",
    platforms: ["WEB"], license: "MIT",
  },
  {
    ordinal: 109, category: "dsp", name: "fft.js", pkg: "fft.js", version: "4.0.4",
    purpose: "Radix-4 FFT kernel (installed)",
    description: "The FFT powering spectral-flux onset detection, chroma and spectral descriptors in lib/audio/dsp.ts — pure JS, runs identically in browser and Node.",
    platforms: ["WEB", "NATIVE"], license: "MIT",
  },
  {
    ordinal: 110, category: "io", name: "node-wav", pkg: "node-wav", version: "0.0.2",
    purpose: "WAV encode/decode in Node (installed)",
    description: "Reference WAV reader/writer for server-side bounce ingestion and fixture loading in the render farm; 16/24/32-bit PCM with exact sample fidelity.",
    platforms: ["NATIVE"], license: "MIT",
  },
];

export const TOTAL_COUNT = DEPENDENCIES.length;

export function categoryCount(key: CategoryKey): number {
  return DEPENDENCIES.filter((d) => d.category === key).length;
}
