package evaluator

import (
	"fmt"
	"lynx/src/ast"
	"lynx/src/object"
	"strconv"
)

var (
	NULL  = &object.Null{}
	TRUE  = &object.Boolean{Value: true}
	FALSE = &object.Boolean{Value: false}
)

func Eval(node ast.Node, env *object.Env) object.Object {
	switch node := node.(type) {
	case *ast.Program:
		return evalProgram(node.Statements, env)
	case *ast.ExpressionStatement:
		return Eval(node.Expression, env)
	case *ast.IntegerLiteral:
		return &object.Integer{Value: node.Value}
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
		if len(args) == 1 && isError(args[0]) {
			return args[0]
		}
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

		obj := env.Assign(node.Name.Value, val)

		if isError(obj) {
			return obj
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
	default:
		return newError("unknown node type: %T", node)
	}

	return nil
}

func nativeBoolToBooleanObject(input bool) *object.Boolean {
	if input {
		return TRUE
	}
	return FALSE
}

func evalProgram(stmts []ast.Statement, env *object.Env) object.Object {
	var result object.Object
	for _, stmt := range stmts {
		result = Eval(stmt, env)

		switch result := result.(type) {
		case *object.Return:
			return result.Value
		case *object.Error:
			return result
		}
	}
	return result
}

func evalPrefixExpression(operator string, right object.Object) object.Object {
	switch operator {
	case "!":
		return evalBangOperatorExpression(right)
	case "-":
		return evalMinusPrefixOperatorExpression(right)
	default:
		return newError("unknown operator: %s%s", operator, right.Type())
	}
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
	case left.Type() == object.INTEGER_OBJ && right.Type() == object.INTEGER_OBJ:
		return evalIntegerInfixExpression(operator, left, right)
	case left.Type() == object.STRING_OBJ && right.Type() == object.STRING_OBJ:
		return evalStringInfixExpression(operator, left, right)
	case operator == "==":
		return nativeBoolToBooleanObject(left == right)
	case operator == "!=":
		return nativeBoolToBooleanObject(left != right)
	case left.Type() != right.Type():
		return newError("type mismatch: %s %s %s", left.Type(), operator, right.Type())
	default:
		return newError("unknown operator: %s %s %s", left.Type(), operator, right.Type())
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
	case "+":
		return &object.String{Value: leftVal + rightVal}
	case "==":
		return nativeBoolToBooleanObject(leftVal == rightVal)
	case "!=":
		return nativeBoolToBooleanObject(leftVal != rightVal)
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
	default:
		return newError("method calls not supported on: %s", obj.Type())
	}
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
	case "length":
		return &object.Integer{Value: int64(len(obj.Value))}
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
		if len(args) > 1 {
			return newError("wrong number of arguments. got=%d, want=0", len(args))
		}
		newElements := make([]object.Object, len(obj.Elements)-1)
		copy(newElements, obj.Elements)
		return &object.Array{Elements: newElements}
	case "length":
		return &object.Integer{Value: int64(len(obj.Elements))}
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
	default:
		return newError("property access not supported on: %s", obj.Type())
	}
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
