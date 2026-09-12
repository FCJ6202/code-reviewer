package review

import (
	"fmt"
	"strings"

	"github.com/fcj6202/code-reviewer/backend/internal/model"
	"google.golang.org/genai"
)

const systemPreamble = `You are a senior software engineer reviewing code submitted by a student.
Be specific, cite line numbers, and explain why each issue matters and how to fix it.
Categories: security, bug, performance, architecture, formatting.
Severity: high, medium, low.

Score the code from 1 to 10 using this rubric:
  9-10 production quality, idiomatic, no defects
  7-8  minor style or efficiency issues only
  5-6  at least one real bug or design flaw, otherwise sound
  3-4  multiple bugs or a security issue
  1-2  does not work or is unsafe

Historical review rules from this team. Apply them where relevant. When a finding
is based on one of these rules, set ruleId to that rule's number; otherwise set
ruleId to 0.
`

func SystemPrompt(rules []model.Rule) string {
	var b strings.Builder
	b.WriteString(systemPreamble)
	if len(rules) == 0 {
		b.WriteString("  (no historical rules available for this review)\n")
	}
	for _, r := range rules {
		fmt.Fprintf(&b, "  [%d] %s: %s\n", r.ID, r.Type, r.Description)
	}
	return b.String()
}

func UserPrompt(req model.ReviewRequest) string {
	return fmt.Sprintf("Language: %s\nFilename: %s\n\n```\n%s```\nReturn only the JSON object.",
		req.Language, req.Filename, NumberLines(req.Code))
}

// NumberLines prefixes each line with "N: " so the model's line refs are reliable.
func NumberLines(code string) string {
	lines := strings.Split(code, "\n")
	var b strings.Builder
	for i, l := range lines {
		fmt.Fprintf(&b, "%d: %s\n", i+1, l)
	}
	return b.String()
}

// BuildCodeSummary is the short text embedded for rule retrieval:
// language, filename, import/require lines, and the first 40 lines.
func BuildCodeSummary(req model.ReviewRequest) string {
	lines := strings.Split(req.Code, "\n")
	var imports, head []string
	for i, l := range lines {
		t := strings.TrimSpace(l)
		if strings.HasPrefix(t, "import ") || strings.HasPrefix(t, "from ") ||
			strings.HasPrefix(t, "require(") || strings.HasPrefix(t, "#include") ||
			strings.HasPrefix(t, "using ") {
			imports = append(imports, t)
		}
		if i < 40 {
			head = append(head, t)
		}
	}
	return fmt.Sprintf("language: %s\nfile: %s\nimports: %s\ncode:\n%s",
		req.Language, req.Filename, strings.Join(imports, "; "), strings.Join(head, "\n"))
}

func ResponseSchema() *genai.Schema {
	return &genai.Schema{
		Type: genai.TypeObject,
		Properties: map[string]*genai.Schema{
			"score":   {Type: genai.TypeInteger},
			"summary": {Type: genai.TypeString},
			"findings": {
				Type: genai.TypeArray,
				Items: &genai.Schema{
					Type: genai.TypeObject,
					Properties: map[string]*genai.Schema{
						"category":    {Type: genai.TypeString, Enum: []string{"security", "bug", "performance", "architecture", "formatting"}},
						"severity":    {Type: genai.TypeString, Enum: []string{"high", "medium", "low"}},
						"line":        {Type: genai.TypeInteger},
						"title":       {Type: genai.TypeString},
						"explanation": {Type: genai.TypeString},
						"suggestion":  {Type: genai.TypeString},
						"ruleId":      {Type: genai.TypeInteger},
					},
					Required: []string{"category", "severity", "line", "title", "explanation", "suggestion", "ruleId"},
				},
			},
		},
		Required: []string{"score", "summary", "findings"},
	}
}
