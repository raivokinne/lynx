package object

import (
	"fmt"
	"hash/fnv"
	"lynx/pkg/ast"
	"strings"
)

type ObjectType string

type Object interface {
	Type() ObjectType
	Inspect() string
}

const (
	INTEGER_OBJ   = "INTEGER"
	FLOAT_OBJ     = "FLOAT"
	BOOLEAN_OBJ   = "BOOLEAN"
	NULL_OBJ      = "NULL"
	RETURN_OBJ    = "RETURN"
	FUNCTION_OBJ  = "FUNCTION"
	STRING_OBJ    = "STRING"
	ARRAY_OBJ     = "ARRAY"
	HASH_OBJ      = "HASH"
	BUILTIN_OBJ   = "BUILTIN"
	ERROR_OBJ     = "ERROR"
	BREAK_OBJ     = "BREAK"
	CONTINUE_OBJ  = "CONTINUE"
	MODULE_OBJ    = "MODULE"
	TUPLE_OBJ     = "TUPLE"
	EXCEPTION_OBJ = "EXCEPTION"
	CLASS_OBJ     = "CLASS"
	INSTANCE_OBJ  = "INSTANCE"
)

type Float struct {
	Value float64
}

func (f *Float) Type() ObjectType { return FLOAT_OBJ }
func (f *Float) Inspect() string  { return fmt.Sprintf("%f", f.Value) }

type Integer struct {
	Value int64
}

func (i *Integer) Type() ObjectType { return INTEGER_OBJ }
func (i *Integer) Inspect() string  { return fmt.Sprintf("%d", i.Value) }

type Boolean struct {
	Value bool
}

func (b *Boolean) Type() ObjectType { return BOOLEAN_OBJ }
func (b *Boolean) Inspect() string  { return fmt.Sprintf("%t", b.Value) }

type Null struct{}

func (n *Null) Type() ObjectType { return NULL_OBJ }
func (n *Null) Inspect() string  { return "null" }

type Error struct {
	Message string
}

func (e *Error) Type() ObjectType { return ERROR_OBJ }
func (e *Error) Inspect() string  { return "ERROR: " + e.Message }

type Return struct {
	Value Object
}

func (r *Return) Type() ObjectType { return RETURN_OBJ }
func (r *Return) Inspect() string  { return r.Value.Inspect() }

type Function struct {
	Parameters 	[]*ast.Identifier
	Body		*ast.BlockStatement
	Env 		*Env
}

func (f *Function) Type() ObjectType { return FUNCTION_OBJ }
func (f *Function) Inspect() string {
	var out string
	params := []string{}
	for _, p := range f.Parameters {
		params = append(params, p.String())
	}
	out += fmt.Sprintf("fn(%s) {\n%s\n}", strings.Join(params, ", "), f.Body.String())
	return out
}

type String struct {
	Value string
}

func (s *String) Type() ObjectType { return STRING_OBJ }
func (s *String) Inspect() string  { return s.Value }

type Array struct {
	Elements []Object
}

func (a *Array) Type() ObjectType { return ARRAY_OBJ }
func (a *Array) Inspect() string {
	var out string
	elements := []string{}
	for _, e := range a.Elements {
		elements = append(elements, e.Inspect())
	}
	out += fmt.Sprintf("[%s]", strings.Join(elements, ", "))
	return out
}

type Hash struct {
	Pairs map[HashKey]HashPair
}

func (h *Hash) Type() ObjectType { return HASH_OBJ }
func (h *Hash) Inspect() string {
	var out string
	pairs := []string{}
	for _, pair := range h.Pairs {
		pairs = append(pairs, fmt.Sprintf("%s: %s", pair.Key.Inspect(), pair.Value.Inspect()))
	}
	out += fmt.Sprintf("{%s}", strings.Join(pairs, ", "))
	return out
}

type HashPair struct {
	Key   Object
	Value Object
}

type Hashable interface {
	HashKey() HashKey
}

type HashKey struct {
	Type  ObjectType
	Value uint64
}

func (h *HashKey) HashKey() HashKey {
	return *h
}

func (s *String) HashKey() HashKey {
	h := fnv.New64a()
	h.Write([]byte(s.Value))
	return HashKey{Type: s.Type(), Value: h.Sum64()}
}

func (i *Integer) HashKey() HashKey {
	return HashKey{Type: i.Type(), Value: uint64(i.Value)}
}

func (b *Boolean) HashKey() HashKey {
	var val uint64
	if b.Value {
		val = 1
	} else {
		val = 0
	}
	return HashKey{Type: b.Type(), Value: val}
}

func (b *Function) HashKey() HashKey {
	return HashKey{Type: b.Type()}
}

type Builtin struct {
	Fn func(args ...Object) Object
}

func (b *Builtin) Type() ObjectType { return BUILTIN_OBJ }
func (b *Builtin) Inspect() string  { return "builtin function" }

type Continue struct{}

func (c *Continue) Type() ObjectType { return "CONTINUE" }
func (c *Continue) Inspect() string  { return "continue" }

type Break struct{}

func (b *Break) Type() ObjectType { return "BREAK" }
func (b *Break) Inspect() string  { return "break" }

type Module struct {
	Name    string
	Members map[string]Object
	Env     *Env
}

func (m *Module) Type() ObjectType { return "MODULE" }
func (m *Module) Inspect() string  { return fmt.Sprintf("<module %s>", m.Name) }

type Tuple struct {
	Elements []Object
}

func (t *Tuple) Type() ObjectType { return TUPLE_OBJ }
func (t *Tuple) Inspect() string {
	var out string
	elements := []string{}
	for _, e := range t.Elements {
		elements = append(elements, e.Inspect())
	}
	out += fmt.Sprintf("(%s)", strings.Join(elements, ", "))
	return out
}

type Exception struct {
	Value Error
}

func (e *Exception) Type() ObjectType { return EXCEPTION_OBJ }
func (e *Exception) Inspect() string {
	return e.Value.Inspect()
}

type Class struct {
	Name       string
	SuperClass *Class
	Methods    map[string]*Function
	Env        *Env
}

func (c *Class) Type() ObjectType { return CLASS_OBJ }
func (c *Class) Inspect() string {
	return fmt.Sprintf("<class %s>", c.Name)
}

type Instance struct {
	Class      *Class
	Attributes map[string]Object
}

func (i *Instance) Type() ObjectType { return INSTANCE_OBJ }
func (i *Instance) Inspect() string {
	return fmt.Sprintf("<instance of %s>", i.Class.Name)
}
