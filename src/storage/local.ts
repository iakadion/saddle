// Node adapter: local storage is explicit and protected against path traversal.
import { mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";
import { ArtifactNotFoundError, ValidationError } from "../core/errors.js";
import type { ArtifactInput, ArtifactManifest } from "../domain/artifacts.js";
import type { StorageAdapter } from "./adapter.js";
import { collectBytes, sha256 } from "./checksum.js";
export class LocalStorageAdapter implements StorageAdapter {
  readonly root: string;
  constructor(root: string) { this.root = resolve(root); }
  async put(input: ArtifactInput): Promise<ArtifactManifest> {
    const filePath = this.safePath(input.key); const data = await collectBytes(input.data); await mkdir(dirname(filePath), { recursive: true }); await writeFile(filePath, data); return this.manifest(input.key, data, input.contentType ?? "application/octet-stream", input.metadata);
  }
  async get(key: string): Promise<Uint8Array> { try { return await readFile(this.safePath(key)); } catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") throw new ArtifactNotFoundError(key); throw error; } }
  async head(key: string): Promise<ArtifactManifest | null> { try { const data = await this.get(key); const fileStats = await stat(this.safePath(key)); return this.manifest(key, data, "application/octet-stream", { mtimeMs: String(fileStats.mtimeMs) }); } catch (error) { if (error instanceof ArtifactNotFoundError) return null; throw error; } }
  async delete(key: string): Promise<void> { try { await rm(this.safePath(key)); } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; } }
  async list(prefix = ""): Promise<ArtifactManifest[]> { const root = this.safePath(prefix || "."); const keys: string[] = []; await this.walk(root, keys); return Promise.all(keys.map(async (key) => (await this.head(key)) as ArtifactManifest)); }
  private async walk(directory: string, keys: string[]): Promise<void> { let entries; try { entries = await readdir(directory, { withFileTypes: true }); } catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return; throw error; } for (const entry of entries) { const filePath = join(directory, entry.name); if (entry.isDirectory()) await this.walk(filePath, keys); else keys.push(relative(this.root, filePath).split(sep).join("/")); } }
  private safePath(key: string): string { const normalized = key.replaceAll("\\", "/"); if (!normalized || normalized.startsWith("/") || normalized.split("/").includes("..")) throw new ValidationError("Storage key is not safe", { key }); const filePath = resolve(this.root, normalized); if (filePath !== this.root && !filePath.startsWith(`${this.root}${sep}`)) throw new ValidationError("Storage key escapes the adapter root", { key }); return filePath; }
  private manifest(key: string, data: Uint8Array, contentType: string, metadata?: Record<string, string>): ArtifactManifest { return { key, sizeBytes: data.byteLength, sha256: sha256(data), contentType, createdAt: Date.now(), metadata: { ...metadata } }; }
}
