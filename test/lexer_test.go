package test

import (
	"lynx/pkg/ast"
	"lynx/pkg/lexer"
	"lynx/pkg/parser"
	"testing"
)

func TestLexer(t *testing.T) {
	l := lexer.New("let a = 1;")
	p := parser.New(l)
	program := p.ParseProgram()

	if len(p.Errors()) > 0 {
		t.Errorf("Parser error: %s", p.Errors())
	}

	if len(program.Statements) != 1 {
		t.Errorf("Expected 1 statement, got %d", len(program.Statements))
	}

	stmt := program.Statements[0]
	if stmt.TokenLiteral() != "let" {
		t.Errorf("Expected let, got %s", stmt.TokenLiteral())
	}

	let := stmt.(*ast.VarStatement)
	if let.Name.Value != "a" {
		t.Errorf("Expected a, got %s", let.Name.Value)
	}

	if let.Value.(*ast.IntegerLiteral).Value != 1 {
		t.Errorf("Expected 1, got %d", let.Value.(*ast.IntegerLiteral).Value)
	}
}
