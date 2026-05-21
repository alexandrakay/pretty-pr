import { randomBytes } from "crypto";
import { NextResponse } from "next/server";

const STATE_COOKIE = "gh_oauth_state";

export async function GET() {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return Response.json({ error: "GitHub OAuth not configured" }, { status: 500 });
  }

  const state = randomBytes(16).toString("hex");
  const params = new URLSearchParams({
    client_id: clientId,
    scope: "repo",
    state,
  });

  const response = NextResponse.redirect(
    `https://github.com/login/oauth/authorize?${params}`
  );

  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return response;
}
