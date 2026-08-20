import { NextResponse, type NextRequest } from "next/server";

const AUTH_ROUTES = ["/login", "/register"];

// Coarse, cookie-presence-only gate — it can't verify the JWT signature at
// the edge without shipping the secret here, so it only prevents obviously
// unauthenticated users from reaching the app shell / logged-in users from
// reaching the auth pages. Real 401s are still handled client-side by the
// axios interceptor in lib/api.ts (refresh-and-retry, else redirect).
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession =
    request.cookies.has("mogoj_access_token") || request.cookies.has("mogoj_refresh_token");
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (!hasSession && !isAuthRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (hasSession && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
