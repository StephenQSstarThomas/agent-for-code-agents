import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(null, args), wait)
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function extractUrlsFromText(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+|www\.[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
  return text.match(urlRegex) || []
}

export function extractFilePathsFromText(text: string): string[] {
  const filePatterns = [
    /[A-Za-z]:\\[^<>"|?*\s]*\.[a-zA-Z0-9]{1,10}/g,  // Windows absolute paths
    /\/[^<>"|?*\s]*\.[a-zA-Z0-9]{1,10}/g,             // Unix absolute paths
    /\.{1,2}\/[^<>"|?*\s]*\.[a-zA-Z0-9]{1,10}/g       // Relative paths
  ]
  
  const matches: string[] = []
  filePatterns.forEach(pattern => {
    const found = text.match(pattern)
    if (found) matches.push(...found)
  })
  
  return matches
}

export function isValidUrl(string: string): boolean {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2)
}

export function getLanguageFromExtension(extension: string): string {
  const languageMap: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'md': 'markdown',
    'json': 'json',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'yaml': 'yaml',
    'yml': 'yaml',
    'xml': 'xml',
    'sh': 'shell',
    'bash': 'shell',
  }
  
  return languageMap[extension.toLowerCase()] || 'text'
}

/**
 * Clean Unicode characters that may cause encoding issues
 * Keeps basic Latin, Latin Extended, Chinese characters, and common symbols
 * Removes problematic emojis and special symbols that cause GBK encoding issues
 */
export function cleanUnicodeText(text: string): string {
  if (!text) return text
  
  // Keep basic ASCII, Latin characters, Chinese characters (CJK), and safe symbols
  // Remove emojis and other problematic Unicode characters using compatible regex
  return text
    .replace(/[\uD83C-\uDBFF][\uDC00-\uDFFF]/g, '') // Remove emoji surrogate pairs
    .replace(/[\u2600-\u26FF]/g, '') // Remove miscellaneous symbols
    .replace(/[\u2700-\u27BF]/g, '') // Remove dingbats
    .replace(/[\uFE00-\uFE0F]/g, '') // Remove variation selectors
    .replace(/[\u200D]/g, '') // Remove zero-width joiner
}

/**
 * Safe error message handler that prevents encoding issues
 */
export function sanitizeErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error)
  return cleanUnicodeText(message)
}