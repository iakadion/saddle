/**
 * n8n node metadata keeps workflow automation as a packaging surface.
 */
export function n8nnode(options = {}) {
  return { name: options.name ?? "saddle", displayname: options.displayname ?? "Saddle", description: options.description ?? "Saddle engine operation", version: 1, inputs: options.inputs ?? ["main"], outputs: options.outputs ?? ["main"], properties: options.properties ?? [{ displayname: "command", name: "command", type: "string", default: "status" }] };
}

export function n8nexecute(node, input, handler) { if (typeof handler !== "function") throw new TypeError("n8n handler is required"); return handler({ node, input }); }
