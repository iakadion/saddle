/**
 * Generate a random port number in the ephemeral port range (1024-65535).
 * The port is calculated once and then fixed for the lifetime of the process.
 */
let _cachedPort: number | null = null;

export function randomPort(): number {
  if (_cachedPort !== null) return _cachedPort;
  _cachedPort = Math.floor(Math.random() * 64511) + 1024;
  return _cachedPort;
}

/**
 * Reset the cached port (for testing).
 */
export function resetPort(): void {
  _cachedPort = null;
}
