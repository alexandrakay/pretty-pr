import clipboardy from 'clipboardy'

export function createClipboardWithProvider(provider) {
  return async function copyToClipboard(text) {
    try {
      await provider.write(text)
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message ?? String(err) }
    }
  }
}

export const copyToClipboard = createClipboardWithProvider(clipboardy)
