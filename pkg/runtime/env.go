package runtime

import (
	"fmt"
	"lynx/pkg/frontend/ast"
	"maps"
	"math"
)

type Variable struct {
	Value   ast.Node
	Mutable bool
}

type ClassContext struct {
	ClassName string
}

type Environment struct {
	parent    *Environment
	variables map[string]Variable
	context   *ClassContext
}

var CurrentContext *Environment

func NewEnvironment(parent *Environment) *Environment {
	return &Environment{
		parent:    parent,
		variables: make(map[string]Variable),
		context:   nil,
	}
}

func CreateGlobal(args []string) *Environment {
	env := NewEnvironment(nil)
	// Declare built-in literals
	env.Declare("null", &ast.NullNode{}, false)
	env.Declare("true", &ast.BooleanNode{Value: true}, false)
	env.Declare("false", &ast.BooleanNode{Value: false}, false)
	env.Declare("pi", &ast.NumberNode{Value: math.Pi}, false)

	var argsNodes []ast.Node
	for _, arg := range args {
		argsNodes = append(argsNodes, &ast.StringNode{Value: arg})
	}
	env.Declare("args", &ast.ArrayNode{Elements: argsNodes}, false)

	// Built-in functions (represented as ast.BuiltinFunctionNode for now)
	env.Declare("print", &ast.BuiltinFunctionNode{Name: "print"}, false)
	env.Declare("range", &ast.BuiltinFunctionNode{Name: "range"}, false)

	return env
}

func (e *Environment) Declare(name string, value ast.Node, mutable bool) error {
	if _, exists := e.variables[name]; exists {
		return fmt.Errorf("variable '%s' already declared in this scope", name)
	}
	e.variables[name] = Variable{
		Value:   value,
		Mutable: mutable,
	}
	return nil
}

func (e *Environment) Assign(name string, value ast.Node) error {
	if variable, exists := e.variables[name]; exists {
		if !variable.Mutable {
			return fmt.Errorf("cannot assign to constant variable '%s'", name)
		}
		e.variables[name] = Variable{
			Value:   value,
			Mutable: variable.Mutable,
		}
		return nil
	}
	if e.parent != nil {
		return e.parent.Assign(name, value)
	}
	return fmt.Errorf("undefined variable '%s'", name)
}

func (e *Environment) Lookup(name string) ast.Node {
	if variable, exists := e.variables[name]; exists {
		return variable.Value
	}
	if e.parent != nil {
		return e.parent.Lookup(name)
	}
	return nil
}

func NewEnclosed(parent *Environment) *Environment {
	return &Environment{
		parent:    parent,
		variables: make(map[string]Variable),
		context:   parent.context,
	}
}

func (e *Environment) GetAll() map[string]ast.Node {
	result := make(map[string]ast.Node)
	if e.parent != nil {
		maps.Copy(result, e.parent.GetAll())
	}
	for name, variable := range e.variables {
		result[name] = variable.Value
	}
	return result
}

func SetCurrentContext(env *Environment) {
	CurrentContext = env
}

func (e *Environment) SetCurrentContext(ctx *ClassContext) {
	e.context = ctx
}

func (e *Environment) GetCurrentContext() *ClassContext {
	if e.context != nil {
		return e.context
	}
	if e.parent != nil {
		return e.parent.GetCurrentContext()
	}
	return nil
}

func (e *Environment) IsInClassContext(className string) bool {
	ctx := e.GetCurrentContext()
	return ctx != nil && ctx.ClassName == className
}
