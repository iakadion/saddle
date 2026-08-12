const { chromium } = require("playwright");
const { mkdirSync, writeFileSync } = require("fs");
const { resolve, join } = require("path");

const BASE_DIR = resolve(__dirname);
const BRAVE_PATH = "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe";
const BRAVE_PROFILE = "C:\\Users\\nathalan\\AppData\\Local\\BraveSoftware\\Brave-Browser\\User Data";

const SHARES = [
  { url: "https://opncd.ai/share/WUiQOiSM", dir: "talks1" },
  { url: "https://opncd.ai/share/WqRRT53d", dir: "talks2" },
  { url: "https://opncd.ai/share/nThdpe0e", dir: "talks3" },
  { url: "https://opncd.ai/share/6YcfUNUQ", dir: "talks4" },
  { url: "https://opncd.ai/share/cHfRSiom", dir: "talks5" },
  { url: "https://opncd.ai/share/bhkdBVUM", dir: "talks6" },
  { url: "https://opncd.ai/share/rtZfjCfS", dir: "talks7" },
];

(async () => {
  const browser = await chromium.launchPersistentContext(BRAVE_PROFILE, {
    executablePath: BRAVE_PATH,
    headless: false,
    viewport: { width: 1280, height: 900 },
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
    bypassCSP: true,
  });

  for (let s = 0; s < SHARES.length; s++) {
    const { url, dir } = SHARES[s];
    const talksDir = resolve(BASE_DIR, dir);
    mkdirSync(talksDir, { recursive: true });

    console.log(`\n=== [${s + 1}/${SHARES.length}] ${dir} ===`);
    console.log(`Navigating to ${url}...`);

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(5000);

    console.log("Scrolling to load ALL content...");
    let prevHeight = 0;
    let sameCount = 0;
    while (sameCount < 5) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(2000);
      const currHeight = await page.evaluate(() => document.body.scrollHeight);
      console.log(`  scroll height: ${currHeight}`);
      if (currHeight === prevHeight) {
        sameCount++;
      } else {
        sameCount = 0;
      }
      prevHeight = currHeight;
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(2000);

    try {
      const expandBtn = await page.$('button:has-text("Expand all")');
      if (expandBtn) {
        await expandBtn.click();
        await page.waitForTimeout(2000);
        console.log("Clicked Expand all");
      }
    } catch {}

    let prevHeight2 = 0;
    let sameCount2 = 0;
    while (sameCount2 < 5) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(2000);
      const currHeight = await page.evaluate(() => document.body.scrollHeight);
      if (currHeight === prevHeight2) {
        sameCount2++;
      } else {
        sameCount2 = 0;
      }
      prevHeight2 = currHeight;
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(2000);
    console.log("Scroll complete. Extracting content...");

    const turnos = await page.evaluate(() => {
      const turns = [];
      const turnEls = document.querySelectorAll("div[data-component='session-turn']");

      for (const turn of turnEls) {
        const userText = turn.querySelector("div[data-slot='user-message-text']");
        if (userText) {
          const text = userText.textContent?.trim() || "";
          if (text) {
            turns.push({ role: "user", content: text });
          }
        }

        const assistantParts = [];

        const reasoningParts = turn.querySelectorAll("div[data-component='reasoning-part']");
        for (const rp of reasoningParts) {
          const md = rp.querySelector("div[data-component='markdown']");
          if (md) {
            const text = md.textContent?.trim() || "";
            if (text) assistantParts.push(`[Thinking] ${text}`);
          }
        }

        const textParts = turn.querySelectorAll("div[data-component='text-part']");
        for (const tp of textParts) {
          const isTool = tp.closest("[data-component='tool-part-wrapper']");
          if (isTool) continue;
          const md = tp.querySelector("div[data-component='markdown']");
          if (md) {
            const text = md.textContent?.trim() || "";
            if (text) assistantParts.push(text);
          }
        }

        const allMd = turn.querySelectorAll("div[data-component='markdown']");
        for (const md of allMd) {
          const inTextPart = md.closest("div[data-component='text-part']");
          const inTool = md.closest("[data-component='tool-part-wrapper']");
          const inReasoning = md.closest("div[data-component='reasoning-part']");
          if (!inTextPart && !inTool && !inReasoning) {
            const text = md.textContent?.trim() || "";
            if (text) assistantParts.push(text);
          }
        }

        if (assistantParts.length > 0) {
          turns.push({ role: "assistant", content: assistantParts.join("\n\n") });
        }
      }

      return turns;
    });

    console.log(`Found ${turnos.length} turnos`);
    console.log(`  User: ${turnos.filter(t => t.role === "user").length}`);
    console.log(`  Assistant: ${turnos.filter(t => t.role === "assistant").length}`);

    let userCount = 0;
    let assCount = 0;

    for (let i = 0; i < turnos.length; i++) {
      const t = turnos[i];
      let filename;
      if (t.role === "user") {
        userCount++;
        filename = `user-${String(userCount).padStart(2, "0")}.md`;
      } else {
        assCount++;
        filename = `assistant-${String(assCount).padStart(2, "0")}.md`;
      }
      const content = `# ${t.role}\n\n${t.content}\n`;
      writeFileSync(join(talksDir, filename), content, "utf-8");
      console.log(`Saved ${filename}`);
    }

    const indexLines = turnos
      .map((t, i) => {
        const f =
          t.role === "user"
            ? `user-${String(turnos.slice(0, i + 1).filter((x) => x.role === "user").length).padStart(2, "0")}`
            : `assistant-${String(turnos.slice(0, i + 1).filter((x) => x.role === "assistant").length).padStart(2, "0")}`;
        return `- [${f}.md](./${f}.md) — ${t.role}: ${t.content.slice(0, 100).replace(/\n/g, " ")}...`;
      })
      .join("\n");

    writeFileSync(join(talksDir, "_index.md"), `# Conversation Turns\n\n${indexLines}\n`, "utf-8");

    const body = await page.innerText("body");
    writeFileSync(join(talksDir, "_body.txt"), body, "utf-8");

    await page.screenshot({ path: join(talksDir, "_screenshot.png"), fullPage: true });

    await page.close();
    console.log(`Done! Saved ${turnos.length} files to docs/talks1/${dir}/`);
  }

  await browser.close();
  console.log(`\nAll ${SHARES.length} shares scraped!`);
})();
