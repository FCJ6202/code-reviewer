package rule

import (
	"errors"
	"strings"
	"testing"
)

func TestParseRulesCSVNormalizes(t *testing.T) {
	in := utf8BOM + "ID, Type ,Description\n" +
		"1, Security ,  Never build SQL from raw input  \n" +
		"2,bug,\"Close files, even on error\"\n"

	data, rows, err := parseRulesCSV(strings.NewReader(in))
	if err != nil {
		t.Fatal(err)
	}
	if rows != 2 {
		t.Fatalf("rows = %d, want 2", rows)
	}
	want := "id,type,description\n" +
		"1,security,Never build SQL from raw input\n" +
		"2,bug,\"Close files, even on error\"\n"
	if string(data) != want {
		t.Fatalf("data =\n%s\nwant\n%s", data, want)
	}
}

func TestParseRulesCSVRejects(t *testing.T) {
	cases := []struct {
		name, in, wantErr string
	}{
		{"empty file", "", "the file is empty"},
		{"wrong header", "id,category,description\n1,bug,x\n", `line 1: header must be "id,type,description"`},
		{"bad id", "id,type,description\nx,bug,a\n", `line 2: id "x" must be a positive whole number`},
		{"duplicate id", "id,type,description\n1,bug,a\n1,bug,b\n", "line 3: id 1 appears more than once"},
		{"unknown type", "id,type,description\n1,bug,ok\n2,style,nope\n",
			`line 3: type "style" must be one of security, bug, performance, architecture, formatting`},
		{"empty description", "id,type,description\n1,bug,  \n", "line 2: description is empty"},
		{"missing column", "id,type,description\n1,bug\n", "line 2: wrong number of fields"},
		{"header only", "id,type,description\n", "the file has a header but no rules"},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			_, _, err := parseRulesCSV(strings.NewReader(tc.in))
			var verr *ValidationError
			if !errors.As(err, &verr) {
				t.Fatalf("err = %v, want *ValidationError", err)
			}
			if verr.Error() != tc.wantErr {
				t.Fatalf("err = %q, want %q", verr.Error(), tc.wantErr)
			}
		})
	}
}
