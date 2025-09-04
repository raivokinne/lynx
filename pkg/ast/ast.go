package ast

import (
	"bytes"
	"strings"

	"lynx/pkg/token"
)

type Node interface {
	TokenLiteral() string
	String() string
}

type Statement interface {
	Node
	statementNode()
}

type Expression interface {
	Node
	expressionNode()
}

type ExpressionStatement struct {
	Token      token.Token
	Expression Expression
}

func (es *ExpressionStatement) statementNode() {}
func (es *ExpressionStatement) TokenLiteral() string {
	return es.Token.Literal
}

func (es *ExpressionStatement) String() string {
	if es.Expression != nil {
		return es.Expression.String()
	}
	return ""
}

type Program struct {
	Statements []Statement
}

func (p *Program) String() string {
	var out bytes.Buffer

	for _, s := range p.Statements {
		out.WriteString(s.String())
	}
	return out.String()
}

func (p *Program) TokenLiteral() string {
	if len(p.Statements) > 0 {
		return p.Statements[0].TokenLiteral()
	} else {
		return ""
	}
}

type VarStatement struct {
	Token   token.Token
	Name    *Identifier
	Value   Expression
	IsConst bool
}

func (vr *VarStatement) statementNode() {}
func (vr *VarStatement) TokenLiteral() string {
	return vr.Token.Literal
}

func (vr *VarStatement) String() string {
	var out bytes.Buffer

	out.WriteString(vr.TokenLiteral() + " ")
	out.WriteString(vr.Name.Value)
	out.WriteString(" = ")
	if vr.Value != nil {
		out.WriteString(vr.Value.String())
	}
	out.WriteString(";")
	return out.String()
}

type Assignment struct {
	Token token.Token
	Name  Expression
	Value Expression
}

func (ls *Assignment) statementNode() {}
func (ls *Assignment) TokenLiteral() string {
	return ls.Token.Literal
}

func (ls *Assignment) String() string {
	var out bytes.Buffer

	out.WriteString(ls.TokenLiteral() + " ")
	out.WriteString(ls.Name.String())
	out.WriteString(" = ")
	if ls.Value != nil {
		out.WriteString(ls.Value.String())
	}
	out.WriteString(";")
	return out.String()
}

type Identifier struct {
	Token token.Token
	Value string
}

func (i *Identifier) expressionNode() {}
func (i *Identifier) TokenLiteral() string {
	return i.Token.Literal
}

func (i *Identifier) String() string {
	return i.Value
}

type ReturnStatement struct {
	Token token.Token
	Value Expression
}

func (rs *ReturnStatement) statementNode() {}
func (rs *ReturnStatement) TokenLiteral() string {
	return rs.Token.Literal
}

func (rs *ReturnStatement) String() string {
	var out bytes.Buffer

	out.WriteString(rs.TokenLiteral() + " ")
	if rs.Value != nil {
		out.WriteString(rs.Value.String())
	}
	out.WriteString(";")
	return out.String()
}

type IntegerLiteral struct {
	Token token.Token
	Value int64
}

func (il *IntegerLiteral) expressionNode() {}
func (il *IntegerLiteral) TokenLiteral() string {
	return il.Token.Literal
}
func (il *IntegerLiteral) String() string {
	return il.Token.Literal
}

type PrefixExpression struct {
	Token    token.Token
	Operator string
	Right    Expression
}

func (pe *PrefixExpression) expressionNode() {}
func (pe *PrefixExpression) TokenLiteral() string {
	return pe.Token.Literal
}
func (pe *PrefixExpression) String() string {
	var out bytes.Buffer

	out.WriteString("(")
	out.WriteString(pe.Operator)
	out.WriteString(pe.Right.String())
	out.WriteString(")")
	return out.String()
}

type InfixExpression struct {
	Token    token.Token
	Left     Expression
	Operator string
	Right    Expression
}

func (ie *InfixExpression) expressionNode() {}
func (ie *InfixExpression) TokenLiteral() string {
	return ie.Token.Literal
}
func (ie *InfixExpression) String() string {
	var out bytes.Buffer

	out.WriteString("(")
	out.WriteString(ie.Left.String())
	out.WriteString(" " + ie.Operator + " ")
	out.WriteString(ie.Right.String())
	out.WriteString(")")
	return out.String()
}

type Boolean struct {
	Token token.Token
	Value bool
}

func (b *Boolean) expressionNode()      {}
func (b *Boolean) TokenLiteral() string { return b.Token.Literal }
func (b *Boolean) String() string       { return b.Token.Literal }

type IfExpression struct {
	Token       token.Token
	Condition   Expression
	Consequence *BlockStatement
	Alternative *BlockStatement
}

func (ie *IfExpression) expressionNode()      {}
func (ie *IfExpression) TokenLiteral() string { return ie.Token.Literal }
func (ie *IfExpression) String() string {
	var out bytes.Buffer
	out.WriteString("if")
	out.WriteString(ie.Condition.String())
	out.WriteString(" ")
	out.WriteString(ie.Consequence.String())
	if ie.Alternative != nil {
		out.WriteString("else ")
		out.WriteString(ie.Alternative.String())
	}
	return out.String()
}

type BlockStatement struct {
	Token      token.Token
	Statements []Statement
}

func (bs *BlockStatement) expressionNode()      {}
func (bs *BlockStatement) TokenLiteral() string { return bs.Token.Literal }
func (bs *BlockStatement) String() string {
	var out bytes.Buffer
	for _, s := range bs.Statements {
		out.WriteString(s.String())
	}
	return out.String()
}

type FunctionLiteral struct {
	Token      token.Token
	Parameters []*Identifier
	Body       *BlockStatement
}

func (fl *FunctionLiteral) expressionNode()      {}
func (fl *FunctionLiteral) TokenLiteral() string { return fl.Token.Literal }
func (fl *FunctionLiteral) String() string {
	var out bytes.Buffer
	params := []string{}
	for _, p := range fl.Parameters {
		params = append(params, p.String())
	}
	out.WriteString(fl.TokenLiteral())
	out.WriteString("(")
	out.WriteString(strings.Join(params, ", "))
	out.WriteString(") ")
	out.WriteString(fl.Body.String())
	return out.String()
}

type CallExpression struct {
	Token     token.Token
	Function  Expression
	Arguments []Expression
}

func (ce *CallExpression) expressionNode()      {}
func (ce *CallExpression) TokenLiteral() string { return ce.Token.Literal }
func (ce *CallExpression) String() string {
	var out bytes.Buffer
	args := []string{}
	for _, a := range ce.Arguments {
		args = append(args, a.String())
	}
	out.WriteString(ce.Function.String())
	out.WriteString("(")
	out.WriteString(strings.Join(args, ", "))
	out.WriteString(")")
	return out.String()
}

type StringLiteral struct {
	Token token.Token
	Value string
}

func (sl *StringLiteral) expressionNode()      {}
func (sl *StringLiteral) TokenLiteral() string { return sl.Token.Literal }
func (sl *StringLiteral) String() string       { return sl.Token.Literal }

type ArrayLiteral struct {
	Token    token.Token
	Elements []Expression
}

func (al *ArrayLiteral) expressionNode()      {}
func (al *ArrayLiteral) TokenLiteral() string { return al.Token.Literal }
func (al *ArrayLiteral) String() string {
	var out bytes.Buffer
	elements := []string{}
	for _, el := range al.Elements {
		elements = append(elements, el.String())
	}
	out.WriteString("[")
	out.WriteString(strings.Join(elements, ", "))
	out.WriteString("]")
	return out.String()
}

type IndexExpression struct {
	Token token.Token
	Left  Expression
	Index Expression
}

func (ie *IndexExpression) expressionNode()      {}
func (ie *IndexExpression) TokenLiteral() string { return ie.Token.Literal }
func (ie *IndexExpression) String() string {
	var out bytes.Buffer
	out.WriteString("(")
	out.WriteString(ie.Left.String())
	out.WriteString("[")
	out.WriteString(ie.Index.String())
	out.WriteString("])")
	return out.String()
}

type HashLiteral struct {
	Token token.Token
	Pairs map[Expression]Expression
}

func (hl *HashLiteral) expressionNode()      {}
func (hl *HashLiteral) TokenLiteral() string { return hl.Token.Literal }
func (hl *HashLiteral) String() string {
	var out bytes.Buffer
	pairs := []string{}
	for key, value := range hl.Pairs {
		pairs = append(pairs, key.String()+":"+value.String())
	}
	out.WriteString("{")
	out.WriteString(strings.Join(pairs, ", "))
	out.WriteString("}")
	return out.String()
}

type MethodCall struct {
	Token     token.Token
	Object    Expression
	Method    *Identifier
	Arguments []Expression
}

func (mc *MethodCall) expressionNode()      {}
func (mc *MethodCall) TokenLiteral() string { return mc.Token.Literal }
func (mc *MethodCall) String() string {
	var out bytes.Buffer
	args := []string{}
	for _, a := range mc.Arguments {
		args = append(args, a.String())
	}
	out.WriteString(mc.Object.String())
	out.WriteString(".")
	out.WriteString(mc.Method.String())
	out.WriteString("(")
	out.WriteString(strings.Join(args, ", "))
	out.WriteString(")")
	return out.String()
}

type PropertyAccess struct {
	Token    token.Token
	Object   Expression
	Property *Identifier
}

func (pa *PropertyAccess) expressionNode()      {}
func (pa *PropertyAccess) TokenLiteral() string { return pa.Token.Literal }
func (pa *PropertyAccess) String() string {
	var out bytes.Buffer
	out.WriteString(pa.Object.String())
	out.WriteString(".")
	out.WriteString(pa.Property.String())
	return out.String()
}

type ForRange struct {
	Token      token.Token
	Index      *Identifier
	Variable   *Identifier
	Collection Expression
	Body       *BlockStatement
}

func (fr *ForRange) statementNode()       {}
func (fr *ForRange) TokenLiteral() string { return fr.Token.Literal }
func (fr *ForRange) String() string {
	var out bytes.Buffer
	out.WriteString("for ")
	if fr.Index != nil {
		out.WriteString(fr.Variable.String())
		out.WriteString(", ")
		out.WriteString(fr.Index.String())
	} else {
		out.WriteString(fr.Variable.String())
	}
	out.WriteString(" in ")
	out.WriteString(fr.Collection.String())
	out.WriteString(" ")
	return out.String()
}

type While struct {
	Token     token.Token
	Condition Expression
	Body      *BlockStatement
}

func (w *While) statementNode()       {}
func (w *While) TokenLiteral() string { return w.Token.Literal }
func (w *While) String() string {
	var out bytes.Buffer
	out.WriteString("while ")
	out.WriteString(w.Condition.String())
	out.WriteString(" ")
	out.WriteString(w.Body.String())
	return out.String()
}

type Break struct {
	Token token.Token
}

func (b *Break) statementNode()       {}
func (b *Break) TokenLiteral() string { return b.Token.Literal }
func (b *Break) String() string {
	var out bytes.Buffer
	out.WriteString("break")
	return out.String()
}

type Continue struct {
	Token token.Token
}

func (c *Continue) statementNode()       {}
func (c *Continue) TokenLiteral() string { return c.Token.Literal }
func (c *Continue) String() string {
	var out bytes.Buffer
	out.WriteString("continue")
	return out.String()
}

type ModuleLoad struct {
	Token   token.Token
	Name    Expression
	Members []*Identifier
}

func (ml *ModuleLoad) statementNode()       {}
func (ml *ModuleLoad) TokenLiteral() string { return ml.Token.Literal }
func (ml *ModuleLoad) String() string {
	var out bytes.Buffer
	out.WriteString("@")
	out.WriteString(ml.Name.String())
	out.WriteString("(")
	for i, member := range ml.Members {
		if i > 0 {
			out.WriteString(", ")
		}
		out.WriteString(member.String())
	}
	out.WriteString(")")
	return out.String()
}
