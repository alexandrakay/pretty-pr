import { describe, it, beforeEach, afterEach, mock } from 'node:test'
import assert from 'node:assert/strict'

describe('printStreamChunk', () => {
  let written = []
  let originalWrite

  beforeEach(() => {
    written = []
    originalWrite = process.stdout.write.bind(process.stdout)
    process.stdout.write = (chunk) => { written.push(chunk); return true }
  })

  afterEach(() => {
    process.stdout.write = originalWrite
  })

  it('writes chunk directly to stdout', async () => {
    const { printStreamChunk } = await import('./output.js')
    printStreamChunk('hello world')
    assert.ok(written.includes('hello world'))
  })

  it('writes multiple chunks in order', async () => {
    const { printStreamChunk } = await import('./output.js')
    printStreamChunk('first ')
    printStreamChunk('second')
    assert.equal(written.join(''), 'first second')
  })
})

describe('printStreamHeader and printStreamFooter', () => {
  let written = []
  let originalWrite

  beforeEach(() => {
    written = []
    originalWrite = process.stdout.write.bind(process.stdout)
    process.stdout.write = (chunk) => { written.push(chunk); return true }
  })

  afterEach(() => {
    process.stdout.write = originalWrite
  })

  it('header contains PRetty branding', async () => {
    const { printStreamHeader } = await import('./output.js')
    printStreamHeader()
    const combined = written.join('')
    assert.ok(combined.includes('PRetty'))
  })

  it('footer writes a newline', async () => {
    const { printStreamFooter } = await import('./output.js')
    printStreamFooter()
    const combined = written.join('')
    assert.ok(combined.includes('\n'))
  })
})
