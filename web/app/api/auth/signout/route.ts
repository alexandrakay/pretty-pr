import { NextResponse } from "next/server";
import { TOKEN_COOKIE } from "@/app/lib/auth";

export async function POST(request: Request) {
  const { origin } = new URL(request.url);
  const response = NextResponse.redirect(`${origin}/app`);
  response.cookies.set(TOKEN_COOKIE, "", { maxAge: 0, path: "/" });
  return response;
}
