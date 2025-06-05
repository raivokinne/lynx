# Lynx Programming Language
A modern, interpreted programming language built with Go.

## Overview
Lynx is a lightweight, interpreted programming language designed for simplicity and performance. Built from the ground up in Go, Lynx combines the simplicity and efficiency of Go with an intuitive syntax that makes programming accessible and enjoyable.

## Features
- **Interpreted**: No compilation step required - run your code directly
- **Go-powered**: Built with Go for simplicity, concurrency, and performance
- **Modern syntax**: Clean, readable code that's easy to learn
- **Cross-platform**: Runs on Linux, macOS, and Windows
- **Interactive REPL**: Test code snippets interactively
- **Rich data structures**: Arrays, objects, and collections built-in
- **Flexible loops**: Multiple iteration patterns for different use cases

## Installation

### Installing Go (Required)
Before installing Lynx, you need to have Go installed on your system.

#### Option 1: Official Go Installation (Recommended)
```bash
# Download and install from https://golang.org/dl/
# Or use the following commands for your platform
```

#### Option 2: Platform-specific Installation
**Windows:**
- Download and run the installer from [golang.org](https://golang.org/dl/)
- Or use winget: `winget install GoLang.Go`
- Or use Chocolatey: `choco install golang`

**macOS:**
```bash
# Using Homebrew
brew install go
# Or download from golang.org
```

**Linux (Ubuntu/Debian):**
```bash
# Using package manager
sudo apt update
sudo apt install golang-go
# Or download latest version from golang.org
wget https://go.dev/dl/go1.21.5.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.21.5.linux-amd64.tar.gz
export PATH=$PATH:/usr/local/go/bin
```

#### Verify Go Installation
```bash
go version
```
You should see version 1.19 or higher for optimal compatibility.

#### Set up Go Environment
```bash
# Add to your shell profile (.bashrc, .zshrc, etc.)
export GOPATH=$HOME/go
export PATH=$PATH:/usr/local/go/bin:$GOPATH/bin
```

### Installing Lynx

#### Method 1: Building from Source
```bash
git clone https://github.com/yourusername/lynx.git
cd lynx
go build -o lynx ./cmd/lynx
```
The compiled binary will be available as `lynx` in the project directory.

#### Method 2: Installing with Go Install
```bash
go install github.com/yourusername/lynx/cmd/lynx@latest
```

#### Method 3: Adding to PATH
After building from source, add the binary to your PATH:
```bash
# Linux/macOS
export PATH=$PATH:$(pwd)
echo 'export PATH=$PATH:/path/to/lynx' >> ~/.bashrc

# Windows (PowerShell)
$env:PATH += ";C:\path\to\lynx"
```

## Quick Start

### Your First Lynx Program
Create a file called `hello.lynx`:
```lynx
print("Hello, World!")
```

Run it with:
```bash
lynx hello.lynx
```

### Using the REPL
Start the interactive mode:
```bash
lynx
```

Try some expressions:
```lynx
lynx> 42
42
lynx> 3 + 5
8
lynx> let name = "Lynx"
lynx> print("Hello, " . name . "!")
Hello, Lynx!
```

## Language Syntax

### Variables
```lynx
let name = "Lynx"
let version = 1.0
let is_interpreted = true
const PI = 3.14159
```

### Arrays
Lynx provides powerful array functionality with various ways to create, manipulate, and iterate over collections.

#### Creating Arrays
```lynx
# Empty array
let empty = []

# Array with initial values
let numbers = [1, 2, 3, 4, 5]
let mixed = [1, "hello", true, 3.14]
let nested = [[1, 2], [3, 4], [5, 6]]
```

#### Array Operations
```lynx
let fruits = ["apple", "banana", "orange"]

# Accessing elements
print(fruits[0])        # "apple"
print(fruits[1])        # "banana"

# Modifying elements
fruits[1] = "grape"
print(fruits)           # ["apple", "grape", "orange"]
```

### Objects
Objects in Lynx are flexible key-value structures that can store any type of data.

#### Creating Objects
```lynx
# Empty object
let empty_obj = {}

# Object with initial properties
let person = {
    name: "Alice",
    age: 30,
    is_student: false,
    hobbies: ["reading", "coding", "hiking"]
}

# Nested objects
let company = {
    name: "TechCorp",
    employees: [
        { name: "Bob", role: "Developer" },
        { name: "Carol", role: "Designer" }
    ],
    location: {
        city: "San Francisco",
        country: "USA"
    }
}
```

#### Object Operations
```lynx
let car = {
    brand: "Toyota",
    model: "Camry",
    year: 2023
}

# Accessing properties
print(car->brand)        # "Toyota"

# Adding/modifying properties
car->color = "blue"
car->mileage = 15000
```

### For Loops
Lynx provides several types of for loops to handle different iteration patterns.

#### Basic For Loop
```lynx
# Traditional C-style for loop
for (let i = 0; i < 5; i = i + 1) {
    print("Count: " . i)
}
# Output: Count: 0, Count: 1, Count: 2, Count: 3, Count: 4
```

#### For-In Loop (Arrays)
```lynx
let colors = ["red", "green", "blue", "yellow"]

# Iterate over values
for (color in colors) {
    print("Color: " . color)
}
# Output: Color: red, Color: green, Color: blue, Color: yellow
```

### Functions
```lynx
# Basic function
fn greet(name) {
    return "Hello, " . name . "!"
}

# Function with arrays
fn sum_array(arr) {
    let total = 0
    for num in arr {
        total = total + num
    }
    return total
}

# Function with objects
fn get_full_name(person) {
    return person.first_name . " " . person.last_name
}

# Function that returns an array
fn create_range(start, end) {
    let result = []
    for i in start..end {
        result.push(i)
    }
    return result
}

# Usage examples
print(greet("World"))                           # "Hello, World!"
print(sum_array([1, 2, 3, 4, 5]))             # 15

let person = { first_name: "John", last_name: "Doe" }
print(get_full_name(person))                   # "John Doe"

let range = create_range(1, 6)
print(range)                                   # [1, 2, 3, 4, 5]
```

## Usage

### Running Scripts
```bash
lynx script.lynx
```

### Interactive Mode (REPL)
```bash
lynx
```

### Command Line Options
```bash
lynx [OPTIONS] [FILE]

Options:
    -h, --help       Print help information
    -v, --version    Print version information
    --verbose        Enable verbose output
    --debug          Enable debug mode
```

### REPL Commands
- `help` - Show help message
- `clear` - Clear the screen
- `exit` or `quit` - Exit the REPL

## Documentation
- [Syntax Guide](docs/syntax.md)
- [Built-in Functions](docs/builtins.md)
- [Standard Library](docs/stdlib.md)
- [Language Reference](docs/reference.md)
- [Array and Object Reference](docs/collections.md)
- [Loop Patterns Guide](docs/loops.md)

## Development

### Project Structure
```
lynx/
├── cmd/
│   └── lynx/            # CLI entry point
│       └── main.go      # Main application
├── pkg/
│   ├── frontend/        # Language frontend
│   │   ├── ast/         # Abstract Syntax Tree definitions
│   │   │   └── ast.go
│   │   └── lexer.go
│   │   └── parser.go
│   │   └── token.go
│   ├── runtime/         # Language runtime
│   │   └── environment.go
│   │   └── interpreter.go
│   │   └── values.go
├── examples/
│   ├── main.lynx        # Basic example
│   ├── arrays.lynx      # Array manipulation examples
│   ├── objects.lynx     # Object usage examples
│   └── loops.lynx       # Loop pattern examples
├── docs/                # Documentation
├── .git/                # Git repository data
├── .gitignore           # Git ignore rules
├── go.mod               # Go module definition
├── go.sum               # Go dependency checksums
└── README.md            # This file
```

### Building and Testing
```bash
# Build the project
go build -o lynx ./cmd/lynx

# Run with example
./lynx examples/main.lynx

# Run array examples
./lynx examples/arrays.lynx

# Run tests
go test ./...

# Format code
go fmt ./...

# Lint code (requires golangci-lint)
golangci-lint run

# Get dependencies
go mod tidy

# Create a release build
go build -ldflags="-s -w" -o lynx ./cmd/lynx
```

### Go Module Setup
Initialize the project as a Go module:
```bash
go mod init github.com/yourusername/lynx
go mod tidy
```

### Example go.mod file:
```go
module github.com/yourusername/lynx

go 1.21

require (
    github.com/spf13/cobra v1.8.0
    github.com/chzyer/readline v1.5.4
)
```

## Roadmap
- [ ] Standard library expansion
- [ ] Go module integration
- [ ] IDE/editor plugins (VS Code, Vim, etc.)
- [ ] Performance optimizations
- [ ] Additional data types (maps, sets)
- [ ] Module system and imports
- [ ] Error recovery improvements
- [ ] Debugging tools and profiler
- [ ] Advanced array methods (filter, map, reduce)
- [ ] Object inheritance and prototypes
- [ ] Goroutine-based concurrency support
- [ ] Pattern matching for arrays and objects
- [ ] Native Go interoperability

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments
- Built with [Go](https://golang.org/)
- Inspired by modern programming language design principles
- Thanks to all contributors and the Go community
- Special thanks to the Go team for creating such an elegant language

---
**Lynx** - Fast, simple, and concurrent programming for everyone.
*"Write code that purrs with performance."* 🐾
