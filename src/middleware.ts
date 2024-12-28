import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const publicPaths = [
    "/api/login",
    "/api/register",
    "/login",
    "/register",
    "/backend", // Added /backend to public paths
  ];
  const { pathname } = request.nextUrl;

  // Allow public paths and any subpaths under /backend
  if (publicPaths.includes(pathname) || pathname.startsWith("/backend")) {
    return NextResponse.next();
  }

  const tokenCookie = request.cookies.get("AccessToken");
  const token = tokenCookie?.value;
  if (!token) {
    const response = NextResponse.redirect(new URL("/login", request.url));

    response.cookies.delete("AccessToken");
    response.cookies.delete("Email");
    response.cookies.delete("Name");
    response.cookies.delete("Role");
    response.cookies.delete("UserName");

    return response;
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
        const response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.delete("AccessToken");
        response.cookies.delete("Email");
        response.cookies.delete("Name");
        response.cookies.delete("Role");
        response.cookies.delete("UserName");

        return response;
      }
    } catch (error) {
      const response = NextResponse.redirect(new URL("/login", request.url));
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
    "/backend(.*)", // Added /backend and subpaths to matcher
  ],
};
