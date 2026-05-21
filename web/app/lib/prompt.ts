export interface Preferences {
  tone: "balanced" | "concise" | "detailed" | "formal";
  sections: string[];
}

export const DEFAULT_PREFERENCES: Preferences = {
  tone: "balanced",
  sections: ["title", "description", "changelog", "reviewer-notes", "testing-checklist"],
};

const SECTION_HEADINGS: Record<string, string> = {
  title: "## PR Title",
  description: "## PR Description",
  changelog: "## Changelog Entry",
  "reviewer-notes": "## Reviewer Notes",
  "testing-checklist": "## Testing Checklist",
};

const TONE_INSTRUCTIONS: Record<string, string | null> = {
  formal: "Use formal, professional language throughout.",
  concise: "Be as concise as possible. Prefer bullet points over prose. Keep each section brief.",
  detailed: "Be thorough and detailed. Include context, motivation, and edge cases where relevant.",
  balanced: null,
};

export function applyPreferencesToPrompt(prompt: string, prefs: Preferences): string {
  let result = prompt;

  const toneNote = TONE_INSTRUCTIONS[prefs.tone] ?? null;
  if (toneNote) {
    result = result.replace(
      "Respond with exactly this structure",
      `${toneNote}\n\nRespond with exactly this structure`
    );
  }

  const excluded = Object.entries(SECTION_HEADINGS)
    .filter(([key]) => !prefs.sections.includes(key))
    .map(([, heading]) => heading);

  if (excluded.length > 0) {
    const lines = result.split("\n");
    const filtered: string[] = [];
    let skip = false;

    for (const line of lines) {
      const isExcluded = excluded.some((h) => line.startsWith(h));
      if (isExcluded) { skip = true; continue; }
      const isAnyHeading = Object.values(SECTION_HEADINGS).some((h) => line.startsWith(h));
      if (isAnyHeading) skip = false;
      if (!skip) filtered.push(line);
    }

    result = filtered.join("\n");
  }

  return result;
}

interface PromptContext {
  commits: string;
  branch?: string;
  diff?: string;
}

export function buildPrompt({ commits, branch, diff }: PromptContext): string {
  const sections: string[] = [];

  if (branch) sections.push(`Branch: ${branch}`);
  sections.push(`Commits:\n${commits}`);
  if (diff) sections.push(`Diff:\n${diff}`);

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
[List specific areas in this diff that warrant extra scrutiny. For each: name the area and one sentence on why it's risky — e.g. "auth middleware modified — verify token validation is unchanged". Be specific to this diff. If there are no meaningful risk areas, say "No significant risk areas identified."]${diff ? `

## Coverage Gaps
[Review the diff above against the PR Description and Changelog you just wrote. List any significant changes in the diff that your description does NOT explain — be specific about what was changed and why it matters. If everything is covered, write exactly: "Description covers all significant changes."]` : ""}`;
}

export const SYSTEM_PROMPT =
  "You write precise, honest pull request descriptions for software engineers. No fluff.";
