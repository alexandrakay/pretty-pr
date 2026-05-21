export async function GET(request: Request) {
  const token = request.headers.get("x-github-token");
  if (!token) return Response.json({ error: "Missing token" }, { status: 401 });

  const res = await fetch(
    "https://api.github.com/user/repos?sort=updated&per_page=100&type=all",
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

  const repos = await res.json() as Array<{ full_name: string; default_branch: string; private: boolean }>;
  return Response.json(
    repos.map((r) => ({ fullName: r.full_name, defaultBranch: r.default_branch, private: r.private }))
  );
}
