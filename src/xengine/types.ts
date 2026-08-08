export type JsonObject = Record<string, unknown>;

/** Query params for GET /api/v1/search */
export type SearchParams = {
  q: string;
  page?: number;
  limit?: number;
  offset?: number;
  lang?: string;
  screen_name?: string;
  hashtag?: string;
  mention?: string;
  from_created_at?: string;
  to_created_at?: string;
  include_raw_json?: boolean;
};

/** x-engine API envelope */
export type APIResponse<T = unknown> = {
  message: string;
  data: T;
  metadata?: unknown;
  errors: Array<{ parameter?: string; message: string }>;
  code: string;
};

export type HealthData = {
  status: string;
};
