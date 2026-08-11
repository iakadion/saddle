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

The content bridge runs in Chrome's isolated world. It exposes bounded page metadata, visible text, stable references and user initiated click or fill commands. The service worker forwards versioned messages and stores only the latest snapshot metadata in session storage. No endpoint, credential, remote script or browser profile is embedded.

`protocol.js` and `serviceworker.js` are reusable ESM contracts. `content.js` is intentionally a classic injected file because programmatic Chrome content scripts are loaded as files; it exposes a small global bridge and avoids arbitrary page JavaScript evaluation.

## next slices

The next extension slices should add snapshot diffing, tab and frame identity, resumable command records, optional host permission escalation, browser action results and a deterministic zip workflow. Browser providers, login profiles, captcha solvers and remote runners remain caller owned adapters.
