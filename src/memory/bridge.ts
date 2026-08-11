// Memory bridge: stages a job in a temporary working set and synchronizes its result.
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { Job } from "../domain/jobs.js";
import type { MemorySyncResult, WorkingSet } from "../domain/runtime.js";
export interface MemoryBridge { prepare<TInput>(job: Job<TInput>): Promise<WorkingSet>; sync(workingSet: WorkingSet, bytes: Uint8Array): Promise<MemorySyncResult>; cleanup(workingSet: WorkingSet): Promise<void>; }
export class LocalMemoryBridge implements MemoryBridge {
  private readonly baseDirectory: string;
  constructor(baseDirectory = tmpdir()) { this.baseDirectory = baseDirectory; }
  async prepare<TInput>(job: Job<TInput>): Promise<WorkingSet> { const location = await mkdtemp(join(this.baseDirectory, "saddle-job-")); const resultPath = join(location, "result.bin"); return { jobId: job.id, location, resultPath, createdAt: Date.now() }; }
  async sync(workingSet: WorkingSet, bytes: Uint8Array): Promise<MemorySyncResult> { await mkdir(workingSet.location, { recursive: true }); await writeFile(workingSet.resultPath, bytes); return { bytes: bytes.byteLength, location: workingSet.resultPath }; }
  async cleanup(workingSet: WorkingSet): Promise<void> { await rm(workingSet.location, { recursive: true, force: true }); }
}
