import { NextResponse } from "next/server";
import { DUMMY_TOKEN } from "@/lib/mocks/data";

export async function GET(request: Request): Promise<NextResponse> {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return new NextResponse("Token not provided", { status: 401 });
  }

  if (token === DUMMY_TOKEN) {
    return new NextResponse("Token is valid", { status: 200 });
  } else {
    return new NextResponse("Invalid token", { status: 401 });
  }
}
