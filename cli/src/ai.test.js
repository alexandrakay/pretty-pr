import { describe, it, mock, beforeEach } from 'node:test'
import assert from 'node:assert/strict'

// We need to mock the Anthropic SDK before importing ai.js.
// Node's test runner supports this via module mocking with --experimental-vm-modules,
// but the simplest approach for ESM is to test the public behavior via a stub client
// injected through a factory function we'll add to ai.js.

// Test the chunk accumulation logic directly — the core behavior we care about.
describe('streaming accumulation', () => {
  it('concatenates chunks in order', () => {
    const chunks = ['## PR Title\n', 'feat: add streaming\n', '\n## PR Description\n', 'Adds streaming.']
    let accumulated = ''
    for (const chunk of chunks) {
      accumulated += chunk
    }
    assert.equal(accumulated, '## PR Title\nfeat: add streaming\n\n## PR Description\nAdds streaming.')
  })

  it('handles empty chunks without breaking', () => {
    const chunks = ['hello', '', ' world', '']
    let accumulated = ''
    for (const chunk of chunks) accumulated += chunk
    assert.equal(accumulated, 'hello world')
  })
})

describe('generate with onChunk callback', () => {
  it('invokes onChunk for each token and returns full text', async () => {
    const { createGenerateWithClient } = await import('./ai.js')

    const fakeChunks = ['## PR Title\n', 'feat: stream output\n', '\n## PR Description\n', 'Done.']
    const fakeStream = {
      async *[Symbol.asyncIterator]() {
        for (const text of fakeChunks) {
          yield { type: 'content_block_delta', delta: { type: 'text_delta', text } }
        }
      },
      async finalMessage() {
        return { content: [{ text: fakeChunks.join('') }] }
      },
    }

    const fakeClient = {
      messages: {
        stream: () => fakeStream,
      },
    }

    const received = []
    const result = await createGenerateWithClient(fakeClient)({ commits: 'abc def' }, (chunk) => {
      received.push(chunk)
    })

    assert.deepEqual(received, fakeChunks)
    assert.equal(result, fakeChunks.join(''))
  })

  it('works without an onChunk callback (silent accumulation)', async () => {
    const { createGenerateWithClient } = await import('./ai.js')

    const fakeChunks = ['## PR Title\n', 'feat: test\n']
    const fakeStream = {
      async *[Symbol.asyncIterator]() {
        for (const text of fakeChunks) {
          yield { type: 'content_block_delta', delta: { type: 'text_delta', text } }
        }
      },
      async finalMessage() {
        return { content: [{ text: fakeChunks.join('') }] }
      },
    }

    const fakeClient = { messages: { stream: () => fakeStream } }
    const result = await createGenerateWithClient(fakeClient)({ commits: 'abc def' })
    assert.equal(result, '## PR Title\nfeat: test\n')
  })
})

describe('generateReview with onChunk callback', () => {
  it('invokes onChunk and returns accumulated review text', async () => {
    const { createGenerateReviewWithClient } = await import('./ai.js')

    const fakeChunks = ['## What this PR does\n', 'Adds streaming.\n']
    const fakeStream = {
      async *[Symbol.asyncIterator]() {
        for (const text of fakeChunks) {
          yield { type: 'content_block_delta', delta: { type: 'text_delta', text } }
        }
      },
      async finalMessage() {
        return { content: [{ text: fakeChunks.join('') }] }
      },
    }

    const fakeClient = { messages: { stream: () => fakeStream } }
    const received = []
    const result = await createGenerateReviewWithClient(fakeClient)('some diff', (chunk) => {
      received.push(chunk)
    })

    assert.deepEqual(received, fakeChunks)
    assert.equal(result, '## What this PR does\nAdds streaming.\n')
  })
})
