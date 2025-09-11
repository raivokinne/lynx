package main

import (
	"fmt"
	"lynx/pkg/evaluator"
	"lynx/pkg/lexer"
	"lynx/pkg/object"
	"lynx/pkg/parser"
	"os"
	"path/filepath"
)

func main() {
	args := os.Args[1:]
	filename := args[0]
	absPath, err := filepath.Abs(filename)
	if err != nil {
		fmt.Printf("Error getting absolute path: %v\n", err)
		os.Exit(1)
	}

	if len(args) > 1 {
		fmt.Printf("Too many arguments\n")
		os.Exit(1)
	}

	dir := filepath.Dir(absPath)
	executeFile(filename, dir)
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

	if errorObj, ok := result.(*object.Error); ok {
		fmt.Printf("Error: %s\n", errorObj.Message)
		os.Exit(1)
	}

	switch results := result.(type) {
	case *object.Error:
		fmt.Printf("Runtime error in main: %s\n", results.Message)
		os.Exit(1)
	case *object.Integer:
		exitCode := int(results.Value)
		os.Exit(exitCode)
	case *object.Return:
		if returnVal, ok := results.Value.(*object.Integer); ok {
			os.Exit(int(returnVal.Value))
		}
		os.Exit(0)
	default:
		os.Exit(0)
	}
}
