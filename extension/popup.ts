/**
 * popup sends user initiated read commands through the service worker.
 */

import { createcommand } from "./protocol.js";

const status = document.querySelector("#status");
const output = document.querySelector("#output");

for (const button of document.querySelectorAll("[data-command]")) button.addEventListener("click", () => request(button.dataset.command));

async function request(command) {
  try {
    status.textContent = "Reading active tab…";
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error("no active tab");
    const response = await chrome.runtime.sendMessage(createcommand(command, { tabid: tab.id }));
    if (response?.type === "error") throw new Error(response.error?.message ?? "extension request failed");
    output.textContent = JSON.stringify(response?.payload ?? response, null, 2);
    status.textContent = "Complete.";
  } catch (error) {
    status.textContent = "Request failed.";
    output.textContent = String(error.message ?? error);
  }
}
