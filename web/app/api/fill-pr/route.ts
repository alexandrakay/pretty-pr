import { getGitHubToken } from "@/app/lib/auth";

const PR_URL_RE = /github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/;

function parsePrUrl(url: string): { owner: string; repo: string; number: number } | null {
  const match = url.match(PR_URL_RE);
  if (!match) return null;
  return { owner: match[1], repo: match[2], number: parseInt(match[3], 10) };
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body?.prUrl || !body?.title || !body?.description) {
    return Response.json({ error: "prUrl, title, and description are required" }, { status: 400 });
  }

  const { prUrl, title, description, patToken } = body as {
    prUrl: string;
    title: string;
    description: string;
    patToken?: string;
  };

  // Prefer OAuth cookie token; fall back to a PAT provided in the request body
  const token = getGitHubToken(request) ?? patToken;
  if (!token) {
    return Response.json({ error: "Not authenticated — connect GitHub or provide a token" }, { status: 401 });
  }

  const parsed = parsePrUrl(prUrl);
  if (!parsed) {
    return Response.json({ error: "Invalid GitHub PR URL" }, { status: 400 });
  }

  const { owner, repo, number } = parsed;

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${number}`, {
    method: "PATCH",
    headers: {
      Authorization: `token ${token}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({ title, body: description }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const message = (data as { message?: string }).message ?? `GitHub API error (${res.status})`;
    return Response.json({ error: message }, { status: res.status });
  }

  const data = await res.json();
  return Response.json({ url: (data as { html_url: string }).html_url });
}
