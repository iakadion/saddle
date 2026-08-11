// Storage boundary: every backend implements the same artifact contract.
import type { ArtifactInput, ArtifactManifest } from "../domain/artifacts.js";
export interface StorageAdapter { put(input: ArtifactInput): Promise<ArtifactManifest>; get(key: string): Promise<Uint8Array>; head(key: string): Promise<ArtifactManifest | null>; delete(key: string): Promise<void>; list(prefix?: string): Promise<ArtifactManifest[]>; }
