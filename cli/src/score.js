const CRITERIA = [
  { key: 'PR Title', label: 'PR Title' },
  { key: 'PR Description', label: 'Description' },
  { key: 'Changelog Entry', label: 'Changelog' },
  { key: 'Reviewer Notes', label: 'Reviewer Notes' },
  { key: 'Testing Checklist', label: 'Testing Checklist' },
]

function extractSection(text, heading) {
  const marker = `## ${heading}`
  const start = text.indexOf(marker)
  if (start === -1) return null
  const contentStart = start + marker.length
  const nextMatch = text.indexOf('\n## ', contentStart)
  const content = text.slice(contentStart, nextMatch === -1 ? text.length : nextMatch).trim()
  return content || null
}

export function scoreOutput(text) {
  const sections = CRITERIA.map((c) => {
    const content = extractSection(text, c.key)
    return { key: c.key, label: c.label, present: Boolean(content?.trim()) }
  })

  const met = sections.filter((s) => s.present).length
  return { met, total: sections.length, sections }
}

export function formatScoreBar(met, total) {
  const filled = '█'.repeat(met)
  const empty = '░'.repeat(total - met)
  return filled + empty
}
