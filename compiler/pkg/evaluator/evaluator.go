package evaluator

import (
	"fmt"
	"lynx/pkg/ast"
	"lynx/pkg/lexer"
	"lynx/pkg/object"
	"lynx/pkg/parser"
	"maps"
	"math"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

var (
	NULL  = &object.Null{}
	TRUE  = &object.Boolean{Value: true}
	FALSE = &object.Boolean{Value: false}
)

var moduleCache = make(map[string]object.Object)

func Eval(node ast.Node, env *object.Env) object.Object {
	switch node := node.(type) {
	case *ast.Program:
		return evalProgram(node.Statements, env)
	case *ast.ExpressionStatement:
		return Eval(node.Expression, env)
	case *ast.IntegerLiteral:
		return &object.Integer{Value: node.Value}
	case *ast.FloatLiteral:
		return &object.Float{Value: node.Value}
	case *ast.Boolean:
		return nativeBoolToBooleanObject(node.Value)
	case *ast.PrefixExpression:
		right := Eval(node.Right, env)
		if isError(right) {
			return right
		}
		return evalPrefixExpression(node.Operator, right)
	case *ast.InfixExpression:
		left := Eval(node.Left, env)
		if isError(left) {
			return left
		}
		right := Eval(node.Right, env)
		if isError(right) {
			return right
		}
		return evalInfixExpression(node.Operator, left, right)
	case *ast.BlockStatement:
		return evalBlockStatement(node, env)
	case *ast.IfExpression:
		return evalIfExpression(node, env)
	case *ast.ReturnStatement:
		val := Eval(node.Value, env)
		if isError(val) {
			return val
		}
		return &object.Return{Value: val}
	case *ast.VarStatement:
		val := Eval(node.Value, env)
		if isError(val) {
			return val
		}
		env.Set(node.Name.Value, val, node.IsConst)
		return val
	case *ast.Identifier:
		return evalIdentifier(node, env)
	case *ast.FunctionLiteral:
		params := node.Parameters
		body := node.Body
		return &object.Function{Parameters: params, Body: body, Env: env}
	case *ast.CallExpression:
		function := Eval(node.Function, env)
		if isError(function) {
			return function
		}
		args := evalExpressions(node.Arguments, env)
		return applyFunction(function, args)
	case *ast.StringLiteral:
		return &object.String{Value: node.Value}
	case *ast.ArrayLiteral:
		elements := evalExpressions(node.Elements, env)
		if len(elements) == 1 && isError(elements[0]) {
			return elements[0]
		}
		return &object.Array{Elements: elements}
	case *ast.IndexExpression:
		left := Eval(node.Left, env)
		if isError(left) {
			return left
		}
		index := Eval(node.Index, env)
		if isError(index) {
			return index
		}
		return evalIndexExpression(left, index)
	case *ast.HashLiteral:
		return evalHashLiteral(node, env)
	case *ast.MethodCall:
		obj := Eval(node.Object, env)
		if isError(obj) {
			return obj
		}
		args := evalExpressions(node.Arguments, env)
		if len(args) == 1 && isError(args[0]) {
			return args[0]
		}
		return applyMethod(obj, node.Method.Value, args)
	case *ast.Assignment:
		val := Eval(node.Value, env)
		if isError(val) {
			return val
		}

		switch target := node.Name.(type) {
		case *ast.Identifier:
			obj := env.Assign(target.Value, val)
			if isError(obj) {
				return obj
			}
			return val
		case *ast.IndexExpression:
			left := Eval(target.Left, env)
			if isError(left) {
				return left
			}
			index := Eval(target.Index, env)
			if isError(index) {
				return index
			}

			return evalIndexAssignment(left, index, val)

		case *ast.PropertyAccess:
			object := Eval(target.Object, env)
			if isError(object) {
				return object
			}
			return evalPropertyAssignment(object, target.Property.Value, val)
		default:
			return newError("invalid assignment target: %T", node.Name)
		}

	case *ast.PropertyAccess:
		obj := Eval(node.Object, env)
		if isError(obj) {
			return obj
		}
		prop := &object.String{Value: node.Property.Value}
		return evalPropertyAccess(obj, prop.Value)
	case *ast.ForRange:
		return evalForRange(node, env)
	case *ast.While:
		return evalWhile(node, env)
	case *ast.Continue:
		return &object.Continue{}
	case *ast.Break:
		return &object.Break{}
	case *ast.ModuleLoad:
		return evalModuleLoad(node, env)
	case *ast.SwitchStatement:
		return evalSwitchStatement(node, env)
	case *ast.PipeExpression:
		return evalPipeExpression(node, env)
	case *ast.ErrorStatement:
		return evalErrorStatement(node, env)
	case *ast.CatchStatement:
		return evalCatchStatement(node, env)
	case *ast.Null:
		return &object.Null{}
	case *ast.Class:
		return evalClassStatement(node, env)
	case *ast.Self:
		return evalSelf(env)
	default:
		return newError("unknown node type: %T", node)
	}
}

func evalIndexAssignment(left, index, value object.Object) object.Object {
	switch arr := left.(type) {
	case *object.Array:
		idx, ok := index.(*object.Integer)
		if !ok {
			return newError("index must be an integer: %s", index.Type())
		}
		max := int64(len(arr.Elements) - 1)
		if idx.Value < 0 || idx.Value > max {
			return newError("index out of range: %d", idx.Value)
		}
		arr.Elements[idx.Value] = value
		return value
	case *object.Hash:
		key, ok := index.(object.Hashable)
		if !ok {
			return newError("unusable as hash key: %s", index.Type())
		}
		pair, ok := arr.Pairs[key.HashKey()]
		if !ok {
			return newError("key not found: %s", index.Type())
		}
		pair.Value = value
		return pair.Value
	default:
		return newError("cannot assign to: %s", left.Type())
	}
}

func evalPropertyAssignment(obj object.Object, prop string, val object.Object) object.Object {
	switch obj := obj.(type) {
	case *object.Hash:
		key := &object.String{Value: prop}
		obj.Pairs[key.HashKey()] = object.HashPair{Key: key, Value: val}
		return val
	case *object.Instance:
		obj.Attributes[prop] = val
		return val
	default:
		return newError("property assignment only supported on objects and instances, got %T", obj)
	}
}

func nativeBoolToBooleanObject(value bool) *object.Boolean {
	if value {
		return TRUE
	}
	return FALSE
}

func evalProgram(stmts []ast.Statement, env *object.Env) object.Object {
	var result object.Object

	for i, statement := range stmts {
		result = Eval(statement, env)

		switch result := result.(type) {
		case *object.Return:
			return result.Value
		case *object.Error:
			return result
		}

		if i == len(stmts)-1 {
			if _, ok := statement.(*ast.ExpressionStatement); ok {
				return result
			}
		}
	}

	return NULL
}

func evalPrefixExpression(operator string, right object.Object) object.Object {
	switch operator {
	case "!":
		return evalBangOperatorExpression(right)
	case "-":
		return evalMinusPrefixOperatorExpression(right)
	case "$":
		return evalSquarePrefixOperatorExpression(right)
	default:
		return newError("unknown operator: %s%s", operator, right.Type())
	}
}

func evalSquarePrefixOperatorExpression(right object.Object) object.Object {
	if right.Type() != object.INTEGER_OBJ {
		return newError("unknown operator: $%s", right.Type())
	}
	value := right.(*object.Integer).Value
	return &object.Float{Value: math.Sqrt(float64(value))}
}

func evalBangOperatorExpression(right object.Object) object.Object {
	switch right {
	case TRUE:
		return FALSE
	case FALSE:
		return TRUE
	case NULL:
		return TRUE
	default:
		return FALSE
	}
}

func evalMinusPrefixOperatorExpression(right object.Object) object.Object {
	if right.Type() != object.INTEGER_OBJ {
		return newError("unknown operator: -%s", right.Type())
	}
	value := right.(*object.Integer).Value
	return &object.Integer{Value: -value}
}

type OperatorHandler func(left, right object.Object) object.Object

type TypePair struct {
	Left  object.ObjectType
	Right object.ObjectType
}

var operatorMap = map[TypePair]map[string]OperatorHandler{
	{object.INTEGER_OBJ, object.INTEGER_OBJ}: {
		"+":   evalIntegerAdd,
		"-":   evalIntegerSub,
		"*":   evalIntegerMul,
		"/":   evalIntegerDiv,
		"%":   evalIntegerMod,
		"^":   evalIntegerPow,
		"$":   evalIntegerSqrt,
		"<":   evalIntegerLess,
		">":   evalIntegerGreater,
		">=":  evalIntegerGreaterEqual,
		"<=":  evalIntegerLessEqual,
		"==":  evalIntegerEqual,
		"!=":  evalIntegerNotEqual,
		"and": evalIntegerAnd,
		"or":  evalIntegerOr,
	},
	{object.FLOAT_OBJ, object.FLOAT_OBJ}: {
		"+":   evalFloatAdd,
		"-":   evalFloatSub,
		"*":   evalFloatMul,
		"/":   evalFloatDiv,
		"%":   evalFloatMod,
		"^":   evalFloatPow,
		"$":   evalFloatSqrt,
		"<":   evalFloatLess,
		">":   evalFloatGreater,
		">=":  evalFloatGreaterEqual,
		"<=":  evalFloatLessEqual,
		"==":  evalFloatEqual,
		"!=":  evalFloatNotEqual,
		"and": evalFloatAnd,
		"or":  evalFloatOr,
	},
	{object.FLOAT_OBJ, object.INTEGER_OBJ}: {
		"+":   evalFloatIntegerAdd,
		"-":   evalFloatIntegerSub,
		"*":   evalFloatIntegerMul,
		"/":   evalFloatIntegerDiv,
		"%":   evalFloatIntegerMod,
		"^":   evalFloatIntegerPow,
		"$":   evalFloatIntegerSqrt,
		"<":   evalFloatIntegerLess,
		">":   evalFloatIntegerGreater,
		">=":  evalFloatIntegerGreaterEqual,
		"<=":  evalFloatIntegerLessEqual,
		"==":  evalFloatIntegerEqual,
		"!=":  evalFloatIntegerNotEqual,
		"and": evalFloatIntegerAnd,
		"or":  evalFloatIntegerOr,
	},
	{object.INTEGER_OBJ, object.FLOAT_OBJ}: {
		"+":   evalIntegerFloatAdd,
		"-":   evalIntegerFloatSub,
		"*":   evalIntegerFloatMul,
		"/":   evalIntegerFloatDiv,
		"%":   evalIntegerFloatMod,
		"^":   evalIntegerFloatPow,
		"$":   evalIntegerFloatSqrt,
		"<":   evalIntegerFloatLess,
		">":   evalIntegerFloatGreater,
		">=":  evalIntegerFloatGreaterEqual,
		"<=":  evalIntegerFloatLessEqual,
		"==":  evalIntegerFloatEqual,
		"!=":  evalIntegerFloatNotEqual,
		"and": evalIntegerFloatAnd,
		"or":  evalIntegerFloatOr,
	},
	{object.STRING_OBJ, object.STRING_OBJ}: {
		"+":   evalStringConcat,
		"==":  evalStringEqual,
		"!=":  evalStringNotEqual,
		"<":   evalStringLess,
		">":   evalStringGreater,
		"<=":  evalStringLessEqual,
		">=":  evalStringGreaterEqual,
		"and": evalStringAnd,
		"or":  evalStringOr,
	},
	{object.BOOLEAN_OBJ, object.BOOLEAN_OBJ}: {
		"and": evalBooleanAnd,
		"or":  evalBooleanOr,
		"==":  evalBooleanEqual,
		"!=":  evalBooleanNotEqual,
	},
	{object.BOOLEAN_OBJ, object.INTEGER_OBJ}: {
		"and": evalBooleanIntegerAnd,
		"or":  evalBooleanIntegerOr,
		"==":  evalBooleanIntegerEqual,
		"!=":  evalBooleanIntegerNotEqual,
		">":   evalBooleanIntegerGreater,
		"<":   evalBooleanIntegerLess,
		">=":  evalBooleanIntegerGreaterEqual,
		"<=":  evalBooleanIntegerLessEqual,
	},
	{object.INTEGER_OBJ, object.BOOLEAN_OBJ}: {
		"and": evalIntegerBooleanAnd,
		"or":  evalIntegerBooleanOr,
		"==":  evalIntegerBooleanEqual,
		"!=":  evalIntegerBooleanNotEqual,
		">":   evalIntegerBooleanGreater,
		"<":   evalIntegerBooleanLess,
		">=":  evalIntegerBooleanGreaterEqual,
		"<=":  evalIntegerBooleanLessEqual,
	},
}

func evalInfixExpression(operator string, left, right object.Object) object.Object {
	if operator == "++" {
		return evalConcatExpression(left, right)
	}

	if operator == "in" {
		return evalInOperator(left, right)
	}

	typePair := TypePair{left.Type(), right.Type()}
	if handlers, exists := operatorMap[typePair]; exists {
		if handler, exists := handlers[operator]; exists {
			return handler(left, right)
		}
	}

	if operator == "==" {
		return nativeBoolToBooleanObject(left == right)
	}

	if operator == "!=" {
		return nativeBoolToBooleanObject(left != right)
	}

	return newError("unknown operator: %s %s %s", left.Type(), operator, right.Type())
}

func evalInOperator(left, right object.Object) object.Object {
	switch container := right.(type) {
	case *object.Array:
		for _, element := range container.Elements {
			result := evalInfixExpression("==", left, element)
			if result.Type() == object.BOOLEAN_OBJ && result.(*object.Boolean).Value {
				return TRUE
			}
		}
		return FALSE

	case *object.Hash:
		hashKey, ok := left.(object.Hashable)
		if !ok {
			return newError("unusable as hash key: %s", left.Type())
		}

		_, exists := container.Pairs[hashKey.HashKey()]
		return nativeBoolToBooleanObject(exists)

	case *object.String:
		if leftStr, ok := left.(*object.String); ok {
			return nativeBoolToBooleanObject(strings.Contains(container.Value, leftStr.Value))
		}
		return newError("left operand of 'in' must be STRING when right is STRING, got %s", left.Type())

	default:
		return newError("right operand of 'in' must be ARRAY, HASH, or STRING, got %s", right.Type())
	}
}

func evalIntegerMod(left, right object.Object) object.Object {
	leftVal := left.(*object.Integer).Value
	rightVal := right.(*object.Integer).Value
	if rightVal == 0 {
		return newError("modulo by zero")
	}
	return &object.Integer{Value: leftVal % rightVal}
}

func evalFloatMod(left, right object.Object) object.Object {
	leftVal := left.(*object.Float).Value
	rightVal := right.(*object.Float).Value
	if rightVal == 0 {
		return newError("modulo by zero")
	}
	return &object.Float{Value: math.Mod(leftVal, rightVal)}
}

func evalFloatIntegerMod(left, right object.Object) object.Object {
	leftVal := left.(*object.Float).Value
	rightVal := float64(right.(*object.Integer).Value)
	if rightVal == 0 {
		return newError("modulo by zero")
	}
	return &object.Float{Value: math.Mod(leftVal, rightVal)}
}

func evalIntegerFloatMod(left, right object.Object) object.Object {
	leftVal := float64(left.(*object.Integer).Value)
	rightVal := right.(*object.Float).Value
	if rightVal == 0 {
		return newError("modulo by zero")
	}
	return &object.Float{Value: math.Mod(leftVal, rightVal)}
}

func evalBooleanIntegerAnd(left, right object.Object) object.Object {
	leftVal := left.(*object.Boolean).Value
	rightVal := right.(*object.Integer).Value
	return nativeBoolToBooleanObject(leftVal && rightVal != 0)
}

func evalBooleanIntegerOr(left, right object.Object) object.Object {
	leftVal := left.(*object.Boolean).Value
	rightVal := right.(*object.Integer).Value
	return nativeBoolToBooleanObject(leftVal || rightVal != 0)
}

func evalIntegerBooleanAnd(left, right object.Object) object.Object {
	leftVal := left.(*object.Integer).Value
	rightVal := right.(*object.Boolean).Value
	return nativeBoolToBooleanObject(leftVal != 0 && rightVal)
}

func evalIntegerBooleanOr(left, right object.Object) object.Object {
	leftVal := left.(*object.Integer).Value
	rightVal := right.(*object.Boolean).Value
	return nativeBoolToBooleanObject(leftVal != 0 || rightVal)
}

func evalBooleanIntegerEqual(left, right object.Object) object.Object {
	leftVal := left.(*object.Boolean).Value
	rightVal := right.(*object.Integer).Value != 0
	return nativeBoolToBooleanObject(leftVal == rightVal)
}

func evalBooleanIntegerNotEqual(left, right object.Object) object.Object {
	leftVal := left.(*object.Boolean).Value
	rightVal := right.(*object.Integer).Value != 0
	return nativeBoolToBooleanObject(leftVal != rightVal)
}

func evalBooleanIntegerGreater(left, right object.Object) object.Object {
	leftVal := boolToInt(left.(*object.Boolean).Value)
	rightVal := right.(*object.Integer).Value
	return nativeBoolToBooleanObject(leftVal > rightVal)
}

func evalBooleanIntegerLess(left, right object.Object) object.Object {
	leftVal := boolToInt(left.(*object.Boolean).Value)
	rightVal := right.(*object.Integer).Value
	return nativeBoolToBooleanObject(leftVal < rightVal)
}

func evalBooleanIntegerGreaterEqual(left, right object.Object) object.Object {
	leftVal := boolToInt(left.(*object.Boolean).Value)
	rightVal := right.(*object.Integer).Value
	return nativeBoolToBooleanObject(leftVal >= rightVal)
}

func evalBooleanIntegerLessEqual(left, right object.Object) object.Object {
	leftVal := boolToInt(left.(*object.Boolean).Value)
	rightVal := right.(*object.Integer).Value
	return nativeBoolToBooleanObject(leftVal <= rightVal)
}

func evalIntegerBooleanEqual(left, right object.Object) object.Object {
	leftVal := left.(*object.Integer).Value != 0
	rightVal := right.(*object.Boolean).Value
	return nativeBoolToBooleanObject(leftVal == rightVal)
}

func evalIntegerBooleanNotEqual(left, right object.Object) object.Object {
	leftVal := left.(*object.Integer).Value != 0
	rightVal := right.(*object.Boolean).Value
	return nativeBoolToBooleanObject(leftVal != rightVal)
}

func evalIntegerBooleanGreater(left, right object.Object) object.Object {
	leftVal := left.(*object.Integer).Value
	rightVal := boolToInt(right.(*object.Boolean).Value)
	return nativeBoolToBooleanObject(leftVal > rightVal)
}

func evalIntegerBooleanLess(left, right object.Object) object.Object {
	leftVal := left.(*object.Integer).Value
	rightVal := boolToInt(right.(*object.Boolean).Value)
	return nativeBoolToBooleanObject(leftVal < rightVal)
}

func evalIntegerBooleanGreaterEqual(left, right object.Object) object.Object {
	leftVal := left.(*object.Integer).Value
	rightVal := boolToInt(right.(*object.Boolean).Value)
	return nativeBoolToBooleanObject(leftVal >= rightVal)
}

func evalIntegerBooleanLessEqual(left, right object.Object) object.Object {
	leftVal := left.(*object.Integer).Value
	rightVal := boolToInt(right.(*object.Boolean).Value)
	return nativeBoolToBooleanObject(leftVal <= rightVal)
}

func boolToInt(b bool) int64 {
	if b {
		return 1
	}
	return 0
}

func evalIntegerAdd(left, right object.Object) object.Object {
	leftVal := left.(*object.Integer).Value
	rightVal := right.(*object.Integer).Value
	return &object.Integer{Value: leftVal + rightVal}
}

func evalIntegerSub(left, right object.Object) object.Object {
	leftVal := left.(*object.Integer).Value
	rightVal := right.(*object.Integer).Value
	return &object.Integer{Value: leftVal - rightVal}
}

func evalIntegerMul(left, right object.Object) object.Object {
	leftVal := left.(*object.Integer).Value
	rightVal := right.(*object.Integer).Value
	return &object.Integer{Value: leftVal * rightVal}
}

func evalIntegerDiv(left, right object.Object) object.Object {
	leftVal := left.(*object.Integer).Value
	rightVal := right.(*object.Integer).Value
	if rightVal == 0 {
		return newError("division by zero")
	}
	return &object.Integer{Value: leftVal / rightVal}
}

func evalIntegerPow(left, right object.Object) object.Object {
	leftVal := float64(left.(*object.Integer).Value)
	rightVal := float64(right.(*object.Integer).Value)
	result := math.Pow(leftVal, rightVal)
	return &object.Integer{Value: int64(result)}
}

func evalIntegerSqrt(left, right object.Object) object.Object {
	rightVal := float64(right.(*object.Integer).Value)
	if rightVal < 0 {
		return newError("square root of negative number")
	}
	return &object.Float{Value: math.Sqrt(rightVal)}
}

func evalIntegerLess(left, right object.Object) object.Object {
	leftVal := left.(*object.Integer).Value
	rightVal := right.(*object.Integer).Value
	return nativeBoolToBooleanObject(leftVal < rightVal)
}

func evalIntegerGreater(left, right object.Object) object.Object {
	leftVal := left.(*object.Integer).Value
	rightVal := right.(*object.Integer).Value
	return nativeBoolToBooleanObject(leftVal > rightVal)
}

func evalIntegerGreaterEqual(left, right object.Object) object.Object {
	leftVal := left.(*object.Integer).Value
	rightVal := right.(*object.Integer).Value
	return nativeBoolToBooleanObject(leftVal >= rightVal)
}

func evalIntegerLessEqual(left, right object.Object) object.Object {
	leftVal := left.(*object.Integer).Value
	rightVal := right.(*object.Integer).Value
	return nativeBoolToBooleanObject(leftVal <= rightVal)
}

func evalIntegerEqual(left, right object.Object) object.Object {
	leftVal := left.(*object.Integer).Value
	rightVal := right.(*object.Integer).Value
	return nativeBoolToBooleanObject(leftVal == rightVal)
}

func evalIntegerNotEqual(left, right object.Object) object.Object {
	leftVal := left.(*object.Integer).Value
	rightVal := right.(*object.Integer).Value
	return nativeBoolToBooleanObject(leftVal != rightVal)
}

func evalIntegerAnd(left, right object.Object) object.Object {
	leftVal := left.(*object.Integer).Value
	rightVal := right.(*object.Integer).Value
	return nativeBoolToBooleanObject(leftVal != 0 && rightVal != 0)
}

func evalIntegerOr(left, right object.Object) object.Object {
	leftVal := left.(*object.Integer).Value
	rightVal := right.(*object.Integer).Value
	return nativeBoolToBooleanObject(leftVal != 0 || rightVal != 0)
}

func evalFloatAdd(left, right object.Object) object.Object {
	leftVal := left.(*object.Float).Value
	rightVal := right.(*object.Float).Value
	return &object.Float{Value: leftVal + rightVal}
}

func evalFloatSub(left, right object.Object) object.Object {
	leftVal := left.(*object.Float).Value
	rightVal := right.(*object.Float).Value
	return &object.Float{Value: leftVal - rightVal}
}

func evalFloatMul(left, right object.Object) object.Object {
	leftVal := left.(*object.Float).Value
	rightVal := right.(*object.Float).Value
	return &object.Float{Value: leftVal * rightVal}
}

func evalFloatDiv(left, right object.Object) object.Object {
	leftVal := left.(*object.Float).Value
	rightVal := right.(*object.Float).Value
	if rightVal == 0 {
		return newError("division by zero")
	}
	return &object.Float{Value: leftVal / rightVal}
}

func evalFloatPow(left, right object.Object) object.Object {
	leftVal := left.(*object.Float).Value
	rightVal := right.(*object.Float).Value
	return &object.Float{Value: math.Pow(leftVal, rightVal)}
}

func evalFloatSqrt(left, right object.Object) object.Object {
	rightVal := right.(*object.Float).Value
	if rightVal < 0 {
		return newError("square root of negative number")
	}
	return &object.Float{Value: math.Sqrt(rightVal)}
}

func evalFloatLess(left, right object.Object) object.Object {
	leftVal := left.(*object.Float).Value
	rightVal := right.(*object.Float).Value
	return nativeBoolToBooleanObject(leftVal < rightVal)
}

func evalFloatGreater(left, right object.Object) object.Object {
	leftVal := left.(*object.Float).Value
	rightVal := right.(*object.Float).Value
	return nativeBoolToBooleanObject(leftVal > rightVal)
}

func evalFloatGreaterEqual(left, right object.Object) object.Object {
	leftVal := left.(*object.Float).Value
	rightVal := right.(*object.Float).Value
	return nativeBoolToBooleanObject(leftVal >= rightVal)
}

func evalFloatLessEqual(left, right object.Object) object.Object {
	leftVal := left.(*object.Float).Value
	rightVal := right.(*object.Float).Value
	return nativeBoolToBooleanObject(leftVal <= rightVal)
}

func evalFloatEqual(left, right object.Object) object.Object {
	leftVal := left.(*object.Float).Value
	rightVal := right.(*object.Float).Value
	return nativeBoolToBooleanObject(leftVal == rightVal)
}

func evalFloatNotEqual(left, right object.Object) object.Object {
	leftVal := left.(*object.Float).Value
	rightVal := right.(*object.Float).Value
	return nativeBoolToBooleanObject(leftVal != rightVal)
}

func evalFloatIntegerAdd(left, right object.Object) object.Object {
	leftVal := left.(*object.Float).Value
	rightVal := float64(right.(*object.Integer).Value)
	return &object.Float{Value: leftVal + rightVal}
}

func evalFloatIntegerSub(left, right object.Object) object.Object {
	leftVal := left.(*object.Float).Value
	rightVal := float64(right.(*object.Integer).Value)
	return &object.Float{Value: leftVal - rightVal}
}

func evalFloatIntegerMul(left, right object.Object) object.Object {
	leftVal := left.(*object.Float).Value
	rightVal := float64(right.(*object.Integer).Value)
	return &object.Float{Value: leftVal * rightVal}
}

func evalFloatIntegerDiv(left, right object.Object) object.Object {
	leftVal := left.(*object.Float).Value
	rightVal := float64(right.(*object.Integer).Value)
	if rightVal == 0 {
		return newError("division by zero")
	}
	return &object.Float{Value: leftVal / rightVal}
}

func evalFloatIntegerPow(left, right object.Object) object.Object {
	leftVal := left.(*object.Float).Value
	rightVal := float64(right.(*object.Integer).Value)
	return &object.Float{Value: math.Pow(leftVal, rightVal)}
}

func evalFloatIntegerSqrt(left, right object.Object) object.Object {
	rightVal := float64(right.(*object.Integer).Value)
	if rightVal < 0 {
		return newError("square root of negative number")
	}
	return &object.Float{Value: math.Sqrt(rightVal)}
}

func evalFloatIntegerLess(left, right object.Object) object.Object {
	leftVal := left.(*object.Float).Value
	rightVal := float64(right.(*object.Integer).Value)
	return nativeBoolToBooleanObject(leftVal < rightVal)
}

func evalFloatIntegerGreater(left, right object.Object) object.Object {
	leftVal := left.(*object.Float).Value
	rightVal := float64(right.(*object.Integer).Value)
	return nativeBoolToBooleanObject(leftVal > rightVal)
}

func evalFloatIntegerGreaterEqual(left, right object.Object) object.Object {
	leftVal := left.(*object.Float).Value
	rightVal := float64(right.(*object.Integer).Value)
	return nativeBoolToBooleanObject(leftVal >= rightVal)
}

func evalFloatIntegerLessEqual(left, right object.Object) object.Object {
	leftVal := left.(*object.Float).Value
	rightVal := float64(right.(*object.Integer).Value)
	return nativeBoolToBooleanObject(leftVal <= rightVal)
}

func evalFloatIntegerAnd(left, right object.Object) object.Object {
	leftVal := left.(*object.Float).Value
	rightVal := float64(right.(*object.Integer).Value)
	return nativeBoolToBooleanObject(leftVal != 0.0 && rightVal != 0.0)
}

func evalFloatIntegerOr(left, right object.Object) object.Object {
	leftVal := left.(*object.Float).Value
	rightVal := float64(right.(*object.Integer).Value)
	return nativeBoolToBooleanObject(leftVal != 0.0 || rightVal != 0.0)
}

func evalFloatIntegerEqual(left, right object.Object) object.Object {
	leftVal := left.(*object.Float).Value
	rightVal := float64(right.(*object.Integer).Value)
	return nativeBoolToBooleanObject(leftVal == rightVal)
}

func evalFloatIntegerNotEqual(left, right object.Object) object.Object {
	leftVal := left.(*object.Float).Value
	rightVal := float64(right.(*object.Integer).Value)
	return nativeBoolToBooleanObject(leftVal != rightVal)
}

func evalFloatAnd(left, right object.Object) object.Object {
	leftVal := left.(*object.Float).Value
	rightVal := right.(*object.Float).Value
	return nativeBoolToBooleanObject(leftVal != 0.0 && rightVal != 0.0)
}

func evalFloatOr(left, right object.Object) object.Object {
	leftVal := left.(*object.Float).Value
	rightVal := right.(*object.Float).Value
	return nativeBoolToBooleanObject(leftVal != 0.0 || rightVal != 0.0)
}

func evalIntegerFloatAdd(left, right object.Object) object.Object {
	leftVal := float64(left.(*object.Integer).Value)
	rightVal := right.(*object.Float).Value
	return &object.Float{Value: leftVal + rightVal}
}

func evalIntegerFloatSub(left, right object.Object) object.Object {
	leftVal := float64(left.(*object.Integer).Value)
	rightVal := right.(*object.Float).Value
	return &object.Float{Value: leftVal - rightVal}
}

func evalIntegerFloatMul(left, right object.Object) object.Object {
	leftVal := float64(left.(*object.Integer).Value)
	rightVal := right.(*object.Float).Value
	return &object.Float{Value: leftVal * rightVal}
}

func evalIntegerFloatDiv(left, right object.Object) object.Object {
	leftVal := float64(left.(*object.Integer).Value)
	rightVal := right.(*object.Float).Value
	if rightVal == 0 {
		return newError("division by zero")
	}
	return &object.Float{Value: leftVal / rightVal}
}

func evalIntegerFloatPow(left, right object.Object) object.Object {
	leftVal := float64(left.(*object.Integer).Value)
	rightVal := right.(*object.Float).Value
	return &object.Float{Value: math.Pow(leftVal, rightVal)}
}

func evalIntegerFloatSqrt(left, right object.Object) object.Object {
	rightVal := right.(*object.Float).Value
	if rightVal < 0 {
		return newError("square root of negative number")
	}
	return &object.Float{Value: math.Sqrt(rightVal)}
}

func evalIntegerFloatLess(left, right object.Object) object.Object {
	leftVal := float64(left.(*object.Integer).Value)
	rightVal := right.(*object.Float).Value
	return nativeBoolToBooleanObject(leftVal < rightVal)
}

func evalIntegerFloatGreater(left, right object.Object) object.Object {
	leftVal := float64(left.(*object.Integer).Value)
	rightVal := right.(*object.Float).Value
	return nativeBoolToBooleanObject(leftVal > rightVal)
}

func evalIntegerFloatGreaterEqual(left, right object.Object) object.Object {
	leftVal := float64(left.(*object.Integer).Value)
	rightVal := right.(*object.Float).Value
	return nativeBoolToBooleanObject(leftVal >= rightVal)
}

func evalIntegerFloatLessEqual(left, right object.Object) object.Object {
	leftVal := float64(left.(*object.Integer).Value)
	rightVal := right.(*object.Float).Value
	return nativeBoolToBooleanObject(leftVal <= rightVal)
}

func evalIntegerFloatEqual(left, right object.Object) object.Object {
	leftVal := float64(left.(*object.Integer).Value)
	rightVal := right.(*object.Float).Value
	return nativeBoolToBooleanObject(leftVal == rightVal)
}

func evalIntegerFloatNotEqual(left, right object.Object) object.Object {
	leftVal := float64(left.(*object.Integer).Value)
	rightVal := right.(*object.Float).Value
	return nativeBoolToBooleanObject(leftVal != rightVal)
}

func evalIntegerFloatAnd(left, right object.Object) object.Object {
	leftVal := float64(left.(*object.Integer).Value)
	rightVal := right.(*object.Float).Value
	return nativeBoolToBooleanObject(leftVal != 0.0 && rightVal != 0.0)
}

func evalIntegerFloatOr(left, right object.Object) object.Object {
	leftVal := float64(left.(*object.Integer).Value)
	rightVal := right.(*object.Float).Value
	return nativeBoolToBooleanObject(leftVal != 0.0 || rightVal != 0.0)
}

func evalStringConcat(left, right object.Object) object.Object {
	leftVal := left.(*object.String).Value
	rightVal := right.(*object.String).Value
	return &object.String{Value: leftVal + rightVal}
}

func evalStringEqual(left, right object.Object) object.Object {
	leftVal := left.(*object.String).Value
	rightVal := right.(*object.String).Value
	return nativeBoolToBooleanObject(leftVal == rightVal)
}

func evalStringNotEqual(left, right object.Object) object.Object {
	leftVal := left.(*object.String).Value
	rightVal := right.(*object.String).Value
	return nativeBoolToBooleanObject(leftVal != rightVal)
}

func evalStringLess(left, right object.Object) object.Object {
	leftVal := left.(*object.String).Value
	rightVal := right.(*object.String).Value
	return nativeBoolToBooleanObject(leftVal < rightVal)
}

func evalStringGreater(left, right object.Object) object.Object {
	leftVal := left.(*object.String).Value
	rightVal := right.(*object.String).Value
	return nativeBoolToBooleanObject(leftVal > rightVal)
}

func evalStringLessEqual(left, right object.Object) object.Object {
	leftVal := left.(*object.String).Value
	rightVal := right.(*object.String).Value
	return nativeBoolToBooleanObject(leftVal <= rightVal)
}

func evalStringGreaterEqual(left, right object.Object) object.Object {
	leftVal := left.(*object.String).Value
	rightVal := right.(*object.String).Value
	return nativeBoolToBooleanObject(leftVal >= rightVal)
}

func evalStringAnd(left, right object.Object) object.Object {
	leftVal := left.(*object.String).Value
	rightVal := right.(*object.String).Value
	return nativeBoolToBooleanObject(leftVal != "" && rightVal != "")
}

func evalStringOr(left, right object.Object) object.Object {
	leftVal := left.(*object.String).Value
	rightVal := right.(*object.String).Value
	return nativeBoolToBooleanObject(leftVal != "" || rightVal != "")
}

func evalBooleanAnd(left, right object.Object) object.Object {
	leftVal := left.(*object.Boolean).Value
	rightVal := right.(*object.Boolean).Value
	return nativeBoolToBooleanObject(leftVal && rightVal)
}

func evalBooleanOr(left, right object.Object) object.Object {
	leftVal := left.(*object.Boolean).Value
	rightVal := right.(*object.Boolean).Value
	return nativeBoolToBooleanObject(leftVal || rightVal)
}

func evalBooleanEqual(left, right object.Object) object.Object {
	leftVal := left.(*object.Boolean).Value
	rightVal := right.(*object.Boolean).Value
	return nativeBoolToBooleanObject(leftVal == rightVal)
}

func evalBooleanNotEqual(left, right object.Object) object.Object {
	leftVal := left.(*object.Boolean).Value
	rightVal := right.(*object.Boolean).Value
	return nativeBoolToBooleanObject(leftVal != rightVal)
}

func evalConcatExpression(left, right object.Object) object.Object {
	switch left := left.(type) {
	case *object.String:
		return &object.String{Value: left.Value + right.(*object.String).Value}
	case *object.Array:
		return &object.Array{Elements: append(left.Elements, right.(*object.Array).Elements...)}
	default:
		return newError("cannot concatenate: %s", left.Type())
	}
}

func evalIfExpression(ie *ast.IfExpression, env *object.Env) object.Object {
	condition := Eval(ie.Condition, env)
	if isError(condition) {
		return condition
	}
	if isTruthy(condition) {
		return Eval(ie.Consequence, env)
	} else if ie.Alternative != nil {
		return Eval(ie.Alternative, env)
	} else {
		return NULL
	}
}

func isTruthy(obj object.Object) bool {
	switch obj {
	case NULL:
		return false
	case TRUE:
		return true
	case FALSE:
		return false
	default:
		return true
	}
}

func isError(obj object.Object) bool {
	if obj != nil {
		return obj.Type() == object.ERROR_OBJ
	}
	return false
}

func evalBlockStatement(block *ast.BlockStatement, env *object.Env) object.Object {
	var result object.Object
	for _, stmt := range block.Statements {
		result = Eval(stmt, env)
		if result != nil {
			rt := result.Type()
			if rt == object.RETURN_OBJ || rt == object.ERROR_OBJ {
				return result
			}
		}
	}
	return result
}

func newError(format string, a ...any) *object.Error {
	return &object.Error{Message: fmt.Sprintf(format, a...)}
}

func evalIdentifier(node *ast.Identifier, env *object.Env) object.Object {
	if val, ok := env.Get(node.Value); ok {
		return val
	}

	if builtin, ok := builtins[node.Value]; ok {
		return builtin
	}

	return newError("identifier not found: %s", node.Value)
}

func evalExpressions(exps []ast.Expression, env *object.Env) []object.Object {
	var result []object.Object
	for _, e := range exps {
		evaluated := Eval(e, env)
		if isError(evaluated) {
			return []object.Object{evaluated}
		}
		result = append(result, evaluated)
	}
	return result
}

func applyFunction(fn object.Object, args []object.Object) object.Object {
	switch fn := fn.(type) {
	case *object.Function:
		if len(args) != len(fn.Parameters) {
			return newError("wrong number of arguments: want=%d, got=%d",
				len(fn.Parameters), len(args))
		}
		extendedEnv := extendFunctionEnv(fn, args)
		evaluated := Eval(fn.Body, extendedEnv)
		return unwrapReturnValue(evaluated)
	case *object.Builtin:
		return fn.Fn(args...)
	case *object.Class:
		return evalClassCall(fn, args)
	default:
		return newError("not a function: %T", fn)
	}
}

func evalClassCall(class *object.Class, args []object.Object) object.Object {
	instance := &object.Instance{
		Class:      class,
		Attributes: make(map[string]object.Object),
	}

	if initMethod, ok := class.Methods["init"]; ok {
		methodEnv := extendFunctionEnv(initMethod, args)
		methodEnv.Set("self", instance, false)

		result := Eval(initMethod.Body, methodEnv)
		if isError(result) {
			return result
		}
	}

	return instance
}

func extendFunctionEnv(fn *object.Function, args []object.Object) *object.Env {
	env := fn.Env.NewEnclosedEnv()
	for paramIdx, param := range fn.Parameters {
		env.Set(param.Value, args[paramIdx], false)
	}
	return env
}

func unwrapReturnValue(obj object.Object) object.Object {
	if returnValue, ok := obj.(*object.Return); ok {
		return returnValue.Value
	}
	return obj
}

func evalIndexExpression(left, index object.Object) object.Object {
	switch {
	case left.Type() == object.ARRAY_OBJ && index.Type() == object.INTEGER_OBJ:
		return evalArrayIndexExpression(left, index)
	case left.Type() == object.ARRAY_OBJ && index.Type() == object.FLOAT_OBJ:
		return evalArrayFloatIndexExpression(left, index)
	case left.Type() == object.HASH_OBJ:
		return evalHashIndexExpression(left, index)
	case left.Type() == object.STRING_OBJ && index.Type() == object.INTEGER_OBJ:
		return evalStringIndexExpression(left, index)
	case left.Type() == object.STRING_OBJ && index.Type() == object.FLOAT_OBJ:
		return evalStringFloatIndexExpression(left, index)
	default:
		return newError("index operator not supported: %s", left.Type())
	}
}
func evalStringFloatIndexExpression(str, index object.Object) object.Object {
	strObj := str.(*object.String)
	idx := index.(*object.Float).Value
	if idx == 0.5 {
		return &object.String{Value: string(strObj.Value[len(strObj.Value)/2])}
	}
	return newError("index out of range: %f", idx)
}

func evalStringIndexExpression(str, index object.Object) object.Object {
	strObj := str.(*object.String)
	idx := index.(*object.Integer).Value
	max := int64(len(strObj.Value) - 1)
	if idx == -1 {
		return &object.String{Value: string(strObj.Value[len(strObj.Value)-1])}
	}
	if idx < 0 || idx > max {
		return newError("index out of range: %d", idx)
	}
	return &object.String{Value: string(strObj.Value[idx])}
}

func evalArrayFloatIndexExpression(array, index object.Object) object.Object {
	arrayObj := array.(*object.Array)
	idx := index.(*object.Float).Value
	if idx == 0.5 {
		return arrayObj.Elements[len(arrayObj.Elements)/2]
	}
	return newError("index out of range: %f", idx)
}

func evalArrayIndexExpression(array, index object.Object) object.Object {
	arrayObj := array.(*object.Array)
	idx := index.(*object.Integer).Value
	max := int64(len(arrayObj.Elements) - 1)
	if idx == -1 {
		return arrayObj.Elements[len(arrayObj.Elements)-1]
	}
	if idx < 0 || idx > max {
		return newError("index out of range: %d", idx)
	}
	return arrayObj.Elements[idx]
}

func evalHashIndexExpression(hash, index object.Object) object.Object {
	hashObj := hash.(*object.Hash)
	key, ok := index.(object.Hashable)
	if !ok {
		return newError("unusable as hash key: %s", index.Type())
	}
	pair, ok := hashObj.Pairs[key.HashKey()]
	if !ok {
		return newError("key not found: %s", index.Type())
	}
	return pair.Value
}

func evalHashLiteral(node *ast.HashLiteral, env *object.Env) object.Object {
	pairs := make(map[object.HashKey]object.HashPair)
	for keyNode, valueNode := range node.Pairs {
		var keyObj object.Object

		switch key := keyNode.(type) {
		case *ast.Identifier:
			keyObj = &object.String{Value: key.Value}
		default:
			keyObj = Eval(keyNode, env)
			if isError(keyObj) {
				return keyObj
			}
		}

		hashKey, ok := keyObj.(object.Hashable)
		if !ok {
			return newError("unusable as hash key: %s", keyObj.Type())
		}

		value := Eval(valueNode, env)
		if isError(value) {
			return value
		}

		pairs[hashKey.HashKey()] = object.HashPair{Key: keyObj, Value: value}
	}
	return &object.Hash{Pairs: pairs}
}

func applyMethod(obj object.Object, method string, args []object.Object) object.Object {
	switch obj := obj.(type) {
	case *object.String:
		return evalStringMethod(obj, method, args)
	case *object.Array:
		return evalArrayMethod(obj, method, args)
	case *object.Hash:
		return evalHashMethod(obj, method, args)
	case *object.Module:
		return evalModuleMethod(obj, method, args)
	case *object.Instance:
		if methodFn, ok := obj.Class.Methods[method]; ok {
			methodEnv := extendFunctionEnv(methodFn, args)
			methodEnv.Set("self", obj, false)

			evaluated := Eval(methodFn.Body, methodEnv)
			return unwrapReturnValue(evaluated)
		}
		return newError("undefined method: %s", method)
	default:
		return newError("method calls not supported on: %s", obj.Type())
	}
}

func evalModuleMethod(obj *object.Module, method string, args []object.Object) object.Object {
	val, ok := obj.Env.Get(method)
	if !ok {
		return newError("module has no method: %s", method)
	}

	fn, ok := val.(*object.Function)
	if !ok {
		return newError("%s is not callable", method)
	}

	return applyFunction(fn, args)
}

func evalHashMethod(obj *object.Hash, method string, args []object.Object) object.Object {
	key := &object.String{Value: method}
	pair, ok := obj.Pairs[key.HashKey()]
	if !ok {
		return newError("method %q not found in hash", method)
	}
	fnObj := pair.Value

	fn, ok := fnObj.(*object.Function)
	if !ok {
		return newError("value at key %q is not a function", method)
	}

	return applyFunction(fn, args)
}

func evalStringMethod(obj *object.String, method string, args []object.Object) object.Object {
	switch method {
	case "append":
		if len(args) != 1 {
			return newError("wrong number of arguments. got=%d, want=1", len(args))
		}
		if args[0].Type() != object.STRING_OBJ {
			return newError("argument to string.append must be STRING, got %T", args[0])
		}
		return &object.String{Value: obj.Value + args[0].(*object.String).Value}
	case "len":
		return &object.Integer{Value: int64(len(obj.Value))}
	case "upper":
		return &object.String{Value: strings.ToUpper(obj.Value)}
	case "lower":
		return &object.String{Value: strings.ToLower(obj.Value)}
	case "split":
		if len(args) != 1 {
			return newError("wrong number of arguments. got=%d, want=1", len(args))
		}
		if args[0].Type() != object.STRING_OBJ {
			return newError("argument to string.split must be STRING, got %T", args[0])
		}
		delimiter := args[0].(*object.String).Value
		parts := strings.Split(obj.Value, delimiter)
		elements := make([]object.Object, len(parts))
		for i, part := range parts {
			elements[i] = &object.String{Value: part}
		}
		return &object.Array{Elements: elements}
	case "contains":
		if len(args) != 1 {
			return newError("wrong number of arguments. got=%d, want=1", len(args))
		}
		if args[0].Type() != object.STRING_OBJ {
			return newError("argument to string.contains must be STRING, got %T", args[0])
		}
		substr := args[0].(*object.String).Value
		return nativeBoolToBooleanObject(strings.Contains(obj.Value, substr))
	case "substr":
		if len(args) != 2 {
			return newError("wrong number of arguments. got=%d, want=2", len(args))
		}
		start, ok := args[0].(*object.Integer)
		if !ok {
			return newError("first argument must be INTEGER, got %T", args[0])
		}
		length, ok := args[1].(*object.Integer)
		if !ok {
			return newError("second argument must be INTEGER, got %T", args[1])
		}
		if start.Value < 0 || start.Value >= int64(len(obj.Value)) {
			return newError("start index out of bounds")
		}
		end := min(start.Value+length.Value, int64(len(obj.Value)))
		return &object.String{Value: obj.Value[start.Value:end]}
	case "trim":
		if len(args) != 0 {
			return newError("string.trim does not take any arguments, got=%d", len(args))
		}
		return &object.String{Value: strings.TrimSpace(obj.Value)}
	default:
		return newError("unknown method: %s", method)
	}
}

func evalArrayMethod(obj *object.Array, method string, args []object.Object) object.Object {
	switch method {
	case "push":
		if len(args) != 1 {
			return newError("wrong number of arguments. got=%d, want=1", len(args))
		}
		newElements := make([]object.Object, len(obj.Elements)+1)
		copy(newElements, obj.Elements)
		newElements[len(obj.Elements)] = args[0]
		return &object.Array{Elements: newElements}
	case "pop":
		if len(args) != 0 {
			return newError("wrong number of arguments. got=%d, want=0", len(args))
		}
		if len(obj.Elements) == 0 {
			return newError("cannot pop from empty array")
		}
		newElements := make([]object.Object, len(obj.Elements)-1)
		copy(newElements, obj.Elements[:len(obj.Elements)-1])
		return &object.Array{Elements: newElements}
	case "len":
		return &object.Integer{Value: int64(len(obj.Elements))}
	case "rest":
		if len(obj.Elements) == 0 {
			return &object.Array{Elements: []object.Object{}}
		}
		newElements := make([]object.Object, len(obj.Elements)-1)
		copy(newElements, obj.Elements[1:])
		return &object.Array{Elements: newElements}
	case "join":
		if len(args) != 1 {
			return newError("wrong number of arguments. got=%d, want=1", len(args))
		}
		if args[0].Type() != object.STRING_OBJ {
			return newError("argument to array.join must be STRING, got %T", args[0])
		}
		delimiter := args[0].(*object.String).Value
		var parts []string
		for _, elem := range obj.Elements {
			parts = append(parts, elem.Inspect())
		}
		return &object.String{Value: strings.Join(parts, delimiter)}
	case "filter":
		if len(args) != 1 {
			return newError("wrong number of arguments. got=%d, want=1", len(args))
		}
		if args[0].Type() != object.FUNCTION_OBJ {
			return newError("argument to array.filter must be FUNCTION, got %s", args[0].Type())
		}

		fn := args[0].(*object.Function)
		var filtered []object.Object

		for _, elem := range obj.Elements {
			result := applyFunction(fn, []object.Object{elem})

			if isError(result) {
				return result
			}

			if isTruthy(result) {
				filtered = append(filtered, elem)
			}
		}

		return &object.Array{Elements: filtered}
	default:
		return newError("unknown method: %s", method)
	}
}

func evalPropertyAccess(obj object.Object, property string) object.Object {
	switch obj := obj.(type) {
	case *object.String:
		return &object.String{Value: obj.Value + property}
	case *object.Array:
		return evalArrayPropertyAccess(obj, property)
	case *object.Hash:
		return evalHashPropertyAccess(obj, property)
	case *object.Module:
		return evalModulePropertyAccess(obj, property)
	case *object.Instance:
		if attr, ok := obj.Attributes[property]; ok {
			return attr
		}
		if method, ok := obj.Class.Methods[property]; ok {
			return method
		}
		return newError("undefined property: %s", property)
	default:
		return newError("property access not supported on: %s", obj.Type())
	}
}

func evalModulePropertyAccess(obj *object.Module, property string) object.Object {
	if obj.Members == nil {
		return newError("module has no members")
	}
	member, ok := obj.Members[property]
	if !ok {
		return newError("module does not have member: %s", property)
	}
	return member
}

func evalArrayPropertyAccess(obj *object.Array, property string) object.Object {
	idx, err := strconv.ParseInt(property, 10, 64)
	if err != nil {
		return newError("property access not supported on: %s", obj.Type())
	}
	max := int64(len(obj.Elements) - 1)
	if idx < 0 || idx > max {
		return newError("index out of range: %d", idx)
	}
	return obj.Elements[idx]
}

func evalHashPropertyAccess(obj *object.Hash, property string) object.Object {
	key := &object.String{Value: property}
	pair, ok := obj.Pairs[key.HashKey()]
	if !ok {
		return NULL
	}
	return pair.Value
}

func evalForRange(node *ast.ForRange, env *object.Env) object.Object {
	collection := Eval(node.Collection, env)
	if isError(collection) {
		return collection
	}

	loopEnv := env.NewEnclosedEnv()

	switch coll := collection.(type) {
	case *object.Array:
		return evalForRangeArray(node, coll, loopEnv)
	case *object.Hash:
		return evalForRangeHash(node, coll, loopEnv)
	case *object.String:
		return evalForRangeString(node, coll, loopEnv)
	default:
		return newError("for-range not supported on: %s", collection.Type())
	}
}

func evalForRangeArray(node *ast.ForRange, array *object.Array, env *object.Env) object.Object {
	var result object.Object = NULL

	for i, element := range array.Elements {
		env.Set(node.Variable.Value, element, false)

		if node.Index != nil {
			env.Set(node.Index.Value, &object.Integer{Value: int64(i)}, false)
		}

		if node.Body != nil {
			result = Eval(node.Body, env)
			if result != nil {
				switch result.Type() {
				case object.RETURN_OBJ, object.ERROR_OBJ:
					return result
				case object.BREAK_OBJ:
					return NULL
				case object.CONTINUE_OBJ:
					continue
				}
			}
		}
	}

	return result
}

func evalForRangeHash(node *ast.ForRange, hash *object.Hash, env *object.Env) object.Object {
	var result object.Object = NULL

	for _, pair := range hash.Pairs {
		env.Set(node.Variable.Value, pair.Value, false)

		if node.Index != nil {
			env.Set(node.Index.Value, pair.Key, false)
		}

		if node.Body != nil {
			result = Eval(node.Body, env)
			if result != nil {
				switch result.Type() {
				case object.RETURN_OBJ, object.ERROR_OBJ:
					return result
				case object.BREAK_OBJ:
					return NULL
				case object.CONTINUE_OBJ:
					continue
				}
			}
		}
	}

	return result
}

func evalForRangeString(node *ast.ForRange, str *object.String, env *object.Env) object.Object {
	var result object.Object = NULL

	for i, char := range str.Value {
		env.Set(node.Variable.Value, &object.String{Value: string(char)}, false)

		if node.Index != nil {
			env.Set(node.Index.Value, &object.Integer{Value: int64(i)}, false)
		}

		if node.Body != nil {
			result = Eval(node.Body, env)
			if result != nil {
				switch result.Type() {
				case object.RETURN_OBJ, object.ERROR_OBJ:
					return result
				case object.BREAK_OBJ:
					return NULL
				case object.CONTINUE_OBJ:
					continue
				}
			}
		}
	}

	return result
}

func evalWhile(node *ast.While, env *object.Env) object.Object {
	var result object.Object = NULL

	for {
		condition := Eval(node.Condition, env)
		if isError(condition) {
			return condition
		}
		if !isTruthy(condition) {
			break
		}
		if node.Body != nil {
			result = Eval(node.Body, env)
			if result != nil {
				switch result.Type() {
				case object.RETURN_OBJ, object.ERROR_OBJ:
					return result
				case object.BREAK_OBJ:
					return NULL
				case object.CONTINUE_OBJ:
					continue
				}
			}
		}
	}

	return result
}

func evalModuleLoad(node *ast.ModuleLoad, env *object.Env) object.Object {
	name := node.Name.String()

	if mod, ok := moduleCache[name]; ok {
		return setModuleInEnv(mod, name, node.Members, env)
	}

	modEnv := env.NewEnclosedEnv()
	if err := loadModule(name, modEnv); err != nil {
		return newError("%s", err.Error())
	}

	modObj := &object.Module{Name: name, Env: modEnv}
	moduleCache[name] = modObj

	return setModuleInEnv(modObj, name, node.Members, env)
}

func setModuleInEnv(mod object.Object, name string, members []*ast.Identifier, env *object.Env) object.Object {
	if members == nil {
		env.Set(name, mod, true)
		return mod
	}

	module, ok := mod.(*object.Module)
	if !ok {
		return newError("expected module object, got %T", mod)
	}

	for _, member := range members {
		val, ok := module.Env.Get(member.Value)
		if !ok {
			return newError("module %s does not have member: %s", name, member.Value)
		}
		env.Set(member.Value, val, true)
	}

	return mod
}

func loadModule(name string, env *object.Env) error {
	source, err := loadModuleSource(name, env)
	if err != nil {
		return err
	}

	lexer := lexer.New(string(source))
	parser := parser.New(lexer)
	program := parser.ParseProgram()

	if len(parser.Errors()) != 0 {
		return fmt.Errorf("parse errors in %s: %v", name, parser.Errors())
	}

	Eval(program, env)
	return nil
}

func loadModuleSource(name string, env *object.Env) ([]byte, error) {
	possiblePaths := []string{
		filepath.Join("/usr/local/lib/lynx/std", name+".lynx"),
		filepath.Join(env.Dir, name+".lynx"),
		filepath.Join("./modules", name+".lynx"),
		filepath.Join(os.Getenv("HOME"), "modules", name+".lynx"),
	}

	var existingPaths []string
	var triedPaths []string
	var lastErr error
	for _, path := range possiblePaths {
		_, err := os.ReadFile(path)
		if err == nil {
			existingPaths = append(existingPaths, path)
		} else {
			triedPaths = append(triedPaths, path)
			lastErr = err
		}
	}

	if len(existingPaths) > 1 {
		return nil, fmt.Errorf("module %q conflicts: found in multiple paths: %v", name, existingPaths)
	}
	if len(existingPaths) == 1 {
		data, err := os.ReadFile(existingPaths[0])
		if err != nil {
			return nil, err
		}
		return data, nil
	}

	return nil, fmt.Errorf("could not find module %q in the following paths: %v (last error: %v)", name, triedPaths, lastErr)
}

func evalSwitchStatement(node *ast.SwitchStatement, env *object.Env) object.Object {
	val := Eval(node.Expression, env)
	if isError(val) {
		return val
	}
	for _, caseStmt := range node.Cases {
		if caseStmt.Value == nil {
			return Eval(caseStmt.Body, env)
		}
		if ident, ok := caseStmt.Value.(*ast.Identifier); ok {
			caseEnv := env.NewEnclosedEnv()
			caseEnv.Set(ident.Value, val, false)
			if caseStmt.Guard != nil {
				guardResult := Eval(caseStmt.Guard, caseEnv)
				if isError(guardResult) {
					return guardResult
				}
				if !isTruthy(guardResult) {
					continue
				}
			}
			return Eval(caseStmt.Body, caseEnv)
		}
		caseValue := Eval(caseStmt.Value, env)
		if isError(caseValue) {
			return caseValue
		}
		if objectsEqual(val, caseValue) {
			if caseStmt.Guard != nil {
				guardResult := Eval(caseStmt.Guard, env)
				if isError(guardResult) {
					return guardResult
				}
				if !isTruthy(guardResult) {
					continue
				}
			}
			return Eval(caseStmt.Body, env)
		}
	}
	return NULL
}

func objectsEqual(a, b object.Object) bool {
	if a.Type() != b.Type() {
		return false
	}
	switch a := a.(type) {
	case *object.Integer:
		return a.Value == b.(*object.Integer).Value
	case *object.String:
		return a.Value == b.(*object.String).Value
	case *object.Boolean:
		return a.Value == b.(*object.Boolean).Value
	case *object.Float:
		return a.Value == b.(*object.Float).Value
	case *object.Array:
		bArray := b.(*object.Array)
		if len(a.Elements) != len(bArray.Elements) {
			return false
		}
		for i, elem := range a.Elements {
			if !objectsEqual(elem, bArray.Elements[i]) {
				return false
			}
		}
		return true
	case *object.Hash:
		bHash := b.(*object.Hash)
		if len(a.Pairs) != len(bHash.Pairs) {
			return false
		}
		for key, valA := range a.Pairs {
			valB, ok := bHash.Pairs[key]
			if !ok {
				return false
			}
			if !objectsEqual(valA.Value, valB.Value) {
				return false
			}
		}
		return true
	default:
		return a == b
	}
}

func evalPipeExpression(pe *ast.PipeExpression, env *object.Env) object.Object {
	left := Eval(pe.Left, env)
	return evalPipeRight(pe.Right, left, env)
}

func evalPipeRight(right ast.Node, left object.Object, env *object.Env) object.Object {
	switch rightExpr := right.(type) {
	case *ast.CallExpression:
		fn := Eval(rightExpr.Function, env)
		args := []object.Object{left}
		for _, arg := range rightExpr.Arguments {
			args = append(args, Eval(arg, env))
		}
		return applyFunction(fn, args)
	case *ast.Identifier:
		fn := Eval(rightExpr, env)
		return applyFunction(fn, []object.Object{left})
	case *ast.PipeExpression:
		intermediate := evalPipeRight(rightExpr.Left, left, env)
		return evalPipeRight(rightExpr.Right, intermediate, env)
	default:
		return newError("invalid pipe target: %s", right.String())
	}
}

func evalErrorStatement(node *ast.ErrorStatement, env *object.Env) object.Object {
	val := Eval(node.Value, env)
	if isError(val) {
		return val
	}
	return &object.Error{Message: val.Inspect()}
}

func evalCatchStatement(catchStmt *ast.CatchStatement, env *object.Env) object.Object {
	result := Eval(catchStmt.Body, env)

	if errObj, ok := result.(*object.Error); ok && catchStmt.ErrorVar != nil {
		catchEnv := env.NewEnclosedEnv()
		catchEnv.Set(catchStmt.ErrorVar.Value, errObj, false)
		return Eval(catchStmt.OnBody, catchEnv)
	}

	return result
}

func evalClassStatement(node *ast.Class, env *object.Env) object.Object {
	class := &object.Class{
		Name: node.Name.Value,
		Methods: make(map[string]*object.Function),
		Env: env,
	}

	if node.SuperClass != nil {
		superClassObj, ok := env.Get(node.SuperClass.Value)
		if !ok {
			return newError("Undefined class: %s", node.SuperClass.Value)
		}
		superClass, ok := superClassObj.(*object.Class)
		if !ok {
			return newError("%s is not a class", node.SuperClass.Value)
		}
		class.SuperClass = superClass

		maps.Copy(class.Methods, superClass.Methods)
	}

	if node.Body != nil {
		for _, stmt := range node.Body.Statements {
			if letStmt, ok := stmt.(*ast.VarStatement); ok {
				if fnLit, ok := letStmt.Value.(*ast.FunctionLiteral); ok {
					method := &object.Function{
						Parameters: fnLit.Parameters,
						Body:       fnLit.Body,
						Env:        env,
					}
					class.Methods[letStmt.Name.Value] = method
				}
			}
		}
	}

	env.Set(node.Name.Value, class, false)

	return class
}

func evalSelf(env *object.Env) object.Object {
	self, ok := env.Get("self")
	if !ok {
		return newError("'self' can only be used inside a class method")
	}
	return self
}
