# saddle usage guide

## install

The canonical package is `@devthink/saddle`. The GitHub Packages npm variant is `@iakadion/saddle`; consumers of that registry must configure npm for the repository owner scope before installing.

```bash
npm install @devthink/saddle
```

## desktop surface

Desktop integrations declare their packaging intent and inject native operations. Saddle does not start a window manager or select a desktop framework.

```js
import { desktopadapter, desktopmanifest } from "@devthink/saddle";

const manifest = desktopmanifest({ name: "saddle-console", formats: ["appimage"] });
const adapter = desktopadapter({
  handlers: {
    status: async () => ({ ready: true }),
    open: async (input) => ({ opened: input?.route ?? "/" })
  }
});

const status = await adapter.invoke("status");
```

## mobile surface

Mobile integrations use the same adapter shape but declare mobile packaging formats and capabilities. Secure storage, screen navigation, permissions, and lifecycle events remain owned by the mobile host.

```js
import { mobileadapter, mobilemanifest } from "@devthink/saddle";

const manifest = mobilemanifest({ name: "saddle-mobile", formats: ["apk"] });
const adapter = mobileadapter({
  handlers: {
    status: async () => ({ ready: true }),
    invoke: async (input) => ({ accepted: Boolean(input) })
  }
});

const result = await adapter.invoke("invoke", { command: "sync" });
```

## n8n surface

The n8n contract is metadata plus a caller-owned execution handler. The node supports the engine trigger vocabulary and rejects actions that were not declared by the node.

```js
import { n8nexecute, n8nnode } from "@devthink/saddle";

const node = n8nnode({
  triggers: ["webhook", "schedule"],
  actions: ["scrape", "extract"]
});

const output = await n8nexecute(node, { command: "scrape", url: "https://example.com" }, async ({ input }) => {
  return { action: input.action, url: input.url };
});
```

Credentials, webhook verification, URL security, browser sessions, workflow storage, and n8n node registration must be supplied by the host application. This keeps the package usable in local, CI, container, desktop, mobile, and browser-worker contexts.

## operator controls

An operator surface can bind resource handlers without forcing a database or dashboard framework into the library. Every response carries a request id, resource, operation and success state; the optional audit callback receives the same serializable response.

```js
import { controlsurface } from "@devthink/saddle";

const controls = controlsurface({
  adapters: {
    jobs: { list: async () => [{ id: "job1", status: "running" }] },
    permissions: { check: async ({ scope }) => ({ allowed: scope === "read" }) }
  },
  audit: async (event) => console.log(event)
});

const jobs = await controls.execute({ resource: "jobs", operation: "list" });
```

The same contract can be mounted behind any Web Request and Response server. The handler does not bind a framework, host, port, database or authentication scheme.

```js
import { controlservice } from "@devthink/saddle";

const service = controlservice({
  verify: async (token) => token === "caller-token" ? { subject: "operator" } : null,
  adapters: { jobs: { list: async () => [{ id: "job1" }] } }
});
```

## operations policies

Operational policies remain declarative. An existing metric collector can receive a bounded vocabulary, while retention, recovery and threat ownership are represented without starting background workers or making storage assumptions.

```js
import { backupplan, metricstore, operationsmetrics, retentionpolicy, threatmodel } from "@devthink/saddle";

const metrics = operationsmetrics({ collector: metricstore() });
metrics.record("runnerselection", 1, { runner: "primary" });
const retention = retentionpolicy({ days: 30, maxbytes: 500000000 });
const recovery = backupplan({ backup: async (input) => ({ saved: input }), restore: async (input) => ({ restored: input }) });
const security = threatmodel({ owner: "platform-team", controls: ["url validation", "audit log"] });
```
