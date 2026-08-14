# Workflow input validation

Workflow manifests can declare caller-owned input schemas. `validateworkflowinputs` rejects unknown fields, checks required values, applies defaults, converts string transport values to declared primitive types and enforces choices. `triggermatch` returns an `invalid-inputs` result instead of dispatching an invalid event.

```ts
const manifest = workflowmanifest({
  name: "process",
  command: "npm test",
  inputs: {
    count: { type: "number", required: true },
    dryrun: { type: "boolean", default: false },
    mode: { type: "string", choices: ["safe", "fast"] },
  },
});
```

When an event does not provide an explicit request ID, the trigger matcher derives one from the workflow name, trigger type and recursively sorted event data. The same logical event therefore receives the same identifier regardless of object key insertion order. No forge, host, port, credential or dispatch API is selected by this contract.
