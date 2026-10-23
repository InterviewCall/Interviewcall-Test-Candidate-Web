import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Must match CANDIDATE_COOKIE_NAME on the API.
const SESSION_COOKIE = process.env.CANDIDATE_COOKIE_NAME ?? "ic_candidate_session";

/**
 * An optimistic gate for the test portal: no session cookie means there is nothing to show,
 * so go to the page that explains how to open the link. The API still checks the session on
 * every request, so a stale cookie ends up on the same page from the client.
 */
export function proxy(request: NextRequest) {
  if (request.cookies.has(SESSION_COOKIE)) return NextResponse.next();
  return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
  matcher: ["/test/:path*", "/test"],
};
