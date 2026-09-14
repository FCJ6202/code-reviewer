// Mirrors backend/internal/module/review/language.go so the UI shows the same
// language the API will detect. The API stays the source of truth: the request
// sends only the filename.
const EXTENSION_LANGUAGES: Record<string, string> = {
  '.py': 'python',
  '.go': 'go',
  '.js': 'javascript',
  '.mjs': 'javascript',
  '.jsx': 'javascript',
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.java': 'java',
  '.kt': 'kotlin',
  '.c': 'c',
  '.h': 'c',
  '.cpp': 'cpp',
  '.cc': 'cpp',
  '.hpp': 'cpp',
  '.cs': 'csharp',
  '.rs': 'rust',
  '.rb': 'ruby',
  '.php': 'php',
  '.swift': 'swift',
  '.sql': 'sql',
  '.sh': 'bash',
  '.html': 'html',
  '.css': 'css',
};

const LANGUAGE_LABELS: Record<string, string> = {
  python: 'Python',
  go: 'Go',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  java: 'Java',
  kotlin: 'Kotlin',
  c: 'C',
  cpp: 'C++',
  csharp: 'C#',
  rust: 'Rust',
  ruby: 'Ruby',
  php: 'PHP',
  swift: 'Swift',
  sql: 'SQL',
  bash: 'Bash',
  html: 'HTML',
  css: 'CSS',
};

/** For the file picker's `accept` attribute. */
export const ACCEPTED_EXTENSIONS = Object.keys(EXTENSION_LANGUAGES).join(',');

/** Language key for a filename, or null when the extension is unknown. */
export function detectLanguage(filename: string): string | null {
  const dot = filename.lastIndexOf('.');
  if (dot < 0) return null;
  return EXTENSION_LANGUAGES[filename.slice(dot).toLowerCase()] ?? null;
}

export function languageLabel(language: string): string {
  return LANGUAGE_LABELS[language] ?? language;
}

/** Stored reviews use "unknown (infer from the code)" for unknown extensions; show it short. */
export function displayLanguage(language: string): string {
  return language.startsWith('unknown') ? 'unknown' : language;
}
