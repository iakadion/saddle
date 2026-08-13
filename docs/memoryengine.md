# Memory engine

The `memoryengine` contract keeps a hot working set in process memory while using caller-owned storage backends as the durable side of the bridge. With no limits, the engine preserves its historical behavior. With `maxentries` or `maxbytes`, it evicts the least recently used object after a load or persist operation exceeds the selected bound.

```ts
import { memoryengine } from "@wenathlan/saddle";

const memory = memoryengine({
  backends: [storage],
  maxentries: 128,
  maxbytes: 64 * 1024 * 1024,
});

await memory.persist("job-output", payload, { mimetype: "application/json" });
const object = await memory.load("job-output");
console.log(memory.stats());
```

Eviction affects only the hot in-process cache. The engine persists data to every configured backend before updating the cache, and a later load can rehydrate an evicted object from the first backend that returns it. `stats()` reports entries, bytes, cache hits, cache misses, evictions and configured limits so a caller can tune the working set without treating storage as physical RAM.

The limits are optional non-negative integers. A payload larger than `maxbytes` remains persisted but is not retained in the hot cache. The engine does not create a host, port, credential, storage account or provider binding on behalf of the caller.
