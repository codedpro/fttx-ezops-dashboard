import axios from "axios";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface TokenCacheEntry {
  timestamp: number;
  isValid: boolean;
}

const tokenCache: { [key: string]: TokenCacheEntry } = {};

const CACHE_DURATION = 60 * 1000;

export async function middleware(request: NextRequest) {
  const publicPaths = ["/api/login", "/api/register", "/login", "/register"];
  const { pathname } = request.nextUrl;

  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  const tokenCookie = request.cookies.get("AcessToken");
  const token = tokenCookie?.value;

  if (!token) {
    console.log("No token found, redirecting to login");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const currentTime = Date.now();
  const cachedToken = tokenCache[token];

  if (cachedToken && currentTime - cachedToken.timestamp < CACHE_DURATION) {
    if (cachedToken.isValid) {
      return NextResponse.next();
    } else {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  try {
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: "https://lnmback.mtnirancell.ir/api/VerifyToken",
      headers: {
        Authorization:
          "Bearer MWoF3YPbXzG0+lMyOa7qS4PAfrazdmICIln0SktIbNxeWoPoIF1D2wwNj1bGQZ0/",
      },
    };
    const apiUrl = `${process.env.NEXT_PUBLIC_LNM_API_URL}/VerifyToken`;
    console.log(apiUrl);
    // const response = await fetch(apiUrl, {
    //   headers: { 'Authorization': `Bearer ${token}` },
    //  });
    console.log(config);
    const response = await axios(config);
    console.log("aw");
    console.log(response.status);
    if (response.status !== 200) {
      tokenCache[token] = { timestamp: currentTime, isValid: false };
      return NextResponse.redirect(new URL("/login", request.url));
    }

    tokenCache[token] = { timestamp: currentTime, isValid: true };

    return NextResponse.next();
  } catch (error) {
    if (error instanceof Error) {
      console.log(`Error verifying token: ${error}`);
    } else {
      console.log("Unknown error occurred during token verification");
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|favicon.ico|public).*)"],
};
