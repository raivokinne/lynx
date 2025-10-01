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

func TestParserInfixExpressions(t *testing.T) {
	tests := []struct {
		input    string
		operator string
	}{
		{"5 + 5", "+"},
		{"5 - 5", "-"},
		{"5 * 5", "*"},
		{"5 / 5", "/"},
		{"5 > 5", ">"},
		{"5 < 5", "<"},
		{"5 == 5", "=="},
		{"5 != 5", "!="},
		{"5 >= 5", ">="},
		{"5 <= 5", "<="},
		{"5 % 5", "%"},
		{"5 ^ 5", "^"},
		{"true and false", "and"},
		{"true or false", "or"},
		{"a ++ b", "++"},
	}

	for _, tt := range tests {
		l := lexer.New(tt.input)
		p := parser.New(l)
		program := p.ParseProgram()

		checkParserErrors(t, p)

		if len(program.Statements) != 1 {
			t.Fatalf("Expected 1 statement, got %d for input %s", len(program.Statements), tt.input)
		}

		stmt, ok := program.Statements[0].(*ast.ExpressionStatement)
		if !ok {
			t.Fatalf("Statement is not ExpressionStatement. got=%T", program.Statements[0])
		}

		exp, ok := stmt.Expression.(*ast.InfixExpression)
		if !ok {
			t.Fatalf("Expression is not InfixExpression. got=%T", stmt.Expression)
		}

		if exp.Operator != tt.operator {
			t.Errorf("Operator wrong. expected=%s, got=%s", tt.operator, exp.Operator)
		}
	}
}

func TestParserFunctionLiteral(t *testing.T) {
	input := `fn(x, y) { x + y }`

	l := lexer.New(input)
	p := parser.New(l)
	program := p.ParseProgram()

	checkParserErrors(t, p)

	if len(program.Statements) != 1 {
		t.Fatalf("Expected 1 statement, got %d", len(program.Statements))
	}

	stmt, ok := program.Statements[0].(*ast.ExpressionStatement)
	if !ok {
		t.Fatalf("Statement is not ExpressionStatement. got=%T", program.Statements[0])
	}

	fn, ok := stmt.Expression.(*ast.FunctionLiteral)
	if !ok {
		t.Fatalf("Expression is not FunctionLiteral. got=%T", stmt.Expression)
	}

	if len(fn.Parameters) != 2 {
		t.Fatalf("Expected 2 parameters, got %d", len(fn.Parameters))
	}

	if fn.Parameters[0].Value != "x" {
		t.Errorf("First parameter wrong. expected=x, got=%s", fn.Parameters[0].Value)
	}

	if fn.Parameters[1].Value != "y" {
		t.Errorf("Second parameter wrong. expected=y, got=%s", fn.Parameters[1].Value)
	}
}

func TestParserArrayLiteral(t *testing.T) {
	input := `[1, 2, 3, 4]`

	l := lexer.New(input)
	p := parser.New(l)
	program := p.ParseProgram()

	checkParserErrors(t, p)

	stmt, ok := program.Statements[0].(*ast.ExpressionStatement)
	if !ok {
		t.Fatalf("Statement is not ExpressionStatement. got=%T", program.Statements[0])
	}

	array, ok := stmt.Expression.(*ast.ArrayLiteral)
	if !ok {
		t.Fatalf("Expression is not ArrayLiteral. got=%T", stmt.Expression)
	}

	if len(array.Elements) != 4 {
		t.Fatalf("Expected 4 elements, got %d", len(array.Elements))
	}
}

func TestParserHashLiteral(t *testing.T) {
	input := `{"one": 1, "two": 2}`

	l := lexer.New(input)
	p := parser.New(l)
	program := p.ParseProgram()

	checkParserErrors(t, p)

	stmt, ok := program.Statements[0].(*ast.ExpressionStatement)
	if !ok {
		t.Fatalf("Statement is not ExpressionStatement. got=%T", program.Statements[0])
	}

	hash, ok := stmt.Expression.(*ast.HashLiteral)
	if !ok {
		t.Fatalf("Expression is not HashLiteral. got=%T", stmt.Expression)
	}

	if len(hash.Pairs) != 2 {
		t.Fatalf("Expected 2 pairs, got %d", len(hash.Pairs))
	}
}

func TestParserSwitchStatement(t *testing.T) {
	input := `
	switch x {
		case 1: println("one")
		case 2: { println("two") }
		default: println("other")
	}
	`

	l := lexer.New(input)
	p := parser.New(l)
	program := p.ParseProgram()

	checkParserErrors(t, p)

	if len(program.Statements) != 1 {
		t.Fatalf("Expected 1 statement, got %d", len(program.Statements))
	}

	stmt, ok := program.Statements[0].(*ast.SwitchStatement)
	if !ok {
		t.Fatalf("Statement is not SwitchStatement. got=%T", program.Statements[0])
	}

	if len(stmt.Cases) != 3 {
		t.Fatalf("Expected 3 cases, got %d", len(stmt.Cases))
	}

	defaultCase := stmt.Cases[2]
	if defaultCase.Value != nil {
		t.Errorf("Default case should have nil value, got %T", defaultCase.Value)
	}
}

func TestParserErrorHandling(t *testing.T) {
	input := `
	error "something went wrong"
	catch {
		println("caught")
	} on err {
		println(err)
	}
	`

	l := lexer.New(input)
	p := parser.New(l)
	program := p.ParseProgram()

	checkParserErrors(t, p)

	if len(program.Statements) != 2 {
		t.Fatalf("Expected 2 statements, got %d", len(program.Statements))
	}

	errorStmt, ok := program.Statements[0].(*ast.ErrorStatement)
	if !ok {
		t.Fatalf("First statement is not ErrorStatement. got=%T", program.Statements[0])
	}

	if errorStmt.Value == nil {
		t.Fatal("Error statement value is nil")
	}

	catchStmt, ok := program.Statements[1].(*ast.CatchStatement)
	if !ok {
		t.Fatalf("Second statement is not CatchStatement. got=%T", program.Statements[1])
	}

	if catchStmt.ErrorVar == nil {
		t.Fatal("Catch statement should have error variable")
	}

	if catchStmt.ErrorVar.Value != "err" {
		t.Errorf("Error variable wrong. expected=err, got=%s", catchStmt.ErrorVar.Value)
	}
}
