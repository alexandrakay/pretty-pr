export function buildPrompt({ commits, diff, branch, status }) {
  const sections = []

  if (branch) {
    sections.push(`Branch: ${branch}`)
  }

  if (commits) {
    sections.push(`Commits:\n${commits}`)
  }

  if (status) {
    sections.push(`Working tree status:\n${status}`)
  }

  if (diff) {
    sections.push(`Diff summary:\n${diff}`)
  }

  const context = sections.join('\n\n')

  return `You are a senior engineer writing a pull request description. Based on the git context below, produce clean, useful PR copy.

${context}

Respond with exactly this structure — no extra commentary:

## PR Title
[conventional commit style, max 72 chars]

## PR Description
**What changed:** [2-4 sentences]
**Why:** [1-2 sentences on motivation]
**How to test:** [numbered steps]

## Changelog Entry
[ready-to-paste changelog line in Keep a Changelog format]

## Reviewer Notes
[what reviewers should focus on, what to skip, any gotchas]

## Testing Checklist
- [ ] [item]
- [ ] [item]
[add as many as relevant]`
}
