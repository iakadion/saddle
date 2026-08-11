/**
 * gitlab adapter keeps project addressing and token ownership outside the package.
 */
import { forgeadapter } from "./forge.js";

export function gitlabadapter(options = {}) {
  const project = encodeURIComponent(options.project ?? "");
  const base = forgeadapter({ ...options, kind: "gitlab" });
  return { ...base, async dispatch(spec) { return base.dispatch({ ...spec, path: spec.path ?? `/api/v4/projects/${project}/pipeline` }); } };
}
