import { AxiosError } from "axios";

export interface FieldIssue {
  path: string;
  message: string;
}

/** Every failed API call surfaces as one of these, whatever went wrong underneath. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string | undefined;
  readonly fieldIssues: FieldIssue[];

  constructor(init: { status: number; message: string; code?: string; fieldIssues?: FieldIssue[] }) {
    super(init.message);
    this.name = "ApiError";
    this.status = init.status;
    this.code = init.code;
    this.fieldIssues = init.fieldIssues ?? [];
  }

  get isNetwork() {
    return this.status === 0;
  }
}

interface ErrorBody {
  message?: unknown;
  code?: unknown;
  errors?: unknown;
}

function readFieldIssues(value: unknown): FieldIssue[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (item && typeof item === "object" && "path" in item && "message" in item) {
      const { path, message } = item as { path: unknown; message: unknown };
      if (typeof path === "string" && typeof message === "string") return [{ path, message }];
    }
    return [];
  });
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (error instanceof AxiosError) {
    if (!error.response) {
      return new ApiError({
        status: 0,
        code: error.code === "ECONNABORTED" ? "TIMEOUT" : "NETWORK",
        message: "Can't reach the server. Check your connection and try again.",
      });
    }

    const { status } = error.response;
    const body = (error.response.data ?? {}) as ErrorBody;
    const serverMessage = typeof body.message === "string" ? body.message : undefined;

    return new ApiError({
      status,
      code: typeof body.code === "string" ? body.code : undefined,
      fieldIssues: readFieldIssues(body.errors),
      message:
        status === 429
          ? "Too many attempts. Wait a minute, then try again."
          : status >= 500
            ? "Something went wrong on our side. Try again in a moment."
            : (serverMessage ?? "The request failed."),
    });
  }

  return new ApiError({ status: 0, message: "Something unexpected happened. Try again." });
}
