/**
 * abort helpers unify deadlines without depending on a server framework.
 */
export function deadline(milliseconds, parent) {
  if (!Number.isFinite(milliseconds) || milliseconds < 1) throw new TypeError("deadline must be positive");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error("deadline exceeded")), milliseconds);
  if (parent) parent.addEventListener("abort", () => controller.abort(parent.reason), { once: true });
  return { signal: controller.signal, cancel() { clearTimeout(timer); controller.abort(); } };
}
