package test

import (
	"lynx/pkg/ast"
	"lynx/pkg/lexer"
	"lynx/pkg/parser"
	"testing"
)

func TestParserVariable(t *testing.T) {
	tests := []struct {
		input   string
		varName string
		value   int64
		isConst bool
	}{
		{"let a = 20", "a", 20, false},
		{"let x = 100", "x", 100, false},
		{"const PI = 314", "PI", 314, true},
		{"let number = 0", "number", 0, false},
		{"let negative = -5", "negative", -5, false},
	}

	for _, tt := range tests {
		l := lexer.New(tt.input)
		p := parser.New(l)
		program := p.ParseProgram()

		checkParserErrors(t, p)

		if len(program.Statements) != 1 {
			t.Fatalf("Expected 1 statement, got %d", len(program.Statements))
		}

		stmt, ok := program.Statements[0].(*ast.VarStatement)
		if !ok {
			t.Fatalf("Statement is not VarStatement. got=%T", program.Statements[0])
		}

		if stmt.Name.Value != tt.varName {
			t.Errorf("Variable name wrong. expected=%s, got=%s", tt.varName, stmt.Name.Value)
		}

		if stmt.IsConst != tt.isConst {
			t.Errorf("IsConst wrong. expected=%t, got=%t", tt.isConst, stmt.IsConst)
		}
	}
}

func TestParserAssignment(t *testing.T) {
	input := `
		let a = 10
		a = 20
	`
	l := lexer.New(input)
	p := parser.New(l)
	program := p.ParseProgram()

	checkParserErrors(t, p)

	if len(program.Statements) != 2 {
		t.Fatalf("Expected 2 statements, got %d", len(program.Statements))
	}

	letStmt, ok := program.Statements[0].(*ast.VarStatement)
	if !ok {
		t.Fatalf("First statement is not VarStatement. got=%T", program.Statements[0])
	}

	if letStmt.Name.Value != "a" {
		t.Errorf("Variable name wrong. expected=a, got=%s", letStmt.Name.Value)
	}

	assignStmt, ok := program.Statements[1].(*ast.Assignment)
	if !ok {
		t.Fatalf("Second statement is not Assignment. got=%T", program.Statements[1])
	}

	ident, ok := assignStmt.Name.(*ast.Identifier)
	if !ok {
		t.Fatalf("Assignment target is not Identifier. got=%T", assignStmt.Name)
	}

	if ident.Value != "a" {
		t.Errorf("Assignment target wrong. expected=a, got=%s", ident.Value)
	}
}

func TestParserForRange(t *testing.T) {
	tests := []struct {
		input    string
		variable string
		index    string
		hasIndex bool
	}{
		{"for num in [1,2] { println(num) }", "num", "", false},
		{"for num,idx in [1,2] { println(num + idx) }", "num", "idx", true},
		{"for x,i in arr { x = x + 1 }", "x", "i", true},
	}

	for _, tt := range tests {
		l := lexer.New(tt.input)
		p := parser.New(l)
		program := p.ParseProgram()

		checkParserErrors(t, p)

		if len(program.Statements) != 1 {
			t.Fatalf("Expected 1 statement, got %d", len(program.Statements))
		}

		stmt, ok := program.Statements[0].(*ast.ForRange)
		if !ok {
			t.Fatalf("Statement is not ForRange. got=%T", program.Statements[0])
		}

		if stmt.Variable.Value != tt.variable {
			t.Errorf("Variable wrong. expected=%s, got=%s", tt.variable, stmt.Variable.Value)
		}

		if tt.hasIndex {
			if stmt.Index == nil {
				t.Errorf("Expected index variable, got nil")
			} else if stmt.Index.Value != tt.index {
				t.Errorf("Index wrong. expected=%s, got=%s", tt.index, stmt.Index.Value)
			}
		} else {
			if stmt.Index != nil {
				t.Errorf("Expected no index, got %s", stmt.Index.Value)
			}
		}
	}
}

func TestParserWhileStatement(t *testing.T) {
	input := `while x < 10 { x = x + 1 }`

	l := lexer.New(input)
	p := parser.New(l)
	program := p.ParseProgram()

	checkParserErrors(t, p)

	if len(program.Statements) != 1 {
		t.Fatalf("Expected 1 statement, got %d", len(program.Statements))
	}

	stmt, ok := program.Statements[0].(*ast.While)
	if !ok {
		t.Fatalf("Statement is not While. got=%T", program.Statements[0])
	}

	if stmt.Condition == nil {
		t.Fatal("While condition is nil")
	}

	if stmt.Body == nil {
		t.Fatal("While body is nil")
	}
}
