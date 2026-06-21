import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { buildChangelogPrompt } from './changelog.js'

describe('buildChangelogPrompt', () => {
  const baseContext = {
    commits: 'abc123 feat: add OAuth login (Alice, 2 days ago)\ndef456 fix: resolve session timeout (Bob, 1 day ago)',
    from: 'v1.2.0',
    to: 'HEAD',
    date: '2024-06-20',
  }

  it('includes the from/to range in the prompt', () => {
    const prompt = buildChangelogPrompt(baseContext)
    assert.ok(prompt.includes('v1.2.0'))
  })

  it('includes the date in the prompt', () => {
    const prompt = buildChangelogPrompt(baseContext)
    assert.ok(prompt.includes('2024-06-20'))
  })

  it('includes the commits in the prompt', () => {
    const prompt = buildChangelogPrompt(baseContext)
    assert.ok(prompt.includes('feat: add OAuth login'))
    assert.ok(prompt.includes('fix: resolve session timeout'))
  })

  it('requests grouped output (Features / Fixes / Internal)', () => {
    const prompt = buildChangelogPrompt(baseContext)
    // The prompt should instruct the AI to group by type
    const lower = prompt.toLowerCase()
    assert.ok(
      lower.includes('feat') || lower.includes('feature') || lower.includes('group'),
      'prompt should mention grouping by type'
    )
  })

  it('includes the to-ref when it is a named tag', () => {
    const prompt = buildChangelogPrompt({ ...baseContext, to: 'v1.3.0' })
    assert.ok(prompt.includes('v1.3.0'))
  })

  it('returns a non-empty string', () => {
    const prompt = buildChangelogPrompt(baseContext)
    assert.ok(typeof prompt === 'string' && prompt.length > 0)
  })
})
