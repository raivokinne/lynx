package token

type TokenType string

type Token struct {
	Type    TokenType
	Literal string
	Line    int
	Column  int
}

const (
	ILLEGAL = "ILLEGAL"
	EOF     = "EOF"

	// Identifiers + literals
	IDENT = "IDENT"  // add, foobar, x, y, ...
	INT   = "INT"    // 1343456
	FLOAT = "FLOAT"  // 3.14, .5, 1e-10
	STR   = "STRING" // "foobar"

	// Operators
	ASSIGN   = "="
	PLUS     = "+"
	MINUS    = "-"
	BANG     = "!"
	ASTERISK = "*"
	SLASH    = "/"
	MODULOS  = "%"
	POWER    = "^"

	LT  = "<"
	GT  = ">"
	LTE = "<="
	GTE = ">="

	PIPE = "|>"

	AND = "and"
	OR  = "or"

	CONCAT = "++"

	EQ     = "=="
	NOT_EQ = "!="

	// Delimiters
	COMMA     = ","
	COLON     = ":"

	LPAREN   = "("
	RPAREN   = ")"
	LBRACE   = "{"
	RBRACE   = "}"
	LBRACKET = "["
	RBRACKET = "]"

	DOT = "."

	// Keywords
	LET      = "LET"
	CONST    = "CONST"
	TRUE     = "TRUE"
	FALSE    = "FALSE"
	IF       = "IF"
	ELSE     = "ELSE"
	WHILE    = "WHILE"
	RETURN   = "RETURN"
	FOR      = "FOR"
	IN       = "IN"
	CONTINUE = "CONTINUE"
	BREAK    = "BREAK"
	FUNCTION = "FUNCTION"
	AT       = "@"
	SWITCH   = "SWITCH"
	CASE     = "CASE"
	DEFAULT  = "DEFAULT"
	ON       = "ON"
	CATCH    = "CATCH"
	ERROR    = "ERROR"
)

var keywords = map[string]TokenType{
	"fn":       FUNCTION,
	"let":      LET,
	"const":    CONST,
	"true":     TRUE,
	"false":    FALSE,
	"if":       IF,
	"else":     ELSE,
	"return":   RETURN,
	"for":      FOR,
	"while":    WHILE,
	"in":       IN,
	"continue": CONTINUE,
	"break":    BREAK,
	"and":      AND,
	"or":       OR,
	"switch":   SWITCH,
	"case":     CASE,
	"default":  DEFAULT,
	"on":       ON,
	"catch":    CATCH,
	"error":    ERROR,
}

func LookupIdent(ident string) TokenType {
	if tok, ok := keywords[ident]; ok {
		return tok
	}
	return IDENT
}
