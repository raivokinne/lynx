package parser

import (
	"fmt"
	"lynx/ast"
	"lynx/lexer"
	"lynx/token"
	"strconv"
	"strings"
)

const (
	_ int = iota
	LOWEST
	EQUALS      // ==
	LESSGREATER // > or <
	LESSEQ      // <=
	GREATEREQ   // >=
	SUM         // +
	PRODUCT     // *
	PREFIX      // -X or !X
	CALL        // myFunction(X)
)

var precedences = map[token.TokenType]int{
	token.EQ:       EQUALS,
	token.NOT_EQ:   EQUALS,
	token.LT:       LESSGREATER,
	token.GT:       LESSGREATER,
	token.PLUS:     SUM,
	token.MINUS:    SUM,
	token.SLASH:    PRODUCT,
	token.ASTERISK: PRODUCT,
	token.LPAREN:   CALL,
	token.DOT:      CALL,
	token.LBRACKET: CALL,
	token.LTE:      LESSEQ,
	token.GTE:      GREATEREQ,
}

type ParseError struct {
	Type    string
	Message string
	Line    int
	Column  int
	Token   token.Token
	Context string
	Hint    string
}

func (pe ParseError) String() string {
	var parts []string
	if pe.Line > 0 && pe.Column > 0 {
		parts = append(parts, fmt.Sprintf("Error at line %d, column %d:", pe.Line, pe.Column))
	} else {
		parts = append(parts, "Parse Error:")
	}
	parts = append(parts, pe.Message)
	if pe.Context != "" {
		parts = append(parts, fmt.Sprintf("Context: %s", pe.Context))
	}
	if pe.Hint != "" {
		parts = append(parts, fmt.Sprintf("Hint: %s", pe.Hint))
	}
	return strings.Join(parts, "\n  ")
}

type (
	prefixParseFn func() ast.Expression
	infixParseFn  func(ast.Expression) ast.Expression
)

type Parser struct {
	l                *lexer.Lexer
	errors           []ParseError
	curToken         token.Token
	peekToken        token.Token
	prefixParseFns   map[token.TokenType]prefixParseFn
	infixParseFns    map[token.TokenType]infixParseFn
	currentStatement string
	functionDepth    int
	loopDepth        int
}

func (p *Parser) registerPrefix(tokenType token.TokenType, fn prefixParseFn) {
	p.prefixParseFns[tokenType] = fn
}

func (p *Parser) registerInfix(tokenType token.TokenType, fn infixParseFn) {
	p.infixParseFns[tokenType] = fn
}

func New(l *lexer.Lexer) *Parser {
	p := &Parser{
		l:      l,
		errors: []ParseError{},
	}
	// Read two tokens, so curToken and peekToken are both set
	p.nextToken()
	p.nextToken()
	p.prefixParseFns = make(map[token.TokenType]prefixParseFn)
	p.registerPrefix(token.IDENT, p.parseIdentifier)
	p.registerPrefix(token.INT, p.parseIntegerLiteral)
	p.registerPrefix(token.BANG, p.parsePrefixExpression)
	p.registerPrefix(token.MINUS, p.parsePrefixExpression)
	p.registerPrefix(token.TRUE, p.parseBoolean)
	p.registerPrefix(token.FALSE, p.parseBoolean)
	p.registerPrefix(token.IF, p.parseIfExpression)
	p.registerPrefix(token.FUNCTION, p.parseFunctionLiteral)
	p.registerPrefix(token.LPAREN, p.parseGroupedExpression)
	p.registerPrefix(token.STR, p.parseStringLiteral)
	p.registerPrefix(token.LBRACKET, p.parseArrayLiteral)
	p.registerPrefix(token.LBRACE, p.parseHashLiteral)
	p.infixParseFns = make(map[token.TokenType]infixParseFn)
	p.registerInfix(token.PLUS, p.parseInfixExpression)
	p.registerInfix(token.MINUS, p.parseInfixExpression)
	p.registerInfix(token.SLASH, p.parseInfixExpression)
	p.registerInfix(token.ASTERISK, p.parseInfixExpression)
	p.registerInfix(token.EQ, p.parseInfixExpression)
	p.registerInfix(token.NOT_EQ, p.parseInfixExpression)
	p.registerInfix(token.LT, p.parseInfixExpression)
	p.registerInfix(token.GT, p.parseInfixExpression)
	p.registerInfix(token.LTE, p.parseInfixExpression)
	p.registerInfix(token.GTE, p.parseInfixExpression)
	p.registerInfix(token.LPAREN, p.parseCallExpression)
	p.registerInfix(token.LBRACKET, p.parseIndexExpression)
	p.registerInfix(token.DOT, p.parseMethodCall)
	return p
}

func (p *Parser) Errors() []ParseError {
	return p.errors
}

func (p *Parser) ErrorStrings() []string {
	var strs []string
	for _, err := range p.errors {
		strs = append(strs, err.String())
	}
	return strs
}

func (p *Parser) addError(errorType, message, context, hint string) {
	p.errors = append(p.errors, ParseError{
		Type:    errorType,
		Message: message,
		Line:    p.curToken.Line,
		Column:  p.curToken.Column,
		Token:   p.curToken,
		Context: context,
		Hint:    hint,
	})
}

func (p *Parser) peekError(expected token.TokenType) {
	var hint string
	var context string
	if p.currentStatement != "" {
		context = fmt.Sprintf("while parsing %s", p.currentStatement)
	}
	switch expected {
	case token.SEMICOLON:
		hint = "Try adding a semicolon ';' at the end of the statement"
	case token.RPAREN:
		hint = "Make sure all opening parentheses '(' have matching closing parentheses ')'"
	case token.RBRACE:
		hint = "Make sure all opening braces '{' have matching closing braces '}'"
	case token.RBRACKET:
		hint = "Make sure all opening brackets '[' have matching closing brackets ']'"
	case token.IDENT:
		hint = "Expected an identifier (variable name)"
	case token.ASSIGN:
		hint = "Use '=' for assignment"
	default:
		hint = fmt.Sprintf("Expected '%s' token", expected)
	}
	message := fmt.Sprintf("Expected '%s', got '%s'", expected, p.peekToken.Type)
	if p.peekToken.Literal != "" && p.peekToken.Literal != string(p.peekToken.Type) {
		message += fmt.Sprintf(" ('%s')", p.peekToken.Literal)
	}
	p.addError("SyntaxError", message, context, hint)
}

func (p *Parser) nextToken() {
	p.curToken = p.peekToken
	p.peekToken = p.l.NextToken()
}

func (p *Parser) ParseProgram() *ast.Program {
	program := &ast.Program{}
	program.Statements = []ast.Statement{}
	for p.curToken.Type != token.EOF {
		stmt := p.parseStatement()
		if stmt != nil {
			program.Statements = append(program.Statements, stmt)
		}
		if len(p.errors) > 10 {
			p.addError("ParserError", "Too many parse errors, stopping", "", "Check syntax carefully")
			break
		}
		p.nextToken()
	}
	return program
}

func (p *Parser) parseIdentifier() ast.Expression {
	return &ast.Identifier{Token: p.curToken, Value: p.curToken.Literal}
}

func (p *Parser) parseIntegerLiteral() ast.Expression {
	lit := &ast.IntegerLiteral{Token: p.curToken}
	value, err := strconv.ParseInt(p.curToken.Literal, 0, 64)
	if err != nil {
		p.addError(
			"ValueError",
			fmt.Sprintf("Cannot parse '%s' as integer", p.curToken.Literal),
			"parsing integer literal",
			"Make sure the number is within valid range and properly formatted",
		)
		return nil
	}
	lit.Value = value
	return lit
}

func (p *Parser) parseStatement() ast.Statement {
	switch p.curToken.Type {
	case token.LET:
		p.currentStatement = "let statement"
		return p.parseLetStatement()
	case token.RETURN:
		p.currentStatement = "return statement"
		return p.parseReturnStatement()
	case token.IDENT:
		if p.peekTokenIs(token.ASSIGN) {
			p.currentStatement = "assignment statement"
			return p.parseAssignmentStatement()
		}
		p.currentStatement = "expression statement"
		return p.parseExpressionStatement()
	case token.FOR:
		p.currentStatement = "for loop"
		return p.parseForStatement()
	case token.WHILE:
		p.currentStatement = "while loop"
		return p.parseWhileStatement()
	case token.CONTINUE:
		p.currentStatement = "continue statement"
		return p.parseContinueStatement()
	case token.BREAK:
		p.currentStatement = "break statement"
		return p.parseBreakStatement()
	default:
		p.currentStatement = "expression statement"
		return p.parseExpressionStatement()
	}
}

func (p *Parser) parseContinueStatement() ast.Statement {
	if p.loopDepth == 0 {
		p.addError(
			"ScopeError",
			"'continue' statement outside of loop",
			"continue statement",
			"'continue' can only be used inside for or while loops",
		)
	}
	stmt := &ast.Continue{Token: p.curToken}
	if p.peekTokenIs(token.SEMICOLON) {
		p.nextToken()
	}
	return stmt
}

func (p *Parser) parseBreakStatement() ast.Statement {
	if p.loopDepth == 0 {
		p.addError(
			"ScopeError",
			"'break' statement outside of loop",
			"break statement",
			"'break' can only be used inside for or while loops",
		)
	}
	stmt := &ast.Break{Token: p.curToken}
	if p.peekTokenIs(token.SEMICOLON) {
		p.nextToken()
	}
	return stmt
}

func (p *Parser) parseForStatement() ast.Statement {
	p.loopDepth++
	defer func() { p.loopDepth-- }()
	stmt := &ast.ForRange{
		Token: p.curToken,
	}
	if !p.expectPeek(token.IDENT) {
		return nil
	}
	variable := &ast.Identifier{
		Token: p.curToken,
		Value: p.curToken.Literal,
	}
	stmt.Variable = variable
	if p.peekToken.Type == token.COMMA {
		p.nextToken()
		if !p.expectPeek(token.IDENT) {
			return nil
		}
		index := &ast.Identifier{
			Token: p.curToken,
			Value: p.curToken.Literal,
		}
		stmt.Index = index
	}
	if !p.expectPeek(token.IN) {
		p.addError(
			"SyntaxError",
			"Missing 'in' keyword in for loop",
			"for loop syntax",
			"For loops should follow the pattern: for variable in collection { ... }",
		)
		return nil
	}
	p.nextToken()
	stmt.Collection = p.parseExpression(LOWEST)
	if !p.expectPeek(token.LBRACE) {
		return nil
	}
	stmt.Body = p.parseBlockStatement()
	return stmt
}

func (p *Parser) parseWhileStatement() ast.Statement {
	p.loopDepth++
	defer func() { p.loopDepth-- }()
	stmt := &ast.While{
		Token: p.curToken,
	}
	p.nextToken()
	stmt.Condition = p.parseExpression(LOWEST)
	if !p.expectPeek(token.LBRACE) {
		return nil
	}
	stmt.Body = p.parseBlockStatement()
	return stmt
}

func (p *Parser) parseAssignmentStatement() *ast.Assignment {
	stmt := &ast.Assignment{Token: p.curToken}
	stmt.Name = &ast.Identifier{Token: p.curToken, Value: p.curToken.Literal}
	if !p.expectPeek(token.ASSIGN) {
		return nil
	}
	p.nextToken()
	stmt.Value = p.parseExpression(LOWEST)
	if p.peekTokenIs(token.SEMICOLON) {
		p.nextToken()
	}
	return stmt
}

func (p *Parser) parseLetStatement() *ast.LetStatement {
	stmt := &ast.LetStatement{Token: p.curToken}
	if !p.expectPeek(token.IDENT) {
		return nil
	}
	stmt.Name = &ast.Identifier{Token: p.curToken, Value: p.curToken.Literal}
	if !p.expectPeek(token.ASSIGN) {
		return nil
	}
	p.nextToken()
	stmt.Value = p.parseExpression(LOWEST)
	if p.peekTokenIs(token.SEMICOLON) {
		p.nextToken()
	}
	return stmt
}

func (p *Parser) parseReturnStatement() *ast.ReturnStatement {
	if p.functionDepth == 0 {
		p.addError(
			"ScopeError",
			"'return' statement outside of function",
			"return statement",
			"'return' can only be used inside function bodies",
		)
	}
	stmt := &ast.ReturnStatement{Token: p.curToken}
	p.nextToken()
	stmt.Value = p.parseExpression(LOWEST)
	if p.peekTokenIs(token.SEMICOLON) {
		p.nextToken()
	}
	return stmt
}

func (p *Parser) parseExpressionStatement() *ast.ExpressionStatement {
	stmt := &ast.ExpressionStatement{Token: p.curToken}
	stmt.Expression = p.parseExpression(LOWEST)
	// Consume optional semicolon
	if p.peekTokenIs(token.SEMICOLON) {
		p.nextToken()
	}
	return stmt
}

func (p *Parser) noPrefixParseFnError(t token.TokenType) {
	var hint string
	var context string
	if p.currentStatement != "" {
		context = fmt.Sprintf("while parsing %s", p.currentStatement)
	}
	switch t {
	case token.RPAREN:
		hint = "Unexpected closing parenthesis - check for missing opening parenthesis or extra closing parenthesis"
	case token.RBRACE:
		hint = "Unexpected closing brace - check for missing opening brace or extra closing brace"
	case token.RBRACKET:
		hint = "Unexpected closing bracket - check for missing opening bracket or extra closing bracket"
	case token.COMMA:
		hint = "Unexpected comma - check if you're missing a value before the comma"
	case token.SEMICOLON:
		hint = "Unexpected semicolon - check if you're missing an expression before the semicolon"
	case token.EOF:
		hint = "Unexpected end of file - check for missing closing braces, parentheses, or brackets"
	default:
		hint = fmt.Sprintf("Token '%s' cannot start an expression", t)
	}
	message := fmt.Sprintf("Unexpected token '%s'", t)
	if p.curToken.Literal != "" && p.curToken.Literal != string(t) {
		message += fmt.Sprintf(" ('%s')", p.curToken.Literal)
	}
	p.addError("SyntaxError", message, context, hint)
}

func (p *Parser) parseExpression(precedence int) ast.Expression {
	prefix := p.prefixParseFns[p.curToken.Type]
	if prefix == nil {
		p.noPrefixParseFnError(p.curToken.Type)
		return nil
	}
	leftExp := prefix()
	for !p.peekTokenIs(token.SEMICOLON) && precedence < p.peekPrecedence() {
		infix := p.infixParseFns[p.peekToken.Type]
		if infix == nil {
			return leftExp
		}
		p.nextToken()
		leftExp = infix(leftExp)
	}
	return leftExp
}

func (p *Parser) parsePrefixExpression() ast.Expression {
	expression := &ast.PrefixExpression{
		Token:    p.curToken,
		Operator: p.curToken.Literal,
	}
	p.nextToken()
	expression.Right = p.parseExpression(PREFIX)
	return expression
}

func (p *Parser) parseInfixExpression(left ast.Expression) ast.Expression {
	expression := &ast.InfixExpression{
		Token:    p.curToken,
		Left:     left,
		Operator: p.curToken.Literal,
	}
	precedence := p.curPrecedence()
	p.nextToken()
	expression.Right = p.parseExpression(precedence)
	return expression
}

func (p *Parser) parseBoolean() ast.Expression {
	return &ast.Boolean{Token: p.curToken, Value: p.curTokenIs(token.TRUE)}
}

func (p *Parser) parseGroupedExpression() ast.Expression {
	p.nextToken()
	exp := p.parseExpression(LOWEST)
	if !p.expectPeek(token.RPAREN) {
		return nil
	}
	return exp
}

func (p *Parser) parseIfExpression() ast.Expression {
	expression := &ast.IfExpression{Token: p.curToken}
	if !p.expectPeek(token.LPAREN) {
		return nil
	}
	p.nextToken()
	expression.Condition = p.parseExpression(LOWEST)
	if !p.expectPeek(token.RPAREN) {
		return nil
	}
	if !p.expectPeek(token.LBRACE) {
		return nil
	}
	expression.Consequence = p.parseBlockStatement()
	if p.peekTokenIs(token.ELSE) {
		p.nextToken()
		if !p.expectPeek(token.LBRACE) {
			return nil
		}
		expression.Alternative = p.parseBlockStatement()
	}
	return expression
}

func (p *Parser) parseBlockStatement() *ast.BlockStatement {
	block := &ast.BlockStatement{Token: p.curToken}
	block.Statements = []ast.Statement{}
	p.nextToken()
	for !p.curTokenIs(token.RBRACE) && !p.curTokenIs(token.EOF) {
		stmt := p.parseStatement()
		if stmt != nil {
			block.Statements = append(block.Statements, stmt)
		}
		p.nextToken()
	}
	return block
}

func (p *Parser) parseFunctionLiteral() ast.Expression {
	p.functionDepth++
	defer func() { p.functionDepth-- }()
	lit := &ast.FunctionLiteral{Token: p.curToken}
	if !p.expectPeek(token.LPAREN) {
		return nil
	}
	lit.Parameters = p.parseFunctionParameters()
	if !p.expectPeek(token.LBRACE) {
		return nil
	}
	lit.Body = p.parseBlockStatement()
	return lit
}

func (p *Parser) parseFunctionParameters() []*ast.Identifier {
	identifiers := []*ast.Identifier{}
	if p.peekTokenIs(token.RPAREN) {
		p.nextToken()
		return identifiers
	}
	p.nextToken()
	ident := &ast.Identifier{Token: p.curToken, Value: p.curToken.Literal}
	identifiers = append(identifiers, ident)
	for p.peekTokenIs(token.COMMA) {
		p.nextToken()
		p.nextToken()
		ident := &ast.Identifier{Token: p.curToken, Value: p.curToken.Literal}
		identifiers = append(identifiers, ident)
	}
	if !p.expectPeek(token.RPAREN) {
		return nil
	}
	return identifiers
}

func (p *Parser) parseCallExpression(function ast.Expression) ast.Expression {
	exp := &ast.CallExpression{Token: p.curToken, Function: function}
	exp.Arguments = p.parseCallArguments()
	return exp
}

func (p *Parser) parseCallArguments() []ast.Expression {
	args := []ast.Expression{}
	if p.peekTokenIs(token.RPAREN) {
		p.nextToken()
		return args
	}
	p.nextToken()
	arg := p.parseExpression(LOWEST)
	if arg != nil {
		args = append(args, arg)
	} else {
		return nil
	}

	for p.peekTokenIs(token.COMMA) {
		p.nextToken()
		p.nextToken()
		arg := p.parseExpression(LOWEST)
		if arg != nil {
			args = append(args, arg)
		} else {
			return nil
		}
	}
	if !p.expectPeek(token.RPAREN) {
		return nil
	}
	return args
}

func (p *Parser) parseStringLiteral() ast.Expression {
	return &ast.StringLiteral{Token: p.curToken, Value: p.curToken.Literal}
}

func (p *Parser) parseArrayLiteral() ast.Expression {
	array := &ast.ArrayLiteral{Token: p.curToken}
	array.Elements = p.parseExpressionList(token.RBRACKET)
	return array
}

func (p *Parser) parseExpressionList(end token.TokenType) []ast.Expression {
	list := []ast.Expression{}
	if p.peekTokenIs(end) {
		p.nextToken()
		return list
	}
	p.nextToken()
	expr := p.parseExpression(LOWEST)
	if expr != nil {
		list = append(list, expr)
	} else {
		return nil
	}

	for p.peekTokenIs(token.COMMA) {
		p.nextToken()
		p.nextToken()
		expr := p.parseExpression(LOWEST)
		if expr != nil {
			list = append(list, expr)
		} else {
			return nil
		}
	}
	if !p.expectPeek(end) {
		return nil
	}
	return list
}

func (p *Parser) parseIndexExpression(left ast.Expression) ast.Expression {
	exp := &ast.IndexExpression{Token: p.curToken, Left: left}
	p.nextToken()
	exp.Index = p.parseExpression(LOWEST)
	if !p.expectPeek(token.RBRACKET) {
		return nil
	}
	return exp
}

func (p *Parser) parseHashLiteral() ast.Expression {
	hash := &ast.HashLiteral{Token: p.curToken}
	hash.Pairs = make(map[ast.Expression]ast.Expression)
	for !p.peekTokenIs(token.RBRACE) {
		p.nextToken()
		key := p.parseExpression(LOWEST)
		if !p.expectPeek(token.COLON) {
			p.addError(
				"SyntaxError",
				"Missing colon ':' in hash literal",
				"hash literal key-value pair",
				"Hash literals should follow the pattern: {key: value, key2: value2}",
			)
			return nil
		}
		p.nextToken()
		value := p.parseExpression(LOWEST)
		hash.Pairs[key] = value
		if !p.peekTokenIs(token.RBRACE) && !p.expectPeek(token.COMMA) {
			return nil
		}
	}
	if !p.expectPeek(token.RBRACE) {
		return nil
	}
	return hash
}

func (p *Parser) parseMethodCall(object ast.Expression) ast.Expression {
	if !p.expectPeek(token.IDENT) {
		p.addError(
			"SyntaxError",
			"Expected method or property name after '.'",
			"method call or property access",
			"Use dot notation like: object.method() or object.property",
		)
		return nil
	}
	methodOrProperty := &ast.Identifier{
		Token: p.curToken,
		Value: p.curToken.Literal,
	}
	if p.peekTokenIs(token.LPAREN) {
		p.nextToken()
		return &ast.MethodCall{
			Token:     p.curToken,
			Object:    object,
			Method:    methodOrProperty,
			Arguments: p.parseCallArguments(),
		}
	}
	return &ast.PropertyAccess{
		Token:    p.curToken,
		Object:   object,
		Property: methodOrProperty,
	}
}

func (p *Parser) curTokenIs(t token.TokenType) bool {
	return p.curToken.Type == t
}

func (p *Parser) peekTokenIs(t token.TokenType) bool {
	return p.peekToken.Type == t
}

func (p *Parser) expectPeek(t token.TokenType) bool {
	if p.peekTokenIs(t) {
		p.nextToken()
		return true
	} else {
		p.peekError(t)
		return false
	}
}

func (p *Parser) peekPrecedence() int {
	if p, ok := precedences[p.peekToken.Type]; ok {
		return p
	}
	return LOWEST
}

func (p *Parser) curPrecedence() int {
	if p, ok := precedences[p.curToken.Type]; ok {
		return p
	}
	return LOWEST
}
