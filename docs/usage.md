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
