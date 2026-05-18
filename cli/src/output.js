import { writeFileSync } from 'fs'

const RESET = '\x1b[0m'
const BOLD = '\x1b[1m'
const DIM = '\x1b[2m'
const CYAN = '\x1b[36m'
const GREEN = '\x1b[32m'

export function printResult(text) {
  const divider = `${DIM}${'─'.repeat(60)}${RESET}`
  console.log()
  console.log(`${BOLD}${CYAN}✦ PRetty${RESET}`)
  console.log(divider)
  console.log()

  // Highlight section headers
  const formatted = text.replace(
    /^(## .+)$/gm,
    `${BOLD}${GREEN}$1${RESET}`
  )
  console.log(formatted)
  console.log()
  console.log(divider)
}

export function writeToFile(text, filepath) {
  writeFileSync(filepath, text, 'utf8')
  console.log(`\nWritten to ${filepath}`)
}
