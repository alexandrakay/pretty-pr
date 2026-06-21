#!/usr/bin/env node
import { program } from 'commander'
import { assertGitRepo, getBranchName, getBaseBranch, getCommits, getDiff, getStatus, getCommitsBetweenTags } from '../src/git.js'
import { generate, generateReview } from '../src/ai.js'
import { generateChangelog } from '../src/changelog.js'
import { printResult, printStreamHeader, printStreamChunk, printStreamFooter, writeToFile } from '../src/output.js'
import { ghAvailable, parseOutput, openPR } from '../src/github.js'
import { copyToClipboard } from '../src/clipboard.js'

program
  .name('pretty-pr')
  .description('Your commits tell the whole story. Your PR should too.')
  .version('0.1.0')
  .option('--diff', 'include diff for richer output')
  .option('--full', 'include everything: commits + diff + branch (slowest, best)')
  .option('--base <branch>', 'base branch to compare against')
  .option('--range <range>', 'specific commit range (e.g. abc..def)')
  .option('--out <file>', 'write output to a markdown file')
  .option('--open', 'create a GitHub PR with the generated copy (requires gh CLI)')
  .option('--draft', 'open as a draft PR (use with --open)')
  .option('--review', 'generate a reviewer brief instead of PR copy')
  .option('--clipboard', 'copy output to clipboard instead of printing')
  .option('--mode <mode>', 'generation mode: pr (default) or changelog')
  .option('--from <ref>', 'start ref for changelog mode (tag or commit)')
  .option('--to <ref>', 'end ref for changelog mode (default: HEAD)')
  .parse()

const opts = program.opts()

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('\n  Error: ANTHROPIC_API_KEY is not set.')
  console.error('  Get a key at https://console.anthropic.com and run:')
  console.error('  export ANTHROPIC_API_KEY=your-key-here\n')
  process.exit(1)
}

try {
  assertGitRepo()
} catch (err) {
  console.error(`\n  Error: ${err.message}\n`)
  process.exit(1)
}

if (opts.open && !ghAvailable()) {
  console.error('\n  Error: --open requires the GitHub CLI (gh). Install it at https://cli.github.com\n')
  process.exit(1)
}

// ── Changelog mode ──────────────────────────────────────────────────────────
if (opts.mode === 'changelog') {
  if (!opts.from) {
    console.error('\n  Error: --mode changelog requires --from <tag-or-ref>\n')
    console.error('  Example: npx pretty-pr --mode changelog --from v1.2.0\n')
    process.exit(1)
  }

  const from = opts.from
  const to = opts.to ?? 'HEAD'
  const commits = getCommitsBetweenTags(from, to)

  if (!commits) {
    console.error(`\n  Error: No commits found between ${from} and ${to}.\n`)
    process.exit(1)
  }

  const date = new Date().toISOString().slice(0, 10)
  const context = { commits, from, to, date }

  console.log(`\n  Generating changelog from ${from} to ${to}...`)

  try {
    if (opts.out) {
      // Buffer silently, then write to file
      const result = await generateChangelog(context)
      writeToFile(result, opts.out)
    } else {
      // Stream tokens live to terminal
      printStreamHeader()
      await generateChangelog(context, printStreamChunk)
      printStreamFooter()
    }
  } catch (err) {
    console.error(`\n  Error: ${err.message}\n`)
    process.exit(1)
  }
  process.exit(0)
}

// ── PR / Review mode (default) ──────────────────────────────────────────────
const useDiff = opts.diff || opts.full || opts.open || opts.review
const base = getBaseBranch(opts.base)
const branch = getBranchName()
const commits = getCommits(base, opts.range)

if (!commits) {
  console.error('\n  Error: No commits found.\n')
  process.exit(1)
}

const diff = useDiff ? getDiff(base, opts.range) : null
const status = opts.full ? getStatus() : null

const context = { commits, diff, branch, status }

// Stream to terminal unless we need to buffer first (--out, --open, --clipboard)
const streamToTerminal = !opts.out && !opts.open && !opts.clipboard

if (streamToTerminal) {
  console.log(`\n  ${opts.review ? 'Generating reviewer brief' : 'Generating PR copy'}${useDiff ? ' (with diff)' : ''}...`)
  printStreamHeader()
} else {
  console.log(`\n  ${opts.review ? 'Generating reviewer brief' : 'Generating PR copy'}${useDiff ? ' (with diff)' : ''}...`)
}

try {
  const onChunk = streamToTerminal ? printStreamChunk : undefined

  const result = opts.review
    ? await generateReview(diff || '', onChunk)
    : await generate(context, onChunk)

  if (streamToTerminal) {
    printStreamFooter()
  }

  if (opts.open) {
    printResult(result)
    const { title, body } = parseOutput(result)
    console.log(`  Opening PR on GitHub${opts.draft ? ' (draft)' : ''}...`)
    try {
      const url = openPR({ title, body, base: base ?? 'main', draft: opts.draft })
      console.log(`\n  PR created: ${url}\n`)
    } catch (err) {
      console.error(`\n  Error creating PR: ${err.message}\n`)
      process.exit(1)
    }
  } else if (opts.out) {
    writeToFile(result, opts.out)
    if (opts.clipboard) {
      const clip = await copyToClipboard(result)
      if (clip.success) {
        console.log('  Copied to clipboard.')
      } else {
        console.warn(`  Warning: clipboard copy failed — ${clip.error}`)
      }
    }
  } else if (opts.clipboard) {
    const clip = await copyToClipboard(result)
    if (clip.success) {
      console.log('\n  Copied to clipboard.\n')
    } else {
      console.warn(`\n  Warning: clipboard copy failed — ${clip.error}`)
      console.warn('  Falling back to terminal output:\n')
      printResult(result)
    }
  }
} catch (err) {
  if (err.status === 401) {
    console.error('\n  Error: Invalid ANTHROPIC_API_KEY.\n')
  } else {
    console.error(`\n  Error: ${err.message}\n`)
  }
  process.exit(1)
}
