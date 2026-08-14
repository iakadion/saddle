# Capability report

The `capabilityreport` contract produces a stable, serializable view of the execution, runtime, memory, file, dependency, visibility and pairing axes. It resolves every execution mode with caller-selected overrides and exposes the effective boolean capabilities for diagnostics, documentation and adapters.

```ts
const report = capabilityreport({
  runtime: "unknown",
  memory: "external",
  pair: "with",
});
```

The report explicitly labels host, port, credentials and provider as caller-owned. It does not start a process, open a socket, select a cloud service or promise that every target has an installed toolchain. It describes the library contract and preserves user choice across browser, desktop, mobile, CLI, binary and application modes.
