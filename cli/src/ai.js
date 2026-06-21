import Anthropic from '@anthropic-ai/sdk'
import { buildPrompt } from './prompt.js'
import { buildReviewerPrompt } from './review.js'
import { loadConfig, applyConfigToPrompt } from './config.js'

const client = new Anthropic()

async function streamToString(stream, onChunk) {
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

export function createGenerateWithClient(anthropicClient) {
  return async function generate(context, onChunk) {
    const config = loadConfig()
    const basePrompt = buildPrompt(context)
    const prompt = applyConfigToPrompt(basePrompt, config)

    const stream = anthropicClient.messages.stream({
      model: 'claude-opus-4-7',
      max_tokens: 1024,
      system: 'You write precise, honest pull request descriptions for software engineers. No fluff.',
      messages: [{ role: 'user', content: prompt }],
    })

    return streamToString(stream, onChunk)
  }
}

export function createGenerateReviewWithClient(anthropicClient) {
  return async function generateReview(diff, onChunk) {
    const prompt = buildReviewerPrompt(diff)

    const stream = anthropicClient.messages.stream({
      model: 'claude-opus-4-7',
      max_tokens: 1024,
      system: 'You are a senior engineer helping a teammate quickly orient themselves before reviewing a pull request. Be direct, specific, and practical.',
      messages: [{ role: 'user', content: prompt }],
    })

    return streamToString(stream, onChunk)
  }
}

export const generate = createGenerateWithClient(client)
export const generateReview = createGenerateReviewWithClient(client)
