import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { resolve } from "node:path";
import { randomPort } from './utils/port.js';

const VITE_PORT = randomPort();

export default defineConfig({
	root: "web",
	build: {
		lib: {
			entry: resolve(__dirname, "index.ts"),
			name: "DevThinkWebScrape",
			formats: ["es", "cjs"],
			fileName: (format) => `index.${format === "es" ? "mjs" : "js"}`,
		},
		rollupOptions: {
			external: [
				"playwright",
				"cheerio",
				"jsdom",
				"turndown",
				"turndown-plugin-gfm",
				"@mozilla/readability",
				"zod",
				"p-retry",
				"p-limit",
				"p-queue",
				"robots-parser",
				"sitemapper",
				"lru-cache",
				"keyv",
				"hono",
				"hono/cors",
				"commander",
				"emittery",
				"normalize-url",
				"node:fs",
				"node:fs/promises",
				"node:path",
				"node:child_process",
				"node:http",
				"node:crypto",
			],
		},
		sourcemap: true,
		minify: false,
	},
	plugins: [dts()],
	server: {
		port: VITE_PORT,
		host: "127.0.0.1",
		cors: true,
	},
});
