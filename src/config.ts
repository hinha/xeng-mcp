import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export type XengConfig = {
  apiKey: string;
  baseUrl: string;
  timeoutMs: number;
  host: string;
  port: number;
};

function loadDotEnv(): void {
  const candidates = [resolve(process.cwd(), ".env"), resolve(import.meta.dirname, "../../.env")];
  for (const file of candidates) {
    if (!existsSync(file)) continue;
    const text = readFileSync(file, "utf8");
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = value;
    }
    break;
  }
}

function firstNonEmpty(...values: Array<string | undefined | null>): string {
  for (const v of values) {
    const t = v?.trim();
    if (t) return t;
  }
  return "";
}

function parseArg(argv: string[], name: string): string | undefined {
  const idx = argv.indexOf(name);
  if (idx >= 0 && argv[idx + 1]) return argv[idx + 1];
  const pref = `${name}=`;
  const hit = argv.find((a) => a.startsWith(pref));
  return hit ? hit.slice(pref.length) : undefined;
}

/** Parse Go-style durations (`600s`, `5m`, `1h`) or plain milliseconds. */
export function parseTimeoutMs(raw: string, fallback = 300_000): number {
  const t = raw.trim().toLowerCase();
  if (!t) return fallback;
  const asNum = Number(t);
  if (Number.isFinite(asNum) && asNum > 0) return asNum;
  const m = /^(\d+(?:\.\d+)?)(ms|s|m|h)$/.exec(t);
  if (!m) return fallback;
  const n = Number(m[1]);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  switch (m[2]) {
    case "ms":
      return Math.round(n);
    case "s":
      return Math.round(n * 1000);
    case "m":
      return Math.round(n * 60_000);
    case "h":
      return Math.round(n * 3_600_000);
    default:
      return fallback;
  }
}

/** Require a non-empty consumer API key (no hard-coded prefix). */
export function validateApiKey(token: string): void {
  const t = token.trim();
  if (!t) throw new Error("missing API key (set XENG_API_KEY)");
}

/**
 * Build the Authorization header value for x-engine consumer auth.
 * If the key already starts with "Bearer ", pass it through unchanged.
 */
export function authorizationHeader(apiKey: string): string {
  const t = apiKey.trim();
  if (!t) throw new Error("missing API key (set XENG_API_KEY)");
  if (/^bearer\s+/i.test(t)) return t;
  return `Bearer ${t}`;
}

/** Load config from env + CLI flags. Does not require apiKey for HTTP serve (per-request Bearer). */
export function loadConfig(argv: string[] = process.argv.slice(2)): XengConfig {
  loadDotEnv();
  const apiKey = firstNonEmpty(parseArg(argv, "--api-key"), process.env.XENG_API_KEY);
  const baseUrl = firstNonEmpty(
    parseArg(argv, "--xeng-base-url"),
    process.env.XENG_BASE_URL,
    "http://127.0.0.1:8080",
  ).replace(/\/+$/, "");
  const timeoutRaw = firstNonEmpty(
    parseArg(argv, "--timeout"),
    parseArg(argv, "--timeout-ms"),
    process.env.XENG_TIMEOUT,
    process.env.XENG_TIMEOUT_MS,
    "300000",
  );
  const timeoutMs = parseTimeoutMs(timeoutRaw, 300_000);
  const host = firstNonEmpty(process.env.XENG_HOST, "127.0.0.1");
  const port = Number(firstNonEmpty(process.env.XENG_PORT, "8787"));

  return {
    apiKey,
    baseUrl,
    timeoutMs,
    host,
    port: Number.isFinite(port) && port > 0 ? port : 8787,
  };
}
