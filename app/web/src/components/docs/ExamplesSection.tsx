import { useTranslation } from "../../hooks/useTranslation";
import { CodeBlock } from "./CodeBlock";

interface ExamplesSectionProps {
  isDarkMode: boolean;
}

export const ExamplesSection = ({ isDarkMode }: ExamplesSectionProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">{t("examples.title")}</h2>

      <div>
        <h3 className="text-lg font-semibold mb-3">
          1. {t("examples.fibonacci")}
        </h3>
        <CodeBlock isDarkMode={isDarkMode}>
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
          2. {t("examples.dataProcessing")}
        </h3>
        <CodeBlock isDarkMode={isDarkMode}>
          {`@arrays(filter, map, reduce, sort)

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
println("Processed users:", processedNames)`}
        </CodeBlock>
      </div>
    </div>
  );
};
