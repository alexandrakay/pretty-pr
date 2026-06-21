import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { scoreOutput, formatScoreBar } from './score.js'

const FULL_OUTPUT = `## PR Title
feat: add OAuth login

## PR Description
**What changed:** Added GitHub OAuth.
**Why:** Users requested social login.
**How to test:** Click Sign in with GitHub.

## Changelog Entry
- Add GitHub OAuth login

## Reviewer Notes
Focus on the session handling.

## Testing Checklist
- [ ] OAuth flow works
- [ ] Session persists on refresh

## Risk Flag
Session middleware modified.`

describe('scoreOutput', () => {
  it('returns 5/5 for a fully populated output', () => {
    const score = scoreOutput(FULL_OUTPUT)
    assert.equal(score.met, 5)
    assert.equal(score.total, 5)
  })

  it('returns 1/5 when only title is present', () => {
    const score = scoreOutput('## PR Title\nfeat: add thing')
    assert.equal(score.met, 1)
  })

  it('returns 0/5 for empty string', () => {
    const score = scoreOutput('')
    assert.equal(score.met, 0)
  })

  it('returns the section breakdown', () => {
    const score = scoreOutput(FULL_OUTPUT)
    assert.ok(Array.isArray(score.sections))
    assert.equal(score.sections.length, 5)
    assert.ok(score.sections.every((s) => typeof s.present === 'boolean' && typeof s.label === 'string'))
  })

  it('marks a section as missing if content is only whitespace', () => {
    const output = '## PR Title\n   \n## PR Description\nSome text.'
    const score = scoreOutput(output)
    const title = score.sections.find((s) => s.key === 'PR Title')
    assert.equal(title?.present, false)
  })
})

describe('formatScoreBar', () => {
  it('produces a bar with filled blocks equal to met count', () => {
    const bar = formatScoreBar(3, 5)
    // ███░░ style — 3 filled, 2 empty
    assert.ok(bar.includes('█'))
    assert.ok(typeof bar === 'string')
  })

  it('is fully filled when met === total', () => {
    const bar = formatScoreBar(5, 5)
    assert.ok(!bar.includes('░'))
  })

  it('is fully empty when met === 0', () => {
    const bar = formatScoreBar(0, 5)
    assert.ok(!bar.includes('█'))
  })
})
