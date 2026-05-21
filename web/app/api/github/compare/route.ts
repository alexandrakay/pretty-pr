import { getGitHubToken } from "@/app/lib/auth";

const DIFF_MAX_CHARS = 6000;

function formatCommits(commits: Array<{ sha: string; commit: { message: string; author: { name: string; date: string } } }>): string {
  return commits
    .slice()
    .reverse()
    .map((c) => {
      const short = c.sha.slice(0, 7);
      const msg = c.commit.message.split("\n")[0];
      const author = c.commit.author.name;
      const date = new Date(c.commit.author.date).toLocaleDateString();
      return `${short} ${msg} (${author}, ${date})`;
    })
    .join("\n");
}

export async function GET(request: Request) {
  const token = getGitHubToken(request);
  const { searchParams } = new URL(request.url);
  const repo = searchParams.get("repo");
  const base = searchParams.get("base");
  const head = searchParams.get("head");

  if (!token) return Response.json({ error: "Not authenticated" }, { status: 401 });
  if (!repo || !base || !head) return Response.json({ error: "Missing repo, base, or head" }, { status: 400 });

  const res = await fetch(
    `https://api.github.com/repos/${repo}/compare/${base}...${head}`,
    {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.diff",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return Response.json({ error: text || `GitHub error (${res.status})` }, { status: res.status });
  }

  const rawDiff = await res.text();
  const diff = rawDiff.length > DIFF_MAX_CHARS ? rawDiff.slice(0, DIFF_MAX_CHARS) + "\n\n[diff truncated]" : rawDiff;

  const jsonRes = await fetch(
    `https://api.github.com/repos/${repo}/compare/${base}...${head}`,
    {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  if (!jsonRes.ok) {
    return Response.json({ commits: "", diff });
  }

  const data = await jsonRes.json() as { commits: Array<{ sha: string; commit: { message: string; author: { name: string; date: string } } }> };
  const commits = formatCommits(data.commits);

  return Response.json({ commits, diff });
}
