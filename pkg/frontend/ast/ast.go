package ast

import (
	"fmt"
	"strconv"
	"strings"
)

type Node interface {
	String() string
	TypeName() string
}

type MethodContainer interface {
	Node
	GetMethod(name string) Node
}

type NumberNode struct {
	Value float64
}

func (n *NumberNode) String() string {
	return fmt.Sprintf("%f", n.Value)
}
func (n *NumberNode) TypeName() string { return "number" }

type StringNode struct {
	Value string
}

func (n *StringNode) String() string {
	return strconv.Quote(n.Value)
}
func (n *StringNode) TypeName() string { return "string" }

type BooleanNode struct {
	Value bool
}

func (n *BooleanNode) String() string {
	return fmt.Sprintf("%t", n.Value)
}
func (n *BooleanNode) TypeName() string { return "boolean" }

type NullNode struct{}

func (n *NullNode) String() string   { return "" }
func (n *NullNode) TypeName() string { return "null" }

type IdentifierNode struct {
	Name string
}

func (n *IdentifierNode) String() string   { return n.Name }
func (n *IdentifierNode) TypeName() string { return "identifier" }

type BinaryOp string

const (
	OpAdd                BinaryOp = "+"
	OpSub                BinaryOp = "-"
	OpMul                BinaryOp = "*"
	OpDiv                BinaryOp = "/"
	OpMod                BinaryOp = "%"
	OpEqual              BinaryOp = "=="
	OpNotEqual           BinaryOp = "!="
	OpGreaterThan        BinaryOp = ">"
	OpGreaterThanOrEqual BinaryOp = ">="
	OpLessThan           BinaryOp = "<"
	OpLessThanOrEqual    BinaryOp = "<="
	OpAnd                BinaryOp = "and"
	OpOr                 BinaryOp = "or"
)

type ConcatOp string

const (
	ConcatOpAdd ConcatOp = "."
)

type BinaryExpression struct {
	Left  Node
	Op    BinaryOp
	Right Node
}

func (e *BinaryExpression) String() string {
	return fmt.Sprintf("(%s %s %s)", e.Left, e.Op, e.Right)
}
func (e *BinaryExpression) TypeName() string { return "expression" }

type ConcatExpression struct {
	Left  Node
	Op    ConcatOp
	Right Node
}

func (e *ConcatExpression) String() string {
	return fmt.Sprintf("(%s %s %s)", e.Left, e.Op, e.Right)
}
func (e *ConcatExpression) TypeName() string { return "expression" }

type RangeExpression struct {
	Start Node
	End   Node
}

func (r *RangeExpression) String() string {
	return fmt.Sprintf("(%s..%s)", r.Start, r.End)
}
func (r *RangeExpression) TypeName() string { return "expression" }

type CallExpression struct {
	Callee Node
	Args   []Node
}

func (c *CallExpression) String() string {
	argsStr := make([]string, len(c.Args))
	for i, arg := range c.Args {
		argsStr[i] = arg.String()
	}
	return fmt.Sprintf("%s(%s)", c.Callee, strings.Join(argsStr, ", "))
}
func (c *CallExpression) TypeName() string { return "expression" }

type CommentNode struct {
	Value string
}

func (c *CommentNode) String() string {
	return fmt.Sprintf("/* %s */", c.Value)
}
func (c *CommentNode) TypeName() string { return "comment" }

type ObjectNode struct {
	Properties map[string]Node
	ClassName  *string
}

func (o *ObjectNode) GetMethod(name string) Node {
	if prop, ok := o.Properties[name]; ok {
		if _, isFunc := prop.(*FunctionNode); isFunc {
			return prop
		}
	}
	if o.ClassName == nil {
		return nil
	}
	return nil
}

func (o *ObjectNode) String() string {
	var entries []string
	for k, v := range o.Properties {
		entries = append(entries, fmt.Sprintf("%s: %s", k, v.String()))
	}
	return fmt.Sprintf("{%s}", strings.Join(entries, ", "))
}
func (o *ObjectNode) TypeName() string { return "object" }

type ObjectAssignmentNode struct {
	Object Node
	Key    string
	Value  Node
}

func (o *ObjectAssignmentNode) String() string {
	return fmt.Sprintf("%s.%s = %s", o.Object, o.Key, o.Value)
}
func (o *ObjectAssignmentNode) TypeName() string { return "statement" }

type ArrayNode struct {
	Elements []Node
}

func (a *ArrayNode) String() string {
	elementsStr := make([]string, len(a.Elements))
	for i, elem := range a.Elements {
		elementsStr[i] = elem.String()
	}
	return fmt.Sprintf("[%s]", strings.Join(elementsStr, ", "))
}
func (a *ArrayNode) TypeName() string { return "array" }

type ArrayAccessNode struct {
	Array Node
	Index Node
}

func (a *ArrayAccessNode) String() string {
	return fmt.Sprintf("%s[%s]", a.Array, a.Index)
}
func (a *ArrayAccessNode) TypeName() string { return "expression" }

type ArrayAssignmentNode struct {
	Array Node
	Index Node
	Value Node
}

func (a *ArrayAssignmentNode) String() string {
	return fmt.Sprintf("%s[%s] = %s", a.Array, a.Index, a.Value)
}
func (a *ArrayAssignmentNode) TypeName() string { return "statement" }

type PropertyAccessNode struct {
	Object Node
	Key    string
}

func (p *PropertyAccessNode) String() string {
	return fmt.Sprintf("%s.%s", p.Object, p.Key)
}
func (p *PropertyAccessNode) TypeName() string { return "expression" }

type ProgramNode struct {
	Statements []Node
}

func (p *ProgramNode) String() string {
	var s []string
	for _, stmt := range p.Statements {
		s = append(s, stmt.String())
	}
	return strings.Join(s, "\n")
}
func (p *ProgramNode) TypeName() string { return "program" }

type BlockNode struct {
	Statements []Node
}

func (b *BlockNode) String() string {
	var s []string
	for _, stmt := range b.Statements {
		s = append(s, stmt.String())
	}
	return fmt.Sprintf("{\n%s\n}", strings.Join(s, "\n"))
}
func (b *BlockNode) TypeName() string { return "block" }

type VarDeclNode struct {
	Name    string
	Value   Node
	Mutable bool
}

func (v *VarDeclNode) String() string {
	prefix := "let"
	if v.Mutable {
		prefix = "mut"
	}
	if v.Value != nil {
		return fmt.Sprintf("%s %s = %s", prefix, v.Name, v.Value)
	}
	return fmt.Sprintf("%s %s", prefix, v.Name)
}
func (v *VarDeclNode) TypeName() string { return "variable_declaration" }

type AssignmentNode struct {
	Name  string
	Value Node
}

func (a *AssignmentNode) String() string {
	return fmt.Sprintf("%s = %s", a.Name, a.Value)
}
func (a *AssignmentNode) TypeName() string { return "assignment" }

type FunctionNode struct {
	Name     string
	Params   []string
	Body     Node
	IsStatic bool
	IsMethod bool
	IsPublic bool
}

func (f *FunctionNode) String() string {
	modifiers := []string{}
	if f.IsPublic {
		modifiers = append(modifiers, "public")
	}
	if f.IsStatic {
		modifiers = append(modifiers, "static")
	}
	if f.IsMethod {
		modifiers = append(modifiers, "method")
	}
	modStr := strings.Join(modifiers, " ")
	if modStr != "" {
		modStr += " "
	}
	return fmt.Sprintf("%sfunction %s(%s) %s", modStr, f.Name, strings.Join(f.Params, ", "), f.Body)
}
func (f *FunctionNode) TypeName() string { return "function" }

type FieldDeclNode struct {
	Name     string
	Value    Node
	IsPublic bool
	IsStatic bool
}

func (f *FieldDeclNode) String() string {
	return fmt.Sprintf("field %s = %s", f.Name, f.Value)
}
func (f *FieldDeclNode) TypeName() string { return "field_declaration" }

type BuiltinFunctionNode struct {
	Name string
}

func (b *BuiltinFunctionNode) String() string   { return fmt.Sprintf("builtin %s", b.Name) }
func (b *BuiltinFunctionNode) TypeName() string { return "builtin_function" }

type ReturnNode struct {
	Value Node
}

func (r *ReturnNode) String() string {
	if r.Value != nil {
		return fmt.Sprintf("%s", r.Value)
	}
	return "return"
}
func (r *ReturnNode) TypeName() string { return "return_statement" }

type ExpressionStatement struct {
	Expression Node
}

func (e *ExpressionStatement) String() string   { return e.Expression.String() }
func (e *ExpressionStatement) TypeName() string { return "expression_statement" }

type IfNode struct {
	Condition  Node
	ThenBranch Node
	ElseBranch Node
}

func (i *IfNode) String() string {
	s := fmt.Sprintf("if %s %s", i.Condition, i.ThenBranch)
	if i.ElseBranch != nil {
		s += fmt.Sprintf(" else %s", i.ElseBranch)
	}
	return s
}
func (i *IfNode) TypeName() string { return "if_statement" }

type ForEachNode struct {
	Array Node
	Item  string
	Body  Node
	Index *string
}

func (f *ForEachNode) String() string {
	return fmt.Sprintf("foreach %s in %s %s", f.Item, f.Array, f.Body)
}
func (f *ForEachNode) TypeName() string { return "foreach_loop" }

type WhileNode struct {
	Condition Node
	Body      Node
}

func (w *WhileNode) String() string {
	return fmt.Sprintf("while %s %s", w.Condition, w.Body)
}
func (w *WhileNode) TypeName() string { return "while_loop" }

type BreakNode struct{}

func (b *BreakNode) String() string   { return "break" }
func (b *BreakNode) TypeName() string { return "break_statement" }

type ContinueNode struct{}

func (c *ContinueNode) String() string   { return "continue" }
func (c *ContinueNode) TypeName() string { return "continue_statement" }

type ClassNode struct {
	Name    string
	Fields  map[string]*FieldDeclNode
	Methods map[string]*FunctionNode
	Parents []string
}

func (c *ClassNode) GetMethod(name string) Node {
	if method, ok := c.Methods[name]; ok {
		return method
	}
	return nil
}

func (c *ClassNode) String() string {
	var parts []string
	if c.Parents != nil && len(c.Parents) > 0 {
		parts = append(parts, fmt.Sprintf("extends %s", strings.Join(c.Parents, ", ")))
	}
	var fieldStrs []string
	for k, v := range c.Fields {
		fieldStrs = append(fieldStrs, fmt.Sprintf("%s: %s", k, v.String()))
	}
	for _, m := range c.Methods {
		fieldStrs = append(fieldStrs, m.String())
	}
	return fmt.Sprintf("class %s %s {\n%s\n}", c.Name, strings.Join(parts, " "), strings.Join(fieldStrs, "\n"))
}
func (c *ClassNode) TypeName() string { return "class_declaration" }

type MatchNode struct {
	Condition Node
	Body      Node
}

func (m *MatchNode) String() string {
	return fmt.Sprintf("match %s %s", m.Condition, m.Body)
}
func (m *MatchNode) TypeName() string { return "match_statement" }

func BinaryOpFromString(s string) (BinaryOp, bool) {
	switch s {
	case "+":
		return OpAdd, true
	case "-":
		return OpSub, true
	case "*":
		return OpMul, true
	case "/":
		return OpDiv, true
	case "%":
		return OpMod, true
	case "==":
		return OpEqual, true
	case "!=":
		return OpNotEqual, true
	case ">":
		return OpGreaterThan, true
	case ">=":
		return OpGreaterThanOrEqual, true
	case "<":
		return OpLessThan, true
	case "<=":
		return OpLessThanOrEqual, true
	case "and":
		return OpAnd, true
	case "or":
		return OpOr, true
	default:
		return "", false
	}
}

func ToStringValue(node Node) string {
	switch n := node.(type) {
	case *NullNode:
		return ""
	case *NumberNode:
		if n.Value == float64(int64(n.Value)) {
			return fmt.Sprintf("%d", int64(n.Value))
		}
		return fmt.Sprintf("%f", n.Value)
	case *StringNode:
		return n.Value
	case *BooleanNode:
		return fmt.Sprintf("%t", n.Value)
	case *FunctionNode:
		return fmt.Sprintf("function %s", n.Name)
	case *BuiltinFunctionNode:
		return fmt.Sprintf("builtin function %s", n.Name)
	case *ObjectNode:
		if len(n.Properties) == 0 {
			return "{}"
		}
		var entries []string
		for k, v := range n.Properties {
			entries = append(entries, fmt.Sprintf("%s: %s", k, ToStringValue(v)))
		}
		return fmt.Sprintf("{%s}", strings.Join(entries, ", "))
	case *ArrayNode:
		var elementsStr []string
		for _, e := range n.Elements {
			elementsStr = append(elementsStr, ToStringValue(e))
		}
		return fmt.Sprintf("[%s]", strings.Join(elementsStr, ", "))
	default:
		return node.String()
	}
}
