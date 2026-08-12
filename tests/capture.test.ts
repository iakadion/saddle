import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

describe("example session log (docs/logs/example-session.json)", () => {
  const raw = readFileSync(
    join(__dirname, "..", "docs", "logs", "examplesession.json"),
    "utf-8",
  );
  const log = JSON.parse(raw) as {
    version: number;
    session: { id: string; browser: string; seed: string };
    events: Array<Record<string, unknown>>;
    captcha: { kind: string; passed: boolean };
  };

  it("has a version and a session id", () => {
    expect(log.version).toBe(1);
    expect(typeof log.session.id).toBe("string");
    expect(log.session.browser).toBe("brave");
  });

  it("seed makes the log reproducible by contract", () => {
    expect(log.session.seed).toBeTruthy();
  });

  it("events carry coordinates and types", () => {
    for (const ev of log.events) {
      expect(typeof ev.t).toBe("number");
      expect(typeof ev.type).toBe("string");
    }
  });

  it("captcha result is recorded", () => {
    expect(log.captcha.kind).toBe("hcaptcha");
    expect(log.captcha.passed).toBe(true);
  });
});
