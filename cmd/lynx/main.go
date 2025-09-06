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

	if errorObj, ok := result.(*object.Error); ok {
		fmt.Printf("Error: %s\n", errorObj.Message)
		os.Exit(1)
	}

	mainObj, exists := env.Get("main")
	if !exists {
		fmt.Printf("Error: main function not found\n")
		os.Exit(1)
	}

	mainFunc, ok := mainObj.(*object.Function)
	if !ok {
		fmt.Printf("Error: main is not a function\n")
		os.Exit(1)
	}

	if len(mainFunc.Parameters) > 1 {
		fmt.Printf("Error: main function takes 1 argument\n")
		os.Exit(1)
	}

	args := os.Args[2:]
	argsArray := make([]object.Object, len(args))
	for i, arg := range args {
		argsArray[i] = &object.String{Value: arg}
	}

	argsObj := &object.Array{Elements: argsArray}

	var mainResult object.Object
	if len(mainFunc.Parameters) == 0 {
		mainResult = evaluator.ApplyFunction(mainFunc, []object.Object{})
	} else {
		mainResult = evaluator.ApplyFunction(mainFunc, []object.Object{argsObj})
	}

	switch mainResult := mainResult.(type) {
	case *object.Error:
		fmt.Printf("Runtime error in main: %s\n", mainResult.Message)
		os.Exit(1)
	case *object.Integer:
		exitCode := int(mainResult.Value)
		os.Exit(exitCode)
	case *object.Return:
		if returnVal, ok := mainResult.Value.(*object.Integer); ok {
			os.Exit(int(returnVal.Value))
		}
		os.Exit(0)
	default:
		os.Exit(0)
	}

}
