declare module "fft.js" {
  export default class FFT {
    constructor(size: number);
    size: number;
    createComplexArray(): number[];
    realTransform(output: number[], input: ArrayLike<number>): void;
    completeSpectrum(spectrum: number[]): void;
    transform(output: number[], input: number[]): void;
    inverseTransform(output: number[], input: number[]): void;
  }
}

declare module "meyda" {
  const Meyda: {
    extract: (
      features: string[],
      signal: Float32Array | number[],
      previousSignal?: Float32Array | number[],
    ) => Record<string, unknown> | null;
    audioContext: unknown;
    numberOfMFCCCoefficients: number;
    bufferSize: number;
    sampleRate: number;
  };
  export default Meyda;
}

declare module "compute-cosine-similarity" {
  export default function similarity(a: ArrayLike<number>, b: ArrayLike<number>): number | null;
}

declare module "seedrandom" {
  namespace seedrandom {
    type PRNG = () => number;
  }
  function seedrandom(seed?: string): seedrandom.PRNG;
  export default seedrandom;
}

declare module "lamejs" {
  export class Mp3Encoder {
    constructor(channels: number, sampleRate: number, kbps: number);
    encodeBuffer(left: Int16Array, right?: Int16Array): number[];
    flush(): number[];
  }
}
