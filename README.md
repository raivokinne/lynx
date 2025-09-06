# Lynx Programming Language

A clean, minimal programming language focused on simplicity and expressiveness.

## Features

- **Clean Syntax** - No unnecessary parentheses in control structures
- **Functional Programming** - First-class functions and closures
- **Immutable Data** - Arrays and strings are immutable by default
- **Pattern Matching** - Elegant destructuring and matching
- **Essential Standard Library** - Batteries included for common tasks

## Syntax Overview

### Variables and Functions

```lynx
let name = "Lynx"
let version = 1.0

let greet = fn(name, version) {
    return "Hello, " ++ name ++ "!"  ++ "version: " ++ version
}

let result = greet("World", version)
```

### Control Flow

```lynx
// No parentheses needed around conditions
if x > 0 {
    print("Positive")
} else {
    print("Not positive")
}

while i < 10 {
    print(i)
    i = i + 1
}
```

### Arrays and Collections

```lynx
let numbers = [1, 2, 3, 4, 5]
let doubled = numbers |> map(fn(x) { x * 2 })
let evens = numbers |> filter(fn(x) { x % 2 == 0 })

let newNumbers = numbers.push(6)  // [1, 2, 3, 4, 5, 6]
```

### Higher-Order Functions

```lynx
let users = [
    {"name": "Alice", "age": 25},
    {"name": "Bob", "age": 30},
    {"name": "Charlie", "age": 35}
]

let names = users |> map(fn(x) { x.name })
let adults = users |> filter(fn(x) { x.age >= 18 })
let totalAge = users |> reduce(fn(acc, x) { acc + x.age }, 0)
```

### Modules

```lynx
@arrays(map, filter, reduce)
@strings(trim, split, replace, contains)
@math(abs, max, min, pow, sqrt, factorial, gcd, lcm)
@test(assertEqual, assert, assertTrue, assertFalse)
@io(println, writeStdout, readStdin)
@net(get, post)

let main = fn() {
    let text = "  Hello World  "
    let clean = text |> trim()
    let words = clean |> split(" ")
    println(words)
}
```

### Error Handling (error and catch)

```lynx
let main = fn() {
    let x = 1 / 0
    catch {
        println(x)
    } on err {
        println("Error:", err)
    }
}
```

## Standard Library

### Core Modules

- **arrays.lynx** - Array manipulation functions (map, filter, reduce, etc.)
- **math.lynx** - Mathematical functions and constants
- **test.lynx** - Testing and assertion utilities
- **io.lynx** - File I/O and console operations
- **net.lynx** - Networking utilities

### Example Usage

```lynx
let numbers = [1, 2, 3, 4, 5]

let sum = numbers |> reduce(fn(a, b) { a + b }, 0)
let sorted = numbers |> sort(fn(a, b) { a - b })

let text = "  Hello World  "
let clean = trim(text)  // "Hello World"
let words = split(clean, " ")  // ["Hello", "World"]

assertEqual(2 + 2, 4, "Math should work")
assert(true, "This should pass")
```

## Language Philosophy

Lynx follows these design principles:

1. **Simplicity** - Clean syntax without unnecessary noise
2. **Immutability** - Prefer immutable operations for safer code
3. **Functional** - Functions are first-class citizens
4. **Practical** - Essential features without bloat
5. **Readable** - Code should be self-documenting

## Installation

```bash
# Clone the repository
git clone https://github.com/raivokinne/lynx.git
cd lynx

# Build the interpreter
make build

# Run a Lynx program
./lynx program.lynx
```

## Quick Start

Create a file `hello.lynx`:

```lynx
let factorial = fn(n) {
    if n <= 1 {
        return 1
    }
    return n * factorial(n - 1)
}

let main = fn() {
    print("5! =", factorial(5))
}
```

Run it:

```bash
./lynx hello.lynx
```

## Examples

### Fibonacci Sequence

```lynx
@arrays(map)

let fibonacci = fn(n) {
    if n <= 1 {
        return n
    }
    return fibonacci(n - 1) + fibonacci(n - 2)
}

let sequence = map([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], fibonacci)

let main = fn() {
    print("Fibonacci sequence:", sequence)
}

```

### Data Processing

```lynx
@arrays(filter, map,reduce)

let data = [
    {"name": "Alice", "score": 85},
    {"name": "Bob", "score": 92},
    {"name": "Charlie", "score": 78}
]

let highScorers = data
    |> filter(fn(x) { x.score > 80 })
    |> map(fn(x) { x.name })

let averageScore = data
    |> reduce(fn(acc, x) { acc + x.score }, 0)

let main = fn() {
    print("High scorers:", highScorers)
    print("Average score:", averageScore)
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

---

**Lynx** - A language that gets out of your way and lets you focus on solving problems.
