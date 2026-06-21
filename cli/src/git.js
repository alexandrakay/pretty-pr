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

// Returns the ticket ID found in a branch name, or null.
// Checks Jira/Linear style (e.g. PROJ-123) first, then GitHub issue numbers
// (e.g. feature/123-add-auth). Returns uppercase to normalize Linear lowercase keys.
export function getTicketFromBranch(branchName) {
  if (!branchName) return null

  // Jira / Linear: 2-10 uppercase (or lowercase) letters, hyphen, one or more digits
  const jiraMatch = branchName.match(/\b([A-Za-z]{2,10})-(\d+)\b/)
  if (jiraMatch) return `${jiraMatch[1].toUpperCase()}-${jiraMatch[2]}`

  // GitHub issue: branch starts with or contains a bare number segment
  // e.g. feature/123-add-auth or fix/456
  const slug = branchName.split('/').pop() ?? branchName
  const numericMatch = slug.match(/^(\d+)(?:-|$)/)
  if (numericMatch) return `#${numericMatch[1]}`

  return null
}
