package repl

import (
	"bufio"
	"fmt"
	"io"

	"lynx/pkg/evaluator"
	"lynx/pkg/lexer"
	"lynx/pkg/object"
	"lynx/pkg/parser"
)

const PROMPT = ">> "

func Start(in io.Reader, out io.Writer) {
	scanner := bufio.NewScanner(in)
	env := object.New("")
	for {
		fmt.Print(PROMPT)
		scanned := scanner.Scan()
		if !scanned {
			return
		}
		line := scanner.Text()
		l := lexer.New(line)
		p := parser.New(l)

		program := p.ParseProgram()
		if len(p.Errors()) != 0 {
			printParserErrors(out, p.Errors())
			continue
		}

		evaluated := evaluator.Eval(program, env)
		if evaluated != nil {
			io.WriteString(out, evaluated.Inspect())
			io.WriteString(out, "\n")
		}
	}
}

func printParserErrors(out io.Writer, errors []parser.ParseError) {
	for _, msg := range errors {
		io.WriteString(out, "\t"+msg.String()+"\n")
	}
}
