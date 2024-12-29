import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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
  console.log(token);
  console.log(pathname);

  if (!token) {
    const response = NextResponse.redirect(new URL("/login", request.url));

    response.cookies.delete("AccessToken");
    response.cookies.delete("Email");
    response.cookies.delete("Name");
    response.cookies.delete("Role");
    response.cookies.delete("UserName");

    return response;
  }
  console.log("step 1");
  if (pathname !== "/api/VerifyToken") {
    try {
      console.log("step 2");
      const verifyResponse = await fetch(
        `https:/fttx.mtnirancell.ir/backend/api/VerifyToken`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(verifyResponse);
      console.log("-------");
      console.log(verifyResponse.status);
      console.log("-------");
      console.log(verifyResponse.url);

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
      console.log(error)
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
    "/backend(.*)",
  ],
};
