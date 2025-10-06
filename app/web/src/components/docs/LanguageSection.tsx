import { useTranslation } from "../../hooks/useTranslation";
import { CodeBlock } from "./CodeBlock";

interface LanguageSectionProps {
  isDarkMode: boolean;
}

export const LanguageSection = ({ isDarkMode }: LanguageSectionProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">{t("language.title")}</h2>

      <div>
        <h3 className="text-lg font-semibold mb-3">
          {t("language.variables")}
        </h3>
        <CodeBlock isDarkMode={isDarkMode}>
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
        <h3 className="text-lg font-semibold mb-3">
          {t("language.functions")}
        </h3>
        <CodeBlock isDarkMode={isDarkMode}>
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
        <h3 className="text-lg font-semibold mb-3">
          {t("language.controlFlow")}
        </h3>
        <CodeBlock isDarkMode={isDarkMode}>
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
        <h3 className="text-lg font-semibold mb-3">
          {t("language.dataStructures")}
        </h3>

        <h4 className="font-medium mb-2">{t("language.arrays")}:</h4>
        <CodeBlock isDarkMode={isDarkMode}>
          {`let numbers = [1, 2, 3, 4, 5]
let mixed = [1, "hello", true, 3.14]

// Array operations return new arrays
let extended = numbers.push(6)        // [1, 2, 3, 4, 5, 6]
let length = numbers.len()         // 5

// Accessing elements
let first = numbers[0]`}
        </CodeBlock>

        <h4 className="font-medium mb-2 mt-4">{t("language.objects")}:</h4>
        <CodeBlock isDarkMode={isDarkMode}>
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
          {t("language.pipelines")}
        </h3>
        <CodeBlock isDarkMode={isDarkMode}>
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
        <h3 className="text-lg font-semibold mb-3">{t("language.errors")}</h3>
        <CodeBlock isDarkMode={isDarkMode}>
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
        <h3 className="text-lg font-semibold mb-3">{t("language.switch")}</h3>
        <CodeBlock isDarkMode={isDarkMode}>
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
};
