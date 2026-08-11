// Domain model: artifacts are content-addressed enough for local verification and future backends.
export type ArtifactManifest = { key: string; sizeBytes: number; sha256: string; contentType: string; createdAt: number; metadata: Record<string, string> };
export type ArtifactInput = { key: string; data: Uint8Array | AsyncIterable<Uint8Array>; contentType?: string; metadata?: Record<string, string> };
