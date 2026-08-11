# comparative audit

## sources reviewed

### Chrome extension messaging

Source: Chrome for Developers, [Message passing](https://developer.chrome.com/docs/extensions/develop/concepts/messaging).

Manifest V3 extensions need explicit message contracts between service workers, extension pages and content scripts. Chrome exposes one-time request/response through `runtime.sendMessage()` and `tabs.sendMessage()`, plus long-lived connections through `runtime.connect()` and ports. Asynchronous responses must keep the channel open with an explicit `true` return in broadly compatible implementations; response values must be serializable, and sender errors need a defined handling path.

Implication for Saddle: the future `extension/` surface needs a versioned message envelope, sender and tab metadata, request correlation, timeout handling, serializable payload validation and a distinction between one-shot commands and long-lived streams. The browser adapter contract alone is not enough for an extension runtime.

### Vercel agent-browser

Source: [vercel-labs/agent-browser](https://github.com/vercel-labs/agent-browser).

The project separates a browser daemon from the CLI and exposes a compact interaction loop: open, snapshot an accessibility tree with stable refs, act on refs, read text, screenshot and close. It also supports traditional selectors, role-based finders, uploads, keyboard events, DOM reads, CDP connection and a remote browser mode. Its README emphasizes early click failure when an overlay covers a target and requires a fresh snapshot before retrying.

Implication for Saddle: the browser contract should add snapshot identity and stale-reference errors, explicit action results, overlay or obstruction diagnostics, upload and keyboard primitives, session lifecycle, and a transport that can point to a local or remote browser without making the CLI the core.

## initial gap hypotheses

The current Saddle code has browser action names, sessions, replay, fingerprint and MCP contracts, but the audit still needs to verify whether it has snapshot references, stale-state detection, tab/frame ownership, extension messaging, permission minimization, content-script isolation and a real buildable Manifest V3 surface. These items remain hypotheses until the repository and more primary sources are reviewed.

### Microsoft Playwright MCP

Source: [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp).

Playwright MCP uses structured accessibility snapshots rather than pixel-only input and supports navigation, interaction, inspection and persistent browser context through an MCP server. Its own documentation distinguishes a CLI path for token-efficient coding-agent workflows from MCP for persistent state, rich introspection and long-running autonomous loops.

Implication for Saddle: the extension and MCP layers should share a structured page snapshot model, while keeping a lower-level browser action contract underneath. The model should support stable element references, snapshot refresh, action diagnostics and a choice between compact command output and richer introspection.

### Chrome content scripts

Source: Chrome for Developers, [Content scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts).

Content scripts run in an isolated world, can use only a limited set of extension APIs directly, and must message the service worker for other capabilities. Static, dynamic and programmatic injection have different permission and lifecycle implications; host match patterns and web-accessible resources expand the security surface.

Implication for Saddle: the first extension implementation should use a narrow static content script, an isolated DOM bridge, a service worker as the privileged coordinator and minimal host permissions. It should not expose the core package or arbitrary remote code as a web-accessible resource.

### Manifest permissions and lifecycle

Sources: Chrome for Developers, [Declare permissions](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions) and [The extension service worker lifecycle](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle).

Permissions, host permissions, optional permissions and optional host permissions are separate manifest controls. Optional permissions should be preferred when a feature allows it because permission changes and broad match patterns can create install or runtime warnings. MV3 service workers are event-driven and can be terminated after inactivity or long-running limits; global variables do not survive shutdown, so durable state belongs in extension storage or IndexedDB and handlers must be reentrant.

Implication for Saddle: the extension manifest should begin with `storage` and a deliberately small content match policy, avoid `tabs`, `cookies`, `webRequest`, debugger and broad host permissions until a tested feature requires them, and expose an explicit permission escalation flow. The service worker should rehydrate state per event, persist session metadata, and treat ports, messages and in-flight jobs as recoverable rather than process-local.

### Browser Use

Source: [browser-use/browser-use](https://github.com/browser-use/browser-use).

Browser Use exposes a high-level task agent, a lower-level programmable library, custom tools, authentication profiles, persistent filesystem and memory, and a hosted execution path with scaling, proxy rotation and browser fingerprinting. It explicitly separates one-off CLI usage from repeatable automation embedded in code.

Implication for Saddle: the core should distinguish task orchestration from browser primitives, provide tool registration and structured task history, and treat authentication profiles, persistence and remote execution as adapters. Saddle already has bot, workflow, session and storage contracts, but the extension surface needs a clear task-to-command bridge rather than exposing raw browser actions only.

### WXT

Source: [WXT](https://wxt.dev/).

WXT demonstrates the value of an opinionated extension build surface: fast development reloads, multiple entrypoints, multi-browser output, automated packaging and publishing, and bundle analysis. The framework uses TypeScript by default, but its architectural lessons apply independently of language choice.

Implication for Saddle: `extension/` should be a buildable, vendor-light surface with explicit manifest, background, content and control entrypoints, a packageable artifact, browser capability detection and a future adapter boundary for Chrome, Firefox and other WebExtension-compatible runtimes. The first implementation can stay pure JavaScript and avoid adding a framework dependency.
