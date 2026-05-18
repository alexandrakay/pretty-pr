import { execSync } from 'child_process'

function run(cmd) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim()
}

export function getBranchName() {
  try {
    return run('git rev-parse --abbrev-ref HEAD')
  } catch {
    return null
  }
}

export function getBaseBranch(specified) {
  if (specified) return specified
  for (const candidate of ['main', 'master', 'develop']) {
    try {
      run(`git rev-parse --verify ${candidate}`)
      return candidate
    } catch {
      continue
    }
  }
  return null
}

export function getCommits(base, range) {
  const ref = range ?? (base ? `${base}...HEAD` : null)
  if (ref) {
    try {
      const result = run(`git log ${ref} --pretty=format:"%h %s (%an, %ar)" --no-merges`)
      if (result) return result
    } catch {
      // fall through to full log
    }
  }
  return run('git log --pretty=format:"%h %s (%an, %ar)" --no-merges -20') || null
}

export function getDiff(base, range) {
  const ref = range ?? (base ? `${base}...HEAD` : 'HEAD~10...HEAD')
  try {
    const diff = run(`git diff ${ref} --stat`)
    const fullDiff = run(`git diff ${ref} -- . ":(exclude)*.lock" ":(exclude)package-lock.json"`)
    // cap at ~6000 chars to stay within reasonable token limits
    return (diff + '\n\n' + fullDiff).slice(0, 6000)
  } catch {
    return null
  }
}

export function getStatus() {
  try {
    return run('git status --short')
  } catch {
    return null
  }
}

export function assertGitRepo() {
  try {
    run('git rev-parse --git-dir')
  } catch {
    throw new Error('Not inside a git repository.')
  }
}
