package test

import (
	"lynx/pkg/object"
	"testing"
)

// TestEvaluatorIntegerArithmetic pārbauda, vai interpretators/evaluators
// pareizi aprēķina veselo skaitļu aritmētiku (saskaitīšanu, atņemšanu,
// reizināšanu, dalīšanu un iekavas).
func TestEvaluatorIntegerArithmetic(t *testing.T) {
	// Testa gadījumi ar ievades izteiksmi un gaidāmo rezultātu.
	tests := []struct {
		input    string // Izteiksme kā string
		expected int64  // Gaidāmais rezultāts
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

	// Izpildām katru testu.
	for _, tt := range tests {
		// Izsaucam funkciju, kas izpilda (evaluē) ievades izteiksmi
		evaluated := testEval(tt.input)
		// Pārbaudām, vai rezultāts ir Integer un vai tas sakrīt ar gaidīto vērtību
		testIntegerObject(t, evaluated, tt.expected)
	}
}

// testIntegerObject pārbauda, vai rezultāts ir vesels skaitlis (object.Integer)
// un vai tā vērtība atbilst gaidītajai.
func testIntegerObject(t *testing.T, obj object.Object, expected int64) bool {
	// Mēģinām pārveidot object.Object uz *object.Integer
	result, ok := obj.(*object.Integer)
	if !ok {
		// Ja nav Integer, tad testam jākrīt ar kļūdu
		t.Errorf("Object is not Integer. got=%T (%+v)", obj, obj)
		return false
	}
	// Ja Integer, tad pārbaudām, vai vērtība atbilst gaidītajai
	if result.Value != expected {
		t.Errorf("Object has wrong value. got=%d, want=%d", result.Value, expected)
		return false
	}
	// Viss kārtībā
	return true
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
