"use client";

export default function GenerateForm() {
  return (
    <form className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="commits" className="text-sm font-medium text-text-muted uppercase tracking-wider">
          Commits
        </label>
        <textarea
          id="commits"
          name="commits"
          rows={10}
          placeholder={"Paste your git log output here...\n\ne.g.\n  abc1234 feat: add user auth (Alex, 2 days ago)\n  def5678 fix: token expiry edge case (Alex, 1 day ago)"}
          className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-muted font-mono resize-y focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="branch" className="text-sm font-medium text-text-muted uppercase tracking-wider">
          Branch name <span className="normal-case text-text-muted">(optional)</span>
        </label>
        <input
          id="branch"
          name="branch"
          type="text"
          placeholder="e.g. feature/user-auth"
          className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-muted font-mono focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
        />
      </div>

      <button
        type="submit"
        className="self-start rounded-lg bg-accent hover:bg-accent-hover px-6 py-3 text-sm font-semibold text-white transition-colors cursor-pointer"
      >
        Generate PR copy
      </button>
    </form>
  );
}
