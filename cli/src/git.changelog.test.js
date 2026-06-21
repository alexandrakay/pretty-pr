import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { getCommitsBetweenTags } from './git.js'

// These tests verify the function exists and handles edge cases.
// Actual git execution only works in a real repo — we test structural behavior.

describe('getCommitsBetweenTags', () => {
  it('returns a string or null — does not throw on valid ref-like args', () => {
    // In a real repo this returns commit lines; in CI with no tags it returns null or a string.
    // We just verify it doesn't throw and returns the right type.
    const result = getCommitsBetweenTags('HEAD~5', 'HEAD')
    assert.ok(result === null || typeof result === 'string')
  })

  it('returns null when from ref does not exist', () => {
    const result = getCommitsBetweenTags('v99.99.99-nonexistent', 'HEAD')
    assert.equal(result, null)
  })

  it('defaults to when no to-ref is provided', () => {
    // Should not throw when only from is given
    const result = getCommitsBetweenTags('HEAD~3')
    assert.ok(result === null || typeof result === 'string')
  })
})
