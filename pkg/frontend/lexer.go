package frontend

import (
	"fmt"
	"strings"
	"unicode"
)

type Lexer struct {
	input       []rune
	pos         int
	currentChar rune
	line        int
	column      int
}

func NewLexer(input string) *Lexer {
	runes := []rune(input)
	currentChar := '\000'
	if len(runes) > 0 {
		currentChar = runes[0]
	}

	return &Lexer{
		input:       runes,
		pos:         0,
		currentChar: currentChar,
		line:        1,
		column:      1,
	}
}

func (l *Lexer) advance() {
	if l.currentChar == '\n' {
		l.line++
		l.column = 1
	} else {
		l.column++
	}

	l.pos++
	if l.pos >= len(l.input) {
		l.currentChar = '\000'
	} else {
		l.currentChar = l.input[l.pos]
	}
}

func (l *Lexer) peek() rune {
	if l.pos+1 >= len(l.input) {
		return '\000'
	}
	return l.input[l.pos+1]
}

func (l *Lexer) skipWhitespace() {
	for unicode.IsSpace(l.currentChar) {
		l.advance()
	}
}

func (l *Lexer) readNumber() string {
	start := l.pos
	for unicode.IsDigit(l.currentChar) || l.currentChar == '.' {
		l.advance()
	}
	return string(l.input[start:l.pos])
}

func (l *Lexer) readIdentifier() string {
	start := l.pos
	for unicode.IsLetter(l.currentChar) || unicode.IsDigit(l.currentChar) || l.currentChar == '_' {
		l.advance()
	}
	return string(l.input[start:l.pos])
}

func (l *Lexer) readString() (string, error) {
	startLine := l.line
	startColumn := l.column
	l.advance()

	start := l.pos
	for l.currentChar != '"' && l.currentChar != '\000' {
		if l.currentChar == '\\' {
			l.advance()
			if l.currentChar != '\000' {
				l.advance()
			}
		} else {
			l.advance()
		}
	}

	if l.currentChar == '\000' {
		return "", fmt.Errorf("unterminated string literal starting at line %d, column %d", startLine, startColumn)
	}

	result := string(l.input[start:l.pos])
	l.advance()
	return result, nil
}

func (l *Lexer) skipComment() {
	for l.currentChar != '\n' && l.currentChar != '\000' {
		l.advance()
	}
	if l.currentChar == '\n' {
		l.advance()
	}
}

func (l *Lexer) readRangeOrDots() Token {
	line := l.line
	column := l.column

	if l.peek() == '.' {
		l.advance()
		if l.pos+1 < len(l.input) && l.input[l.pos+1] == '=' {
			l.advance()
			l.advance()
			return NewToken(RangeInclusive, "..=", line, column)
		} else {
			l.advance()
			return NewToken(Range, "..", line, column)
		}
	} else {
		l.advance()
		return NewToken(Dot, ".", line, column)
	}
}

func (l *Lexer) NextToken() (Token, error) {
	l.skipWhitespace()

	line := l.line
	column := l.column

	switch l.currentChar {
	case '\000':
		return NewToken(Eof, "", line, column), nil
	case '+':
		l.advance()
		return NewToken(Plus, "+", line, column), nil
	case '*':
		l.advance()
		return NewToken(Star, "*", line, column), nil
	case '/':
		l.advance()
		return NewToken(Slash, "/", line, column), nil
	case '%':
		l.advance()
		return NewToken(Percent, "%", line, column), nil
	case '.':
		return l.readRangeOrDots(), nil
	case '(':
		l.advance()
		return NewToken(LeftParen, "(", line, column), nil
	case ')':
		l.advance()
		return NewToken(RightParen, ")", line, column), nil
	case '{':
		l.advance()
		return NewToken(LeftBrace, "{", line, column), nil
	case '}':
		l.advance()
		return NewToken(RightBrace, "}", line, column), nil
	case '[':
		l.advance()
		return NewToken(LeftBracket, "[", line, column), nil
	case ']':
		l.advance()
		return NewToken(RightBracket, "]", line, column), nil
	case ';':
		l.advance()
		return NewToken(Semicolon, ";", line, column), nil
	case ',':
		l.advance()
		return NewToken(Comma, ",", line, column), nil
	case ':':
		if l.peek() == ':' {
			l.advance()
			l.advance()
			return NewToken(DoubleColon, "::", line, column), nil
		} else {
			l.advance()
			return NewToken(Colon, ":", line, column), nil
		}
	case '-':
		if l.peek() == '>' {
			l.advance()
			l.advance()
			return NewToken(Arrow, "->", line, column), nil
		} else {
			l.advance()
			return NewToken(Minus, "-", line, column), nil
		}
	case '#':
		l.skipComment()
		return l.NextToken()
	case '<':
		if l.peek() == '=' {
			l.advance()
			l.advance()
			return NewToken(LessEqual, "<=", line, column), nil
		} else {
			l.advance()
			return NewToken(Less, "<", line, column), nil
		}
	case '>':
		if l.peek() == '=' {
			l.advance()
			l.advance()
			return NewToken(GreaterEqual, ">=", line, column), nil
		} else {
			l.advance()
			return NewToken(Greater, ">", line, column), nil
		}
	case '!':
		if l.peek() == '=' {
			l.advance()
			l.advance()
			return NewToken(NotEqual, "!=", line, column), nil
		} else {
			l.advance()
			return NewToken(Bang, "!", line, column), nil
		}
	case '=':
		if l.peek() == '=' {
			l.advance()
			l.advance()
			return NewToken(EqualEqual, "==", line, column), nil
		} else {
			l.advance()
			return NewToken(Equals, "=", line, column), nil
		}
	case '&':
		if l.peek() == '&' {
			l.advance()
			l.advance()
			return NewToken(And, "&&", line, column), nil
		} else {
			l.advance()
			return Token{}, fmt.Errorf("unexpected character '&' at line %d, column %d", line, column)
		}
	case '|':
		if l.peek() == '|' {
			l.advance()
			l.advance()
			return NewToken(Or, "||", line, column), nil
		} else {
			l.advance()
			return Token{}, fmt.Errorf("unexpected character '|' at line %d, column %d", line, column)
		}
	case '"':
		value, err := l.readString()
		if err != nil {
			return Token{}, err
		}
		return NewToken(String, value, line, column), nil
	default:
		if unicode.IsDigit(l.currentChar) {
			value := l.readNumber()
			if strings.Count(value, ".") > 1 {
				return Token{}, fmt.Errorf("invalid number format '%s' at line %d, column %d", value, line, column)
			}
			return NewToken(Number, value, line, column), nil
		} else if unicode.IsLetter(l.currentChar) || l.currentChar == '_' {
			value := l.readIdentifier()
			tokenType, _ := IsKeyword(value)
			return NewToken(tokenType, value, line, column), nil
		} else {
			char := l.currentChar
			l.advance()
			return Token{}, fmt.Errorf("unexpected character '%c' at line %d, column %d", char, line, column)
		}
	}
}

func (l *Lexer) Tokenize() ([]Token, error) {
	var tokens []Token

	for {
		token, err := l.NextToken()
		if err != nil {
			return nil, err
		}

		isEof := token.Kind == Eof
		tokens = append(tokens, token)

		if isEof {
			break
		}
	}

	return tokens, nil
}
