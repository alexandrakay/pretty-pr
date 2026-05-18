# prettypr

Your commits tell the whole story. Your PR should too.

**prettypr** turns your git history into clean pull request descriptions, changelogs, and reviewer notes — in seconds.

```
npx @alexandrakay/pretty-pr
```

---

## The problem

Everyone knows what a good PR looks like. Nobody writes one at 4pm on a Friday.

You just shipped something. Your commit history says `wip`, `fix`, `ok this works`. The code is solid. The PR description is blank. Your teammate has no idea what they're reviewing.

prettypr reads your commits, understands what you built, and writes the copy your PR should have had.

---

## Setup

You need an [Anthropic API key](https://console.anthropic.com).

```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

Or drop it in a `.env.local` file at your repo root — prettypr picks it up automatically.

---

## Usage

```bash
npx @alexandrakay/pretty-pr                   # commits only — fast, good enough for most PRs
npx @alexandrakay/pretty-pr --diff            # includes diff — richer output, better testing notes
npx @alexandrakay/pretty-pr --full            # everything: commits + diff + branch — best results
npx @alexandrakay/pretty-pr --base main       # compare against a specific base branch
npx @alexandrakay/pretty-pr --range abc..def  # specific commit range
npx @alexandrakay/pretty-pr --out pr.md       # write output to a markdown file
npx @alexandrakay/pretty-pr --open            # generate and open a GitHub PR (requires gh CLI)
npx @alexandrakay/pretty-pr --draft           # use with --open to open as a draft PR
```

### Output quality ladder

| Mode | Command | Output |
|------|---------|--------|
| Commits only | `npx @alexandrakay/pretty-pr` | Decent PR title, okay description |
| Commits + diff | `npx @alexandrakay/pretty-pr --diff` | Strong title, solid description, testing notes |
| Commits + diff + branch | `npx @alexandrakay/pretty-pr --full` | Full picture — best title, reviewer notes, checklist |

---

## What you get

Every run produces five sections:

- **PR Title** — conventional commit style, max 72 chars
- **PR Description** — what changed, why, how to test
- **Changelog Entry** — ready to paste into your CHANGELOG.md
- **Reviewer Notes** — what to focus on, what to skip, what's risky
- **Testing Checklist** — auto-generated from your actual diff

---

## Config file

Drop a `.prettyrc` file in your repo root to set team-wide preferences:

```json
{
  "tone": "concise",
  "sections": ["title", "description", "changelog", "reviewer-notes", "testing-checklist"],
  "format": "markdown"
}
```

**Tone options:** `balanced` (default) · `concise` · `detailed` · `formal`

Generate your `.prettyrc` at [prettypr.dev/config](https://prettypr.dev/config).

prettypr reads `.prettyrc` automatically — no flags needed. Commit it to your repo and every teammate gets the same output format.

---

## Open PRs directly

If you have the [GitHub CLI](https://cli.github.com) installed and authenticated:

```bash
npx @alexandrakay/pretty-pr --full --open
```

prettypr generates the copy, opens a PR, and fills in the title and description. Add `--draft` for a draft PR.

---

## Install globally

If you use it every day:

```bash
npm install -g @alexandrakay/pretty-pr
prettypr --full
```

---

## Web app

Prefer the browser? Paste your commits at [prettypr.dev](https://prettypr.dev) — no install, no signup.

---

## License

MIT
