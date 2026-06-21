import { getTicketFromBranch } from './git.js'

export function buildPrompt({ commits, diff, branch, status }) {
  const sections = []
  const ticket = getTicketFromBranch(branch)

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

  return `You are a senior engineer writing a pull request description. Based on the git context below, produce clean, useful PR copy.${ticket ? `\n\nInclude the ticket reference \`${ticket}\` in the PR title, e.g. \`feat(scope): description [${ticket}]\`.` : ''}

${context}

Respond with exactly this structure — no extra commentary:

## PR Title
[conventional commit style, max 72 chars${ticket ? ` — must include ticket reference ${ticket}` : ''}]

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
[add as many as relevant]

## Risk Flag
[List specific areas in this diff that warrant extra scrutiny. For each: name the area and one sentence on why it's risky — e.g. "auth middleware modified — verify token validation is unchanged". Be specific to this diff. If there are no meaningful risk areas, say "No significant risk areas identified."]${diff ? `

## Coverage Gaps
[Review the diff above against the PR Description and Changelog you just wrote. List any significant changes in the diff that your description does NOT explain — be specific about what was changed and why it matters. If everything is covered, write exactly: "Description covers all significant changes."]` : ''}`
}
