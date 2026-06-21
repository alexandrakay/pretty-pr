import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SYSTEM_PROMPT =
  "You are a careful code reviewer checking that a PR description covers all the changes in the diff.";

function buildHintsPrompt(diff: string, description: string): string {
  return `You are a senior engineer reviewing a pull request description for completeness.

Here is the git diff:
<diff>
${diff}
</diff>

Here is the PR description that was written:
<description>
${description}
</description>

Compare the diff against the description. List any significant changes in the diff that the description does NOT adequately explain. Be specific: name the file or function changed and one sentence on why it matters.

If the description covers all significant changes, respond with exactly:
"Description covers all significant changes."

Otherwise, respond with a bullet list. Each bullet: one concrete gap, e.g.:
• \`auth/session.ts\` modifies SESSION_TIMEOUT — not mentioned in the description.

Do not comment on style or completeness of the description itself. Only flag changes in the diff that are absent from the description.`;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body?.diff?.trim() || !body?.description?.trim()) {
    return Response.json(
      { error: "diff and description are required" },
      { status: 400 }
    );
  }

  const { diff, description } = body as { diff: string; description: string };
  const prompt = buildHintsPrompt(diff, description);

  const stream = await client.messages.stream({
    model: "claude-opus-4-7",
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
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
