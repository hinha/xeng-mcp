import { XengApiError } from "./errors.js";

/** Soft ceiling so a runaway upstream body cannot OOM the MCP process. */
export const MAX_UPSTREAM_RESPONSE_BYTES = 5 * 1024 * 1024;

/**
 * Read a Response body as UTF-8 text, aborting once `maxBytes` is exceeded.
 * Prefers Content-Length when present to fail fast without buffering.
 */
export async function readBodyText(
  res: Response,
  maxBytes: number = MAX_UPSTREAM_RESPONSE_BYTES,
): Promise<string> {
  const cl = res.headers.get("content-length");
  if (cl) {
    const n = Number(cl);
    if (Number.isFinite(n) && n > maxBytes) {
      try {
        await res.body?.cancel();
      } catch {
        /* ignore */
      }
      throw new XengApiError(
        502,
        `upstream response too large (content-length ${n} > ${maxBytes})`,
      );
    }
  }

  if (!res.body) {
    return "";
  }

  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel().catch(() => undefined);
        throw new XengApiError(502, `upstream response too large (> ${maxBytes} bytes)`);
      }
      chunks.push(value);
    }
  } finally {
    try {
      reader.releaseLock();
    } catch {
      /* already released */
    }
  }

  if (chunks.length === 0) return "";
  return Buffer.concat(chunks).toString("utf8");
}
