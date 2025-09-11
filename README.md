# Lynx Programming Language

[![License: WTFPL](https://img.shields.io/badge/License-WTFPL-brightgreen.svg)](http://www.wtfpl.net/about/)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)]()

> A clean, minimal programming language focused on simplicity, expressiveness, and functional programming paradigms.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Language Guide](#language-guide)
- [Standard Library](#standard-library)
- [Examples](#examples)
- [Performance](#performance)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Overview

Lynx is a modern programming language designed for developers who value clean, readable code without sacrificing functionality. It combines the best aspects of functional programming with practical features for everyday development tasks.

**When to use Lynx:**
- Rapid prototyping and scripting
- Data processing and transformation
- Educational programming projects
- Situations where code clarity is paramount
- Functional programming exploration

**When to consider alternatives:**
- Performance-critical applications (use Go, Rust, C++)
- Large enterprise applications (use Java, C#, Python)
- System programming (use C, Rust, Zig)
- Web development (use JavaScript, TypeScript)

## Key Features

### 🧹 **Clean Syntax**
No unnecessary parentheses in control structures, minimal punctuation, and intuitive operators.

### 🔧 **Functional Programming**
First-class functions, closures, higher-order functions, and pipeline operators for elegant data transformation.

### 🔒 **Immutable by Default**
Arrays and strings are immutable, promoting safer concurrent programming and easier reasoning about code.

### 🎯 **Pattern Matching**
Elegant destructuring and matching capabilities for complex data handling.

### 📚 **Rich Standard Library**
Comprehensive modules for arrays, mathematics, I/O, networking, and testing.

### ⚡ **Pipeline Operators**
Powerful `|>` operator for chaining operations in a readable, left-to-right manner.

### 🛡️ **Structured Error Handling**
Explicit error handling with `error` and `catch`/`on` blocks for robust applications.

### 📦 **Module System**
Clean module imports with selective member loading for better dependency management.

## Quick Start

### Installation

#### Prerequisites
- Go 1.19 or higher
- Git

#### Build from Source

```bash
# Clone the repository
git clone https://github.com/raivokinne/lynx.git
cd lynx

# Build the interpreter
make build-all
cd build
./lynx
```

#### Alternative Installation Methods

```bash
# Using Go directly
go install github.com/raivokinne/lynx@latest

# Or download pre-built binaries from releases
# https://github.com/raivokinne/lynx/releases
```

### Your First Lynx Program

Create `hello.lynx`:

```lynx
let main = fn() {
    print("Hello, Lynx!")
}
```

Run it:

```bash
./lynx hello.lynx
```

## Language Guide

### Variables and Constants

```lynx
// Mutable variables
let name = "Lynx"
let version = 1.0

// Constants (immutable)
const PI = 3.14159
const MAX_USERS = 100

// Type inference works automatically
let numbers = [1, 2, 3, 4, 5]
let user = {"name": "Alice", "age": 30}
```

### Functions

```lynx
// Basic function
let greet = fn(name) {
    return "Hello, " ++ name ++ "!"
}

// Function with multiple parameters
let add = fn(a, b) {
    return a + b
}

// Higher-order function
let applyTwice = fn(f, x) {
    return f(f(x))
}

// Usage
let result = greet("World")
let sum = add(5, 3)
let doubled = applyTwice(fn(x) { x * 2 }, 4) // Returns 16
```

### Control Flow

```lynx
// If-else statements (no parentheses required)
if x > 0 {
    print("Positive")
} else if x < 0 {
    print("Negative")
} else {
    print("Zero")
}

// While loops
let i = 0
while i < 10 {
    print(i)
    i = i + 1
}

// For-range loops
for item in [1, 2, 3, 4, 5] {
    print(item)
}

// With index
for item, index in ["a", "b", "c"] {
    print("Item", index, ":", item)
}

// Break and continue
for i in range(0, 100) {
    if i % 2 == 0 {
        continue
    }
    if i > 10 {
        break
    }
    print(i)
}
```

### Data Structures

#### Arrays (Immutable)

```lynx
let numbers = [1, 2, 3, 4, 5]
let mixed = [1, "hello", true, 3.14]

// Array operations return new arrays
let extended = numbers.push(6)        // [1, 2, 3, 4, 5, 6]
let first = numbers.head()            // 1
let rest = numbers.tail()             // [2, 3, 4, 5]
let length = numbers.length()         // 5

// Accessing elements
let first = numbers[0]
let last = numbers[-1]
```

#### Hash Maps/Objects

```lynx
let person = {
    "name": "Alice",
    "age": 30,
    "city": "New York"
}

// Property access
let name = person["name"]
let age = person.age

// Adding/updating (returns new object)
let updated = person.set("age", 31)
```

#### Tuples

```lynx
let coordinates = (10, 20)
let person = ("Alice", 30, true)

// Destructuring
let (x, y) = coordinates
let (name, age, active) = person
```

### Pipeline Operations

```lynx
let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

// Traditional nested calls (harder to read)
let result1 = filter(map(numbers, fn(x) { x * 2 }), fn(x) { x % 4 == 0 })

// Pipeline style (much cleaner)
let result2 = numbers
    |> map(fn(x) { x * 2 })
    |> filter(fn(x) { x % 4 == 0 })
    |> reduce(fn(acc, x) { acc + x }, 0)

// Complex data transformation
let users = [
    {"name": "Alice", "age": 25, "active": true},
    {"name": "Bob", "age": 17, "active": false},
    {"name": "Charlie", "age": 35, "active": true}
]

let activeAdultNames = users
    |> filter(fn(u) { u.active })
    |> filter(fn(u) { u.age >= 18 })
    |> map(fn(u) { u.name })
    |> sort()
```

### Error Handling

```lynx
// Function that might fail
let divide = fn(a, b) {
    if b == 0 {
        error "Division by zero"
    }
    return a / b
}

// Handling errors
let safeCalculation = fn(x, y) {
    catch err {
        let result = divide(x, y)
        print("Result:", result)
        return result
    } on {
        print("Error occurred:", err)
        return 0
    }
}

// Multiple operations with error handling
let processData = fn(data) {
    catch err {
        let validated = validateData(data)
        let processed = transformData(validated)
        let result = saveData(processed)
        return result
    } on {
        print("Processing failed:", err)
        return null
    }
}
```

### Module System

```lynx
// Import specific functions from modules
@arrays(map, filter, reduce)
@math(sqrt, pow, abs)
@io(readFile, writeFile)

// Import with aliases
@arrays(map as transform, filter as select)

// Use imported functions
let processNumbers = fn(nums) {
    return nums
        |> transform(fn(x) { pow(x, 2) })
        |> select(fn(x) { x > 10 })
        |> reduce(fn(a, b) { a + b }, 0)
}
```

### Switch Statements

```lynx
let processGrade = fn(grade) {
    switch grade {
        case "A" {
            print("Excellent!")
            return 4.0
        }
        case "B" {
            print("Good job!")
            return 3.0
        }
        case "C" {
            print("Satisfactory")
            return 2.0
        }
        default {
            print("Needs improvement")
            return 0.0
        }
    }
}
```

## Standard Library

### Core Modules

#### `@arrays` - Array Operations
```lynx
@arrays(map, filter, reduce, sort, reverse, find, contains)

let numbers = [1, 2, 3, 4, 5]
let doubled = map(numbers, fn(x) { x * 2 })
let evens = filter(numbers, fn(x) { x % 2 == 0 })
let sum = reduce(numbers, fn(a, b) { a + b }, 0)
let sorted = sort(numbers, fn(a, b) { b - a }) // Descending
```

#### `@math` - Mathematical Functions
```lynx
@math(sin, cos, tan, sqrt, pow, abs, floor, ceil, round, pi, e)

let area = pi * pow(radius, 2)
let distance = sqrt(pow(x2 - x1, 2) + pow(y2 - y1, 2))
let rounded = round(3.14159, 2) // 3.14
```

#### `@strings` - String Operations
```lynx
@strings(split, join, trim, upper, lower, replace, contains, startsWith, endsWith)

let text = "  Hello, World!  "
let clean = trim(text)
let words = split(clean, ", ")
let upper = upper(clean)
let replaced = replace(clean, "World", "Lynx")
```

## Examples

### 1. Fibonacci Sequence

```lynx
@arrays(map)

// Recursive implementation
let fibonacci = fn(n) {
    if n <= 1 {
        return n
    }
    return fibonacci(n - 1) + fibonacci(n - 2)
}

// Optimized iterative version
let fibonacciIter = fn(n) {
    if n <= 1 { return n }

    let a = 0
    let b = 1
    let i = 2

    while i <= n {
        let temp = a + b
        a = b
        b = temp
        i = i + 1
    }

    return b
}

let sequence = map(range(0, 10), fibonacciIter)
print("Fibonacci sequence:", sequence)
```

### 2. Data Processing Pipeline

```lynx
@arrays(filter, map, reduce, sort)
@strings(upper, trim)

let processUserData = fn(rawData) {
    return rawData
        |> filter(fn(user) { user.age >= 18 })           // Adults only
        |> filter(fn(user) { user.active })              // Active users
        |> map(fn(user) {                                // Normalize names
            user.set("name", upper(trim(user.name)))
        })
        |> sort(fn(a, b) { a.name.compare(b.name) })     // Sort by name
        |> map(fn(user) { user.name })                   // Extract names only
}

let users = [
    {"name": "  alice  ", "age": 25, "active": true},
    {"name": "bob", "age": 17, "active": true},
    {"name": "charlie", "age": 30, "active": false},
    {"name": "diana", "age": 28, "active": true}
]

let processedNames = processUserData(users)
print("Processed users:", processedNames)
```

### 3. File Processing with Error Handling

```lynx
@io(readFile, writeFile, fileExists)
@strings(split, trim, join)

let processLogFile = fn(inputFile, outputFile) {
    catch err {
        if !fileExists(inputFile) {
            error "Input file does not exist: " ++ inputFile
        }

        let content = readFile(inputFile)
        let lines = split(content, "\n")

        let processedLines = lines
            |> filter(fn(line) { trim(line) != "" })      // Remove empty lines
            |> filter(fn(line) { !startsWith(line, "#") }) // Remove comments
            |> map(fn(line) { trim(line) })               // Trim whitespace

        let output = join(processedLines, "\n")
        writeFile(outputFile, output)

        print("Successfully processed", len(lines), "lines")
        return true

    } on {
        print("Error processing file:", err)
        return false
    }
}

let success = processLogFile("input.log", "output.log")
if success {
    print("File processing completed")
} else {
    print("File processing failed")
}
```

### 4. Web API Data Fetcher

```lynx
@net(httpGet, parseJson)
@arrays(map, filter, sort)

let fetchUserPosts = fn(userId) {
    catch err {
        let url = "https://jsonplaceholder.typicode.com/posts?userId=" ++ toString(userId)
        let response = httpGet(url)
        let posts = parseJson(response)

        return posts
            |> filter(fn(post) { len(post.title) > 10 })
            |> sort(fn(a, b) { len(b.title) - len(a.title) })
            |> map(fn(post) {
                {
                    "id": post.id,
                    "title": post.title,
                    "wordCount": len(split(post.body, " "))
                }
            })
    } on {
        print("Failed to fetch posts:", err)
        return []
    }
}

let posts = fetchUserPosts(1)

print("Found", len(posts), "posts")

for post in posts {
    print("Post", post.id, ":", post.title)
    print("Word count:", post.wordCount)
    print("---")
}
```

### 5. Simple Calculator REPL

```lynx
@strings(trim, split)
@math(add, subtract, multiply, divide)

let parseExpression = fn(input) {
    let parts = split(trim(input), " ")
    if len(parts) != 3 {
        error "Invalid expression format. Use: <number> <operator> <number>"
    }

    let left = parseFloat(parts[0])
    let operator = parts[1]
    let right = parseFloat(parts[2])

    return (left, operator, right)
}

let calculate = fn(left, operator, right) {
    switch operator {
        case "+" { return left + right }
        case "-" { return left - right }
        case "*" { return left * right }
        case "/" {
            if right == 0 {
                error "Division by zero"
            }
            return left / right
        }
        default {
            error "Unknown operator: " ++ operator
        }
    }
}

let repl = fn() {
    print("Simple Calculator (type 'quit' to exit)")
    print("Enter expressions like: 5 + 3")

    while true {
        print("> ")
        let input = readLine()

        if trim(input) == "quit" {
            break
        }

        catch err {
            let (left, operator, right) = parseExpression(input)
            let result = calculate(left, operator, right)
            print("Result:", result)
        } on {
            print("Error:", err)
        }
    }
}

repl()
print("Goodbye!")
```

## Performance

### Benchmarks

Lynx is optimized for developer productivity rather than raw performance. Here are some general performance characteristics:

- **Startup time**: ~10-50ms for small programs
- **Memory usage**: Generally lightweight, immutable data structures may use more memory
- **Execution speed**: Suitable for scripting and data processing tasks

### Performance Tips

1. **Use pipeline operations** - They're optimized for chaining
2. **Prefer immutable operations** - They're safer and often optimized
3. **Minimize deep recursion** - Use iterative approaches for large datasets
4. **Cache expensive computations** - Store results in variables when reused
5. **Use appropriate data structures** - Arrays for ordered data, objects for key-value pairs

```lynx
// Good: Pipeline operations
let result = data
    |> filter(isValid)
    |> map(transform)
    |> reduce(combine, initial)

// Good: Iterative approach for large datasets
let factorial = fn(n) {
    let result = 1
    let i = 2
    while i <= n {
        result = result * i
        i = i + 1
    }
    return result
}
```

## Troubleshooting

### Common Issues

#### "command not found: lynx"
```bash
# Make sure the binary is in your PATH
export PATH=$PATH:/path/to/lynx

# Or run with full path
/path/to/lynx/lynx program.lynx
```

#### "module not found" errors
```bash
# Ensure standard library is in the correct location
ls /usr/local/lib/lynx/stdlib/

# Or set LYNX_PATH environment variable
export LYNX_PATH=/path/to/lynx/stdlib
```

#### Memory issues with large datasets
- Use streaming operations when possible
- Process data in chunks
- Consider using external tools for very large datasets

#### Performance issues
- Profile your code to identify bottlenecks
- Use iterative instead of recursive approaches for large inputs
- Cache expensive calculations

### Getting Help

- Check the [documentation](https://github.com/raivokinne/lynx/docs)
- Open an [issue](https://github.com/raivokinne/lynx/issues)
- Join our [community discussions](https://github.com/raivokinne/lynx/discussions)

## Contributing

We welcome contributions! Here's how to get started:

### Contribution Guidelines

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Write** tests for your changes
4. **Ensure** all tests pass (`make test`)
5. **Commit** your changes (`git commit -m 'Add amazing feature'`)
6. **Push** to the branch (`git push origin feature/amazing-feature`)
7. **Open** a Pull Request

### Code Style

- Use clear, descriptive variable names
- Add comments for complex logic
- Follow existing code formatting
- Write tests for new features
- Update documentation as needed

### Areas for Contribution

- 📚 **Documentation** - Improve guides, add examples
- 🐛 **Bug fixes** - Fix issues and edge cases
- ✨ **New features** - Add language features or standard library functions
- 🎯 **Performance** - Optimize interpreter or standard library
- 🧪 **Testing** - Add test cases and improve coverage
- 🎨 **Tooling** - IDE plugins, syntax highlighters

## Language Philosophy

Lynx is built on these core principles:

### 1. **Simplicity Over Complexity**
Every feature should solve a real problem without adding unnecessary complexity. If something can be expressed simply, it should be.

### 2. **Immutability Promotes Correctness**
Immutable data structures make code easier to reason about and prevent entire classes of bugs.

### 3. **Functions as First-Class Citizens**
Functions should be as easy to work with as any other data type, enabling powerful abstractions and code reuse.

### 4. **Readability is Paramount**
Code is read far more often than it's written. Lynx syntax prioritizes clarity and readability over brevity.

### 5. **Practical Over Pure**
While functional programming concepts are important, practical needs come first. Lynx includes imperative features when they make sense.

### 6. **Batteries Included, But Not Overwhelming**
The standard library should provide essential functionality without becoming bloated or opinionated about specific use cases.

## License

This project is licensed under the WTFPL License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by functional languages like Haskell and Clojure
- Syntax influenced by Go and JavaScript
- Built with Go for performance and simplicity

---

**Lynx** - *A language that gets out of your way and lets you focus on solving problems.*

*"The best code is the code you don't have to think about twice."*
