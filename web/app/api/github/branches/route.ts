export async function GET(request: Request) {
  const token = request.headers.get("x-github-token");
  const { searchParams } = new URL(request.url);
  const repo = searchParams.get("repo");

  if (!token) return Response.json({ error: "Missing token" }, { status: 401 });
  if (!repo) return Response.json({ error: "Missing repo" }, { status: 400 });

  const res = await fetch(
    `https://api.github.com/repos/${repo}/branches?per_page=100`,
    {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return Response.json(
      { error: (data as { message?: string }).message ?? `GitHub error (${res.status})` },
      { status: res.status }
    );
  }

  const branches = await res.json() as Array<{ name: string }>;
  return Response.json(branches.map((b) => b.name));
}
