# Lynx Code Examples

This directory contains example Lynx programs to help you get started.

## Running Examples

```bash
cd lynx/compiler
./lynx ../examples/hello_world.lynx
```

## Examples

| File | Description |
|------|-----------|
| [hello_world.lynx](./hello_world.lynx) | Basic hello world program |
| [variables.lynx](./variables.lynx) | Variables, loops, and control flow |
| [functions.lynx](./functions.lynx) | Functions, higher-order functions, closures |
| [arrays.lynx](./arrays.lynx) | Arrays and pipeline operators |
| [pattern_matching.lynx](./pattern_matching.lynx) | Pattern matching and destructuring |
| [error_handling.lynx](./error_handling.lynx) | Error handling with try-catch |

## Quick Examples

### Hello World
```lynx
println("Hello, World!")
```

### Variables
```lynx
let x = 10
let name = "Lynx"
```

### Functions
```lynx
fn add(a, b) { a + b }
```

### Pipelines
```lynx
[1, 2, 3] |> filter(fn(x) { x > 1 }) |> map(fn(x) { x * 2 })
```