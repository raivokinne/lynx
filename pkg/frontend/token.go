package frontend

import "fmt"

type TokenType int

const (
	// Literals
	Number TokenType = iota
	String
	Identifier
	True
	False
	Null

	// Operators
	Plus
	Minus
	Star
	Slash
	Percent
	Dot
	Arrow
	Equals
	Greater
	GreaterEqual
	Less
	LessEqual
	EqualEqual
	NotEqual
	DoubleColon

	// Range operators
	Range
	RangeInclusive

	// Delimiters
	LeftParen
	RightParen
	LeftBrace
	RightBrace
	LeftBracket
	RightBracket
	Semicolon
	Comma
	Colon
	Bang
	And
	Or

	// Keywords
	Let
	Const
	Function
	Return
	If
	Else
	For
	In
	While
	Break
	Continue
	Case
	Default
	Class
	Match
	Static
	Pub

	// Special
	Comment
	Eof
)

type Token struct {
	Kind   TokenType
	Lexeme string
	Line   int
	Column int
}

func NewToken(kind TokenType, lexeme string, line, column int) Token {
	return Token{
		Kind:   kind,
		Lexeme: lexeme,
		Line:   line,
		Column: column,
	}
}

func (t Token) String() string {
	return fmt.Sprintf("%s('%s') at %d:%d", t.Kind, t.Lexeme, t.Line, t.Column)
}

func (tt TokenType) String() string {
	switch tt {
	case Number:
		return "number"
	case String:
		return "string"
	case Identifier:
		return "identifier"
	case True:
		return "true"
	case False:
		return "false"
	case Null:
		return "null"
	case Plus:
		return "+"
	case Minus:
		return "-"
	case Star:
		return "*"
	case Slash:
		return "/"
	case Percent:
		return "%"
	case Dot:
		return "."
	case Arrow:
		return "->"
	case Equals:
		return "="
	case Greater:
		return ">"
	case GreaterEqual:
		return ">="
	case Less:
		return "<"
	case LessEqual:
		return "<="
	case EqualEqual:
		return "=="
	case NotEqual:
		return "!="
	case Range:
		return ".."
	case RangeInclusive:
		return "..="
	case LeftParen:
		return "("
	case RightParen:
		return ")"
	case LeftBrace:
		return "{"
	case RightBrace:
		return "}"
	case LeftBracket:
		return "["
	case RightBracket:
		return "]"
	case Semicolon:
		return ";"
	case Comma:
		return ","
	case Colon:
		return ":"
	case Bang:
		return "!"
	case And:
		return "&&"
	case Or:
		return "||"
	case Let:
		return "let"
	case Const:
		return "const"
	case Function:
		return "fn"
	case Return:
		return "return"
	case If:
		return "if"
	case Else:
		return "else"
	case For:
		return "for"
	case In:
		return "in"
	case While:
		return "while"
	case Break:
		return "break"
	case Continue:
		return "continue"
	case Case:
		return "case"
	case Default:
		return "default"
	case Match:
		return "match"
	case Class:
		return "class"
	case Static:
		return "static"
	case Pub:
		return "pub"
	case DoubleColon:
		return "::"
	case Comment:
		return "comment"
	case Eof:
		return "end of file"
	default:
		return "unknown"
	}
}

func IsKeyword(lexeme string) (TokenType, bool) {
	keywords := map[string]TokenType{
		"let":      Let,
		"const":    Const,
		"fn":       Function,
		"return":   Return,
		"if":       If,
		"else":     Else,
		"for":      For,
		"in":       In,
		"while":    While,
		"break":    Break,
		"continue": Continue,
		"case":     Case,
		"default":  Default,
		"match":    Match,
		"class":    Class,
		"static":   Static,
		"pub":      Pub,
		"true":     True,
		"false":    False,
		"null":     Null,
	}

	if tokenType, exists := keywords[lexeme]; exists {
		return tokenType, true
	}
	return Identifier, false
}
