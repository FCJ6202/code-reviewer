package rule

import (
	"bytes"
	"encoding/csv"
	"errors"
	"fmt"
	"io"
	"strconv"
	"strings"
)

const (
	maxRules          = 5000
	maxDescriptionLen = 1000
)

// utf8BOM is U+FEFF, the byte-order mark some editors put at the start of a CSV.
// Written as a rune value: Go rejects a literal BOM character inside source files.
var utf8BOM = string(rune(0xFEFF))

// Rule types match the finding categories the review prompt uses.
var ruleTypes = map[string]bool{
	"security": true, "bug": true, "performance": true, "architecture": true, "formatting": true,
}

// ValidationError explains why an uploaded rules CSV was rejected.
type ValidationError struct {
	Line int // 1-based; 0 when the problem isn't tied to one line
	Msg  string
}

func (e *ValidationError) Error() string {
	if e.Line > 0 {
		return fmt.Sprintf("line %d: %s", e.Line, e.Msg)
	}
	return e.Msg
}

// parseRulesCSV validates an id,type,description CSV and returns it re-encoded
// (trimmed values, lowercase types) with the number of rules. Re-encoding means
// the BigQuery load only ever sees a file this function accepted.
func parseRulesCSV(r io.Reader) ([]byte, int64, error) {
	reader := csv.NewReader(r)
	reader.FieldsPerRecord = 3

	header, err := reader.Read()
	if errors.Is(err, io.EOF) {
		return nil, 0, &ValidationError{Msg: "the file is empty"}
	}
	if err != nil {
		return nil, 0, csvError(err)
	}
	header[0] = strings.TrimPrefix(header[0], utf8BOM) // Excel adds a byte-order mark
	for i, want := range []string{"id", "type", "description"} {
		if !strings.EqualFold(strings.TrimSpace(header[i]), want) {
			return nil, 0, &ValidationError{Line: 1, Msg: `header must be "id,type,description"`}
		}
	}

	var out bytes.Buffer
	writer := csv.NewWriter(&out)
	if err := writer.Write([]string{"id", "type", "description"}); err != nil {
		return nil, 0, err
	}

	seen := map[int64]bool{}
	var rows int64
	for {
		record, err := reader.Read()
		if errors.Is(err, io.EOF) {
			break
		}
		if err != nil {
			return nil, 0, csvError(err)
		}
		line, _ := reader.FieldPos(0)

		id, err := strconv.ParseInt(strings.TrimSpace(record[0]), 10, 64)
		if err != nil || id <= 0 {
			return nil, 0, &ValidationError{Line: line, Msg: fmt.Sprintf("id %q must be a positive whole number", record[0])}
		}
		if seen[id] {
			return nil, 0, &ValidationError{Line: line, Msg: fmt.Sprintf("id %d appears more than once", id)}
		}
		seen[id] = true

		ruleType := strings.ToLower(strings.TrimSpace(record[1]))
		if !ruleTypes[ruleType] {
			return nil, 0, &ValidationError{Line: line, Msg: fmt.Sprintf(
				"type %q must be one of security, bug, performance, architecture, formatting", record[1])}
		}

		description := strings.TrimSpace(record[2])
		if description == "" {
			return nil, 0, &ValidationError{Line: line, Msg: "description is empty"}
		}
		if len([]rune(description)) > maxDescriptionLen {
			return nil, 0, &ValidationError{Line: line, Msg: fmt.Sprintf("description is longer than %d characters", maxDescriptionLen)}
		}

		rows++
		if rows > maxRules {
			return nil, 0, &ValidationError{Msg: fmt.Sprintf("too many rules (max %d)", maxRules)}
		}
		if err := writer.Write([]string{strconv.FormatInt(id, 10), ruleType, description}); err != nil {
			return nil, 0, err
		}
	}

	if rows == 0 {
		return nil, 0, &ValidationError{Msg: "the file has a header but no rules"}
	}
	writer.Flush()
	if err := writer.Error(); err != nil {
		return nil, 0, err
	}
	return out.Bytes(), rows, nil
}

// csvError turns a malformed-CSV error into a ValidationError with its line.
func csvError(err error) error {
	var parseErr *csv.ParseError
	if errors.As(err, &parseErr) {
		return &ValidationError{Line: parseErr.Line, Msg: parseErr.Err.Error()}
	}
	return err
}
