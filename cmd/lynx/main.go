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
	"path/filepath"
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
		absPath, err := filepath.Abs(filename)
		if err != nil {
			fmt.Printf("Error getting absolute path: %v\n", err)
			os.Exit(1)
		}

		dir := filepath.Dir(absPath)
		executeFile(filename, dir)
	}
}

func executeFile(filename string, dir string) {
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

	env := object.New(dir)
	evaluator.RegisterBuiltins()
	result := evaluator.Eval(program, env)

	switch result := result.(type) {
	case *object.Error:
		fmt.Printf("Error: %s\n", result.Message)
		os.Exit(1)
	case *object.Return:
		fmt.Printf("%s\n", result.Value.Inspect())
	default:
		if result != evaluator.NULL && result.Type() != object.NULL_OBJ {
			fmt.Printf("%s\n", result.Inspect())
		}
	}
}
