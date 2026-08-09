import { authorizationHeader, validateApiKey } from "../config.js";
import { MAX_UPSTREAM_RESPONSE_BYTES, readBodyText } from "./body.js";
import { XengApiError } from "./errors.js";
import type { APIResponse, HealthData, JsonObject, SearchParams } from "./types.js";

/** Header x-engine uses to select the MCP rate-limit profile. */
export const XENG_CLIENT_TYPE_HEADER = "X-Client-Type";
export const XENG_CLIENT_TYPE_MCP = "mcp";

export type XengClientOptions = {
  baseUrl: string;
  timeoutMs: number;
  fetchImpl?: typeof fetch;
  /** Override default {@link MAX_UPSTREAM_RESPONSE_BYTES}. */
  maxResponseBytes?: number;
};

function parseErrorMessage(body: string): string {
  try {
    const parsed = JSON.parse(body) as JsonObject;
    if (typeof parsed.message === "string" && parsed.message) {
      const errors = parsed.errors;
      if (Array.isArray(errors) && errors.length > 0) {
        const first = errors[0] as { message?: string };
        if (typeof first?.message === "string" && first.message) {
          return `${parsed.message}: ${first.message}`;
        }
      }
      return parsed.message;
    }
    if (typeof parsed.error === "string" && parsed.error) return parsed.error;
    return "";
  } catch {
    return body.slice(0, 500);
  }
}

export class XengClient {
  readonly baseUrl: string;
  readonly timeoutMs: number;
  readonly maxResponseBytes: number;
  private readonly fetchImpl: typeof fetch;

  constructor(opts: XengClientOptions) {
    this.baseUrl = opts.baseUrl.replace(/\/+$/, "");
    this.timeoutMs = opts.timeoutMs;
    this.maxResponseBytes = opts.maxResponseBytes ?? MAX_UPSTREAM_RESPONSE_BYTES;
    this.fetchImpl = opts.fetchImpl ?? fetch;
  }

  async doJSON<T = unknown>(
    apiKey: string,
    method: string,
    path: string,
    query?: Record<string, string | number | boolean | undefined>,
  ): Promise<T> {
    validateApiKey(apiKey);

    const url = new URL(this.baseUrl + path);
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v === undefined || v === "") continue;
        url.searchParams.set(k, String(v));
      }
    }

    const headers: Record<string, string> = {
      Accept: "application/json",
      Authorization: authorizationHeader(apiKey),
      [XENG_CLIENT_TYPE_HEADER]: XENG_CLIENT_TYPE_MCP,
    };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await this.fetchImpl(url, {
        method,
        headers,
        signal: controller.signal,
      });
      const text = await readBodyText(res, this.maxResponseBytes);
      if (res.status >= 400) {
        throw new XengApiError(res.status, parseErrorMessage(text) || res.statusText);
      }
      if (!text) return undefined as T;
      return JSON.parse(text) as T;
    } finally {
      clearTimeout(timer);
    }
  }

  async search(apiKey: string, params: SearchParams): Promise<APIResponse<unknown>> {
    const q = params.q.trim();
    if (!q) throw new Error("query parameter 'q' is required");
    return this.doJSON<APIResponse<unknown>>(apiKey, "GET", "/api/v1/search", {
      q,
      page: params.page,
      limit: params.limit,
      offset: params.offset,
      lang: params.lang,
      screen_name: params.screen_name,
      hashtag: params.hashtag,
      mention: params.mention,
      from_created_at: params.from_created_at,
      to_created_at: params.to_created_at,
      include_raw_json: params.include_raw_json,
    });
  }

  /** Public liveness probe — no auth required by x-engine. */
  checkHealth(): Promise<APIResponse<HealthData> | HealthData | JsonObject> {
    return this.fetchPublic("/health");
  }

  private async fetchPublic(path: string): Promise<JsonObject> {
    const url = this.baseUrl + path;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await this.fetchImpl(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      const text = await readBodyText(res, this.maxResponseBytes);
      if (res.status >= 400) {
        throw new XengApiError(res.status, parseErrorMessage(text) || res.statusText);
      }
      return text ? (JSON.parse(text) as JsonObject) : {};
    } finally {
      clearTimeout(timer);
    }
  }
}

/** True when upstream health reports ok (envelope or bare). */
export function isHealthy(payload: unknown): boolean {
  if (!payload || typeof payload !== "object") return false;
  const obj = payload as JsonObject;
  if (typeof obj.status === "string" && obj.status.toLowerCase() === "ok") return true;
  const data = obj.data;
  if (data && typeof data === "object") {
    const status = (data as JsonObject).status;
    if (typeof status === "string" && status.toLowerCase() === "ok") return true;
  }
  return false;
}
