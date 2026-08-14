# Action recorder

The browser `actionrecorder` links actions to the snapshot, tab, frame and window context that preceded them. The optional `maxevents` limit keeps long sessions bounded by dropping the oldest events and reporting the number dropped in the manifest.

```ts
const recorder = actionrecorder({ maxevents: 2000 });
recorder.snapshot(snapshot);
recorder.action({ action: "click", payload: { ref: "e1" } });
const archive = recorder.exportjson();
```

`manifest()` and `exportjson()` return copies of the recorded payloads. `clear()` resets the event stream and correlation boundary. The recorder remains an in-memory, caller-owned component; it does not select a browser, persistence backend or credential.
