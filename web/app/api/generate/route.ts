import Anthropic from "@anthropic-ai/sdk";
import { buildPrompt, applyPreferencesToPrompt, DEFAULT_PREFERENCES, SYSTEM_PROMPT, type Preferences } from "@/app/lib/prompt";

const client = new Anthropic();

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body?.commits?.trim()) {
    return Response.json({ error: "commits is required" }, { status: 400 });
  }

  const { commits, branch, diff, preferences } = body as {
    commits: string;
    branch?: string;
    diff?: string;
    preferences?: Preferences;
  };

  const prefs: Preferences = {
    tone: preferences?.tone ?? DEFAULT_PREFERENCES.tone,
    sections: Array.isArray(preferences?.sections) ? preferences.sections : DEFAULT_PREFERENCES.sections,
  };

  const basePrompt = buildPrompt({ commits, branch, diff });
  const prompt = applyPreferencesToPrompt(basePrompt, prefs);

  const stream = await client.messages.stream({
    model: "claude-opus-4-7",
    max_tokens: 1500,
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
