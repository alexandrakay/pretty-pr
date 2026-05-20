interface PromptContext {
  commits: string;
  branch?: string;
}

export function buildPrompt({ commits, branch }: PromptContext): string {
  const sections: string[] = [];

  if (branch) sections.push(`Branch: ${branch}`);
  sections.push(`Commits:\n${commits}`);

  const context = sections.join("\n\n");

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
[add as many as relevant]

## Risk Flag
[List specific areas in this diff that warrant extra scrutiny. For each: name the area and one sentence on why it's risky — e.g. "auth middleware modified — verify token validation is unchanged". Be specific to this diff. If there are no meaningful risk areas, say "No significant risk areas identified."]`;
}

export const SYSTEM_PROMPT =
  "You write precise, honest pull request descriptions for software engineers. No fluff.";
