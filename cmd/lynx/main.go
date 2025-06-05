package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"

	"lynx/pkg/frontend"
	"lynx/pkg/runtime"
)

type Config struct {
	Filename   *string
	ScriptArgs []string
	ShowHelp   bool
	DebugMode  bool
	Verbose    bool
}

func NewConfig() *Config {
	return &Config{
		Filename:   nil,
		ScriptArgs: make([]string, 0),
		ShowHelp:   false,
		DebugMode:  false,
		Verbose:    false,
	}
}

func parseArgs() (*Config, error) {
	args := os.Args
	config := NewConfig()
	i := 1
	parsingScriptArgs := false

	for i < len(args) {
		arg := args[i]

		if parsingScriptArgs {
			config.ScriptArgs = append(config.ScriptArgs, arg)
		} else {
			switch arg {
			case "-h", "--help":
				config.ShowHelp = true
			case "-d", "--debug":
				config.DebugMode = true
			case "-v", "--verbose":
				config.Verbose = true
			case "--":
				parsingScriptArgs = true
			default:
				if strings.HasPrefix(arg, "-") {
					return nil, fmt.Errorf("unknown option: %s", arg)
				}
				if config.Filename != nil {
					return nil, fmt.Errorf("multiple filenames provided")
				}
				filename := arg
				config.Filename = &filename
				parsingScriptArgs = true
			}
		}
		i++
	}

	return config, nil
}

func printUsage(program string) {
	fmt.Printf("Usage: %s [OPTIONS] [filename] [script_args...]\n", program)
	fmt.Printf("       %s [OPTIONS] -- [script_args...]\n", program)
	fmt.Println()
	fmt.Println("Options:")
	fmt.Println("  -h, --help       Show this help message")
	fmt.Println("  -d, --debug      Enable debug mode")
	fmt.Println("  -v, --verbose    Enable verbose output")
	fmt.Println()
	fmt.Println("Examples:")
	fmt.Printf("  %s myfile.lynx                    Run a Lynx source file\n", program)
	fmt.Printf("  %s myfile.lynx arg1 arg2 arg3     Run with script arguments\n", program)
	fmt.Printf("  %s -d myfile.lynx 1 2 3          Run with debug and script args\n", program)
	fmt.Printf("  %s -- arg1 arg2                  Start REPL with arguments\n", program)
	fmt.Printf("  %s                               Start the REPL\n", program)
}

func main() {
	config, err := parseArgs()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: %s\n", err)
		printUsage("lynx")
		os.Exit(1)
	}

	if config.ShowHelp {
		printUsage("lynx")
		os.Exit(0)
	}

	env := runtime.CreateGlobal(config.ScriptArgs)

	if config.Verbose {
		fmt.Println("Lynx Language Interpreter")
		if config.Filename != nil {
			fmt.Printf("File: %s\n", *config.Filename)
		}
		if len(config.ScriptArgs) > 0 {
			fmt.Printf("Script args: %v\n", config.ScriptArgs)
		}
		fmt.Printf("Debug mode: %t\n", config.DebugMode)
		fmt.Println()
	}

	if config.Filename != nil {
		runFile(*config.Filename, env, config)
	} else {
		runREPL(env, config)
	}
}

func runFile(filename string, env *runtime.Environment, config *Config) {
	if config.Verbose {
		fmt.Printf("Running file: %s\n", filename)
	}

	source, err := os.ReadFile(filename)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error reading file '%s': %s\n", filename, err)
		return
	}

	executeSourceWithEnv(string(source), env, config)
}

func runREPL(env *runtime.Environment, config *Config) {
	fmt.Println("Lynx Language REPL v0.1.0")
	if config.DebugMode {
		fmt.Println("Debug mode enabled")
	}
	if len(config.ScriptArgs) > 0 {
		fmt.Printf("Script args available: %v\n", config.ScriptArgs)
	}
	fmt.Println("Type 'exit' or 'quit' to exit, 'help' for help")
	fmt.Println()

	scanner := bufio.NewScanner(os.Stdin)

	for {
		fmt.Print("lynx> ")

		if !scanner.Scan() {
			break
		}

		input := strings.TrimSpace(scanner.Text())

		switch input {
		case "exit", "quit":
			fmt.Println("Goodbye!")
			return
		case "help":
			printHelp()
			continue
		case "clear":
			fmt.Print("\033[2J\033[1;1H")
			continue
		case "":
			continue
		}

		executeSourceWithEnv(input, env, config)
	}

	if err := scanner.Err(); err != nil {
		fmt.Fprintf(os.Stderr, "Error reading input: %s\n", err)
	}
}

func executeSourceWithEnv(source string, env *runtime.Environment, config *Config) {
	if config.DebugMode {
		fmt.Printf("DEBUG: Executing source: %s\n", source)
	}

	lexer := frontend.NewLexer(source)
	tokens, err := lexer.Tokenize()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: %s\n", err)
		return
	}

	if config.DebugMode {
		fmt.Println("DEBUG: Tokenization successful")
		fmt.Printf("DEBUG: Token count: %d\n", len(tokens))
	}

	parser := frontend.NewParser(tokens)
	program, err := parser.Parse()

	if config.DebugMode {
		fmt.Println("DEBUG: Parsing successful")
	}

	result, err := runtime.Evaluate(program, env)
	if err != nil {
		fmt.Fprintf(os.Stderr, "%s\n", err)
		return
	}

	if config.Verbose {
		fmt.Printf("Result: %s\n", result)
	} else {
		fmt.Printf("%s\n", result)
	}
}

func printHelp() {
	fmt.Println("Lynx Language REPL Commands:")
	fmt.Println("  help       - Show this help message")
	fmt.Println("  clear      - Clear the screen")
	fmt.Println("  exit/quit  - Exit the REPL")
	fmt.Println()
	fmt.Println("Language Examples:")
	fmt.Println("  42")
	fmt.Println("  3 + 5")
	fmt.Println("  (10 - 2) * 3")
	fmt.Println("  let x = 5;")
	fmt.Println("  const pi = 3.14;")
	fmt.Println("  args       - Access command line arguments")
	fmt.Println("  args[0]    - First argument (program name)")
	fmt.Println("  args[1]    - Second argument (filename)")
	fmt.Println()
}
