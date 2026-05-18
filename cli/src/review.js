export function buildReviewerPrompt(diff) {
  return `You are about to review a pull request. Here is the diff:

${diff}

Produce a plain-English reviewer brief with exactly this structure — no extra commentary:

## What this PR does
[2-3 sentences. Plain English. What changed and why, from a reviewer's perspective.]

## What to focus on
[Bullet list of the most important things to review carefully — logic changes, edge cases, security, correctness.]

## What to skip
[Bullet list of things that are low-risk or boilerplate — safe to skim.]

## Risk areas
[Bullet list of specific lines, functions, or patterns most likely to contain bugs or regressions. If none, say "No obvious risk areas."]

## Questions to ask
[2-4 questions worth raising with the author before or during review. If none, say "None — the changes look self-explanatory."]`
}
