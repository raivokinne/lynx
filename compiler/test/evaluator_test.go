package test

import (
	"lynx/pkg/evaluator"
	"lynx/pkg/object"
	"testing"
)

func TestEvaluatorIntegerArithmetic(t *testing.T) {
	tests := []struct {
		input    string
		expected int64
	}{
		{"5", 5},
		{"10", 10},
		{"-5", -5},
		{"-10", -10},
		{"5 + 5 + 5 + 5 - 10", 10},
		{"2 * 2 * 2 * 2 * 2", 32},
		{"-50 + 100 + -50", 0},
		{"5 * 2 + 10", 20},
		{"5 + 2 * 10", 25},
		{"20 + 2 * -10", 0},
		{"50 / 2 * 2 + 10", 60},
		{"2 * (5 + 10)", 30},
		{"3 * 3 * 3 + 10", 37},
		{"3 * (3 * 3) + 10", 37},
		{"(5 + 10 * 2 + 15 / 3) * 2 + -10", 50},
	}

	for _, tt := range tests {
		evaluated := testEval(tt.input)
		testIntegerObject(t, evaluated, tt.expected)
	}
}

func TestEvaluatorFloatArithmetic(t *testing.T) {
	tests := []struct {
		input    string
		expected float64
	}{
		{"5.5", 5.5},
		{"10.25", 10.25},
		{"5.5 + 2.5", 8.0},
		{"5.5 * 2.0", 11.0},
		{"10.0 / 2.0", 5.0},
		{"0.0 - 5.5", -5.5},
	}

	for _, tt := range tests {
		evaluated := testEvalDebug(t, tt.input)
		if !testFloatObject(t, evaluated, tt.expected) {
			t.Errorf("Failed for input: %s", tt.input)
		}
	}
}

func TestEvaluatorBooleanExpression(t *testing.T) {
	tests := []struct {
		input    string
		expected bool
	}{
		{"true", true},
		{"false", false},
		{"1 < 2", true},
		{"1 > 2", false},
		{"1 < 1", false},
		{"1 > 1", false},
		{"1 == 1", true},
		{"1 != 1", false},
		{"1 == 2", false},
		{"1 != 2", true},
		{"true == true", true},
		{"false == false", true},
		{"true == false", false},
		{"true != false", true},
		{"false != true", true},
		{"(1 < 2) == true", true},
		{"(1 < 2) == false", false},
		{"(1 > 2) == true", false},
		{"(1 > 2) == false", true},
	}

	for _, tt := range tests {
		evaluated := testEvalDebug(t, tt.input)
		if !testBooleanObject(t, evaluated, tt.expected) {
			t.Errorf("Failed for input: %s", tt.input)
		}
	}
}

func TestEvaluatorBangOperator(t *testing.T) {
	tests := []struct {
		input    string
		expected bool
	}{
		{"!true", false},
		{"!false", true},
		{"!5", false},
		{"!!true", true},
		{"!!false", false},
		{"!!5", true},
	}

	for _, tt := range tests {
		evaluated := testEval(tt.input)
		testBooleanObject(t, evaluated, tt.expected)
	}
}

func TestEvaluatorIfElseExpressions(t *testing.T) {
	tests := []struct {
		input    string
		expected any
	}{
		{"if (true) { 10 }", 10},
		{"if (false) { 10 }", nil},
		{"if (1) { 10 }", 10},
		{"if (1 < 2) { 10 }", 10},
		{"if (1 > 2) { 10 }", nil},
		{"if (1 > 2) { 10 } else { 20 }", 20},
		{"if (1 < 2) { 10 } else { 20 }", 10},
	}

	for _, tt := range tests {
		evaluated := testEval(tt.input)
		integer, ok := tt.expected.(int)
		if ok {
			testIntegerObject(t, evaluated, int64(integer))
		} else {
			testNullObject(t, evaluated)
		}
	}
}

func TestEvaluatorReturnStatements(t *testing.T) {
	tests := []struct {
		input    string
		expected int64
	}{
		{"fn() { return 10 }()", 10},
		{"fn() { return 10\n9 }()", 10},
		{"fn() { return 2 * 5\n9 }()", 10},
		{"fn() { 9\nreturn 2 * 5\n9 }()", 10},
	}

	for _, tt := range tests {
		result := testEvalDebug(t, tt.input)
		if !testIntegerObject(t, result, tt.expected) {
			t.Errorf("Failed for input: %s", tt.input)
		}
	}
}

func TestEvaluatorMultipleStatementsWithNewlines(t *testing.T) {
	tests := []struct {
		input    string
		expected int64
		desc     string
	}{
		{"let a = 5\na", 5, "variable declaration with newline"},
		{"5\n10", 10, "two expressions with newline"},
		{"let x = 1\nlet y = 2\nx + y", 3, "multiple lets with newlines"},
	}

	for _, tt := range tests {
		t.Run(tt.desc, func(t *testing.T) {
			result := testEvalDebug(t, tt.input)
			if !testIntegerObject(t, result, tt.expected) {
				t.Errorf("Failed for input: %s", tt.input)
			}
		})
	}
}

func TestEvaluatorVariable(t *testing.T) {
	tests := []struct {
		input    string
		expected int64
	}{
		{"let a = 5\na", 5},
		{"let a = 5 * 5\na", 25},
		{"let a = 5\nlet b = a\nb", 5},
		{"let a = 5\nlet b = a\nlet c = a + b + 5\nc", 15},
	}

	for _, tt := range tests {
		result := testEvalDebug(t, tt.input)
		if !testIntegerObject(t, result, tt.expected) {
			t.Errorf("Failed for input: %s", tt.input)
		}
	}
}

func TestEvaluatorAssignment(t *testing.T) {
	tests := []struct {
		input    string
		expected int64
	}{
		{"let a = 10\na = 20\na", 20},
		{"let a = 5\na = a + 5\na", 10},
		{"let a = 5\nlet b = 10\na = b\na", 10},
	}

	for _, tt := range tests {
		result := testEvalDebug(t, tt.input)
		if !testIntegerObject(t, result, tt.expected) {
			t.Errorf("Failed for input: %s", tt.input)
		}
	}
}

func TestEvaluatorFunctionApplication(t *testing.T) {
	tests := []struct {
		input    string
		expected int64
	}{
		{"let identity = fn(x) { x }\nidentity(5)", 5},
		{"let identity = fn(x) { return x }\nidentity(5)", 5},
		{"let double = fn(x) { x * 2 }\ndouble(5)", 10},
		{"let add = fn(x, y) { x + y }\nadd(5, 5)", 10},
		{"let add = fn(x, y) { x + y }\nadd(5 + 5, add(5, 5))", 20},
		{"fn(x) { x }(5)", 5},
	}

	for _, tt := range tests {
		result := testEvalDebug(t, tt.input)
		if !testIntegerObject(t, result, tt.expected) {
			t.Errorf("Failed for input: %s", tt.input)
		}
	}
}

func TestEvaluatorStringLiteral(t *testing.T) {
	input := `"Hello World!"`
	evaluated := testEval(input)
	testStringObject(t, evaluated, "Hello World!")
}

func TestEvaluatorStringConcatenation(t *testing.T) {
	tests := []struct {
		input    string
		expected string
	}{
		{`"Hello" ++ " " ++ "World"`, "Hello World"},
		{`"foo" ++ "bar"`, "foobar"},
	}

	for _, tt := range tests {
		evaluated := testEval(tt.input)
		testStringObject(t, evaluated, tt.expected)
	}
}

func TestEvaluatorArrayLiterals(t *testing.T) {
	input := "[1, 2 * 2, 3 + 3]"
	evaluated := testEval(input)

	result, ok := evaluated.(*object.Array)
	if !ok {
		t.Fatalf("Object is not Array. got=%T (%+v)", evaluated, evaluated)
	}

	if len(result.Elements) != 3 {
		t.Fatalf("Array has wrong number of elements. got=%d", len(result.Elements))
	}

	testIntegerObject(t, result.Elements[0], 1)
	testIntegerObject(t, result.Elements[1], 4)
	testIntegerObject(t, result.Elements[2], 6)
}

func TestEvaluatorArrayIndexExpressions(t *testing.T) {
	tests := []struct {
		input    string
		expected any
	}{
		{"[1, 2, 3][0]", 1},
		{"[1, 2, 3][1]", 2},
		{"[1, 2, 3][2]", 3},
		{"[1, 2, 3][1 + 1]", 3},
		{"let myArray = [1, 2, 3]\nmyArray[2]", 3},
		{"let myArray = [1, 2, 3]\nmyArray[0] + myArray[1] + myArray[2]", 6},
		{"let myArray = [1, 2, 3]\nlet i = myArray[0]\nmyArray[i]", 2},
	}

	for _, tt := range tests {
		evaluated := testEvalDebug(t, tt.input)
		integer, ok := tt.expected.(int)
		if ok {
			if !testIntegerObject(t, evaluated, int64(integer)) {
				t.Errorf("Failed for input: %s", tt.input)
			}
		} else {
			if !testNullObject(t, evaluated) {
				t.Errorf("Failed for input: %s", tt.input)
			}
		}
	}
}

func TestEvaluatorHashLiterals(t *testing.T) {
	input := `
	let two = "two"
	{
		"one": 10 - 9,
		two: 1 + 1,
		"thr" ++ "ee": 6 / 2,
		4: 4,
		true: 5,
		false: 6
	}
	`

	evaluated := testEvalDebug(t, input)
	result, ok := evaluated.(*object.Hash)
	if !ok {
		t.Fatalf("Eval didn't return Hash. got=%T (%+v)", evaluated, evaluated)
		return
	}

	expected := map[object.HashKey]int64{
		(&object.String{Value: "one"}).HashKey():   1,
		(&object.String{Value: "two"}).HashKey():   2,
		(&object.String{Value: "three"}).HashKey(): 3,
		(&object.Integer{Value: 4}).HashKey():      4,
		evaluator.TRUE.HashKey():                   5,
		evaluator.FALSE.HashKey():                  6,
	}

	if len(result.Pairs) != len(expected) {
		t.Fatalf("Hash has wrong number of pairs. got=%d, expected=%d", len(result.Pairs), len(expected))
	}

	for expectedKey, expectedValue := range expected {
		pair, ok := result.Pairs[expectedKey]
		if !ok {
			t.Errorf("No pair for given key in Pairs")
		}
		testIntegerObject(t, pair.Value, expectedValue)
	}
}

func TestEvaluatorForLoop(t *testing.T) {
	input := `
	let sum = 0
	for x in [1, 2, 3, 4] {
		sum = sum + x
	}
	sum
	`
	evaluated := testEval(input)
	testIntegerObject(t, evaluated, 10)
}

func TestEvaluatorWhileLoop(t *testing.T) {
	input := `
	let x = 0
	while x < 5 {
		x = x + 1
	}
	x
	`
	evaluated := testEval(input)
	testIntegerObject(t, evaluated, 5)
}
