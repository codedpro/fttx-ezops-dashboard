import { NextResponse } from "next/server";
import axios from "axios";
import https from "https";

export async function GET(request: Request): Promise<NextResponse> {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return new NextResponse("Token not provided", { status: 401 });
  }
  console.log(token)
  const isValid = await verifyToken(token);

  if (isValid) {
    return new NextResponse("Token is valid", { status: 200 });
  } else {
    return new NextResponse("Invalid token", { status: 401 });
  }
}

async function verifyToken(token: string): Promise<boolean> {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_LNM_API_URL}/VerifyToken`,

      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      }
    );

    return response.status === 200;
  } catch (error) {
    return false;
  }
}
