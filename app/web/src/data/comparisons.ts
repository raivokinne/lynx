import type { ComparisonExample } from "../types/docs";

export const languageComparisons: ComparisonExample[] = [
  {
    title: "Fibonacci Sequence",
    description: "Implementing the Fibonacci sequence",
    examples: {
      lynx: {
        language: "lynx",
        filename: "fibonacci.lynx",
        code: `let fibonacci = fn(n) {
    if n <= 1 {
        return n
    }
    return fibonacci(n - 1) + fibonacci(n - 2)
}

let sequence = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    |> map(fibonacci)

println("Fibonacci:", sequence)`,
      },
      javascript: {
        language: "javascript",
        filename: "fibonacci.js",
        code: `function fibonacci(n) {
    if (n <= 1) {
        return n;
    }
    return fibonacci(n - 1) + fibonacci(n - 2);
}

const sequence = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    .map(fibonacci);

console.log("Fibonacci:", sequence);`,
      },
      python: {
        language: "python",
        filename: "fibonacci.py",
        code: `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

sequence = [fibonacci(i) for i in range(10)]
print("Fibonacci:", sequence)`,
      },
      go: {
        language: "go",
        filename: "fibonacci.go",
        code: `package main

import "fmt"

func fibonacci(n int) int {
    if n <= 1 {
        return n
    }
    return fibonacci(n-1) + fibonacci(n-2)
}

func main() {
    sequence := make([]int, 10)
    for i := 0; i < 10; i++ {
        sequence[i] = fibonacci(i)
    }
    fmt.Println("Fibonacci:", sequence)
}`,
      },
      rust: {
        language: "rust",
        filename: "fibonacci.rs",
        code: `fn fibonacci(n: u32) -> u32 {
    match n {
        0 | 1 => n,
        _ => fibonacci(n - 1) + fibonacci(n - 2),
    }
}

fn main() {
    let sequence: Vec<u32> = (0..10)
        .map(fibonacci)
        .collect();
    println!("Fibonacci: {:?}", sequence);
}`,
      },
    },
  },
  {
    title: "Array Processing",
    description: "Filtering and transforming arrays",
    examples: {
      lynx: {
        language: "lynx",
        filename: "arrays.lynx",
        code: `@arrays(map, filter, reduce)

let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

let result = numbers
    |> filter(fn(x) { x % 2 == 0 })  // Even numbers
    |> map(fn(x) { x * x })          // Square them
    |> reduce(fn(a, b) { a + b }, 0) // Sum them

println("Result:", result)`,
      },
      javascript: {
        language: "javascript",
        filename: "arrays.js",
        code: `const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const result = numbers
    .filter(x => x % 2 === 0)  // Even numbers
    .map(x => x * x)           // Square them
    .reduce((a, b) => a + b, 0); // Sum them

console.log("Result:", result);`,
      },
      python: {
        language: "python",
        filename: "arrays.py",
        code: `from functools import reduce

numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

result = reduce(
    lambda a, b: a + b,
    map(lambda x: x * x,
        filter(lambda x: x % 2 == 0, numbers)),
    0
)

print("Result:", result)`,
      },
      go: {
        language: "go",
        filename: "arrays.go",
        code: `package main

import "fmt"

func main() {
    numbers := []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}

    result := 0
    for _, x := range numbers {
        if x%2 == 0 {  // Even numbers
            squared := x * x  // Square them
            result += squared // Sum them
        }
    }

    fmt.Println("Result:", result)
}`,
      },
      rust: {
        language: "rust",
        filename: "arrays.rs",
        code: `fn main() {
    let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    let result: i32 = numbers
        .iter()
        .filter(|&x| x % 2 == 0)  // Even numbers
        .map(|&x| x * x)          // Square them
        .sum();                   // Sum them

    println!("Result: {}", result);
}`,
      },
    },
  },
  {
    title: "Pattern Matching",
    description: "Using pattern matching for control flow",
    examples: {
      lynx: {
        language: "lynx",
        filename: "pattern.lynx",
        code: `let processValue = fn(value) {
    switch value {
        case 0: "zero"
        case x if x > 0: "positive: " ++ toString(x)
        case x if x < 0: "negative: " ++ toString(x)
        default: "unknown"
    }
}

println(processValue(0))   // "zero"
println(processValue(5))   // "positive: 5"
println(processValue(-3))  // "negative: -3"`,
      },
      javascript: {
        language: "javascript",
        filename: "pattern.js",
        code: `function processValue(value) {
    switch (true) {
        case value === 0:
            return "zero";
        case value > 0:
            return \`positive: \${value}\`;
        case value < 0:
            return \`negative: \${value}\`;
        default:
            return "unknown";
    }
}

console.log(processValue(0));   // "zero"
console.log(processValue(5));   // "positive: 5"
console.log(processValue(-3));  // "negative: -3"`,
      },
      python: {
        language: "python",
        filename: "pattern.py",
        code: `def process_value(value):
    match value:
        case 0:
            return "zero"
        case x if x > 0:
            return f"positive: {x}"
        case x if x < 0:
            return f"negative: {x}"
        case _:
            return "unknown"

print(process_value(0))   # "zero"
print(process_value(5))   # "positive: 5"
print(process_value(-3))  # "negative: -3"`,
      },
      go: {
        language: "go",
        filename: "pattern.go",
        code: `package main

import "fmt"

func processValue(value int) string {
    switch {
    case value == 0:
        return "zero"
    case value > 0:
        return fmt.Sprintf("positive: %d", value)
    case value < 0:
        return fmt.Sprintf("negative: %d", value)
    default:
        return "unknown"
    }
}

func main() {
    fmt.Println(processValue(0))   // "zero"
    fmt.Println(processValue(5))   // "positive: 5"
    fmt.Println(processValue(-3))  // "negative: -3"
}`,
      },
      rust: {
        language: "rust",
        filename: "pattern.rs",
        code: `fn process_value(value: i32) -> String {
    match value {
        0 => "zero".to_string(),
        x if x > 0 => format!("positive: {}", x),
        x if x < 0 => format!("negative: {}", x),
        _ => "unknown".to_string(),
    }
}

fn main() {
    println!("{}", process_value(0));   // "zero"
    println!("{}", process_value(5));   // "positive: 5"
    println!("{}", process_value(-3));  // "negative: -3"
}`,
      },
    },
  },
];
