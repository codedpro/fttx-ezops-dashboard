import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const publicPaths = ["/api/login", "/api/register", "/login", "/register"];
  const { pathname } = request.nextUrl;

  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  const tokenCookie = request.cookies.get("AcessToken");
  const token = tokenCookie?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname !== "/api/VerifyToken") {
    try {
      const verifyResponse = await fetch(
        `${request.nextUrl.origin}/api/VerifyToken`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (verifyResponse.status === 200) {
        return NextResponse.next();
      } else {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    } catch (error) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|favicon.ico|public|api/VerifyToken).*)"],
};
