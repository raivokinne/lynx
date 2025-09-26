import { X, Shield, Package, Wrench, Book, Code } from "lucide-react";
import { useState } from "react";

interface DocsModalProps {
  isDarkMode: boolean;
  onClose: () => void;
}

export const DocsModal = ({ isDarkMode, onClose }: DocsModalProps) => {
  const [activeSection, setActiveSection] = useState("overview");

  const sections = [
    { id: "overview", title: "Overview", icon: Book },
    { id: "language", title: "Language Guide", icon: Package },
    { id: "stdlib", title: "Standard Library", icon: Shield },
    { id: "examples", title: "Examples", icon: Code },
    { id: "performance", title: "Performance", icon: Wrench },
  ];

  const CodeBlock = ({
    children,
    language = "lynx",
  }: {
    children: string;
    language?: string;
  }) => (
    <pre
      className={`${isDarkMode ? "bg-black border-gray-700" : "bg-white border-gray-200"} border rounded-lg p-4 overflow-x-auto text-sm font-mono`}
    >
      <code
        className={`language-${language} ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
      >
        {children}
      </code>
    </pre>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Overview</h2>

            <div className="prose max-w-none">
              <p className="text-lg mb-6">
                Lynx is a modern programming language designed for developers
                who value clean, readable code without sacrificing
                functionality. It combines the best aspects of functional
                programming with practical features for everyday development
                tasks.
              </p>

              <h3 className="text-lg font-semibold mb-3">When to use Lynx:</h3>
              <ul
                className={`list-disc list-inside space-y-1 mb-6 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                <li>Rapid prototyping and scripting</li>
                <li>Data processing and transformation</li>
                <li>Educational programming projects</li>
                <li>Situations where code clarity is paramount</li>
                <li>Functional programming exploration</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3">Key Features:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div
                  className={`p-4 rounded-lg border ${isDarkMode ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-gray-50"}`}
                >
                  <h4 className="font-semibold mb-2">Clean Syntax</h4>
                  <p className="text-sm">
                    No unnecessary parentheses in control structures, minimal
                    punctuation.
                  </p>
                </div>
                <div
                  className={`p-4 rounded-lg border ${isDarkMode ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-gray-50"}`}
                >
                  <h4 className="font-semibold mb-2">Functional Programming</h4>
                  <p className="text-sm">
                    First-class functions, closures, higher-order functions.
                  </p>
                </div>
                <div
                  className={`p-4 rounded-lg border ${isDarkMode ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-gray-50"}`}
                >
                  <h4 className="font-semibold mb-2">Immutable by Default</h4>
                  <p className="text-sm">
                    Arrays and strings are immutable for safer programming.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case "language":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Language Guide</h2>

            <div>
              <h3 className="text-lg font-semibold mb-3">
                Variables and Constants
              </h3>
              <CodeBlock>
                {`// Mutable variables
let name = "Lynx"
let version = 1.0

// Constants (immutable)
const PI = 3.14159
const MAX_USERS = 100

// Type inference works automatically
let numbers = [1, 2, 3, 4, 5]
let user = {"name": "Alice", "age": 30}`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Functions</h3>
              <CodeBlock>
                {`// Basic function
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
let doubled = applyTwice(fn(x) { x * 2 }, 4) // Returns 16`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Control Flow</h3>
              <CodeBlock>
                {`// If-else statements (no parentheses required)
let x = 0
if x > 0 {
    println("Positive")
} else {
    println("Negative")
}

// While loops
let i = 0
while i < 10 {
    println(i)
    i = i + 1
}

// For-range loops
for item in [1, 2, 3, 4, 5] {
    println(item)
}

// With index
for item, index in ["a", "b", "c"] {
    println("Item", index, ":", item)
}`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Data Structures</h3>

              <h4 className="font-medium mb-2">Arrays (Immutable):</h4>
              <CodeBlock>
                {`let numbers = [1, 2, 3, 4, 5]
let mixed = [1, "hello", true, 3.14]

// Array operations return new arrays
let extended = numbers.push(6)        // [1, 2, 3, 4, 5, 6]
let length = numbers.len()         // 5

// Accessing elements
let first = numbers[0]`}
              </CodeBlock>

              <h4 className="font-medium mb-2 mt-4">Hash Maps/Objects:</h4>
              <CodeBlock>
                {`let person = {
    "name": "Alice",
    "age": 30,
    "city": "New York"
}

// Property access
let name = person["name"]
let age = person.age

// Adding/updating (returns new object)
let updated = person.set("age", 31)`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">
                Pipeline Operations
              </h3>
              <CodeBlock>
                {`let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

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
    |> sort()`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Error Handling</h3>
              <CodeBlock>
                {`// Function that might fail
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
        println("Result:", result)
        return result
    } on {
        println("Error occurred:", err)
        return 0
    }
}`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Switch Statements</h3>
              <CodeBlock>
                {`let processGrade = fn(grade) {
    switch grade {
        case "A": {
            println("Excellent!")
            return 4.0
        }
        case "B": {
            println("Good job!")
            return 3.0
        }
        case "C": {
            println("Satisfactory")
            return 2.0
        }
        default: {
            println("Needs improvement")
            return 0.0
        }
    }
}`}
              </CodeBlock>
            </div>
          </div>
        );

      case "stdlib":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Standard Library</h2>

            <div>
              <h3 className="text-lg font-semibold mb-3">Module System</h3>
              <CodeBlock>
                {`// Import specific functions from modules
@arrays(map, filter, reduce)
@math(sqrt, pow, abs)
@io(readFile, writeFile)
`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">
                @arrays - Array Operations
              </h3>
              <CodeBlock>
                {`@arrays(map, filter, reduce, sort, reverse, find, contains)

let numbers = [1, 2, 3, 4, 5]
let doubled = map(numbers, fn(x) { x * 2 })
let evens = filter(numbers, fn(x) { x % 2 == 0 })
let sum = reduce(numbers, fn(a, b) { a + b }, 0)
let sorted = sort(numbers, fn(a, b) { b - a }) // Descending`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">
                @math - Mathematical Functions
              </h3>
              <CodeBlock>
                {`@math(sin, cos, tan, sqrt, pow, abs, floor, ceil, round, pi, e)

let area = pi * pow(radius, 2)
let distance = sqrt(pow(x2 - x1, 2) + pow(y2 - y1, 2))
let rounded = round(3.14159, 2) // 3.14`}
              </CodeBlock>
            </div>
          </div>
        );

      case "examples":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Examples</h2>

            <div>
              <h3 className="text-lg font-semibold mb-3">
                1. Fibonacci Sequence
              </h3>
              <CodeBlock>
                {`@arrays(map)

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
println("Fibonacci sequence:", sequence)`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">
                2. Data Processing Pipeline
              </h3>
              <CodeBlock>
                {`
@arrays(filter, map, reduce, sort)

let processUserData = fn(rawData) {
    return rawData
        |> filter(fn(user) { user.age >= 18 })           // Adults only
        |> filter(fn(user) { user.active })              // Active users
        |> map(fn(user) {                                // Normalize names
            return user.name.upper().trim()
        })
}

let users = [
    {"name": "  alice  ", "age": 25, "active": true},
    {"name": "bob", "age": 17, "active": true},
    {"name": "charlie", "age": 30, "active": false},
    {"name": "diana", "age": 28, "active": true}
]

let processedNames = processUserData(users)
println("Processed users:", processedNames)
                  `}
              </CodeBlock>
            </div>
          </div>
        );

      case "performance":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Performance</h2>

            <div>
              <h3 className="text-lg font-semibold mb-3">Benchmarks</h3>
              <p className="mb-4">
                Lynx is optimized for developer productivity rather than raw
                performance. Here are some general performance characteristics:
              </p>
              <ul
                className={`list-disc list-inside space-y-1 mb-6 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                <li>
                  <strong>Startup time:</strong> ~10-50ms for small programs
                </li>
                <li>
                  <strong>Memory usage:</strong> Generally lightweight,
                  immutable data structures may use more memory
                </li>
                <li>
                  <strong>Execution speed:</strong> Suitable for scripting and
                  data processing tasks
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Performance Tips</h3>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">
                    1. Use pipeline operations - they're optimized for chaining
                  </h4>
                  <CodeBlock>
                    {`// Good: Pipeline operations
let result = data
    |> filter(isValid)
    |> map(transform)
    |> reduce(combine, initial)`}
                  </CodeBlock>
                </div>

                <div>
                  <h4 className="font-medium mb-2">
                    2. Prefer iterative approaches for large datasets
                  </h4>
                  <CodeBlock>
                    {`// Good: Iterative approach
let factorial = fn(n) {
    let result = 1
    let i = 2
    while i <= n {
        result = result * i
        i = i + 1
    }
    return result
}`}
                  </CodeBlock>
                </div>

                <div>
                  <h4 className="font-medium mb-2">
                    3. Cache expensive computations
                  </h4>
                  <CodeBlock>
                    {`// Store results in variables when reused
let expensiveResult = complexCalculation(data)
let result1 = processA(expensiveResult)
let result2 = processB(expensiveResult)`}
                  </CodeBlock>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div
        className={`max-w-6xl w-full mx-4 h-[90vh] rounded-xl ${
          isDarkMode ? "bg-black border-gray-700" : "bg-white border-gray-200"
        } border flex overflow-hidden`}
      >
        {/* Sidebar */}
        <div
          className={`w-64 ${
            isDarkMode ? "bg-black border-gray-700" : "bg-white border-gray-200"
          } border-r flex-shrink-0`}
        >
          <div
            className={`p-4 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
          >
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">Lynx Docs</h1>
              <button
                onClick={onClose}
                className={`p-1 rounded transition-colors ${
                  isDarkMode
                    ? "hover:bg-gray-700 text-gray-300 hover:text-white"
                    : "hover:bg-gray-200 text-gray-600 hover:text-black"
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <nav className="p-4">
            <ul className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <li key={section.id}>
                    <button
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeSection === section.id
                          ? isDarkMode
                            ? "bg-gray-700 text-white"
                            : "bg-gray-200 text-black"
                          : isDarkMode
                            ? "text-gray-400 hover:bg-gray-800 hover:text-gray-300"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {section.title}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default DocsModal;
