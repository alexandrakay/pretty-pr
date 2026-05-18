import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SYSTEM_PROMPT = "You are a senior engineer helping a teammate quickly orient themselves before reviewing a pull request. Be direct, specific, and practical.";

function buildReviewerPrompt(diff: string): string {
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
[2-4 questions worth raising with the author before or during review. If none, say "None — the changes look self-explanatory."]`;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body?.diff?.trim()) {
    return Response.json({ error: "diff is required" }, { status: 400 });
  }

  const { diff } = body as { diff: string };

  const stream = await client.messages.stream({
    model: "claude-opus-4-7",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildReviewerPrompt(diff) }],
  });

  const readable = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
