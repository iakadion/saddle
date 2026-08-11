/**
 * webhook signatures use hmac sha256 and keep secrets outside serialized events.
 */
import { createHmac, timingSafeEqual } from "node:crypto";

export function webhooksig(payload, secret) { return createHmac("sha256", secret).update(typeof payload === "string" ? payload : JSON.stringify(payload)).digest("hex"); }
export function webhookverify(payload, signature, secret) { const expected = webhooksig(payload, secret); const left = Buffer.from(String(signature ?? "")); const right = Buffer.from(expected); return left.length === right.length && timingSafeEqual(left, right); }
