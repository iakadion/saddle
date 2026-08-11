/**
 * hugging face storage remains an explicit adapter with caller supplied repository path.
 */
import { forgeadapter } from "./forge.js";

export function huggingfaceadapter(options = {}) { return forgeadapter({ ...options, kind: "huggingface" }); }
