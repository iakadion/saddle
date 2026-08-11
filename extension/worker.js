/**
 * worker binds the generic extension router to the Manifest V3 runtime APIs.
 */

import { createerror } from "./protocol.js";
import { createworkerrouter } from "./serviceworker.js";

/** Installs the service worker listeners against a caller supplied Chrome API object. */
export function startworker(chromeapi = globalThis.chrome) {
  if (!chromeapi?.runtime?.onMessage || !chromeapi?.tabs || !chromeapi?.scripting) throw new TypeError("extension worker requires runtime tabs and scripting APIs");
  const router = createworkerrouter({ tabs: chromeapi.tabs, scripting: chromeapi.scripting, storage: chromeapi.storage?.session });
  const listener = (message, sender, sendresponse) => {
    router.handle(message, sender).then(sendresponse).catch((error) => sendresponse(createerror(message, error)));
    return true;
  };
  chromeapi.runtime.onMessage.addListener(listener);
  return { router, dispose() { chromeapi.runtime.onMessage.removeListener?.(listener); } };
}

if (globalThis.chrome?.runtime?.onMessage) startworker();
