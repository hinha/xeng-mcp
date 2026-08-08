import type { XengConfig } from "./config.js";
import { XengClient } from "./xengine/client.js";

export type Runtime = {
  config: XengConfig;
  client: XengClient;
  /** Effective API key for this session (stdio env or HTTP Bearer). */
  apiKey: string;
};

export function createRuntime(
  config: XengConfig,
  apiKey?: string,
  fetchImpl?: typeof fetch,
): Runtime {
  const key = (apiKey ?? config.apiKey).trim();
  return {
    config,
    apiKey: key,
    client: new XengClient({
      baseUrl: config.baseUrl,
      timeoutMs: config.timeoutMs,
      fetchImpl,
    }),
  };
}
