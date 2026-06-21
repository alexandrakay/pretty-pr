import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export function buildHintsPrompt(diff, description) {
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

Do not comment on style or completeness of the description itself. Only flag changes in the diff that are absent from the description.`
}

export function createGenerateHintsWithClient(anthropicClient) {
  return async function generateCoverageHints(diff, description, onChunk) {
    const prompt = buildHintsPrompt(diff, description)

    const stream = anthropicClient.messages.stream({
      model: 'claude-opus-4-7',
      max_tokens: 512,
      system: 'You are a careful code reviewer checking that a PR description covers all the changes in the diff.',
      messages: [{ role: 'user', content: prompt }],
    })

    let text = ''
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
        const chunk = event.delta.text
        text += chunk
        onChunk?.(chunk)
      }
    }
    return text
  }
}

export const generateCoverageHints = createGenerateHintsWithClient(client)
