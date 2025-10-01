package lexer

import (
	"fmt"
	"lynx/pkg/token"
	"unicode"
	"unicode/utf8"
)

type Position struct {
	Line   int
	Column int
	Offset int
}

type LexError struct {
	Position Position
	Message  string
	Context  string
}

func (le LexError) String() string {
	return fmt.Sprintf("Lexer error at line %d, column %d: %s",
		le.Position.Line, le.Position.Column, le.Message)
}

type Lexer struct {
	input        string
	position     int
	readPosition int
	ch           rune
	line         int
	column       int
	errors       []LexError
}

func New(input string) *Lexer {
	l := &Lexer{
		input:  input,
		line:   1,
		column: 0,
		errors: []LexError{},
	}
	l.readChar()
	return l
}

func (l *Lexer) Errors() []LexError {
	return l.errors
}

func (l *Lexer) ErrorStrings() []string {
	var strs []string
	for _, err := range l.errors {
		strs = append(strs, err.String())
	}
	return strs
}

func (l *Lexer) addError(message, context string) {
	l.errors = append(l.errors, LexError{
		Position: Position{
			Line:   l.line,
			Column: l.column,
			Offset: l.position,
		},
		Message: message,
		Context: context,
	})
}

func (l *Lexer) readChar() {
	if l.readPosition >= len(l.input) {
		l.ch = 0
		l.position = l.readPosition
	} else {
		r, size := utf8.DecodeRuneInString(l.input[l.readPosition:])
		if r == utf8.RuneError && size == 1 {
			l.addError(
				"Invalid UTF-8 encoding",
				fmt.Sprintf("at byte position %d", l.readPosition),
			)
			l.ch = '�'
		} else {
			l.ch = r
		}
		l.position = l.readPosition
		l.readPosition += size
	}

	if l.ch == '\n' {
		l.line++
		l.column = 0
	} else {
		l.column++
	}
}

func (l *Lexer) NextToken() token.Token {
	var tok token.Token

	l.skipWhitespace()

	currentLine := l.line
	currentColumn := l.column

	switch l.ch {
	case '=':
		if l.peekChar() == '=' {
			ch := l.ch
			l.readChar()
			tok = token.Token{
				Type:    token.EQ,
				Literal: string(ch) + string(l.ch),
				Line:    currentLine,
				Column:  currentColumn,
			}
		} else {
			tok = l.newToken(token.ASSIGN, l.ch)
		}
	case '%':
		tok = l.newToken(token.MODULOS, l.ch)
	case '(':
		tok = l.newToken(token.LPAREN, l.ch)
	case ')':
		tok = l.newToken(token.RPAREN, l.ch)
	case ',':
		tok = l.newToken(token.COMMA, l.ch)
	case '|':
		if l.peekChar() == '>' {
			ch := l.ch
			l.readChar()
			tok = token.Token{
				Type:    token.PIPE,
				Literal: string(ch) + string(l.ch),
				Line:    currentLine,
				Column:  currentColumn,
			}
		} else {
			tok = l.newToken(token.OR, l.ch)
		}
	case '$':
		tok = l.newToken(token.SQUARE, l.ch)
	case '+':
		if l.peekChar() == '+' {
			ch := l.ch
			l.readChar()
			tok = token.Token{
				Type:    token.CONCAT,
				Literal: string(ch) + string(l.ch),
				Line:    currentLine,
				Column:  currentColumn,
			}
		} else {
			tok = l.newToken(token.PLUS, l.ch)
		}
	case '-':
		tok = l.newToken(token.MINUS, l.ch)
	case '!':
		if l.peekChar() == '=' {
			ch := l.ch
			l.readChar()
			tok = token.Token{
				Type:    token.NOT_EQ,
				Literal: string(ch) + string(l.ch),
				Line:    currentLine,
				Column:  currentColumn,
			}
		} else {
			tok = l.newToken(token.BANG, l.ch)
		}
	case '@':
		tok = l.newToken(token.AT, l.ch)
	case '*':
		tok = l.newToken(token.ASTERISK, l.ch)
	case '^':
		tok = l.newToken(token.POWER, l.ch)
	case '/':
		if l.peekChar() == '/' {
			l.skipLineComment()
			return l.NextToken()
		} else if l.peekChar() == '*' {
			l.skipBlockComment()
			return l.NextToken()
		} else {
			tok = l.newToken(token.SLASH, l.ch)
		}
	case '<':
		if l.peekChar() == '=' {
			ch := l.ch
			l.readChar()
			tok = token.Token{
				Type:    token.LTE,
				Literal: string(ch) + string(l.ch),
				Line:    currentLine,
				Column:  currentColumn,
			}
		} else {
			tok = l.newToken(token.LT, l.ch)
		}
	case '>':
		if l.peekChar() == '=' {
			ch := l.ch
			l.readChar()
			tok = token.Token{
				Type:    token.GTE,
				Literal: string(ch) + string(l.ch),
				Line:    currentLine,
				Column:  currentColumn,
			}
		} else {
			tok = l.newToken(token.GT, l.ch)
		}
	case '{':
		tok = l.newToken(token.LBRACE, l.ch)
	case '}':
		tok = l.newToken(token.RBRACE, l.ch)
	case '[':
		tok = l.newToken(token.LBRACKET, l.ch)
	case ']':
		tok = l.newToken(token.RBRACKET, l.ch)
	case ':':
		tok = l.newToken(token.COLON, l.ch)
	case '.':
		if l.isDigit(l.peekChar()) {
			tok.Type = token.FLOAT
			tok.Literal = l.readFloatNumber()
			tok.Line = currentLine
			tok.Column = currentColumn
			return tok
		} else if l.peekChar() == '.' {
			if l.peekChar() == '.' {
				l.readChar()
				tok.Type = token.SPREAD
				tok.Literal = "..."
				tok.Line = currentLine
				tok.Column = currentColumn
				return tok
			}
		} else {
			tok = l.newToken(token.DOT, l.ch)
		}
	case '"':
		tok.Type = token.STR
		tok.Literal = l.readString()
		tok.Line = currentLine
		tok.Column = currentColumn
		return tok
	case '\'':
		tok.Type = token.STR
		tok.Literal = l.readCharLiteral()
		tok.Line = currentLine
		tok.Column = currentColumn
		return tok
	case 0:
		tok.Literal = ""
		tok.Type = token.EOF
		tok.Line = currentLine
		tok.Column = currentColumn
	default:
		if l.isLetter(l.ch) {
			tok.Literal = l.readIdentifier()
			tok.Type = token.LookupIdent(tok.Literal)
			tok.Line = currentLine
			tok.Column = currentColumn
			return tok
		} else if l.isDigit(l.ch) {
			tok.Type = token.INT
			tok.Literal = l.readNumber()
			tok.Line = currentLine
			tok.Column = currentColumn

			if tok.Literal[len(tok.Literal)-1] == '.' ||
				(l.ch == '.' && l.isDigit(l.peekChar())) {
				tok.Type = token.FLOAT
				tok.Literal = l.readFloatFromInt(tok.Literal)
			}
			return tok
		} else {
			// fmt.Printf("DEBUG: ILLEGAL character '%c' (U+%04X) at line %d, column %d\n",
			// 	l.ch, l.ch, l.line, l.column)
			l.addError(
				fmt.Sprintf("Unexpected character '%c' (U+%04X)", l.ch, l.ch),
				"lexical analysis",
			)
			tok = l.newToken(token.ILLEGAL, l.ch)
		}
	}

	l.readChar()
	return tok
}

func (l *Lexer) newToken(tokenType token.TokenType, ch rune) token.Token {
	return token.Token{
		Type:    tokenType,
		Literal: string(ch),
		Line:    l.line,
		Column:  l.column,
	}
}

func (l *Lexer) isLetter(ch rune) bool {
	return unicode.IsLetter(ch) || ch == '_'
}

func (l *Lexer) isDigit(ch rune) bool {
	return unicode.IsDigit(ch)
}

func (l *Lexer) isAlphanumeric(ch rune) bool {
	return l.isLetter(ch) || l.isDigit(ch)
}

func (l *Lexer) readIdentifier() string {
	position := l.position
	for l.isAlphanumeric(l.ch) {
		l.readChar()
	}
	return l.input[position:l.position]
}

func (l *Lexer) readNumber() string {
	position := l.position
	for l.isDigit(l.ch) {
		l.readChar()
	}
	return l.input[position:l.position]
}

func (l *Lexer) readFloatNumber() string {
	position := l.position

	for l.isDigit(l.ch) {
		l.readChar()
	}

	if l.ch == '.' {
		l.readChar()
	}

	for l.isDigit(l.ch) {
		l.readChar()
	}

	return l.input[position:l.position]
}

func (l *Lexer) readFloatFromInt(intPart string) string {
	if l.ch == '.' {
		l.readChar()
		position := l.position
		for l.isDigit(l.ch) {
			l.readChar()
		}
		return intPart + "." + l.input[position:l.position]
	}
	return intPart
}

func (l *Lexer) skipWhitespace() {
	for unicode.IsSpace(l.ch) {
		l.readChar()
	}
}

func (l *Lexer) skipLineComment() {
	l.readChar()
	l.readChar()

	for l.ch != '\n' && l.ch != 0 {
		l.readChar()
	}
}

func (l *Lexer) skipBlockComment() {
	l.readChar()
	l.readChar()

	for {
		if l.ch == 0 {
			l.addError(
				"Unterminated block comment",
				"reached end of file while parsing block comment",
			)
			break
		}
		if l.peekChar() == '/' {
			l.readChar()
			l.readChar()
			break
		}
		l.readChar()
	}
}

func (l *Lexer) peekChar() rune {
	if l.readPosition >= len(l.input) {
		return 0
	} else {
		r, _ := utf8.DecodeRuneInString(l.input[l.readPosition:])
		return r
	}
}

func (l *Lexer) readString() string {
	position := l.position + 1
	for {
		l.readChar()
		if l.ch == '\\' {
			l.readChar()
			if l.ch == 0 {
				l.addError(
					"Unterminated string literal",
					"unexpected end of file in string",
				)
				break
			}
			continue
		}
		if l.ch == '"' || l.ch == 0 {
			break
		}
	}
	if l.ch == 0 {
		l.addError(
			"Unterminated string literal",
			"reached end of file without closing quote",
		)
	}
	result := l.processEscapeSequences(l.input[position:l.position])
	// result := l.input[position:l.position]
	if l.ch == '"' {
		l.readChar()
	}
	return result
}

func (l *Lexer) readCharLiteral() string {
	position := l.position + 1
	l.readChar()
	if l.ch == '\\' {
		l.readChar()
		if l.ch == 0 {
			l.addError(
				"Unterminated character literal",
				"unexpected end of file in character literal",
			)
			return ""
		}
	}
	if l.ch != '\'' {
		l.readChar()
	}
	if l.ch != '\'' {
		l.addError(
			"Unterminated character literal",
			"expected closing single quote",
		)
		return ""
	}
	result := l.processEscapeSequences(l.input[position:l.position])
	// result := l.input[position:l.position]
	l.readChar()
	return result
}

func (l *Lexer) processEscapeSequences(s string) string {
	result := make([]rune, 0, len(s))
	runes := []rune(s)

	for i := 0; i < len(runes); i++ {
		if runes[i] == '\\' && i+1 < len(runes) {
			next := runes[i+1]
			switch next {
			case 'n':
				result = append(result, '\n')
			case 't':
				result = append(result, '\t')
			case 'r':
				result = append(result, '\r')
			case '\\':
				result = append(result, '\\')
			case '"':
				result = append(result, '"')
			case '\'':
				result = append(result, '\'')
			case '0':
				result = append(result, '\000')
			default:
				result = append(result, runes[i], next)
			}
			i++
		} else {
			result = append(result, runes[i])
		}
	}
	return string(result)
}
