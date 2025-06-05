package runtime

import (
	"fmt"
	"strings"

	. "lynx/pkg/frontend/ast"
)

type InterpreterError struct {
	Type    string
	Message string
	Line    int
	Column  int
	Return  Node
	Context string
}

func (e *InterpreterError) Error() string {
	if e.Line > 0 && e.Column > 0 {
		return fmt.Sprintf("[%s] Line %d:%d - %s", e.Type, e.Line, e.Column, e.Message)
	}
	if e.Context != "" {
		return fmt.Sprintf("[%s] %s (in %s)", e.Type, e.Message, e.Context)
	}
	return fmt.Sprintf("[%s] %s", e.Type, e.Message)
}

func NewRuntimeError(message string) *InterpreterError {
	return &InterpreterError{
		Type:    "RuntimeError",
		Message: message,
	}
}

func NewRuntimeErrorWithContext(message, context string) *InterpreterError {
	return &InterpreterError{
		Type:    "RuntimeError",
		Message: message,
		Context: context,
	}
}

func NewAccessError(message string) *InterpreterError {
	return &InterpreterError{
		Type:    "AccessError",
		Message: message,
	}
}

type Interpreter struct{}

func NewInterpreter() *Interpreter {
	return &Interpreter{}
}

func (i *Interpreter) Evaluate(program Node, env *Environment) (Node, error) {
	result, err := i.evalNode(program, env)
	if err != nil {
		if interpreterErr, ok := err.(*InterpreterError); ok {
			if interpreterErr.Type == "Return" {
				return interpreterErr.Return, nil
			}
			return nil, fmt.Errorf("%s", interpreterErr.Message)
		}
		return nil, err
	}
	return result, nil
}

func (i *Interpreter) evalNode(node Node, env *Environment) (Node, error) {
	if node == nil {
		return &NullNode{}, nil
	}

	switch n := node.(type) {
	case *NumberNode:
		return n, nil
	case *StringNode:
		return n, nil
	case *BooleanNode:
		return n, nil
	case *NullNode:
		return n, nil

	case *IdentifierNode:
		value := env.Lookup(n.Name)
		if value == nil {
			return nil, NewRuntimeError(fmt.Sprintf("Undefined variable: %s", n.Name))
		}
		return value, nil

	case *BinaryExpression:
		return i.evalBinaryExpr(n.Left, n.Op, n.Right, env)

	case *ConcatExpression:
		return i.evalConcatExpr(n.Left, n.Op, n.Right, env)

	case *CallExpression:
		return i.evalFunctionCall(n.Callee, n.Args, env)

	case *ObjectNode:
		return i.evalObjectLiteral(n.Properties, env)

	case *PropertyAccessNode:
		return i.evalPropertyAccess(n.Object, n.Key, env)

	case *ObjectAssignmentNode:
		return i.evalObjectAssignment(n.Object, n.Key, n.Value, env)

	case *ProgramNode:
		return i.evalProgram(n.Statements, env)

	case *BlockNode:
		return i.evalBlock(n.Statements, env)

	case *VarDeclNode:
		return i.evalVarDeclaration(n.Name, n.Value, n.Mutable, env)

	case *AssignmentNode:
		return i.evalAssignment(n.Name, n.Value, env)

	case *FunctionNode:
		return i.evalFunctionDeclaration(n.Name, n.Params, n.Body,
			n.IsMethod, n.IsStatic, n.IsPublic, env)

	case *ReturnNode:
		return i.evalReturnStatement(n.Value, env)

	case *ExpressionStatement:
		return i.evalNode(n.Expression, env)

	case *IfNode:
		return i.evalIfStatement(n.Condition, n.ThenBranch, n.ElseBranch, env)

	case *WhileNode:
		return i.evalWhileLoop(n.Condition, n.Body, env)

	case *ForEachNode:
		return i.evalForEachLoop(n.Item, n.Array, n.Index, n.Body, env)

	case *BreakNode, *ContinueNode:
		return nil, NewRuntimeError(fmt.Sprintf("Unimplemented node type: %T", node))

	case *CommentNode:
		return &NullNode{}, nil

	case *ArrayNode:
		return i.evalArrayLiteral(n.Elements, env)

	case *ArrayAccessNode:
		return i.evalArrayAccess(n.Array, n.Index, env)

	case *ArrayAssignmentNode:
		return i.evalArrayAssignment(n.Array, n.Index, n.Value, env)

	case *ClassNode:
		return i.evalClass(n, env)

	case *MatchNode:
		return i.evalMatch(n.Condition, n.Body, env)

	case *RangeExpression:
		return i.evalRangeExpression(n.Start, n.End, env)

	default:
		return nil, NewRuntimeError(fmt.Sprintf("Unimplemented node type: %T", node))
	}
}

func (i *Interpreter) evalProgram(statements []Node, env *Environment) (Node, error) {
	var lastVal Node = &NullNode{}
	for _, stmt := range statements {
		val, err := i.evalNode(stmt, env)
		if err != nil {
			return nil, err
		}
		lastVal = val
	}
	return lastVal, nil
}

func (i *Interpreter) evalBlock(statements []Node, env *Environment) (Node, error) {
	var lastVal Node = &NullNode{}
	for _, stmt := range statements {
		val, err := i.evalNode(stmt, env)
		if err != nil {
			return nil, err
		}
		lastVal = val
	}
	return lastVal, nil
}

func (i *Interpreter) evalBinaryExpr(left Node, op BinaryOp, right Node, env *Environment) (Node, error) {
	leftVal, err := i.evalNode(left, env)
	if err != nil {
		return nil, err
	}
	rightVal, err := i.evalNode(right, env)
	if err != nil {
		return nil, err
	}

	if leftNum, ok := leftVal.(*NumberNode); ok {
		if rightNum, ok := rightVal.(*NumberNode); ok {
			l := leftNum.Value
			r := rightNum.Value

			switch op {
			case OpAdd:
				return &NumberNode{Value: l + r}, nil
			case OpSub:
				return &NumberNode{Value: l - r}, nil
			case OpMul:
				return &NumberNode{Value: l * r}, nil
			case OpDiv:
				if r == 0.0 {
					return nil, NewRuntimeError("Division by zero")
				}
				return &NumberNode{Value: l / r}, nil
			case OpMod:
				if r == 0.0 {
					return nil, NewRuntimeError("Modulo by zero")
				}
				return &NumberNode{Value: float64(int(l) % int(r))}, nil
			case OpEqual:
				return &BooleanNode{Value: l == r}, nil
			case OpNotEqual:
				return &BooleanNode{Value: l != r}, nil
			case OpGreaterThan:
				return &BooleanNode{Value: l > r}, nil
			case OpGreaterThanOrEqual:
				return &BooleanNode{Value: l >= r}, nil
			case OpLessThan:
				return &BooleanNode{Value: l < r}, nil
			case OpLessThanOrEqual:
				return &BooleanNode{Value: l <= r}, nil
			default:
				return nil, NewRuntimeError(fmt.Sprintf("Invalid operation for numbers: %v", op))
			}
		}
	}

	if leftStr, ok := leftVal.(*StringNode); ok {
		if rightStr, ok := rightVal.(*StringNode); ok {
			l := leftStr.Value
			r := rightStr.Value

			switch op {
			case OpAdd:
				return &StringNode{Value: l + r}, nil
			case OpEqual:
				return &BooleanNode{Value: l == r}, nil
			case OpNotEqual:
				return &BooleanNode{Value: l != r}, nil
			default:
				return nil, NewRuntimeError(fmt.Sprintf("Invalid operation for strings: %v", op))
			}
		}
	}

	if leftBool, ok := leftVal.(*BooleanNode); ok {
		if rightBool, ok := rightVal.(*BooleanNode); ok {
			l := leftBool.Value
			r := rightBool.Value

			switch op {
			case OpEqual:
				return &BooleanNode{Value: l == r}, nil
			case OpNotEqual:
				return &BooleanNode{Value: l != r}, nil
			case OpAnd:
				return &BooleanNode{Value: l && r}, nil
			case OpOr:
				return &BooleanNode{Value: l || r}, nil
			default:
				return nil, NewRuntimeError(fmt.Sprintf("Invalid operation for booleans: %v", op))
			}
		}
	}

	switch op {
	case OpEqual:
		return &BooleanNode{Value: false}, nil
	case OpNotEqual:
		return &BooleanNode{Value: true}, nil
	default:
		return nil, NewRuntimeError(fmt.Sprintf("Type error: Cannot apply operation to %s and %s",
			leftVal.TypeName(), rightVal.TypeName()))
	}
}

func (i *Interpreter) evalConcatExpr(left Node, op ConcatOp, right Node, env *Environment) (Node, error) {
	leftVal, err := i.evalNode(left, env)
	if err != nil {
		return nil, err
	}
	rightVal, err := i.evalNode(right, env)
	if err != nil {
		return nil, err
	}

	switch op {
	case ConcatOpAdd:
		result := ToStringValue(leftVal) + ToStringValue(rightVal)
		return &StringNode{Value: result}, nil
	default:
		return nil, NewRuntimeError("Invalid concat operation")
	}
}

func (i *Interpreter) evalVarDeclaration(name string, value Node, mutable bool, env *Environment) (Node, error) {
	var val Node
	if value != nil {
		var err error
		val, err = i.evalNode(value, env)
		if err != nil {
			return nil, err
		}
	} else {
		val = &NullNode{}
	}

	err := env.Declare(name, val, mutable)
	if err != nil {
		return nil, NewRuntimeError(err.Error())
	}
	return val, nil
}

func (i *Interpreter) evalAssignment(name string, value Node, env *Environment) (Node, error) {
	val, err := i.evalNode(value, env)
	if err != nil {
		return nil, err
	}

	err = env.Assign(name, val)
	if err != nil {
		return nil, NewRuntimeError(err.Error())
	}
	return val, nil
}

func (i *Interpreter) evalFunctionDeclaration(name string, params []string, body Node,
	isMethod, isStatic, isPublic bool, env *Environment) (Node, error) {

	funcVal := &FunctionNode{
		Name:     name,
		Params:   params,
		Body:     body,
		IsMethod: isMethod,
		IsStatic: isStatic,
		IsPublic: isPublic,
	}

	err := env.Declare(name, funcVal, false)
	if err != nil {
		return nil, NewRuntimeError(err.Error())
	}
	return funcVal, nil
}

func (i *Interpreter) evalReturnStatement(value Node, env *Environment) (Node, error) {
	var val Node
	if value != nil {
		var err error
		val, err = i.evalNode(value, env)
		if err != nil {
			return nil, err
		}
	} else {
		val = &NullNode{}
	}
	return &ReturnNode{Value: val}, nil
}

func (i *Interpreter) evalIfStatement(condition Node, thenBranch Node, elseBranch Node, env *Environment) (Node, error) {
	condVal, err := i.evalNode(condition, env)
	if err != nil {
		return nil, err
	}

	if condBool, ok := condVal.(*BooleanNode); ok {
		if condBool.Value {
			return i.evalNode(thenBranch, env)
		} else if elseBranch != nil {
			return i.evalNode(elseBranch, env)
		}
		return &NullNode{}, nil
	}

	return nil, NewRuntimeError("Condition must evaluate to a boolean")
}

func (i *Interpreter) evalWhileLoop(condition Node, body Node, env *Environment) (Node, error) {
	var last Node = &NullNode{}
	for {
		condVal, err := i.evalNode(condition, env)
		if err != nil {
			return nil, err
		}

		if condBool, ok := condVal.(*BooleanNode); ok && condBool.Value {
			last, err = i.evalNode(body, env)
			if err != nil {
				return nil, err
			}
		} else {
			break
		}
	}
	return last, nil
}

func (i *Interpreter) evalForEachLoop(item string, array Node, index *string, body Node, env *Environment) (Node, error) {
	loopEnv := NewEnclosed(env)

	err := loopEnv.Declare(item, &NullNode{}, true)
	if err != nil {
		return nil, NewRuntimeError(err.Error())
	}

	if index != nil {
		err = loopEnv.Declare(*index, &NumberNode{Value: 0.0}, true)
		if err != nil {
			return nil, NewRuntimeError(err.Error())
		}
	}

	arrayVal, err := i.evalNode(array, env)
	if err != nil {
		return nil, err
	}

	var elements []Node
	if arrayNode, ok := arrayVal.(*ArrayNode); ok {
		elements = arrayNode.Elements
	} else if rangeNode, ok := arrayVal.(*RangeExpression); ok {
		start, err := i.evalNode(rangeNode.Start, env)
		if err != nil {
			return nil, err
		}
		end, err := i.evalNode(rangeNode.End, env)
		if err != nil {
			return nil, err
		}

		if startNum, ok := start.(*NumberNode); ok {
			if endNum, ok := end.(*NumberNode); ok {
				startInt := int(startNum.Value)
				endInt := int(endNum.Value)
				for j := startInt; j < endInt; j++ {
					elements = append(elements, &NumberNode{Value: float64(j)})
				}
			} else {
				return nil, NewRuntimeError("Range end must be a number")
			}
		} else {
			return nil, NewRuntimeError("Range start must be a number")
		}
	} else {
		return nil, NewRuntimeError("Variable is not an array")
	}

	var last Node = &NullNode{}
	for idx, elem := range elements {
		if index != nil {
			err = loopEnv.Assign(*index, &NumberNode{Value: float64(idx)})
			if err != nil {
				return nil, NewRuntimeError(err.Error())
			}
		}
		err = loopEnv.Assign(item, elem)
		if err != nil {
			return nil, NewRuntimeError(err.Error())
		}
		last, err = i.evalNode(body, loopEnv)
		if err != nil {
			return nil, err
		}
	}
	return last, nil
}

func (i *Interpreter) evalMatch(condition Node, body Node, env *Environment) (Node, error) {
	condVal, err := i.evalNode(condition, env)
	if err != nil {
		return nil, err
	}

	if condBool, ok := condVal.(*BooleanNode); ok && condBool.Value {
		return i.evalNode(body, env)
	}
	return &NullNode{}, nil
}

func (i *Interpreter) evalArrayLiteral(elements []Node, env *Environment) (Node, error) {
	var arr []Node
	for _, e := range elements {
		val, err := i.evalNode(e, env)
		if err != nil {
			return nil, err
		}
		arr = append(arr, val)
	}
	return &ArrayNode{Elements: arr}, nil
}

func (i *Interpreter) evalArrayAccess(array Node, index Node, env *Environment) (Node, error) {
	arrayVal, err := i.evalNode(array, env)
	if err != nil {
		return nil, err
	}
	idxVal, err := i.evalNode(index, env)
	if err != nil {
		return nil, err
	}

	if arrayNode, ok := arrayVal.(*ArrayNode); ok {
		if idxNum, ok := idxVal.(*NumberNode); ok {
			idx := int(idxNum.Value)
			if idx >= 0 && idx < len(arrayNode.Elements) {
				return arrayNode.Elements[idx], nil
			}
			return nil, NewRuntimeError(fmt.Sprintf("Index out of bounds: %d >= %d", idx, len(arrayNode.Elements)))
		}
		return nil, NewRuntimeError("Index must be a number")
	}
	return nil, NewRuntimeError("Cannot index non-array")
}

func (i *Interpreter) evalArrayAssignment(array Node, index Node, value Node, env *Environment) (Node, error) {
	if identNode, ok := array.(*IdentifierNode); ok {
		arrName := identNode.Name
		existing := env.Lookup(arrName)
		if existing == nil {
			return nil, NewRuntimeError(fmt.Sprintf("Undefined variable: %s", arrName))
		}

		if existingArr, ok := existing.(*ArrayNode); ok {
			idxNode, err := i.evalNode(index, env)
			if err != nil {
				return nil, err
			}
			valNode, err := i.evalNode(value, env)
			if err != nil {
				return nil, err
			}

			if idxNum, ok := idxNode.(*NumberNode); ok {
				idx := int(idxNum.Value)
				if idx < 0 || idx >= len(existingArr.Elements) {
					return nil, NewRuntimeError(fmt.Sprintf("Index out of bounds: %d >= %d", idx, len(existingArr.Elements)))
				}

				newElems := make([]Node, len(existingArr.Elements))
				copy(newElems, existingArr.Elements)
				newElems[idx] = valNode

				newArrNode := &ArrayNode{Elements: newElems}
				err = env.Assign(arrName, newArrNode)
				if err != nil {
					return nil, NewRuntimeError(err.Error())
				}
				return newArrNode, nil
			}
			return nil, NewRuntimeError("Index must be a number")
		}
		return nil, NewRuntimeError(fmt.Sprintf("Variable '%s' is not an array", arrName))
	}
	return nil, NewRuntimeError("Left side of array assignment must be an identifier")
}

func (i *Interpreter) checkAccess(className, memberName string, isPublic bool, env *Environment) error {
	if isPublic {
		return nil
	}

	currentContext := env.GetCurrentContext()
	if currentContext != nil && currentContext.ClassName == className {
		return nil
	}

	return NewAccessError(fmt.Sprintf("Cannot access private member '%s' of class '%s'", memberName, className))
}

func (i *Interpreter) evalObjectLiteral(properties map[string]Node, env *Environment) (Node, error) {
	objMap := make(map[string]Node)
	for k, v := range properties {
		val, err := i.evalNode(v, env)
		if err != nil {
			return nil, NewRuntimeErrorWithContext(
				fmt.Sprintf("Error evaluating property '%s': %s", k, err.Error()),
				"object literal creation",
			)
		}
		objMap[k] = val
	}
	return &ObjectNode{Properties: objMap}, nil
}

func (i *Interpreter) evalPropertyAccess(object Node, key string, env *Environment) (Node, error) {
	objVal, err := i.evalNode(object, env)
	if err != nil {
		return nil, NewRuntimeErrorWithContext(
			fmt.Sprintf("Error evaluating object for property access: %s", err.Error()),
			fmt.Sprintf("accessing property '%s'", key),
		)
	}

	if objNode, ok := objVal.(*ObjectNode); ok {
		if objNode.ClassName != nil {
			classDef := env.Lookup(*objNode.ClassName)
			if classDef == nil {
				return nil, NewRuntimeError(fmt.Sprintf("Class '%s' not found", *objNode.ClassName))
			}

			classNode := classDef.(*ClassNode)

			if fieldInfo, exists := classNode.Fields[key]; exists {
				err := i.checkAccess(*objNode.ClassName, key, fieldInfo.IsPublic, env)
				if err != nil {
					return nil, err
				}
			}
		}

		if val, exists := objNode.Properties[key]; exists {
			return val, nil
		}
		return nil, NewRuntimeError(fmt.Sprintf("Property '%s' not found on object", key))
	}

	return nil, NewRuntimeError(fmt.Sprintf("Attempted to access property '%s' on non-object (type: %s)", key, objVal.TypeName()))
}

func (i *Interpreter) evalObjectAssignment(object Node, key string, value Node, env *Environment) (Node, error) {
	if identNode, ok := object.(*IdentifierNode); ok {
		objName := identNode.Name
		existing := env.Lookup(objName)
		if existing == nil {
			return nil, NewRuntimeError(fmt.Sprintf("Undefined variable: %s", objName))
		}

		if existingObj, ok := existing.(*ObjectNode); ok {
			if existingObj.ClassName != nil {
				classDef := env.Lookup(*existingObj.ClassName)
				if classDef == nil {
					return nil, NewRuntimeError(fmt.Sprintf("Class '%s' not found", *existingObj.ClassName))
				}

				classNode := classDef.(*ClassNode)
				if fieldInfo, exists := classNode.Fields[key]; exists {
					err := i.checkAccess(*existingObj.ClassName, key, fieldInfo.IsPublic, env)
					if err != nil {
						return nil, err
					}
				} else {
					return nil, NewRuntimeError(fmt.Sprintf("Field '%s' does not exist in class '%s'", key, *existingObj.ClassName))
				}
			}

			valNode, err := i.evalNode(value, env)
			if err != nil {
				return nil, NewRuntimeErrorWithContext(
					fmt.Sprintf("Error evaluating assignment value: %s", err.Error()),
					fmt.Sprintf("assigning to %s.%s", objName, key),
				)
			}
			existingObj.Properties[key] = valNode
			return existingObj, nil
		}
		return nil, NewRuntimeError(fmt.Sprintf("Variable '%s' is not an object (type: %s)", objName, existing.TypeName()))
	}
	return nil, NewRuntimeError("Left side of object assignment must be an identifier")
}

func (i *Interpreter) evalClass(classNode *ClassNode, env *Environment) (Node, error) {
	if classNode.Name == "" {
		return nil, NewRuntimeError("Class must have a name")
	}

	for fieldName := range classNode.Fields {
		if _, exists := classNode.Methods[fieldName]; exists {
			return nil, NewRuntimeError(fmt.Sprintf("Class '%s' has both a field and method named '%s'", classNode.Name, fieldName))
		}
	}

	err := env.Declare(classNode.Name, classNode, false)
	if err != nil {
		return nil, NewRuntimeErrorWithContext(
			fmt.Sprintf("Error declaring class: %s", err.Error()),
			fmt.Sprintf("class '%s' declaration", classNode.Name),
		)
	}
	return classNode, nil
}

func (i *Interpreter) evalRangeExpression(start Node, end Node, env *Environment) (Node, error) {
	startVal, err := i.evalNode(start, env)
	if err != nil {
		return nil, NewRuntimeErrorWithContext(
			fmt.Sprintf("Error evaluating range start: %s", err.Error()),
			"range expression",
		)
	}
	endVal, err := i.evalNode(end, env)
	if err != nil {
		return nil, NewRuntimeErrorWithContext(
			fmt.Sprintf("Error evaluating range end: %s", err.Error()),
			"range expression",
		)
	}
	return &RangeExpression{Start: startVal, End: endVal}, nil
}

func (i *Interpreter) evalFunctionCall(callee Node, args []Node, env *Environment) (Node, error) {
	switch calleeNode := callee.(type) {
	case *PropertyAccessNode:
		objectVal, err := i.evalNode(calleeNode.Object, env)
		if err != nil {
			return nil, NewRuntimeErrorWithContext(
				fmt.Sprintf("Error evaluating object for method call: %s", err.Error()),
				fmt.Sprintf("calling method '%s'", calleeNode.Key),
			)
		}

		if classNode, isClass := objectVal.(*ClassNode); isClass {
			if calleeNode.Key == "new" {
				return i.evalConstructorCall(classNode, args, env)
			}
		}
		return i.evalMethodCall(objectVal, calleeNode.Key, args, env)

	case *IdentifierNode:
		funcName := calleeNode.Name
		funcVal := env.Lookup(funcName)
		if funcVal == nil {
			return nil, NewRuntimeError(fmt.Sprintf("Undefined function: %s", funcName))
		}

		switch fn := funcVal.(type) {
		case *BuiltinFunctionNode:
			return i.evalBuiltinCall(fn.Name, args, env)

		case *FunctionNode:
			if fn.IsMethod {
				return nil, NewRuntimeError(fmt.Sprintf("'%s' is a method and cannot be called directly as a function", funcName))
			}
			if !fn.IsPublic {
				return nil, NewAccessError(fmt.Sprintf("Function '%s' is private and cannot be called directly", funcName))
			}
			if len(fn.Params) != len(args) {
				return nil, NewRuntimeError(fmt.Sprintf("Function '%s' expects %d arguments, got %d", funcName, len(fn.Params), len(args)))
			}

			funcEnv := NewEnvironment(env)
			for idx, param := range fn.Params {
				argVal, err := i.evalNode(args[idx], env)
				if err != nil {
					return nil, NewRuntimeErrorWithContext(
						fmt.Sprintf("Error evaluating argument %d: %s", idx+1, err.Error()),
						fmt.Sprintf("calling function '%s'", funcName),
					)
				}
				err = funcEnv.Declare(param, argVal, true)
				if err != nil {
					return nil, NewRuntimeErrorWithContext(err.Error(), fmt.Sprintf("function '%s' parameter binding", funcName))
				}
			}

			result, err := i.evalNode(fn.Body, funcEnv)
			if err != nil {
				if interpreterErr, ok := err.(*InterpreterError); ok && interpreterErr.Type == "Return" {
					return interpreterErr.Return, nil
				}
				return nil, NewRuntimeErrorWithContext(err.Error(), fmt.Sprintf("executing function '%s'", funcName))
			}
			return result, nil

		case *ClassNode:
			return nil, NewRuntimeError(fmt.Sprintf("'%s' is a class, not a function. Use '%s.new()' to create an instance", funcName, funcName))

		default:
			return nil, NewRuntimeError(fmt.Sprintf("'%s' is not a callable function (type: %s)", funcName, funcVal.TypeName()))
		}

	default:
		return nil, NewRuntimeError(fmt.Sprintf("Cannot call non-function type: %s", callee.TypeName()))
	}
}

func (i *Interpreter) evalConstructorCall(classNode *ClassNode, args []Node, env *Environment) (Node, error) {
	newInstance := &ObjectNode{
		Properties: make(map[string]Node),
		ClassName:  &classNode.Name,
	}

	for fieldName := range classNode.Fields {
		newInstance.Properties[fieldName] = &NullNode{}
	}

	if constructor := classNode.Methods["new"]; constructor != nil {
		if !constructor.IsPublic {
			return nil, NewAccessError(fmt.Sprintf("Constructor of class '%s' is private", classNode.Name))
		}

		expectedArgCount := len(constructor.Params)
		if expectedArgCount > 0 && constructor.Params[0] == "self" {
			expectedArgCount--
		}

		if len(args) != expectedArgCount {
			return nil, NewRuntimeError(fmt.Sprintf("Constructor of '%s' expects %d arguments, got %d", classNode.Name, expectedArgCount, len(args)))
		}

		constructorEnv := NewEnvironment(env)
		constructorEnv.SetCurrentContext(&ClassContext{ClassName: classNode.Name})

		err := constructorEnv.Declare("self", newInstance, true)
		if err != nil {
			constructorEnv.Assign("self", newInstance)
		}

		paramStartIndex := 0
		if len(constructor.Params) > 0 && constructor.Params[0] == "self" {
			paramStartIndex = 1
		}

		for idx, param := range constructor.Params[paramStartIndex:] {
			argVal, err := i.evalNode(args[idx], env)
			if err != nil {
				return nil, NewRuntimeErrorWithContext(
					fmt.Sprintf("Error evaluating constructor argument %d: %s", idx+1, err.Error()),
					fmt.Sprintf("constructing '%s'", classNode.Name),
				)
			}
			err = constructorEnv.Declare(param, argVal, true)
			if err != nil {
				return nil, NewRuntimeErrorWithContext(err.Error(), fmt.Sprintf("constructor '%s' parameter binding", classNode.Name))
			}
		}

		_, err = i.evalNode(constructor.Body, constructorEnv)
		if err != nil {
			if interpreterErr, ok := err.(*InterpreterError); ok && interpreterErr.Type == "Return" {
			} else {
				return nil, NewRuntimeErrorWithContext(err.Error(), fmt.Sprintf("executing constructor of '%s'", classNode.Name))
			}
		}
	}

	return newInstance, nil
}

func (i *Interpreter) evalMethodCall(objectVal Node, methodName string, args []Node, env *Environment) (Node, error) {
	obj, ok := objectVal.(*ObjectNode)
	if !ok {
		return nil, NewRuntimeError(fmt.Sprintf("Can only call methods on objects, got %s", objectVal.TypeName()))
	}

	if obj.ClassName == nil {
		return nil, NewRuntimeError("Object has no class information")
	}

	classDef := env.Lookup(*obj.ClassName)
	if classDef == nil {
		return nil, NewRuntimeError(fmt.Sprintf("Class '%s' not found", *obj.ClassName))
	}

	classNode := classDef.(*ClassNode)
	method := classNode.Methods[methodName]
	if method == nil {
		return nil, NewRuntimeError(fmt.Sprintf("Method '%s' not found in class '%s'", methodName, *obj.ClassName))
	}

	err := i.checkAccess(*obj.ClassName, methodName, method.IsPublic, env)
	if err != nil {
		return nil, err
	}

	expectedArgCount := len(method.Params)
	if expectedArgCount > 0 && method.Params[0] == "self" {
		expectedArgCount--
	}

	if len(args) != expectedArgCount {
		return nil, NewRuntimeError(fmt.Sprintf("Method '%s' of class '%s' expects %d arguments, got %d", methodName, *obj.ClassName, expectedArgCount, len(args)))
	}

	methodEnv := NewEnvironment(env)
	methodEnv.SetCurrentContext(&ClassContext{ClassName: *obj.ClassName})

	err = methodEnv.Declare("self", obj, true)
	if err != nil {
		methodEnv.Assign("self", obj)
	}

	paramStartIndex := 0
	if len(method.Params) > 0 && method.Params[0] == "self" {
		paramStartIndex = 1
	}

	if len(method.Params) > paramStartIndex {
		for idx, param := range method.Params[paramStartIndex:] {
			argVal, err := i.evalNode(args[idx], env)
			if err != nil {
				return nil, NewRuntimeErrorWithContext(
					fmt.Sprintf("Error evaluating method argument %d: %s", idx+1, err.Error()),
					fmt.Sprintf("calling method '%s' on class '%s'", methodName, *obj.ClassName),
				)
			}
			err = methodEnv.Declare(param, argVal, true)
			if err != nil {
				return nil, NewRuntimeErrorWithContext(err.Error(), fmt.Sprintf("method '%s' parameter binding", methodName))
			}
		}
	}

	result, err := i.evalNode(method.Body, methodEnv)
	if err != nil {
		if interpreterErr, ok := err.(*InterpreterError); ok && interpreterErr.Type == "Return" {
			return interpreterErr.Return, nil
		}
		return nil, NewRuntimeErrorWithContext(err.Error(), fmt.Sprintf("executing method '%s' of class '%s'", methodName, *obj.ClassName))
	}
	return result, nil
}

func (i *Interpreter) evalBuiltinCall(name string, args []Node, env *Environment) (Node, error) {
	switch name {
	case "print":
		var output []string
		for idx, arg := range args {
			val, err := i.evalNode(arg, env)
			if err != nil {
				return nil, NewRuntimeErrorWithContext(
					fmt.Sprintf("Error evaluating print argument %d: %s", idx+1, err.Error()),
					"print function call",
				)
			}
			output = append(output, ToStringValue(val))
		}
		fmt.Println(strings.Join(output, " "))
		return &NullNode{}, nil

	case "range":
		switch len(args) {
		case 1:
			stop, err := i.evalNode(args[0], env)
			if err != nil {
				return nil, NewRuntimeErrorWithContext(
					fmt.Sprintf("Error evaluating range stop value: %s", err.Error()),
					"range function call",
				)
			}
			return &RangeExpression{
				Start: &NumberNode{Value: 0.0},
				End:   stop,
			}, nil
		case 2:
			start, err := i.evalNode(args[0], env)
			if err != nil {
				return nil, NewRuntimeErrorWithContext(
					fmt.Sprintf("Error evaluating range start value: %s", err.Error()),
					"range function call",
				)
			}
			end, err := i.evalNode(args[1], env)
			if err != nil {
				return nil, NewRuntimeErrorWithContext(
					fmt.Sprintf("Error evaluating range end value: %s", err.Error()),
					"range function call",
				)
			}
			return &RangeExpression{
				Start: start,
				End:   end,
			}, nil
		default:
			return nil, NewRuntimeError("Range function takes 1 or 2 arguments")
		}

	default:
		return nil, NewRuntimeError(fmt.Sprintf("Unknown builtin function: %s", name))
	}
}

func Evaluate(program Node, env *Environment) (Node, error) {
	interpreter := NewInterpreter()
	return interpreter.Evaluate(program, env)
}
