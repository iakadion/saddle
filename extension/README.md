# saddle browser bridge

This directory contains the first Manifest V3 surface for Saddle. It is a user initiated bridge, not a hidden automation service.

## load unpacked

1. Open `chrome://extensions`.
2. Enable developer mode.
3. Choose **Load unpacked**.
4. Select this `extension/` directory.
5. Open a page, invoke Saddle from the extension action and choose `Snapshot` or `Read page`.

The manifest requests only `activeTab`, `scripting` and `storage`. It does not request broad host permissions, cookies, tabs, webRequest or debugger access. `activeTab` gives temporary access after the user invokes the action for the current tab.

## boundaries

The content bridge runs in Chrome's isolated world. It exposes bounded page metadata, visible text, stable references and user initiated click or fill commands. `pagebridge.js` runs in the page world as a narrow read-only boundary; the isolated content script requests the `pagefacts` command through a token-correlated `postMessage` channel and rejects foreign sources or timed-out responses. The page world cannot invoke extension commands, receive credentials or evaluate arbitrary extension code. The service worker forwards versioned messages, persists bounded pending command records and stores the latest snapshot metadata in session storage. Rehydration is explicit; startup never replays a command without a caller action. No endpoint, credential, remote script or browser profile is embedded.

`protocol.js` and `serviceworker.js` are reusable ESM contracts. `content.js` is intentionally a classic injected file because programmatic Chrome content scripts are loaded as files; it exposes a small global bridge and avoids arbitrary page JavaScript evaluation.

## deterministic release artifact

The Node-only build adapter creates an isolated unpacked artifact with the release version in its manifest. A caller can run `npm run extension:build -- --version 1.8.2 --output build/extension` and package that directory with the archive tool available in the host environment. The release workflow derives the version from the published tag and attaches `saddle-extension-<version>.zip` without changing the source manifest.

## next slices

The next extension slices should add snapshot diffing, richer tab and frame metadata, optional host permission escalation, browser action results and Firefox, Edge or Safari adapter profiles. Browser providers, login profiles, captcha solvers and remote runners remain caller owned adapters.
