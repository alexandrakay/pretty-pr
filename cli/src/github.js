import { execSync } from 'child_process'
import { writeFileSync, unlinkSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

function run(cmd) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim()
}

export function parseOutput(text) {
  const titleMatch = text.match(/^## PR Title\s*\n+(.+)/m)
  const title = titleMatch ? titleMatch[1].trim() : null

  const bodyMatch = text.match(/## PR Description[\s\S]+/m)
  const body = bodyMatch ? bodyMatch[0].trim() : text

  return { title, body }
}

export function ghAvailable() {
  try {
    run('gh --version')
    return true
  } catch {
    return false
  }
}

export function openPR({ title, body, base, draft = false }) {
  const tmp = join(tmpdir(), `pretty-pr-${Date.now()}.md`)

  try {
    run('git push -u origin HEAD')
  } catch {
    // already pushed or no remote — gh pr create will surface the real error
  }

  try {
    writeFileSync(tmp, body, 'utf8')

    const args = [
      'gh pr create',
      title ? `--title ${JSON.stringify(title)}` : '',
      `--body-file ${JSON.stringify(tmp)}`,
      `--base ${base}`,
      draft ? '--draft' : '',
    ].filter(Boolean).join(' ')

    return run(args)
  } finally {
    try { unlinkSync(tmp) } catch {}
  }
}
