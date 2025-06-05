package frontend

import (
	"fmt"
	"slices"
	"strconv"

	. "lynx/pkg/frontend/ast"
)

type ParseError struct {
	Message string
	Line    int
	Column  int
}

func NewParseError(message string, line int, column int) *ParseError {
	return &ParseError{
		Message: message,
		Line:    line,
		Column:  column,
	}
}

func (e *ParseError) Error() string {
	return fmt.Sprintf("Parse error at line %d, column %d: %s", e.Line, e.Column, e.Message)
}

type Parser struct {
	tokens  []Token
	current int
}

func NewParser(tokens []Token) *Parser {
	return &Parser{
		tokens:  tokens,
		current: 0,
	}
}

func (p *Parser) isAtEnd() bool {
	return p.current >= len(p.tokens) || p.tokens[p.current].Kind == Eof
}

func (p *Parser) currentToken() *Token {
	if p.current >= len(p.tokens) {
		return &Token{Kind: Eof, Lexeme: "", Line: p.previous().Line, Column: p.previous().Column}
	}
	return &p.tokens[p.current]
}

func (p *Parser) currentLine() int {
	return p.currentToken().Line
}

func (p *Parser) currentColumn() int {
	return p.currentToken().Column
}

func (p *Parser) advance() *Token {
	if !p.isAtEnd() {
		p.current++
	}
	return p.previous()
}

func (p *Parser) previous() *Token {
	if p.current-1 < 0 {
		return &Token{Kind: Eof, Lexeme: "", Line: 0, Column: 0}
	}
	return &p.tokens[p.current-1]
}

func (p *Parser) check(kind TokenType) bool {
	if p.isAtEnd() {
		return false
	}
	return p.currentToken().Kind == kind
}

func (p *Parser) matches(kinds ...TokenType) bool {
	if slices.ContainsFunc(kinds, p.check) {
		p.advance()
		return true
	}
	return false
}

func (p *Parser) consume(kind TokenType, msg string) (*Token, *ParseError) {
	if p.check(kind) {
		return p.advance(), nil
	}
	return nil, p.error(fmt.Sprintf("%s: expected %v, got %v", msg, kind, p.currentToken().Kind))
}

func (p *Parser) error(message string) *ParseError {
	return NewParseError(message, p.currentLine(), p.currentColumn())
}

func (p *Parser) Parse() (*ProgramNode, *ParseError) {
	statements := []Node{}
	for !p.isAtEnd() {
		stmt, err := p.declaration()
		if err != nil {
			return nil, err
		}
		statements = append(statements, stmt)
	}
	return &ProgramNode{Statements: statements}, nil
}

func (p *Parser) declaration() (Node, *ParseError) {
	if p.matches(Let, Const) {
		return p.varDeclaration()
	} else if p.matches(Function) {
		return p.functionDeclaration(false, false, false)
	} else if p.matches(Class) {
		return p.classDeclaration()
	} else {
		return p.statement()
	}
}

func (p *Parser) varDeclaration() (*VarDeclNode, *ParseError) {
	isConst := p.previous().Kind == Const
	nameToken, err := p.consume(Identifier, "Expected variable name")
	if err != nil {
		return nil, err
	}
	name := nameToken.Lexeme

	var value Node
	if p.matches(Equals) {
		expr, err := p.expression()
		if err != nil {
			return nil, err
		}
		value = expr
	} else if isConst {
		return nil, p.error("Const variables must be initialized")
	} else {
		value = nil
	}

	if p.check(Semicolon) {
		_, err := p.consume(Semicolon, "Expected ';' after variable declaration")
		if err != nil {
			return nil, err
		}
	}

	return &VarDeclNode{
		Name:    name,
		Value:   value,
		Mutable: !isConst,
	}, nil
}

func (p *Parser) functionDeclaration(inClass, isPublic, isStatic bool) (*FunctionNode, *ParseError) {
	nameToken, err := p.consume(Identifier, "Expected function name")
	if err != nil {
		return nil, err
	}
	name := nameToken.Lexeme

	_, err = p.consume(LeftParen, "Expected '(' after function name")
	if err != nil {
		return nil, err
	}

	params := []string{}

	if inClass {
		tok, err := p.consume(Identifier, "Expected 'self' as first parameter")
		if err != nil {
			return nil, err
		}
		if tok.Lexeme != "self" {
			return nil, p.error("In a class method, first parameter must be `self`")
		}
		params = append(params, "self")
	}

	if !p.check(RightParen) {
		if !inClass {
			firstParam, err := p.consume(Identifier, "Expected parameter name")
			if err != nil {
				return nil, err
			}
			params = append(params, firstParam.Lexeme)
		}

		for p.matches(Comma) {
			nextParam, err := p.consume(Identifier, "Expected parameter name after ','")
			if err != nil {
				return nil, err
			}
			params = append(params, nextParam.Lexeme)
		}
	}

	_, err = p.consume(RightParen, "Expected ')' after parameters")
	if err != nil {
		return nil, err
	}
	_, err = p.consume(LeftBrace, "Expected '{' before function body")
	if err != nil {
		return nil, err
	}
	body, err := p.blockStatement()
	if err != nil {
		return nil, err
	}

	return &FunctionNode{
		Name:     name,
		Params:   params,
		Body:     body,
		IsStatic: isStatic,
		IsMethod: inClass,
		IsPublic: isPublic,
	}, nil
}

func (p *Parser) statement() (Node, *ParseError) {
	if p.matches(Return) {
		return p.returnStatement()
	} else if p.matches(LeftBrace) {
		return p.blockStatement()
	} else if p.matches(For) {
		return p.forStatement()
	} else if p.matches(If) {
		return p.ifStatement()
	} else if p.matches(Comment) {
		return p.commentStatement()
	} else if p.matches(While) {
		return p.whileStatement()
	} else if p.matches(Break) {
		return p.breakStatement()
	} else if p.matches(Continue) {
		return p.continueStatement()
	} else if p.matches(Match) {
		return p.matchStatement()
	} else if p.check(Identifier) {
		if p.peekIsPropertyAssignment() {
			return p.propertyAssignmentStatement()
		} else if p.current+1 < len(p.tokens) {
			switch p.tokens[p.current+1].Kind {
			case Equals:
				return p.assignmentStatement()
			case LeftBracket:
				return p.expressionStatement()
			case Dot:
				return p.expressionStatement()
			default:
				return p.expressionStatement()
			}
		} else {
			return p.expressionStatement()
		}
	} else {
		return p.expressionStatement()
	}
}

func (p *Parser) peekIsPropertyAssignment() bool {
	tempCurrent := p.current
	if p.check(Identifier) {
		p.advance()
		if p.matches(Dot) {
			if p.matches(Identifier) {
				if p.matches(Equals) {
					p.current = tempCurrent
					return true
				}
			}
		}
	}
	p.current = tempCurrent
	return false
}

func (p *Parser) propertyAssignmentStatement() (*ObjectAssignmentNode, *ParseError) {
	objectNameToken, err := p.consume(Identifier, "Expected object name")
	if err != nil {
		return nil, err
	}
	objectNode := &IdentifierNode{Name: objectNameToken.Lexeme}

	_, err = p.consume(Dot, "Expected '.'")
	if err != nil {
		return nil, err
	}

	keyToken, err := p.consume(Identifier, "Expected property name")
	if err != nil {
		return nil, err
	}
	key := keyToken.Lexeme

	_, err = p.consume(Equals, "Expected '=' after property")
	if err != nil {
		return nil, err
	}

	value, err := p.expression()
	if err != nil {
		return nil, err
	}

	if p.check(Semicolon) {
		_, err = p.consume(Semicolon, "Expected ';' after assignment")
		if err != nil {
			return nil, err
		}
	}

	return &ObjectAssignmentNode{
		Object: objectNode,
		Key:    key,
		Value:  value,
	}, nil
}

func (p *Parser) breakStatement() (*BreakNode, *ParseError) {
	if p.check(Semicolon) {
		_, err := p.consume(Semicolon, "Expected ';' after break")
		if err != nil {
			return nil, err
		}
	}
	return &BreakNode{}, nil
}

func (p *Parser) continueStatement() (*ContinueNode, *ParseError) {
	if p.check(Semicolon) {
		_, err := p.consume(Semicolon, "Expected ';' after continue")
		if err != nil {
			return nil, err
		}
	}
	return &ContinueNode{}, nil
}

func (p *Parser) commentStatement() (*CommentNode, *ParseError) {
	commentToken, err := p.consume(Comment, "Expected comment")
	if err != nil {
		return nil, err
	}
	return &CommentNode{Value: commentToken.Lexeme}, nil
}

func (p *Parser) ifStatement() (*IfNode, *ParseError) {
	condition, err := p.expression()
	if err != nil {
		return nil, err
	}
	thenBranch, err := p.statement()
	if err != nil {
		return nil, err
	}

	var elseBranch Node
	if p.matches(Else) {
		elseStmt, err := p.statement()
		if err != nil {
			return nil, err
		}
		elseBranch = elseStmt
	}

	return &IfNode{
		Condition:  condition,
		ThenBranch: thenBranch,
		ElseBranch: elseBranch,
	}, nil
}

func (p *Parser) returnStatement() (*ReturnNode, *ParseError) {
	var value Node
	if !p.check(Semicolon) && !p.isAtEnd() {
		expr, err := p.expression()
		if err != nil {
			return nil, err
		}
		value = expr
	}
	if p.check(Semicolon) {
		_, err := p.consume(Semicolon, "Expected ';' after return")
		if err != nil {
			return nil, err
		}
	}
	return &ReturnNode{Value: value}, nil
}

func (p *Parser) blockStatement() (*BlockNode, *ParseError) {
	statements := []Node{}
	for !p.check(RightBrace) && !p.isAtEnd() {
		stmt, err := p.declaration()
		if err != nil {
			return nil, err
		}
		statements = append(statements, stmt)
	}
	_, err := p.consume(RightBrace, "Expected '}'")
	if err != nil {
		return nil, err
	}
	return &BlockNode{Statements: statements}, nil
}

func (p *Parser) assignmentStatement() (*AssignmentNode, *ParseError) {
	nameToken := p.previous()
	if nameToken.Kind != Identifier {
		return nil, p.error("Internal error: Expected identifier for assignment target")
	}
	name := nameToken.Lexeme

	_, err := p.consume(Equals, "Expected '='")
	if err != nil {
		return nil, err
	}
	value, err := p.expression()
	if err != nil {
		return nil, err
	}
	if p.check(Semicolon) {
		_, err = p.consume(Semicolon, "Expected ';'")
		if err != nil {
			return nil, err
		}
	}
	return &AssignmentNode{Name: name, Value: value}, nil
}

func (p *Parser) expressionStatement() (*ExpressionStatement, *ParseError) {
	expr, err := p.expression()
	if err != nil {
		return nil, err
	}
	p.matches(Semicolon)
	return &ExpressionStatement{Expression: expr}, nil
}

func (p *Parser) expression() (Node, *ParseError) {
	return p.logicOr()
}

func (p *Parser) logicOr() (Node, *ParseError) {
	expr, err := p.logicAnd()
	if err != nil {
		return nil, err
	}

	for p.matches(Or) {
		op, ok := BinaryOpFromString(p.previous().Lexeme)
		if !ok {
			return nil, p.error(fmt.Sprintf("Invalid logical OR operator: %s", p.previous().Lexeme))
		}
		right, err := p.logicAnd()
		if err != nil {
			return nil, err
		}
		expr = &BinaryExpression{Left: expr, Op: op, Right: right}
	}
	return expr, nil
}

func (p *Parser) logicAnd() (Node, *ParseError) {
	expr, err := p.equality()
	if err != nil {
		return nil, err
	}

	for p.matches(And) {
		op, ok := BinaryOpFromString(p.previous().Lexeme)
		if !ok {
			return nil, p.error(fmt.Sprintf("Invalid logical AND operator: %s", p.previous().Lexeme))
		}
		right, err := p.equality()
		if err != nil {
			return nil, err
		}
		expr = &BinaryExpression{Left: expr, Op: op, Right: right}
	}
	return expr, nil
}

func (p *Parser) equality() (Node, *ParseError) {
	expr, err := p.comparison()
	if err != nil {
		return nil, err
	}

	for p.matches(EqualEqual, NotEqual) {
		op, ok := BinaryOpFromString(p.previous().Lexeme)
		if !ok {
			return nil, p.error(fmt.Sprintf("Invalid equality operator: %s", p.previous().Lexeme))
		}
		right, err := p.comparison()
		if err != nil {
			return nil, err
		}
		expr = &BinaryExpression{Left: expr, Op: op, Right: right}
	}
	return expr, nil
}

func (p *Parser) comparison() (Node, *ParseError) {
	left, err := p.addition()
	if err != nil {
		return nil, err
	}

	for p.matches(Greater, GreaterEqual, Less, LessEqual) {
		op, ok := BinaryOpFromString(p.previous().Lexeme)
		if !ok {
			return nil, p.error(fmt.Sprintf("Invalid comparison operator: %s", p.previous().Lexeme))
		}
		right, err := p.addition()
		if err != nil {
			return nil, err
		}
		left = &BinaryExpression{Left: left, Op: op, Right: right}
	}
	return left, nil
}

func (p *Parser) addition() (Node, *ParseError) {
	expr, err := p.multiplication()
	if err != nil {
		return nil, err
	}

	for p.matches(Plus, Minus) {
		op, ok := BinaryOpFromString(p.previous().Lexeme)
		if !ok {
			return nil, p.error(fmt.Sprintf("Invalid addition/subtraction operator: %s", p.previous().Lexeme))
		}
		right, err := p.multiplication()
		if err != nil {
			return nil, err
		}
		expr = &BinaryExpression{Left: expr, Op: op, Right: right}
	}
	return expr, nil
}

func (p *Parser) multiplication() (Node, *ParseError) {
	expr, err := p.call()
	if err != nil {
		return nil, err
	}

	for p.matches(Star, Slash, Percent) {
		op, ok := BinaryOpFromString(p.previous().Lexeme)
		if !ok {
			return nil, p.error(fmt.Sprintf("Invalid multiplication/division/modulo operator: %s", p.previous().Lexeme))
		}
		right, err := p.call()
		if err != nil {
			return nil, err
		}
		expr = &BinaryExpression{Left: expr, Op: op, Right: right}
	}
	return expr, nil
}

func (p *Parser) call() (Node, *ParseError) {
	expr, err := p.primary()
	if err != nil {
		return nil, err
	}

	for {
		if p.matches(LeftParen) {
			args := []Node{}
			if !p.check(RightParen) {
				for {
					arg, err := p.expression()
					if err != nil {
						return nil, err
					}
					args = append(args, arg)
					if !p.matches(Comma) {
						break
					}
				}
			}
			_, err := p.consume(RightParen, "Expected ')' after arguments")
			if err != nil {
				return nil, err
			}
			expr = &CallExpression{
				Callee: expr,
				Args:   args,
			}
		} else if p.matches(Dot) {
			keyToken, err := p.consume(Identifier, "Expected property name after '.'")
			if err != nil {
				return nil, err
			}
			key := keyToken.Lexeme
			expr = &PropertyAccessNode{
				Object: expr,
				Key:    key,
			}
		} else if p.matches(LeftBracket) {
			indexExpr, err := p.expression()
			if err != nil {
				return nil, err
			}
			_, err = p.consume(RightBracket, "Expected ']'")
			if err != nil {
				return nil, err
			}

			if p.matches(Equals) {
				valueExpr, err := p.expression()
				if err != nil {
					return nil, err
				}
				expr = &ArrayAssignmentNode{
					Array: expr,
					Index: indexExpr,
					Value: valueExpr,
				}
			} else {
				expr = &ArrayAccessNode{
					Array: expr,
					Index: indexExpr,
				}
			}
		} else {
			break
		}
	}
	return expr, nil
}

func (p *Parser) primary() (Node, *ParseError) {
	if p.matches(True) {
		return &BooleanNode{Value: true}, nil
	}
	if p.matches(False) {
		return &BooleanNode{Value: false}, nil
	}
	if p.matches(Null) {
		return &NullNode{}, nil
	}
	if p.matches(Number) {
		value, err := strconv.ParseFloat(p.previous().Lexeme, 64)
		if err != nil {
			return nil, p.error("Invalid number format")
		}
		return &NumberNode{Value: value}, nil
	}
	if p.matches(String) {
		lexeme := p.previous().Lexeme
		if len(lexeme) >= 2 && lexeme[0] == '"' && lexeme[len(lexeme)-1] == '"' {
			lexeme = lexeme[1 : len(lexeme)-1]
		}
		return &StringNode{Value: lexeme}, nil
	}
	if p.matches(Identifier) {
		return &IdentifierNode{Name: p.previous().Lexeme}, nil
	}
	if p.matches(LeftParen) {
		expr, err := p.expression()
		if err != nil {
			return nil, err
		}
		_, err = p.consume(RightParen, "Expected ')'")
		if err != nil {
			return nil, err
		}
		return expr, nil
	}
	if p.matches(LeftBrace) {
		return p.objectLiteral()
	}
	if p.matches(LeftBracket) {
		return p.arrayLiteral()
	}
	return nil, p.error(fmt.Sprintf("Unexpected token: %v", p.currentToken().Kind))
}

func (p *Parser) whileStatement() (*WhileNode, *ParseError) {
	condition, err := p.expression()
	if err != nil {
		return nil, err
	}
	body, err := p.statement()
	if err != nil {
		return nil, err
	}
	return &WhileNode{Condition: condition, Body: body}, nil
}

func (p *Parser) forStatement() (Node, *ParseError) {
	var index *string
	var item string
	var array Node
	var body Node

	if p.matches(LeftParen) {
		indexToken, err := p.consume(Identifier, "Expected index name")
		if err != nil {
			return nil, err
		}
		idx := indexToken.Lexeme
		index = &idx

		_, err = p.consume(Comma, "Expected ',' after index")
		if err != nil {
			return nil, err
		}

		itemToken, err := p.consume(Identifier, "Expected item name")
		if err != nil {
			return nil, err
		}
		item = itemToken.Lexeme

		_, err = p.consume(RightParen, "Expected ')' after for loop vars")
		if err != nil {
			return nil, err
		}
		_, err = p.consume(In, "Expected 'in'")
		if err != nil {
			return nil, err
		}
		array, err = p.expression()
		if err != nil {
			return nil, err
		}
		body, err = p.statement()
		if err != nil {
			return nil, err
		}
	} else {
		itemToken, err := p.consume(Identifier, "Expected item name")
		if err != nil {
			return nil, err
		}
		item = itemToken.Lexeme

		_, err = p.consume(In, "Expected 'in'")
		if err != nil {
			return nil, err
		}
		array, err = p.expression()
		if err != nil {
			return nil, err
		}
		body, err = p.statement()
		if err != nil {
			return nil, err
		}
		index = nil
	}

	return &ForEachNode{
		Array: array,
		Item:  item,
		Body:  body,
		Index: index,
	}, nil
}

func (p *Parser) arrayLiteral() (*ArrayNode, *ParseError) {
	elements := []Node{}
	if !p.check(RightBracket) {
		for {
			expr, err := p.expression()
			if err != nil {
				return nil, err
			}
			elements = append(elements, expr)
			if !p.matches(Comma) {
				break
			}
		}
	}
	_, err := p.consume(RightBracket, "Expected ']' after array")
	if err != nil {
		return nil, err
	}
	return &ArrayNode{Elements: elements}, nil
}

func (p *Parser) objectLiteral() (*ObjectNode, *ParseError) {
	properties := make(map[string]Node)
	for !p.check(RightBrace) && !p.isAtEnd() {
		keyToken, err := p.consume(Identifier, "Expected property name")
		if err != nil {
			return nil, err
		}
		key := keyToken.Lexeme

		if p.matches(Comma) {
			properties[key] = &NullNode{}
			continue
		}

		_, err = p.consume(Colon, "Expected ':' after property name")
		if err != nil {
			return nil, err
		}
		value, err := p.expression()
		if err != nil {
			return nil, err
		}
		properties[key] = value

		if !p.matches(Comma) {
			break
		}
	}
	_, err := p.consume(RightBrace, "Expected '}' after object literal")
	if err != nil {
		return nil, err
	}

	return &ObjectNode{Properties: properties}, nil
}

func (p *Parser) classDeclaration() (*ClassNode, *ParseError) {
	nameToken, err := p.consume(Identifier, "Expected class name")
	if err != nil {
		return nil, err
	}
	nameLexeme := nameToken.Lexeme
	var parents []string
	if p.matches(LeftParen) {
		if !p.check(RightParen) {
			for {
				parentNameToken, err := p.consume(Identifier, "Expected parent name")
				if err != nil {
					return nil, err
				}
				parents = append(parents, parentNameToken.Lexeme)
				if !p.matches(Comma) {
					break
				}
			}
		}
		_, err = p.consume(RightParen, "Expected ')' after parents")
		if err != nil {
			return nil, err
		}
	}
	fields := make(map[string]*FieldDeclNode)
	methods := make(map[string]*FunctionNode)
	_, err = p.consume(LeftBrace, "Expected '{' after class signature")
	if err != nil {
		return nil, err
	}
	for !p.check(RightBrace) && !p.isAtEnd() {
		isPublic := false
		isStatic := false
		for p.check(Pub) || p.check(Static) {
			if p.matches(Pub) {
				isPublic = true
			}
			if p.matches(Static) {
				isStatic = true
			}
		}
		currentTokenKind := p.currentToken().Kind
		switch currentTokenKind {
		case Class:
			nestedClass, err := p.classDeclaration()
			if err != nil {
				return nil, err
			}
			if _, exists := fields[nestedClass.Name]; exists {
				return nil, p.error(fmt.Sprintf("Duplicate class name: %s", nestedClass.Name))
			}
			fields[nestedClass.Name] = &FieldDeclNode{
				Name:     nestedClass.Name,
				Value:    nestedClass,
				IsPublic: isPublic,
				IsStatic: isStatic,
			}
		case Function:
			p.advance()
			function, err := p.functionDeclaration(true, isPublic, isStatic)
			if err != nil {
				return nil, err
			}
			if _, exists := methods[function.Name]; exists {
				return nil, p.error(fmt.Sprintf("Duplicate method name: %s", function.Name))
			}
			methods[function.Name] = function
		case Let:
			p.advance()
			varDecl, err := p.varDeclaration()
			if err != nil {
				return nil, err
			}
			if _, exists := fields[varDecl.Name]; exists {
				return nil, p.error(fmt.Sprintf("Duplicate field name: %s", varDecl.Name))
			}
			fields[varDecl.Name] = &FieldDeclNode{
				Name:     varDecl.Name,
				Value:    varDecl.Value,
				IsPublic: isPublic,
				IsStatic: isStatic,
			}
		case Identifier:
			fieldNameToken, err := p.consume(Identifier, "Expected field name")
			if err != nil {
				return nil, err
			}
			fieldName := fieldNameToken.Lexeme
			var defaultValue Node
			if p.matches(Equals) {
				expr, err := p.expression()
				if err != nil {
					return nil, err
				}
				defaultValue = expr
			}
			if _, exists := fields[fieldName]; exists {
				return nil, p.error(fmt.Sprintf("Duplicate field name: %s", fieldName))
			}
			fields[fieldName] = &FieldDeclNode{
				Name:     fieldName,
				Value:    defaultValue,
				IsPublic: isPublic,
				IsStatic: isStatic,
			}
			p.matches(Semicolon)
		default:
			return nil, p.error(fmt.Sprintf("Expected class member declaration, got %v", currentTokenKind))
		}
	}
	_, err = p.consume(RightBrace, "Expected '}' after class body")
	if err != nil {
		return nil, err
	}

	return &ClassNode{
		Name:    nameLexeme,
		Parents: parents,
		Fields:  fields,
		Methods: methods,
	}, nil
}

func (p *Parser) matchStatement() (*MatchNode, *ParseError) {
	_, err := p.consume(LeftParen, "Expected '(' after match")
	if err != nil {
		return nil, err
	}
	condition, err := p.expression()
	if err != nil {
		return nil, err
	}
	_, err = p.consume(RightParen, "Expected ')' after match condition")
	if err != nil {
		return nil, err
	}
	body, err := p.statement()
	if err != nil {
		return nil, err
	}
	return &MatchNode{Condition: condition, Body: body}, nil
}
