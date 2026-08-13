/**
 * browser playwright adapter keeps the optional Node browser provider outside the transport-neutral surface.
 */

/** Creates a caller-owned Playwright browser session when the optional peer is installed. */
export async function createplaywrightsession(options = {}) {
  let playwright;
  try {
    playwright = await import("playwright");
  } catch (error) {
    const missing = new Error("optional peer dependency 'playwright' is required for the Playwright adapter", { cause: error });
    missing.code = "OPTIONAL_DEPENDENCY_MISSING";
    throw missing;
  }
  const browsername = options.browser ?? "chromium";
  const browsertype = playwright[browsername];
  if (!browsertype || typeof browsertype.launch !== "function") throw new TypeError(`unsupported Playwright browser: ${browsername}`);
  const browser = await browsertype.launch({ headless: options.headless ?? true, ...(options.launch ?? {}) });
  const context = await browser.newContext(options.context ?? {});
  const page = await context.newPage();
  return { browser, context, page, close: () => browser.close() };
}
