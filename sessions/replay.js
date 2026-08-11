/**
 * replay maps validated session events to an injected browser adapter.
 */
export async function replay(session, adapter, options = {}) {
  if (!session?.events || typeof adapter?.move !== "function") throw new TypeError("replay requires session events and browser adapter");
  const speed = options.speed ?? 1;
  let previous = 0;
  for (const event of session.events) {
    const wait = Math.max(0, (event.t - previous) / speed);
    if (wait) await delay(wait);
    previous = event.t;
    if (event.type === "move") await adapter.move(event);
    else if (event.type === "click") await adapter.click(event);
    else if (event.type === "drag") await adapter.drag(event);
    else if (event.type === "scroll") await adapter.scroll(event);
    else if (event.type === "key") await adapter.key(event);
  }
  return { events: session.events.length, duration: previous / speed };
}

function delay(milliseconds) { return new Promise((resolve) => setTimeout(resolve, milliseconds)); }
