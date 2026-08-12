/**
 * runtime probe exercises only root-safe contracts and produces serializable evidence for CI matrices.
 */

import { memorystorage, runtimecontract, sha256 } from "../index.js";

const storage = memorystorage({ maxbytes: 1024 });
await storage.put({ key: "probe.txt", data: new TextEncoder().encode("saddle") });
const value = await storage.get("probe.txt");
console.log(JSON.stringify({ contract: runtimecontract(), digest: sha256("saddle"), text: new TextDecoder().decode(value), head: await storage.head("probe.txt") }));
