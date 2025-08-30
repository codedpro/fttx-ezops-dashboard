import { NextResponse } from "next/server";
import { DUMMY_TOKEN, DUMMY_USER } from "@/lib/mocks/data";

export async function POST(request: Request) {
  // Accept either x-www-form-urlencoded or JSON body
  let username = "";
  let password = "";
  const ct = request.headers.get("content-type") || "";
  try {
    if (ct.includes("application/x-www-form-urlencoded")) {
      const text = await request.text();
      const params = new URLSearchParams(text);
      username = params.get("Username") || params.get("username") || "";
      password = params.get("Password") || params.get("password") || "";
    } else {
      const body = await request.json();
      username = body?.Username || body?.username || "";
      password = body?.Password || body?.password || "";
    }
  } catch {}

  // Any credentials accepted; return fixed dummy user
  const resp = {
    AccessToken: DUMMY_TOKEN,
    Name: DUMMY_USER.Name,
    Email: DUMMY_USER.Email,
    Role: DUMMY_USER.Role,
    Username: DUMMY_USER.Username,
  };
  return NextResponse.json(resp, { status: 200 });
}

