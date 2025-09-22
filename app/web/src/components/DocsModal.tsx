import { X, Shield, Package, Wrench } from "lucide-react";
import { useState } from "react";

interface DocsModalProps {
  isDarkMode: boolean;
  onClose: () => void;
}

export const DocsModal = ({ isDarkMode, onClose }: DocsModalProps) => {
  const [activeSection, setActiveSection] = useState("language");

  const sections = [
    { id: "language", title: "Language Guide", icon: Package },
    { id: "stdlib", title: "Standard Library", icon: Shield },
    { id: "examples", title: "Examples", icon: Wrench },
  ];

  const CodeBlock = ({
    children,
    language = "lynx",
  }: {
    children: string;
    language?: string;
  }) => (
    <pre
      className={`${isDarkMode ? "bg-gray-800 border-gray-600" : "bg-gray-100 border-gray-300"} border rounded-lg p-4 overflow-x-auto text-sm`}
    >
      <code className={`language-${language}`}>{children}</code>
    </pre>
  );

  const renderContent = () => {
    switch (activeSection) {
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

// Higher-order function
let applyTwice = fn(f, x) {
    return f(f(x))
}

// Usage
let result = greet("World")
let doubled = applyTwice(fn(x) { x * 2 }, 4) // Returns 16`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Control Flow</h3>
              <CodeBlock>
                {`// If-else statements (no parentheses required)
if x > 0 {
    print("Positive")
} else if x < 0 {
    print("Negative")
} else {
    print("Zero")
}

// For-range loops
for item in [1, 2, 3, 4, 5] {
    print(item)
}

// With index
for item, index in ["a", "b", "c"] {
    print("Item", index, ":", item)
}`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">
                Pipeline Operations
              </h3>
              <CodeBlock>
                {`let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

// Pipeline style (much cleaner)
let result = numbers
    |> map(fn(x) { x * 2 })
    |> filter(fn(x) { x % 4 == 0 })
    |> reduce(fn(acc, x) { acc + x }, 0)`}
              </CodeBlock>
            </div>
          </div>
        );

      case "stdlib":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Standard Library</h2>

            <div>
              <h3 className="text-lg font-semibold mb-3">
                @arrays - Array Operations
              </h3>
              <CodeBlock>
                {`@arrays(map, filter, reduce, sort, reverse, find, contains)

let numbers = [1, 2, 3, 4, 5]
let doubled = map(numbers, fn(x) { x * 2 })
let evens = filter(numbers, fn(x) { x % 2 == 0 })
let sum = reduce(numbers, fn(a, b) { a + b }, 0)`}
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

            <div>
              <h3 className="text-lg font-semibold mb-3">
                @strings - String Operations
              </h3>
              <CodeBlock>
                {`@strings(split, join, trim, upper, lower, replace, contains)

let text = "  Hello, World!  "
let clean = trim(text)
let words = split(clean, ", ")
let upper = upper(clean)
let replaced = replace(clean, "World", "Lynx")`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Module System</h3>
              <CodeBlock>
                {`// Import specific functions from modules
@arrays(map, filter, reduce)
@math(sqrt, pow, abs)
@io(readFile, writeFile)

// Import with aliases
@arrays(map as transform, filter as select)`}
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
                {`// Recursive implementation
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
}`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">
                2. Data Processing Pipeline
              </h3>
              <CodeBlock>
                {`@arrays(filter, map, reduce, sort)
@strings(upper, trim)

let processUserData = fn(rawData) {
    return rawData
        |> filter(fn(user) { user.age >= 18 })           // Adults only
        |> filter(fn(user) { user.active })              // Active users
        |> map(fn(user) {                                // Normalize names
            user.set("name", upper(trim(user.name)))
        })
        |> sort(fn(a, b) { a.name.compare(b.name) })     // Sort by name
        |> map(fn(user) { user.name })                   // Extract names
}`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">3. Error Handling</h3>
              <CodeBlock>
                {`let divide = fn(a, b) {
    if b == 0 {
        error "Division by zero"
    }
    return a / b
}

let safeCalculation = fn(x, y) {
    catch err {
        let result = divide(x, y)
        print("Result:", result)
        return result
    } on {
        print("Error occurred:", err)
        return 0
    }
}`}
              </CodeBlock>
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
          isDarkMode
            ? "bg-gray-900 border-gray-700"
            : "bg-white border-gray-200"
        } border flex overflow-hidden`}
      >
        {/* Sidebar */}
        <div
          className={`w-64 ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-gray-50 border-gray-200"
          } border-r flex-shrink-0`}
        >
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">Lynx Docs</h1>
              <button
                onClick={onClose}
                className={`p-1 rounded ${
                  isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
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
                            ? "bg-blue-900 text-blue-200"
                            : "bg-blue-100 text-blue-900"
                          : isDarkMode
                            ? "text-gray-300 hover:bg-gray-700"
                            : "text-gray-700 hover:bg-gray-200"
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
