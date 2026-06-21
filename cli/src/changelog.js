import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export function buildChangelogPrompt({ commits, from, to, date }) {
  const range = to && to !== 'HEAD' ? `${from}..${to}` : `${from}..HEAD`
  const version = to && to !== 'HEAD' ? to : 'Unreleased'

  return `You are a technical writer generating a changelog entry for a software release.

Release: ${version}
Date: ${date}
Range: ${range}

Commits:
${commits}

Group these commits into a changelog entry using Keep a Changelog format.
Group by type: Features (feat:), Fixes (fix:), Internal (chore:/refactor:/test:/docs:).
Omit groups that have no entries. Keep entries concise — one line each.
Normalize conventional commit prefixes into plain descriptions (e.g. "feat: add X" → "Add X").

Respond with exactly this structure — no extra commentary:

## [${version}] — ${date}

### Features
- [entry]

### Fixes
- [entry]

### Internal
- [entry]

If a group has no entries, omit it entirely.`
}

export function createGenerateChangelogWithClient(anthropicClient) {
  return async function generateChangelog(context, onChunk) {
    const prompt = buildChangelogPrompt(context)

    const stream = anthropicClient.messages.stream({
      model: 'claude-opus-4-7',
      max_tokens: 1024,
      system: 'You write precise, structured changelogs. Follow Keep a Changelog format exactly.',
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

export const generateChangelog = createGenerateChangelogWithClient(client)
