import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { createClipboardWithProvider } from './clipboard.js'

describe('copyToClipboard', () => {
  it('calls the provider write function with the text', async () => {
    let written = null
    const fakeProvider = { write: async (text) => { written = text } }
    const copyToClipboard = createClipboardWithProvider(fakeProvider)

    const result = await copyToClipboard('hello clipboard')
    assert.equal(written, 'hello clipboard')
    assert.equal(result.success, true)
  })

  it('returns success: false and an error message when the provider throws', async () => {
    const fakeProvider = {
      write: async () => { throw new Error('xclip not found') },
    }
    const copyToClipboard = createClipboardWithProvider(fakeProvider)

    const result = await copyToClipboard('some text')
    assert.equal(result.success, false)
    assert.ok(result.error.includes('xclip not found'))
  })

  it('returns success: false with a helpful message on headless/CI environments', async () => {
    const fakeProvider = {
      write: async () => { throw new Error('Could not copy to clipboard') },
    }
    const copyToClipboard = createClipboardWithProvider(fakeProvider)

    const result = await copyToClipboard('text')
    assert.equal(result.success, false)
    assert.ok(typeof result.error === 'string')
  })

  it('handles empty string without throwing', async () => {
    let written = null
    const fakeProvider = { write: async (text) => { written = text } }
    const copyToClipboard = createClipboardWithProvider(fakeProvider)

    const result = await copyToClipboard('')
    assert.equal(written, '')
    assert.equal(result.success, true)
  })
})
