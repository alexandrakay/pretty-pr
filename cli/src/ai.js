import Anthropic from '@anthropic-ai/sdk'
import { buildPrompt } from './prompt.js'
import { buildReviewerPrompt } from './review.js'
import { loadConfig, applyConfigToPrompt } from './config.js'

const client = new Anthropic()

export async function generateReview(diff) {
  const prompt = buildReviewerPrompt(diff)
  const message = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 1024,
    system: 'You are a senior engineer helping a teammate quickly orient themselves before reviewing a pull request. Be direct, specific, and practical.',
    messages: [{ role: 'user', content: prompt }],
  })
  return message.content[0].text
}

export async function generate(context) {
  const config = loadConfig()
  const basePrompt = buildPrompt(context)
  const prompt = applyConfigToPrompt(basePrompt, config)

  const message = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 1024,
    system: 'You write precise, honest pull request descriptions for software engineers. No fluff.',
    messages: [{ role: 'user', content: prompt }],
  })

  return message.content[0].text
}
