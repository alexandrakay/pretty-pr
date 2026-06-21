import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { buildHintsPrompt } from './hints.js'

describe('buildHintsPrompt', () => {
  const diff = `diff --git a/src/auth.ts b/src/auth.ts
+++ b/src/auth.ts
+const SESSION_TIMEOUT = 3600`

  const description = `## PR Description
**What changed:** Added OAuth login via GitHub.
**Why:** Users requested social login.
**How to test:** Click "Sign in with GitHub".`

  it('includes the diff in the prompt', () => {
    const prompt = buildHintsPrompt(diff, description)
    assert.ok(prompt.includes('SESSION_TIMEOUT'))
  })

  it('includes the description in the prompt', () => {
    const prompt = buildHintsPrompt(diff, description)
    assert.ok(prompt.includes('OAuth login'))
  })

  it('asks the AI to compare diff against description', () => {
    const prompt = buildHintsPrompt(diff, description)
    const lower = prompt.toLowerCase()
    assert.ok(
      lower.includes('description') && (lower.includes('diff') || lower.includes('changes')),
      'prompt should ask AI to compare description against diff'
    )
  })

  it('returns a non-empty string', () => {
    const prompt = buildHintsPrompt(diff, description)
    assert.ok(typeof prompt === 'string' && prompt.length > 0)
  })

  it('handles empty diff gracefully', () => {
    const prompt = buildHintsPrompt('', description)
    assert.ok(typeof prompt === 'string')
  })
})
