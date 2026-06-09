import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_ROUTES = ["/candidate-dashboard",
    "/recruiter-dashboard","/dashboard", "/messages", "/settings"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session =
    request.cookies.get("session") || request.cookies.get("token");
  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  if (isProtected && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (
    (pathname.startsWith("/login") || pathname.startsWith("/register")) &&
    session
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin-dashboard",
    "/candidate-dashboard",
    "/recruiter-dashboard",
    "/dashboard/:path*",
    "/messages/:path*",
    "/settings/:path*",
    "/login",
    "/register",
  ],
};
