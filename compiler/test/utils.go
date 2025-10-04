package test

import (
	"lynx/pkg/evaluator"
	"lynx/pkg/lexer"
	"lynx/pkg/object"
	"lynx/pkg/parser"
	"testing"
)

func testFloatObject(t *testing.T, obj object.Object, expected float64) bool {
	result, ok := obj.(*object.Float)
	if !ok {
		t.Errorf("Object is not Float. got=%T (%+v)", obj, obj)
		return false
	}
	if result.Value != expected {
		t.Errorf("Object has wrong value. got=%f, want=%f", result.Value, expected)
		return false
	}
	return true
}

func testBooleanObject(t *testing.T, obj object.Object, expected bool) bool {
	result, ok := obj.(*object.Boolean)
	if !ok {
		t.Errorf("Object is not Boolean. got=%T (%+v)", obj, obj)
		return false
	}
	if result.Value != expected {
		t.Errorf("Object has wrong value. got=%t, want=%t", result.Value, expected)
		return false
	}
	return true
}

func testStringObject(t *testing.T, obj object.Object, expected string) bool {
	result, ok := obj.(*object.String)
	if !ok {
		t.Errorf("Object is not String. got=%T (%+v)", obj, obj)
		return false
	}
	if result.Value != expected {
		t.Errorf("Object has wrong value. got=%q, want=%q", result.Value, expected)
		return false
	}
	return true
}

func testNullObject(t *testing.T, obj object.Object) bool {
	if obj != evaluator.NULL {
		t.Errorf("Object is not NULL. got=%T (%+v)", obj, obj)
		return false
	}
	return true
}

func testEval(input string) object.Object {
	l := lexer.New(input)
	p := parser.New(l)
	program := p.ParseProgram()

	if len(p.Errors()) > 0 {
		panic("Parser errors: " + p.Errors()[0].String())
	}

	env := object.New(".")
	result := evaluator.Eval(program, env)
	return result
}

func testEvalDebug(t *testing.T, input string) object.Object {
	l := lexer.New(input)
	p := parser.New(l)
	program := p.ParseProgram()

	if len(p.Errors()) > 0 {
		t.Logf("Parser errors for input %q:", input)
		for _, err := range p.Errors() {
			t.Logf("  %s", err.String())
		}
	}

	env := object.New(".")
	result := evaluator.Eval(program, env)

	if errObj, ok := result.(*object.Error); ok {
		t.Logf("Eval error for input %q: %s", input, errObj.Message)
	}

	return result
}

func checkParserErrors(t *testing.T, p *parser.Parser) {
	errors := p.Errors()
	if len(errors) == 0 {
		return
	}

	t.Errorf("Parser has %d errors", len(errors))
	for _, err := range errors {
		t.Errorf("Parser error: %s", err.String())
	}
	t.FailNow()
}
