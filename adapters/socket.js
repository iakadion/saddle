/**
 * socket adapter keeps realtime optional and accepts a caller supplied websocket constructor.
 */
export function socketadapter(options = {}) {
  const websocket = options.websocket ?? globalThis.WebSocket;
  if (!websocket) throw new Error("websocket implementation is required");
  return {
    connect(url, protocols) {
      if (!url) throw new TypeError("socket url is required");
      const socket = new websocket(url, protocols);
      return { socket, send(value) { socket.send(typeof value === "string" ? value : JSON.stringify(value)); }, close(code, reason) { socket.close(code, reason); } };
    }
  };
}
