# P**R**etty

> Your commits tell the whole story. Your PR should too.

Most developers skip proper PR descriptions.

Maybe you're vibe coding and your commit history looks like:
```
→ checkpoint
→ claude suggested this
→ fix
→ ok works
```

Maybe you just don't enjoy writing them. Maybe it's 4pm on a Friday and you just want to ship.

Either way — your teammate is staring at 400 lines of diff with no context.

PRs aren't just for getting code merged. They're how your team understands your work. They're institutional memory. Six months from now someone's in `git blame` trying to understand a decision — and the PR is either helpful or useless.

AI writes the code. AI should write the PR. The loop closes.

---

## What it generates

Run PRetty against any branch and get:

- **PR title** — conventional commit style, clean
- **PR description** — what changed, why, how to test
- **Reviewer notes** — what to focus on, what to skip, any gotchas
- **Testing checklist** — auto-generated from your diff
- **Changelog entry** — ready to paste

---

## CLI

```bash
npx pretty-pr                  # commits only, fast
npx pretty-pr --diff           # includes diff, richer output
npx pretty-pr --full           # everything: commits + diff + branch
npx pretty-pr --base main      # specify base branch
npx pretty-pr --range abc..def # specific commit range
npx pretty-pr --out pr.md      # write to markdown file
npx pretty-pr --open           # generate copy and open a GitHub PR
npx pretty-pr --open --draft   # open as a draft PR
```

### Setup

```bash
cd your-repo
export ANTHROPIC_API_KEY=sk-ant-...
npx pretty-pr --diff
```

Or add `ANTHROPIC_API_KEY` to your `.env`.

**Output quality ladder:**
- Commits only → decent title, okay description
- Commits + diff → strong title, solid description, testing notes
- Commits + diff + branch → full picture, good reviewer notes

---

## Web app

Paste commits into [pretty-pr.com](https://pretty-pr.com) and get the same output in your browser. No install, no auth.

---

## GitHub Action

Drop one workflow file into your repo. Every new PR gets an AI-generated description filled in automatically.

```yaml
# .github/workflows/pretty-pr.yml
name: PRetty PR

on:
  pull_request:
    types: [opened, reopened]

jobs:
  pretty-pr:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: alexandrakay/pretty-pr/action@v1
        with:
          anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
```

Add `ANTHROPIC_API_KEY` as a repo secret and you're done. When a PR is opened with an empty description, PRetty fills it in. If the description already has content, it posts the generated copy as a comment instead.

---

## Local development

```bash
# Clone
git clone https://github.com/alexandrakay/pretty-pr.git
cd pretty-pr

# CLI
cd cli
npm install
cp .env.example .env.local   # add your ANTHROPIC_API_KEY
node bin/pretty-pr.js --diff

# Web
cd web
npm install
cp .env.example .env.local   # add your ANTHROPIC_API_KEY
npm run dev                  # http://localhost:3000
```

---

## Stack

- **CLI** — Node.js, Commander, Anthropic SDK
- **Web** — Next.js 16, Tailwind CSS v4, Anthropic SDK
- **AI** — Claude (claude-opus-4-7)

---

Built in public — Week 3 of 12.  
[Week 1: Queryn](https://github.com/alexandrakay/queryn) · [Week 2: Infrayn](https://github.com/alexandrakay/infrayn) · Week 3: PRetty
