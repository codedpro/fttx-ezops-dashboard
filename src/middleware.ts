import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { LRUCache } from "lru-cache";

const tokenCache = new LRUCache<string, boolean>({
  max: 1000,
  ttl: 1000 * 60,
});

export async function middleware(request: NextRequest) {
  const publicPaths = [
    "/api/login",
    "/api/register",
    "/login",
    "/register",
    "/backend",
  ];
  const { pathname } = request.nextUrl;

  if (publicPaths.includes(pathname) || pathname.startsWith("/backend")) {
    return NextResponse.next();
  }

  const tokenCookie = request.cookies.get("AccessToken");
  const token = tokenCookie?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set(
      "redirect",
      `${request.nextUrl.pathname}${request.nextUrl.search}`
    );
    const response = NextResponse.redirect(loginUrl);

    response.cookies.delete("AccessToken");
    response.cookies.delete("Email");
    response.cookies.delete("Name");
    response.cookies.delete("Role");
    response.cookies.delete("UserName");

    return response;
  }
  if (pathname !== "/api/VerifyToken") {
    if (tokenCache.get(token)) {
      return NextResponse.next();
    }

    try {
      const verifyUrl = new URL("/api/VerifyToken", request.url);
      const verifyResponse = await fetch(verifyUrl.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (verifyResponse.status === 200) {
        tokenCache.set(token, true);
        return NextResponse.next();
      } else {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set(
          "redirect",
          `${request.nextUrl.pathname}${request.nextUrl.search}`
        );
        const response = NextResponse.redirect(loginUrl);
        response.cookies.delete("AccessToken");
        response.cookies.delete("Email");
        response.cookies.delete("Name");
        response.cookies.delete("Role");
        response.cookies.delete("UserName");

        return response;
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error during token verification:", error.message);
      }

      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set(
        "redirect",
        `${request.nextUrl.pathname}${request.nextUrl.search}`
      );
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("AccessToken");
      response.cookies.delete("Email");
      response.cookies.delete("Name");
      response.cookies.delete("Role");
      response.cookies.delete("UserName");

      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|favicon.ico|public|api/VerifyToken).*)",
    "/backend(.*)",
  ],
};
