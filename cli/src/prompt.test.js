import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { buildPrompt } from './prompt.js'

describe('buildPrompt — ticket injection', () => {
  it('includes the ticket reference when a Jira ticket is in the branch name', () => {
    const prompt = buildPrompt({ commits: 'abc def', branch: 'feature/PROJ-123-add-oauth', diff: null, status: null })
    assert.ok(prompt.includes('PROJ-123'), 'Expected ticket PROJ-123 in prompt')
  })

  it('includes a GitHub issue reference when branch starts with a number', () => {
    const prompt = buildPrompt({ commits: 'abc def', branch: 'feature/456-fix-timeout', diff: null, status: null })
    assert.ok(prompt.includes('#456'), 'Expected issue #456 in prompt')
  })

  it('does not include ticket instructions when branch has no ticket pattern', () => {
    const prompt = buildPrompt({ commits: 'abc def', branch: 'feature/add-oauth', diff: null, status: null })
    assert.ok(!prompt.includes('ticket reference'), 'Should not mention ticket reference when none found')
  })

  it('does not include ticket instructions when branch is null', () => {
    const prompt = buildPrompt({ commits: 'abc def', branch: null, diff: null, status: null })
    assert.ok(!prompt.includes('ticket reference'))
  })

  it('instructs the AI to include the ticket in the PR title', () => {
    const prompt = buildPrompt({ commits: 'abc def', branch: 'feature/ENG-99-auth', diff: null, status: null })
    assert.ok(prompt.includes('ENG-99'))
    assert.ok(prompt.includes('PR title') || prompt.includes('title'))
  })
})
