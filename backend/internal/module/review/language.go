package review

import (
	"path/filepath"
	"strings"
)

var extToLang = map[string]string{
	".py": "python", ".go": "go", ".js": "javascript", ".mjs": "javascript",
	".ts": "typescript", ".tsx": "typescript", ".jsx": "javascript",
	".java": "java", ".kt": "kotlin", ".c": "c", ".h": "c",
	".cpp": "cpp", ".cc": "cpp", ".hpp": "cpp", ".cs": "csharp",
	".rs": "rust", ".rb": "ruby", ".php": "php", ".swift": "swift",
	".sql": "sql", ".sh": "bash", ".html": "html", ".css": "css",
}

// DetectLanguage maps a filename extension to a language name.
// Unknown extensions return a hint so the model infers from content.
func DetectLanguage(filename string) string {
	if l, ok := extToLang[strings.ToLower(filepath.Ext(filename))]; ok {
		return l
	}
	return "unknown (infer from the code)"
}
