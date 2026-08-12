import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "jsdom",
		include: ["tests/**/*.{test,spec}.{ts,mjs}", "tests/**/*.test.ts"],
		globals: true,
		testTimeout: 10000,
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			include: ["*.ts"],
			exclude: ["tests/**", "scripts/**", "web/**", "ink-components/**", "node_modules/**", "dist/**", "coverage/**"],
			thresholds: { lines: 60, functions: 50, branches: 50, statements: 60 },
		},
	},
});
