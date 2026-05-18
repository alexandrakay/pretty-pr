# PRetty — Project Context for Claude Code

## What is PRetty?

PRetty turns messy commits into clean pull request descriptions, changelogs, and release notes — from the browser or your terminal.

It solves a real, universal developer problem: everyone knows what a good PR looks like. Nobody writes one at 4pm on a Friday. PRetty removes the friction between knowing and doing.

**Tagline:** Your commits tell the whole story. Your PR should too.

---

## Project Structure

Two products, one AI core:

### 1. Web App
- Paste commits manually (or connect repo — stretch goal)
- Generate structured PR copy
- Save history
- Stack: React, Tailwind, Anthropic API

### 2. npm CLI Package
- Run `npx pretty-pr` inside any repo
- Reads from `git log` and optionally `git diff`
- Outputs to terminal or markdown file
- Stack: Node.js, commander or yargs, Anthropic API

---

## CLI Design

### Commands & Flags

```bash
npx pretty-pr                  # commits only, fast
npx pretty-pr --diff           # includes diff, richer output
npx pretty-pr --full           # everything: commits + diff + branch, slowest/best
npx pretty-pr --base main      # specify base branch
npx pretty-pr --range abc..def # specific commit range
npx pretty-pr --out pr.md      # output to markdown file
```

### What the CLI reads
- `git log` — commit messages, authors, timestamps
- `git diff` — actual code changes (with --diff or --full)
- `git status` — staged/unstaged state
- Branch name — infers intent (e.g. `feat/user-auth`, `fix/payment-timeout`)

### Output quality ladder
- Commits only → decent PR title, okay description, thin on context
- Commits + diff → strong title, solid description, inferred testing notes
- Commits + diff + branch name → full picture, good reviewer notes

---

## AI Output Format

Every generation produces:

1. **PR Title** — conventional commit style, clean
2. **PR Description** — what changed, why, how to test
3. **Changelog Entry** — ready to paste
4. **Reviewer Notes** — what to focus on, what to skip
5. **Testing Checklist** — auto-generated from the diff

---

## Architecture Decision

The CLI calls the same API as the web app — it's a thin wrapper over the same AI logic. This is intentional: one core, two surfaces. Good engineering story for the build series.

---

## Team Features (planned)

PRetty is a personal tool today. These features make it a team tool:

- **`.prettyrc` config** — team commits to repo, everyone gets same format/tone/structure. Tone settings: `formal`, `concise`, `detailed`.
- **Custom templates** — teams define their own structure (Jira ticket numbers, motivation/approach/testing, etc.)
- **GitHub Action** — runs PRetty on PR open, posts generated description if empty. Highest-leverage distribution feature — sticky in a way a CLI isn't.
- **Reviewer summary mode** — paste a PR link or diff, get a plain-English brief before reviewing. Doubles the audience: authors write PRs with it, reviewers read PRs with it.
- **Risk flag** — highlights diff areas most likely to need scrutiny. Not a linter, an AI second opinion on where to look.
- **Slack summary** — posts a one-line AI-generated PR summary to team channel on PR open.
- **PR score** — checklist completion indicator (has description? testing notes? changelog?). Soft standard, not a grade.
- **Diff coverage hints** — flags gaps between the description and actual changes ("you mentioned auth but didn't explain the session timeout change").

## Stretch Goals (post-MVP)

- npm publish
- Changelog mode (generate full changelog from tag range, `--mode changelog` flag)
- Conventional commit cleanup
- GitHub repo connection (connect repo directly, no manual paste)
- Save history / auth

---

## Build Context

This is Week 3 of a 12-week build-in-public series. Each week ships a working app.

- Week 1: Queryn (AI quiz app — consumer)
- Week 2: Infrayn (infrastructure analysis — developer tools)
- Week 3: PRetty (PR copy generation — developer workflow)

The series documents decisions, tradeoffs, and process — not just the code.

### Why this week is significant
- First build that a developer might share with a teammate who's never heard of the series
- Shows: React app + Node CLI + npm packaging + AI workflow + git integration
- Useful enough to actually keep using after the week ends

---

## Content / Brand Tone

- Sharp, a little cocky — like it was built by someone annoyed enough to fix the problem
- The capital R in PRetty is intentional — PR + pretty
- Not polished enterprise software. A developer tool with opinions.
- Honest about the problem: "nobody writes good PR descriptions"

---

## Reference

Planning conversation (claude.ai): https://claude.ai/chat/[this-chat-id]

Good PR reference article: https://codedrivendevelopment.com/posts/master-pull-requests

Key insight from that article: PRs are both an engineering *and* soft skill. A PR is how your teammates experience your work.
