/**
 * node server is an optional adapter around the universal service contract.
 */
import { createServer } from "node:http";

export function nodeserver(options = {}) {
  if (!options.host || !Number.isInteger(options.port) || options.port < 1) throw new TypeError("node server requires host and port");
  if (typeof options.handle !== "function") throw new TypeError("node server requires handle");
  const server = createServer(async (request, response) => {
    try {
      const chunks = [];
      for await (const chunk of request) chunks.push(chunk);
      const body = Buffer.concat(chunks).toString("utf8");
      const headers = new Headers(request.headers);
      const webrequest = new Request(new URL(request.url ?? "/", `http://${options.host}:${options.port}`), { method: request.method, headers, body: body || undefined });
      const result = await options.handle(webrequest);
      response.statusCode = result.status;
      result.headers.forEach((value, key) => response.setHeader(key, value));
      response.end(Buffer.from(await result.arrayBuffer()));
    } catch (error) { response.statusCode = 500; response.setHeader("content-type", "application/json"); response.end(JSON.stringify({ error: error.message })); }
  });
  return { server, listen() { return new Promise((resolve, reject) => { server.once("error", reject); server.listen(options.port, options.host, () => resolve({ host: options.host, port: options.port })); }); }, close() { return new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())); } };
}
