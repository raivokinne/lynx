package parser

import (
	"fmt"
	"lynx/pkg/ast"
	"lynx/pkg/lexer"
	"lynx/pkg/token"
	"strconv"
)

const (
	_ int = iota
	LOWEST
	NULL        // null
	PIPE        // |>
	LESSGREATER // > or <
	EQUALS      // ==
	LESSEQ      // <=
	GREATEREQ   // >=
	CONCAT      // ++
	SQUARE      // _/
	AND         // and
	OR          // or
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
	token.MODULOS:  PRODUCT,
	token.POWER:    PRODUCT,
	token.AND:      AND,
	token.OR:       OR,
	token.CONCAT:   CONCAT,
	token.SQUARE:   SQUARE,
	token.PIPE:     PIPE,
	token.NULL:     NULL,
}

type ParseError struct {
	Type    string
	Message string
	Line    int
	Column  int
	Token   token.Token
}

func (pe ParseError) String() string {
	return fmt.Sprintf("Parser error at line %d, column %d: %s: %s", pe.Line, pe.Column, pe.Type, pe.Message)
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
	p.registerPrefix(token.FLOAT, p.parseFloatLiteral)
	p.registerPrefix(token.BANG, p.parsePrefixExpression)
	p.registerPrefix(token.MINUS, p.parsePrefixExpression)
	p.registerPrefix(token.SQUARE, p.parsePrefixExpression)
	p.registerPrefix(token.TRUE, p.parseBoolean)
	p.registerPrefix(token.FALSE, p.parseBoolean)
	p.registerPrefix(token.IF, p.parseIfExpression)
	p.registerPrefix(token.FUNCTION, p.parseFunctionLiteral)
	p.registerPrefix(token.LPAREN, p.parseGroupedExpression)
	p.registerPrefix(token.STR, p.parseStringLiteral)
	p.registerPrefix(token.LBRACKET, p.parseArrayLiteral)
	p.registerPrefix(token.LBRACE, p.parseHashLiteral)
	p.registerPrefix(token.LPAREN, p.parseTuple)
	p.registerPrefix(token.NULL, p.parseNull)

	p.infixParseFns = make(map[token.TokenType]infixParseFn)
	p.registerInfix(token.PLUS, p.parseInfixExpression)
	p.registerInfix(token.MODULOS, p.parseInfixExpression)
	p.registerInfix(token.POWER, p.parseInfixExpression)
	p.registerInfix(token.MINUS, p.parseInfixExpression)
	p.registerInfix(token.SLASH, p.parseInfixExpression)
	p.registerInfix(token.ASTERISK, p.parseInfixExpression)
	p.registerInfix(token.CONCAT, p.parseInfixExpression)
	p.registerInfix(token.AND, p.parseInfixExpression)
	p.registerInfix(token.OR, p.parseInfixExpression)
	p.registerInfix(token.EQ, p.parseInfixExpression)
	p.registerInfix(token.NOT_EQ, p.parseInfixExpression)
	p.registerInfix(token.LT, p.parseInfixExpression)
	p.registerInfix(token.GT, p.parseInfixExpression)
	p.registerInfix(token.LTE, p.parseInfixExpression)
	p.registerInfix(token.GTE, p.parseInfixExpression)
	p.registerInfix(token.LPAREN, p.parseCallExpression)
	p.registerInfix(token.LBRACKET, p.parseIndexExpression)
	p.registerInfix(token.DOT, p.parseMethodCall)
	p.registerInfix(token.PIPE, p.parsePipeExpression)
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

func (p *Parser) addError(errorType, message string) {
	p.errors = append(p.errors, ParseError{
		Type:    errorType,
		Message: message,
		Line:    p.curToken.Line,
		Column:  p.curToken.Column,
		Token:   p.curToken,
	})
}

func (p *Parser) peekError(expected token.TokenType) {
	message := fmt.Sprintf("Expected '%s', got '%s'", expected, p.peekToken.Literal)
	p.addError("SyntaxError", message)
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
		)
		return nil
	}
	lit.Value = value
	return lit
}

func (p *Parser) parseFloatLiteral() ast.Expression {
	lit := &ast.FloatLiteral{}
	value, err := strconv.ParseFloat(p.curToken.Literal, 64)
	if err != nil {
		p.addError(
			"ValueError",
			fmt.Sprintf("Cannot parse '%s' as float", p.curToken.Literal),
		)
		return nil
	}
	lit.Value = value
	return lit
}

func (p *Parser) parseStatement() ast.Statement {
	switch p.curToken.Type {
	case token.LET, token.CONST:
		return p.parseVarStatement()
	case token.RETURN:
		return p.parseReturnStatement()
	case token.IDENT:
		if p.peekTokenIs(token.ASSIGN) || p.peekTokenIs(token.LBRACKET) {
			return p.parseAssignmentStatement()
		}
		return p.parseExpressionStatement()
	case token.FOR:
		return p.parseForStatement()
	case token.WHILE:
		return p.parseWhileStatement()
	case token.CONTINUE:
		return p.parseContinueStatement()
	case token.BREAK:
		return p.parseBreakStatement()
	case token.AT:
		return p.parseAtExpression()
	case token.SWITCH:
		return p.parseSwitchStatement()
	case token.ERROR:
		return p.parseErrorStatement()
	case token.CATCH:
		return p.parseCatchStatement()
	default:
		return p.parseExpressionStatement()
	}
}

func (p *Parser) parseErrorStatement() ast.Statement {
	stmt := &ast.ErrorStatement{Token: p.curToken}
	p.nextToken()
	stmt.Value = p.parseExpression(LOWEST)
	return stmt
}

func (p *Parser) parseCatchStatement() ast.Statement {
	stmt := &ast.CatchStatement{Token: p.curToken}

	if !p.expectPeek(token.LBRACE) {
		p.addError(
			"SyntaxError",
			"Missing opening brace",
		)
		return nil
	}

	stmt.Body = p.parseBlockStatement()

	if p.peekTokenIs(token.ON) {
		p.nextToken()

		if !p.expectPeek(token.IDENT) {
			p.addError("SyntaxError", "Expected identifier after 'on'")
			return nil
		}
		stmt.ErrorVar = &ast.Identifier{
			Token: p.curToken,
			Value: p.curToken.Literal,
		}

		if !p.expectPeek(token.LBRACE) {
			p.addError("SyntaxError", "Missing opening brace for 'on' block")
			return nil
		}
		stmt.OnBody = p.parseBlockStatement()
	}

	return stmt
}

func (p *Parser) parseSwitchStatement() ast.Statement {
	switchStmt := &ast.SwitchStatement{Token: p.curToken}
	p.nextToken()
	switchStmt.Expression = p.parseExpression(LOWEST)
	if !p.expectPeek(token.LBRACE) {
		p.addError(
			"SyntaxError",
			"Missing opening brace",
		)
		return nil
	}

	switchStmt.Cases = p.parseCases()

	if !p.expectPeek(token.RBRACE) {
		p.addError(
			"SyntaxError",
			"Missing closing brace",
		)
		return nil
	}

	return switchStmt
}

func (p *Parser) parseCases() []*ast.Case {
	cases := []*ast.Case{}

	for !p.peekTokenIs(token.RBRACE) && !p.peekTokenIs(token.EOF) {
		if p.peekTokenIs(token.CASE) {
			p.nextToken()
			caseStmt := p.parseCase()
			if caseStmt != nil {
				cases = append(cases, caseStmt)
			}
		} else if p.peekTokenIs(token.DEFAULT) {
			p.nextToken()
			defaultCase := p.parseDefaultCase()
			if defaultCase != nil {
				cases = append(cases, defaultCase)
			}
		} else {
			p.addError(
				"SyntaxError",
				fmt.Sprintf("Expected 'case' or 'default', got %s", p.peekToken.Type),
			)
			return cases
		}
	}

	return cases
}

func (p *Parser) parseCase() *ast.Case {
	caseToken := p.curToken
	p.nextToken()

	caseValue := p.parseExpression(LOWEST)
	if caseValue == nil {
		p.addError(
			"SyntaxError",
			"Expected case value",
		)
		return nil
	}

	if !p.expectPeek(token.COLON) {
		p.addError(
			"SyntaxError",
			"Expected ':' after case value",
		)
		return nil
	}

	var caseBody *ast.BlockStatement

	if p.peekTokenIs(token.LBRACE) {
		p.nextToken()
		caseBody = p.parseBlockStatement()
	} else {
		p.nextToken()
		stmt := p.parseStatement()
		if stmt != nil {
			caseBody = &ast.BlockStatement{
				Token:      p.curToken,
				Statements: []ast.Statement{stmt},
			}
		}
	}

	return &ast.Case{
		Token: caseToken,
		Value: caseValue,
		Body:  caseBody,
	}
}

func (p *Parser) parseDefaultCase() *ast.Case {
	caseToken := p.curToken

	if !p.expectPeek(token.COLON) {
		p.addError(
			"SyntaxError",
			"Expected ':' after default",
		)
		return nil
	}

	var caseBody *ast.BlockStatement

	if p.peekTokenIs(token.LBRACE) {
		p.nextToken()
		caseBody = p.parseBlockStatement()
	} else {
		p.nextToken()
		stmt := p.parseStatement()
		if stmt != nil {
			caseBody = &ast.BlockStatement{
				Token:      p.curToken,
				Statements: []ast.Statement{stmt},
			}
		}
	}

	return &ast.Case{
		Token: caseToken,
		Value: nil,
		Body:  caseBody,
	}
}

func (p *Parser) parseAtExpression() ast.Statement {
	stmt := &ast.ModuleLoad{Token: p.curToken}
	p.nextToken()

	stmt.Name = p.parseIdentifier()

	if p.peekTokenIs(token.LPAREN) {
		p.nextToken()
		stmt.Members = p.parseIdentifierList()
		if !p.expectPeek(token.RPAREN) {
			p.addError(
				"SyntaxError",
				"Missing closing parenthesis",
			)
			return nil
		}
	}
	return stmt
}

func (p *Parser) parseIdentifierList() []*ast.Identifier {
	identifiers := []*ast.Identifier{}

	if p.peekTokenIs(token.RPAREN) {
		p.nextToken()
		return identifiers
	}

	p.nextToken()
	identifiers = append(identifiers, &ast.Identifier{Token: p.curToken, Value: p.curToken.Literal})

	for p.peekTokenIs(token.COMMA) {
		p.nextToken()
		p.nextToken()
		identifiers = append(identifiers, &ast.Identifier{Token: p.curToken, Value: p.curToken.Literal})
	}

	return identifiers
}

func (p *Parser) parseContinueStatement() ast.Statement {
	if p.loopDepth == 0 {
		p.addError(
			"ScopeError",
			"'continue' statement outside of loop",
		)
	}
	stmt := &ast.Continue{Token: p.curToken}
	return stmt
}

func (p *Parser) parseBreakStatement() ast.Statement {
	if p.loopDepth == 0 {
		p.addError(
			"ScopeError",
			"'break' statement outside of loop",
		)
	}
	stmt := &ast.Break{Token: p.curToken}
	return stmt
}

func (p *Parser) parseForStatement() ast.Statement {
	p.loopDepth++
	defer func() { p.loopDepth-- }()
	stmt := &ast.ForRange{
		Token: p.curToken,
	}
	if !p.expectPeek(token.IDENT) {
		p.addError(
			"SyntaxError",
			"Missing identifier in for loop",
		)
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
			p.addError(
				"SyntaxError",
				"Missing identifier in for loop",
			)
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
		)
		return nil
	}
	p.nextToken()
	stmt.Collection = p.parseExpression(LOWEST)
	if !p.expectPeek(token.LBRACE) {
		p.addError(
			"SyntaxError",
			"Missing block statement in for loop",
		)
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
		p.addError(
			"SyntaxError",
			"Missing block statement in while loop",
		)
		return nil
	}
	stmt.Body = p.parseBlockStatement()
	return stmt
}

func (p *Parser) parseAssignmentStatement() *ast.Assignment {
	stmt := &ast.Assignment{Token: p.curToken}

	lhs := p.parseExpression(LOWEST)

	if !isAssignable(lhs) {
		p.addError("SyntaxError", "Invalid left-hand side in assignment")
		return nil
	}

	if !p.expectPeek(token.ASSIGN) {
		p.addError("SyntaxError", "Missing assignment operator")
		return nil
	}

	p.nextToken()
	stmt.Name = lhs
	stmt.Value = p.parseExpression(LOWEST)

	return stmt
}

func (p *Parser) parseVarStatement() *ast.VarStatement {
	stmt := &ast.VarStatement{Token: p.curToken}

	if p.curToken.Type == token.CONST {
		stmt.IsConst = true
		p.nextToken()
	} else {
		p.nextToken()
	}

	stmt.Name = &ast.Identifier{Token: p.curToken, Value: p.curToken.Literal}

	if !p.expectPeek(token.ASSIGN) {
		p.addError(
			"SyntaxError",
			"Missing assignment operator",
		)
		return nil
	}

	p.nextToken()
	stmt.Value = p.parseExpression(LOWEST)

	return stmt
}

func (p *Parser) parseReturnStatement() *ast.ReturnStatement {
	if p.functionDepth == 0 {
		p.addError(
			"ScopeError",
			"'return' statement outside of function",
		)
	}
	stmt := &ast.ReturnStatement{Token: p.curToken}
	p.nextToken()
	stmt.Value = p.parseExpression(LOWEST)
	return stmt
}

func (p *Parser) parseExpressionStatement() *ast.ExpressionStatement {
	stmt := &ast.ExpressionStatement{Token: p.curToken}
	stmt.Expression = p.parseExpression(LOWEST)
	return stmt
}

func (p *Parser) noPrefixParseFnError(t token.TokenType) {
	message := fmt.Sprintf("Unexpected token %s", t)
	if p.curToken.Literal != "" && p.curToken.Literal != string(t) {
		message += fmt.Sprintf("%s", p.curToken.Literal)
	}
	p.addError("SyntaxError", message)
}

func (p *Parser) parseExpression(precedence int) ast.Expression {
	prefix := p.prefixParseFns[p.curToken.Type]
	if prefix == nil {
		p.noPrefixParseFnError(p.curToken.Type)
		return nil
	}
	leftExp := prefix()
	for precedence < p.peekPrecedence() {
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
		p.addError(
			"SyntaxError",
			"Missing closing parenthesis",
		)
		return nil
	}
	return exp
}

func (p *Parser) parseIfExpression() ast.Expression {
	expression := &ast.IfExpression{Token: p.curToken}
	p.nextToken()
	expression.Condition = p.parseExpression(LOWEST)
	if !p.expectPeek(token.LBRACE) {
		p.addError(
			"SyntaxError",
			"Missing opening brace",
		)
		return nil
	}
	expression.Consequence = p.parseBlockStatement()
	if p.peekTokenIs(token.ELSE) {
		p.nextToken()
		if !p.expectPeek(token.LBRACE) {
			p.addError(
				"SyntaxError",
				"Missing opening brace",
			)
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
		p.addError(
			"SyntaxError",
			"Missing opening parenthesis",
		)
		return nil
	}
	lit.Parameters = p.parseFunctionParameters()
	if !p.expectPeek(token.LBRACE) {
		p.addError(
			"SyntaxError",
			"Missing opening brace",
		)
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
		p.addError(
			"SyntaxError",
			"Missing closing parenthesis",
		)
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
		p.addError(
			"SyntaxError",
			"Missing closing parenthesis",
		)
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
		p.addError(
			"SyntaxError",
			"Missing closing bracket",
		)
		return nil
	}
	return list
}

func (p *Parser) parseIndexExpression(left ast.Expression) ast.Expression {
	exp := &ast.IndexExpression{Token: p.curToken, Left: left}
	p.nextToken()
	exp.Index = p.parseExpression(LOWEST)
	if !p.expectPeek(token.RBRACKET) {
		p.addError(
			"SyntaxError",
			"Missing closing bracket",
		)
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
			)
			return nil
		}
		p.nextToken()
		value := p.parseExpression(LOWEST)
		hash.Pairs[key] = value
		if !p.peekTokenIs(token.RBRACE) && !p.expectPeek(token.COMMA) {
			p.addError(
				"SyntaxError",
				"Missing comma ',' in hash literal",
			)
			return nil
		}
	}
	if !p.expectPeek(token.RBRACE) {
		p.addError(
			"SyntaxError",
			"Missing closing brace",
		)
		return nil
	}
	return hash
}

func (p *Parser) parseMethodCall(object ast.Expression) ast.Expression {
	if !p.expectPeek(token.IDENT) {
		p.addError(
			"SyntaxError",
			"Expected method or property name after '.'",
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

func (p *Parser) parsePipeExpression(left ast.Expression) ast.Expression {
	exp := &ast.PipeExpression{Token: p.curToken, Left: left}
	p.nextToken()
	exp.Right = p.parseExpression(LOWEST)

	return exp
}

func (p *Parser) parseTuple() ast.Expression {
	exp := &ast.Tuple{Token: p.curToken}
	exp.Elements = p.parseExpressionList(token.RPAREN)
	return exp
}

func (p *Parser) parseNull() ast.Expression {
	return &ast.Null{Token: p.curToken}
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

func isAssignable(expr ast.Expression) bool {
	switch expr.(type) {
	case *ast.Identifier, *ast.IndexExpression, *ast.PropertyAccess:
		return true
	default:
		return false
	}
}
