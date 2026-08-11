/**
 * browser agent delegates browser actions to an injected runtime adapter.
 */
export function browseragent(adapter) {
  const required = ["navigate", "click", "type", "screenshot", "html", "text", "title", "scrolltobottom", "executecommands"];
  for (const name of required) if (typeof adapter?.[name] !== "function") throw new TypeError(`browser adapter requires ${name}`);
  return { navigate: (options) => adapter.navigate(options), click: (target) => adapter.click(target), type: (value) => adapter.type(value), screenshot: (options) => adapter.screenshot(options), html: () => adapter.html(), text: () => adapter.text(), title: () => adapter.title(), scrolltobottom: (options) => adapter.scrolltobottom(options), executecommands: (commands) => adapter.executecommands(commands) };
}
