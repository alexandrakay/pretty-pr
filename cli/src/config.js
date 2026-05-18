import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

const DEFAULTS = {
  tone: 'balanced',
  sections: ['title', 'description', 'changelog', 'reviewer-notes', 'testing-checklist'],
  format: 'markdown',
  template: null,
}

export function loadConfig(cwd = process.cwd()) {
  const configPath = resolve(cwd, '.prettyrc')
  if (!existsSync(configPath)) return DEFAULTS

  try {
    const raw = readFileSync(configPath, 'utf-8')
    const parsed = JSON.parse(raw)
    return { ...DEFAULTS, ...parsed }
  } catch {
    return DEFAULTS
  }
}

export function applyConfigToPrompt(basePrompt, config) {
  const { tone, sections, template } = config

  if (template) return template

  let prompt = basePrompt

  const toneInstructions = {
    formal: 'Use formal, professional language throughout.',
    concise: 'Be as concise as possible. Prefer bullet points over prose. Keep each section brief.',
    detailed: 'Be thorough and detailed. Include context, motivation, and edge cases where relevant.',
    balanced: null,
  }

  const toneNote = toneInstructions[tone] ?? null
  if (toneNote) {
    prompt = prompt.replace(
      'Respond with exactly this structure',
      `${toneNote}\n\nRespond with exactly this structure`
    )
  }

  const sectionMap = {
    title: '## PR Title',
    description: '## PR Description',
    changelog: '## Changelog Entry',
    'reviewer-notes': '## Reviewer Notes',
    'testing-checklist': '## Testing Checklist',
  }

  const excluded = Object.entries(sectionMap)
    .filter(([key]) => !sections.includes(key))
    .map(([, heading]) => heading)

  if (excluded.length > 0) {
    const lines = prompt.split('\n')
    const filtered = []
    let skip = false

    for (const line of lines) {
      const isExcludedHeading = excluded.some((h) => line.startsWith(h))
      if (isExcludedHeading) {
        skip = true
        continue
      }
      const isAnyHeading = Object.values(sectionMap).some((h) => line.startsWith(h))
      if (isAnyHeading) skip = false
      if (!skip) filtered.push(line)
    }

    prompt = filtered.join('\n')
  }

  return prompt
}
