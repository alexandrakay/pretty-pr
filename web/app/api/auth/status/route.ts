import { getGitHubToken } from "@/app/lib/auth";

export async function GET(request: Request) {
  const token = getGitHubToken(request);
  if (!token) return Response.json({ authenticated: false });

  const res = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!res.ok) return Response.json({ authenticated: false });

  const user = await res.json() as { login: string; avatar_url: string };
  return Response.json({ authenticated: true, username: user.login, avatar: user.avatar_url });
}
