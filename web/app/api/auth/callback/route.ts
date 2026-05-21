import { NextResponse } from "next/server";
import { encryptToken, TOKEN_COOKIE, tokenCookieOptions } from "@/app/lib/auth";

const STATE_COOKIE = "gh_oauth_state";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const cookie = request.headers.get("cookie") ?? "";
  const stateMatch = cookie.match(/(?:^|;)\s*gh_oauth_state=([^;]+)/);
  const storedState = stateMatch?.[1];

  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(`${origin}/app?error=oauth_failed`);
  }

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const tokenData = await tokenRes.json() as { access_token?: string; error?: string };

  if (tokenData.error || !tokenData.access_token) {
    return NextResponse.redirect(`${origin}/app?error=token_exchange_failed`);
  }

  const encrypted = encryptToken(tokenData.access_token);
  const response = NextResponse.redirect(`${origin}/app`);

  response.cookies.set(STATE_COOKIE, "", { maxAge: 0, path: "/" });
  response.cookies.set(TOKEN_COOKIE, encrypted, tokenCookieOptions(60 * 60 * 24 * 30));

  return response;
}
