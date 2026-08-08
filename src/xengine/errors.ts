export class XengApiError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message || `x-engine api error: status ${statusCode}`);
    this.name = "XengApiError";
    this.statusCode = statusCode;
  }
}
