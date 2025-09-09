package evaluator

import (
	"fmt"
	"lynx/pkg/ast"
	"lynx/pkg/lexer"
	"lynx/pkg/object"
	"lynx/pkg/parser"
	"math"
	"os"
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
	case *ast.Tuple:
		return evalTuple(node, env)
	case *ast.ErrorStatement:
		return evalErrorStatement(node, env)
	case *ast.CatchStatement:
		return evalCatchStatement(node, env)
	case *ast.Null:
		return &object.Null{}
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
		return value
	default:
		return newError("cannot assign to: %s", left.Type())
	}
}

func evalPropertyAssignment(obj object.Object, prop string, val object.Object) object.Object {
	hash, ok := obj.(*object.Hash)
	if !ok {
		return newError("property assignment only supported on objects, got %T", obj)
	}

	key := &object.String{Value: prop}
	hash.Pairs[key.HashKey()] = object.HashPair{Key: key, Value: val}
	return val
}

func nativeBoolToBooleanObject(input bool) *object.Boolean {
	if input {
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
		return newError("unknown operator: -%s", right.Type())
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

func evalInfixExpression(operator string, left, right object.Object) object.Object {
	switch {
	case operator == "++":
		return evalConcatExpression(left, right)
	case left.Type() == object.INTEGER_OBJ && right.Type() == object.INTEGER_OBJ:
		return evalIntegerInfixExpression(operator, left, right)
	case left.Type() == object.STRING_OBJ && right.Type() == object.STRING_OBJ:
		return evalStringInfixExpression(operator, left, right)
	case operator == "==":
		return nativeBoolToBooleanObject(left == right)
	case operator == "and":
		return nativeBoolToBooleanObject(left.Type() == object.BOOLEAN_OBJ && left.(*object.Boolean).Value)
	case operator == "or":
		return nativeBoolToBooleanObject(left.Type() == object.BOOLEAN_OBJ || left.(*object.Boolean).Value)
	case operator == "!=":
		return nativeBoolToBooleanObject(left != right)
	case left.Type() != right.Type():
		return newError("type mismatch: %s %s %s", left.Type(), operator, right.Type())
	default:
		return newError("unknown operator: %s %s %s", left.Type(), operator, right.Type())
	}
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

func evalIntegerInfixExpression(operator string, left, right object.Object) object.Object {
	leftVal := left.(*object.Integer).Value
	rightVal := right.(*object.Integer).Value

	switch operator {
	case "+":
		return &object.Integer{Value: leftVal + rightVal}
	case "-":
		return &object.Integer{Value: leftVal - rightVal}
	case "*":
		return &object.Integer{Value: leftVal * rightVal}
	case "%":
		return &object.Integer{Value: leftVal % rightVal}
	case "^":
		return &object.Integer{Value: int64(math.Pow(float64(leftVal), float64(rightVal)))}
	case "$":
		return &object.Integer{Value: int64(math.Sqrt(float64(rightVal)))}
	case "/":
		if rightVal == 0 {
			return newError("division by zero")
		}
		return &object.Integer{Value: leftVal / rightVal}
	case "<":
		return nativeBoolToBooleanObject(leftVal < rightVal)
	case ">":
		return nativeBoolToBooleanObject(leftVal > rightVal)
	case ">=":
		return nativeBoolToBooleanObject(leftVal >= rightVal)
	case "<=":
		return nativeBoolToBooleanObject(leftVal <= rightVal)
	case "==":
		return nativeBoolToBooleanObject(leftVal == rightVal)
	case "!=":
		return nativeBoolToBooleanObject(leftVal != rightVal)
	default:
		return newError("unknown operator: %s %s %s", left.Type(), operator, right.Type())
	}
}

func evalStringInfixExpression(operator string, left, right object.Object) object.Object {
	leftVal := left.(*object.String).Value
	rightVal := right.(*object.String).Value

	switch operator {
	case "==":
		return nativeBoolToBooleanObject(leftVal == rightVal)
	case "!=":
		return nativeBoolToBooleanObject(leftVal != rightVal)
	case "<":
		return nativeBoolToBooleanObject(leftVal < rightVal)
	case ">":
		return nativeBoolToBooleanObject(leftVal > rightVal)
	case ">=":
		return nativeBoolToBooleanObject(leftVal >= rightVal)
	case "<=":
		return nativeBoolToBooleanObject(leftVal <= rightVal)
	default:
		return newError("unknown operator: %s %s %s", left.Type(), operator, right.Type())
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
	default:
		return newError("not a function: %T", fn)
	}
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
	case left.Type() == object.HASH_OBJ:
		return evalHashIndexExpression(left, index)
	case left.Type() == object.STRING_OBJ && index.Type() == object.INTEGER_OBJ:
		return evalStringIndexExpression(left, index)
	default:
		return newError("index operator not supported: %s", left.Type())
	}
}

func evalStringIndexExpression(str, index object.Object) object.Object {
	strObj := str.(*object.String)
	idx := index.(*object.Integer).Value
	max := int64(len(strObj.Value) - 1)
	if idx < 0 || idx > max {
		return newError("index out of range: %d", idx)
	}
	return &object.String{Value: string(strObj.Value[idx])}
}

func evalArrayIndexExpression(array, index object.Object) object.Object {
	arrayObj := array.(*object.Array)
	idx := index.(*object.Integer).Value
	max := int64(len(arrayObj.Elements) - 1)
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
	case "first":
		if len(obj.Elements) == 0 {
			return NULL
		}
		return obj.Elements[0]
	case "last":
		if len(obj.Elements) == 0 {
			return NULL
		}
		return obj.Elements[len(obj.Elements)-1]
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
	modEnv := env.NewEnclosedEnv()

	if mod, ok := moduleCache[name]; ok {
		if node.Members == nil {
			env.Set(name, mod, true)
		} else {
			for _, member := range node.Members {
				val, ok := modEnv.Get(member.Value)
				if !ok {
					return newError("module %s does not have member: %s", name, member.Value)
				}
				env.Set(member.Value, val, true)
			}
		}
		return mod
	}

	if err := loadModule(name, modEnv); err != nil {
		return newError("%s", err.Error())
	}

	modObj := &object.Module{Name: name, Env: modEnv}
	moduleCache[name] = modObj

	if node.Members == nil {
		env.Set(name, modObj, true)
	} else {
		for _, member := range node.Members {
			val, ok := modObj.Env.Get(member.Value)
			if !ok {
				return newError("module %s does not have member: %s", name, member.Value)
			}
			env.Set(member.Value, val, true)
		}
	}

	return modObj
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
		fmt.Sprintf("./std/%s.lynx", name),
		fmt.Sprintf("/usr/local/lib/lynx/std/%s.lynx", name),
		fmt.Sprintf("%s/%s.lynx", env.Dir, name),
	}

	var lastErr error
	for _, path := range possiblePaths {
		source, err := os.ReadFile(path)
		if err == nil {
			return source, nil
		}
		lastErr = err
	}

	return nil, fmt.Errorf("could not find module %s: %v", name, lastErr)
}

func evalSwitchInteger(node *ast.SwitchStatement, switchVal *object.Integer, env *object.Env) object.Object {
	var defaultCase *ast.Case

	for _, caseNode := range node.Cases {
		if caseNode.Value == nil {
			defaultCase = caseNode
			continue
		}

		caseVal := Eval(caseNode.Value, env)
		if isError(caseVal) {
			return caseVal
		}

		if intVal, ok := caseVal.(*object.Integer); ok {
			if intVal.Value == switchVal.Value {
				return Eval(caseNode.Body, env)
			}
		}
	}

	if defaultCase != nil {
		return Eval(defaultCase.Body, env)
	}

	return NULL
}

func evalSwitchString(node *ast.SwitchStatement, switchVal *object.String, env *object.Env) object.Object {
	var defaultCase *ast.Case

	for _, caseNode := range node.Cases {
		if caseNode.Value == nil {
			defaultCase = caseNode
			continue
		}

		caseVal := Eval(caseNode.Value, env)
		if isError(caseVal) {
			return caseVal
		}

		if strVal, ok := caseVal.(*object.String); ok {
			if strVal.Value == switchVal.Value {
				return Eval(caseNode.Body, env)
			}
		}
	}

	if defaultCase != nil {
		return Eval(defaultCase.Body, env)
	}

	return NULL
}

func evalSwitchStatement(node *ast.SwitchStatement, env *object.Env) object.Object {
	val := Eval(node.Expression, env)
	if isError(val) {
		return val
	}
	switch val := val.(type) {
	case *object.Integer:
		return evalSwitchInteger(node, val, env)
	case *object.String:
		return evalSwitchString(node, val, env)
	case *object.Boolean:
		if val.Value {
			return Eval(node.Cases[0].Body, env)
		}
		if len(node.Cases) > 1 {
			return Eval(node.Cases[1].Body, env)
		}
		return NULL
	default:
		return newError("switch statement not supported on: %s", val.Type())
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

func evalTuple(node *ast.Tuple, env *object.Env) object.Object {
	elements := make([]object.Object, len(node.Elements))
	for i, elem := range node.Elements {
		elements[i] = Eval(elem, env)
		if isError(elements[i]) {
			return elements[i]
		}
	}
	tuple := &object.Tuple{Elements: elements}
	return tuple
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
