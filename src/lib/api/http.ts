import axios from "axios";
import { toApiError } from "./errors";

/**
 * All API calls go through /api/v1 on this same origin. Next forwards them to the
 * NestJS API (see rewrites in next.config.ts), so the httpOnly session cookie rides
 * along automatically and nothing needs CORS.
 */
export const http = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
  timeout: 20_000,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(toApiError(error)),
);
