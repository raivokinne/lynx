package test

import (
	"lynx/pkg/lexer"
	"lynx/pkg/token"
	"testing"
)

func TestLexerBasicTokens(t *testing.T) {
	tests := []struct {
		input    string
		expected []token.Token
	}{
		{
			input: "=",
			expected: []token.Token{
				{Type: token.ASSIGN, Literal: "=", Line: 1, Column: 1},
			},
		},
		{
			input: "+",
			expected: []token.Token{
				{Type: token.PLUS, Literal: "+", Line: 1, Column: 1},
			},
		},
		{
			input: "-",
			expected: []token.Token{
				{Type: token.MINUS, Literal: "-", Line: 1, Column: 1},
			},
		},
		{
			input: "*",
			expected: []token.Token{
				{Type: token.ASTERISK, Literal: "*", Line: 1, Column: 1},
			},
		},
		{
			input: "/",
			expected: []token.Token{
				{Type: token.SLASH, Literal: "/", Line: 1, Column: 1},
			},
		},
		{
			input: "%",
			expected: []token.Token{
				{Type: token.MODULOS, Literal: "%", Line: 1, Column: 1},
			},
		},
		{
			input: "^",
			expected: []token.Token{
				{Type: token.POWER, Literal: "^", Line: 1, Column: 1},
			},
		},
		{
			input: "$",
			expected: []token.Token{
				{Type: token.SQUARE, Literal: "$", Line: 1, Column: 1},
			},
		},
		{
			input: "(",
			expected: []token.Token{
				{Type: token.LPAREN, Literal: "(", Line: 1, Column: 1},
			},
		},
		{
			input: ")",
			expected: []token.Token{
				{Type: token.RPAREN, Literal: ")", Line: 1, Column: 1},
			},
		},
		{
			input: "{",
			expected: []token.Token{
				{Type: token.LBRACE, Literal: "{", Line: 1, Column: 1},
			},
		},
		{
			input: "}",
			expected: []token.Token{
				{Type: token.RBRACE, Literal: "}", Line: 1, Column: 1},
			},
		},
		{
			input: "[",
			expected: []token.Token{
				{Type: token.LBRACKET, Literal: "[", Line: 1, Column: 1},
			},
		},
		{
			input: "]",
			expected: []token.Token{
				{Type: token.RBRACKET, Literal: "]", Line: 1, Column: 1},
			},
		},
		{
			input: ",",
			expected: []token.Token{
				{Type: token.COMMA, Literal: ",", Line: 1, Column: 1},
			},
		},
		{
			input: ":",
			expected: []token.Token{
				{Type: token.COLON, Literal: ":", Line: 1, Column: 1},
			},
		},
		{
			input: ".",
			expected: []token.Token{
				{Type: token.DOT, Literal: ".", Line: 1, Column: 1},
			},
		},
		{
			input: "!",
			expected: []token.Token{
				{Type: token.BANG, Literal: "!", Line: 1, Column: 1},
			},
		},
		{
			input: "<",
			expected: []token.Token{
				{Type: token.LT, Literal: "<", Line: 1, Column: 1},
			},
		},
		{
			input: ">",
			expected: []token.Token{
				{Type: token.GT, Literal: ">", Line: 1, Column: 1},
			},
		},
		{
			input: "@",
			expected: []token.Token{
				{Type: token.AT, Literal: "@", Line: 1, Column: 1},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.input, func(t *testing.T) {
			l := lexer.New(tt.input)
			tokens := collectTokens(l)

			if len(tokens) != len(tt.expected) {
				t.Fatalf("Expected %d tokens, got %d", len(tt.expected), len(tokens))
			}

			for i, exp := range tt.expected {
				if tokens[i].Type != exp.Type {
					t.Errorf("Token %d: expected type %s, got %s", i, exp.Type, tokens[i].Type)
				}
				if tokens[i].Literal != exp.Literal {
					t.Errorf("Token %d: expected literal %q, got %q", i, exp.Literal, tokens[i].Literal)
				}
			}
		})
	}
}

func TestLexerTwoCharTokens(t *testing.T) {
	tests := []struct {
		input    string
		expected []token.Token
	}{
		{
			input: "==",
			expected: []token.Token{
				{Type: token.EQ, Literal: "==", Line: 1, Column: 1},
			},
		},
		{
			input: "!=",
			expected: []token.Token{
				{Type: token.NOT_EQ, Literal: "!=", Line: 1, Column: 1},
			},
		},
		{
			input: "<=",
			expected: []token.Token{
				{Type: token.LTE, Literal: "<=", Line: 1, Column: 1},
			},
		},
		{
			input: ">=",
			expected: []token.Token{
				{Type: token.GTE, Literal: ">=", Line: 1, Column: 1},
			},
		},
		{
			input: "++",
			expected: []token.Token{
				{Type: token.CONCAT, Literal: "++", Line: 1, Column: 1},
			},
		},
		{
			input: "|>",
			expected: []token.Token{
				{Type: token.PIPE, Literal: "|>", Line: 1, Column: 1},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.input, func(t *testing.T) {
			l := lexer.New(tt.input)
			tokens := collectTokens(l)

			if len(tokens) != len(tt.expected) {
				t.Fatalf("Expected %d tokens, got %d", len(tt.expected), len(tokens))
			}

			for i, exp := range tt.expected {
				if tokens[i].Type != exp.Type {
					t.Errorf("Token %d: expected type %s, got %s", i, exp.Type, tokens[i].Type)
				}
				if tokens[i].Literal != exp.Literal {
					t.Errorf("Token %d: expected literal %q, got %q", i, exp.Literal, tokens[i].Literal)
				}
			}
		})
	}
}

func TestLexerIdentifiers(t *testing.T) {
	tests := []struct {
		input    string
		expected token.TokenType
	}{
		{"foo", token.IDENT},
		{"bar", token.IDENT},
		{"x", token.IDENT},
		{"_private", token.IDENT},
		{"abc123", token.IDENT},
		{"let", token.LET},
		{"const", token.CONST},
		{"fn", token.FUNCTION},
		{"if", token.IF},
		{"else", token.ELSE},
		{"return", token.RETURN},
		{"for", token.FOR},
		{"while", token.WHILE},
		{"in", token.IN},
		{"continue", token.CONTINUE},
		{"break", token.BREAK},
		{"and", token.AND},
		{"or", token.OR},
		{"switch", token.SWITCH},
		{"case", token.CASE},
		{"default", token.DEFAULT},
		{"on", token.ON},
		{"catch", token.CATCH},
		{"error", token.ERROR},
		{"true", token.TRUE},
		{"false", token.FALSE},
		{"null", token.NULL},
		{"class", token.CLASS},
		{"self", token.SELF},
	}

	for _, tt := range tests {
		t.Run(tt.input, func(t *testing.T) {
			l := lexer.New(tt.input)
			tok := l.NextToken()

			if tok.Type != tt.expected {
				t.Errorf("Expected type %s, got %s", tt.expected, tok.Type)
			}
			if tok.Literal != tt.input {
				t.Errorf("Expected literal %q, got %q", tt.input, tok.Literal)
			}
		})
	}
}

func TestLexerNumbers(t *testing.T) {
	tests := []struct {
		input    string
		expected token.TokenType
		partial  bool
	}{
		{"0", token.INT, false},
		{"123", token.INT, false},
		{"999999", token.INT, false},
		{"0.0", token.FLOAT, false},
		{"1.5", token.FLOAT, false},
		{"3.14159", token.FLOAT, false},
		{".5", token.FLOAT, true},
		{"5.", token.INT, true},
		{"1e10", token.INT, false},
		{"1.5e10", token.FLOAT, false},
		{"1E10", token.INT, false},
		{"1.5E10", token.FLOAT, false},
	}

	for _, tt := range tests {
		t.Run(tt.input, func(t *testing.T) {
			l := lexer.New(tt.input)
			tok := l.NextToken()

			if tok.Type != tt.expected {
				t.Errorf("Expected type %s, got %s", tt.expected, tok.Type)
			}
		})
	}
}

func TestLexerStrings(t *testing.T) {
	tests := []struct {
		input    string
		expected string
	}{
		{`""`, ""},
		{`"hello"`, "hello"},
		{`"hello world"`, "hello world"},
		{`"hello\nworld"`, "hello\nworld"},
		{`"hello\tworld"`, "hello\tworld"},
		{`"hello\\world"`, "hello\\world"},
		{`"hello\"world"`, "hello\"world"},
		{`''`, ""},
		{`'a'`, "a"},
		{`'\n'`, "\n"},
		{`'\t'`, "\t"},
	}

	for _, tt := range tests {
		t.Run(tt.input, func(t *testing.T) {
			l := lexer.New(tt.input)
			tok := l.NextToken()

			if tok.Type != token.STR {
				t.Errorf("Expected type %s, got %s", token.STR, tok.Type)
			}
			if tok.Literal != tt.expected {
				t.Errorf("Expected literal %q, got %q", tt.expected, tok.Literal)
			}
		})
	}
}

func TestLexerComments(t *testing.T) {
	tests := []struct {
		input   string
		addends int
	}{
		{"// comment\n", 0},
		{"let x = 1 // comment\n", 4},
		{"/* block comment */", 0},
		{"let x = 1 /* comment */", 4},
		{"/* multi\nline\ncomment */", 0},
		{"let x = 1 /* comment */\nlet y = 2", 8},
	}

	for _, tt := range tests {
		t.Run("", func(t *testing.T) {
			l := lexer.New(tt.input)
			tokens := collectTokens(l)

			if len(tokens) != tt.addends {
				t.Errorf("Expected %d tokens, got %d", tt.addends, len(tokens))
			}
		})
	}
}

// Testē pilnu programmas fragmentu
func TestLexerFullExpression(t *testing.T) {

	// Multi-line input — simulē reālu programmu
	input := `let x = 10
let y = 20
fn add(a, b) {
    return a + b
}
add(x, y)`

	// Inicializē lexer ar input tekstu
	l := lexer.New(input)

	// Savāc visus tokenus līdz EOF
	tokens := collectTokens(l)

	// Sagaidāmā tokenu secība (visi vienā listē, bez sadalīšanas)
	expected := []token.TokenType{
		token.LET, token.IDENT, token.ASSIGN, token.INT,
		token.LET, token.IDENT, token.ASSIGN, token.INT,
		token.FUNCTION, token.IDENT, token.LPAREN, token.IDENT, token.COMMA, token.IDENT, token.RPAREN, token.LBRACE,
		token.RETURN, token.IDENT, token.PLUS, token.IDENT,
		token.RBRACE,
		token.IDENT, token.LPAREN, token.IDENT, token.COMMA, token.IDENT, token.RPAREN,
	}

	// Pārbauda vai tokenu skaits sakrīt
	// Ja nesakrīt — lexer kaut kur "pazaudē" vai "izdomā" tokenus
	if len(tokens) != len(expected) {
		t.Fatalf("Expected %d tokens, got %d", len(expected), len(tokens))
	}

	// Salīdzina katru tokenu secībā
	for i, exp := range expected {

		// Pārbauda vai tokena tips sakrīt
		if tokens[i].Type != exp {
			t.Errorf(
				"Token %d: expected type %s, got %s",
				i,
				exp,
				tokens[i].Type,
			)
		}
	}
}

func TestLexerPositionTracking(t *testing.T) {
	input := "let x = 1\nlet y = 2\n"
	l := lexer.New(input)

	tok1 := l.NextToken()
	if tok1.Line != 1 || tok1.Column != 1 {
		t.Errorf("Expected line 1, column 1; got line %d, column %d", tok1.Line, tok1.Column)
	}

	_ = l.NextToken()
	_ = l.NextToken()
	_ = l.NextToken()

	tok2 := l.NextToken()
	if tok2.Line != 2 || tok2.Column != 1 {
		t.Errorf("Expected line 2, column 1; got line %d, column %d", tok2.Line, tok2.Column)
	}
}

func TestLexerErrors(t *testing.T) {
	tests := []struct {
		input    string
		errCount int
	}{
		{"@", 0},
		{`"unterminated`, 1},
		{"'unterminated", 1},
		{"/* unterminated", 1},
	}

	for _, tt := range tests {
		t.Run("", func(t *testing.T) {
			l := lexer.New(tt.input)
			collectTokens(l)
			errors := l.Errors()

			if len(errors) != tt.errCount {
				t.Errorf("Expected %d errors, got %d", tt.errCount, len(errors))
			}
		})
	}
}

func collectTokens(l *lexer.Lexer) []token.Token {
	var tokens []token.Token
	for {
		tok := l.NextToken()
		if tok.Type == token.EOF {
			break
		}
		tokens = append(tokens, tok)
	}
	return tokens
}
