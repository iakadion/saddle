// Domain model: a working set is temporary process space, not a promise of physical VRAM.
export type WorkingSet = { jobId: string; location: string; resultPath: string; createdAt: number };
export type MemorySyncResult = { bytes: number; location: string };
