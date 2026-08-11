/**
 * forgejo and gitea can reuse the open forge contract with a caller supplied base url.
 */
import { forgeadapter } from "./forge.js";

export function forgejoadapter(options = {}) { return forgeadapter({ ...options, kind: "forgejo" }); }
export function giteaadapter(options = {}) { return forgeadapter({ ...options, kind: "gitea" }); }
export function codebergadapter(options = {}) { return forgeadapter({ ...options, kind: "codeberg" }); }
