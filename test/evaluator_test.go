package test

import (
	"lynx/pkg/evaluator"
	"lynx/pkg/lexer"
	"lynx/pkg/object"
	"lynx/pkg/parser"
	"testing"
)

func TestEvaluator(t *testing.T) {
	l := lexer.New("let a = 1")
	p := parser.New(l)
	program := p.ParseProgram()

	env := object.New(".")
	result := evaluator.Eval(program, env)

	if result != evaluator.NULL {
		t.Errorf("Expected NULL, got %s", result.Type())
	}
}
