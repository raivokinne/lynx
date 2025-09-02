package main

import (
	"fmt"
	"lynx/pkg/evaluator"
	"lynx/pkg/lexer"
	"lynx/pkg/object"
	"lynx/pkg/parser"
	"lynx/pkg/repl"
	"os"
	"os/user"
)

func main() {
	args := os.Args[1:]

	if len(args) == 0 {
		user, err := user.Current()
		if err != nil {
			panic(err)
		}
		fmt.Printf("Hello %s! This is the Lynx programming language!\n", user.Username)
		fmt.Printf("Feel free to type in commands\n")
		repl.Start(os.Stdin, os.Stdout)
	} else {
		filename := args[0]
		executeFile(filename)
	}
}

func executeFile(filename string) {
	input, err := os.ReadFile(filename)
	if err != nil {
		fmt.Printf("Error reading file: %v\n", err)
		os.Exit(1)
	}

	l := lexer.New(string(input))
	p := parser.New(l)
	program := p.ParseProgram()

	if len(p.Errors()) > 0 {
		for _, err := range p.Errors() {
			fmt.Printf("Parser error: %s\n", err)
		}
		os.Exit(1)
	}

	env := object.New()
	result := evaluator.Eval(program, env)

	if result.Type() == object.ERROR_OBJ {
		fmt.Printf("Error: %s\n", result.(*object.Error).Message)
		os.Exit(1)
	}
}
