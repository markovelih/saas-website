// Shared with the file picker; server validation remains authoritative.
export const MATERIAL_ACCEPT = '.png,.jpg,.jpeg,.webp,.gif,.svg,.pdf,.docx,.xlsx,.pptx,.txt,.md,.csv,.json'
export const MATERIAL_FORMATS = 'Images, SVG, PDF, DOCX, XLSX, PPTX, TXT, Markdown, CSV or JSON.'

export function materialExtension(name: string) {
  if (!name || name.length > 200 || name !== name.trim() || /[\x00-\x1f\x7f/\\:%\u202a-\u202e\u2066-\u2069]/.test(name)) return null
  // Also reject hidden executables in names such as invoice.exe.pdf.
  if (/\.(?:exe|dll|com|bat|cmd|ps1|vbs|vbe|js|jse|mjs|cjs|scr|msi|hta|jar|sh|php\d*|phtml|html?|docm|xlsm|pptm)(?:\.|$)/i.test(name)) return null
  const ext = name.split('.').pop()?.toLowerCase()
  return ext && MATERIAL_ACCEPT.split(',').includes('.' + ext) ? ext : null
}
