import {
  X,
  Shield,
  Package,
  Book,
  Code,
  Search,
  Languages,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useTranslation } from "../hooks/useTranslation";
import { LanguageSelector } from "./LanguageSelector";
import { languageComparisons } from "../data/comparisons";

interface DocsModalProps {
  isDarkMode: boolean;
  onClose: () => void;
}

interface SearchResult {
  section: string;
  sectionTitle: string;
  content: string;
  type: "heading" | "text" | "code";
}

export const DocsModal = ({ isDarkMode, onClose }: DocsModalProps) => {
  const [activeSection, setActiveSection] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedComparisonLanguages, setSelectedComparisonLanguages] =
    useState<string[]>(["lynx", "javascript"]);
  const { t } = useTranslation();

  const sections = useMemo(
    () => [
      { id: "overview", title: t("nav.overview"), icon: Book },
      { id: "language", title: t("nav.language"), icon: Package },
      { id: "stdlib", title: t("nav.stdlib"), icon: Shield },
      { id: "examples", title: t("nav.examples"), icon: Code },
      { id: "comparisons", title: t("nav.comparisons"), icon: Languages },
    ],
    [t],
  );

  const availableComparisonLanguages = [
    "lynx",
    "javascript",
    "python",
    "go",
    "rust",
  ];

  const CodeBlock = ({
    children,
    language = "lynx",
    highlight = "",
    filename = "",
  }: {
    children: string;
    language?: string;
    highlight?: string;
    filename?: string;
  }) => {
    const highlightCode = (code: string, query: string) => {
      if (!query.trim()) return code;

      const regex = new RegExp(
        `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
        "gi",
      );
      return code.replace(
        regex,
        '<mark class="bg-yellow-300 text-black">$1</mark>',
      );
    };

    return (
      <div
        className={`border rounded-lg overflow-hidden ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
      >
        {filename && (
          <div
            className={`px-4 py-2 text-xs font-mono border-b ${
              isDarkMode
                ? "bg-gray-800 border-gray-700 text-gray-400"
                : "bg-gray-50 border-gray-200 text-gray-600"
            }`}
          >
            {filename}
          </div>
        )}
        <pre
          className={`${isDarkMode ? "bg-black" : "bg-white"} p-4 overflow-x-auto text-sm font-mono`}
        >
          <code
            className={`language-${language} ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
            dangerouslySetInnerHTML={{
              __html: highlightCode(children, highlight),
            }}
          />
        </pre>
      </div>
    );
  };

  const searchableContent = useMemo(() => {
    const content: SearchResult[] = [];

    // Overview content
    content.push(
      {
        section: "overview",
        sectionTitle: t("overview.title"),
        content: t("overview.title"),
        type: "heading",
      },
      {
        section: "overview",
        sectionTitle: t("overview.title"),
        content: t("overview.description"),
        type: "text",
      },
      {
        section: "overview",
        sectionTitle: t("overview.title"),
        content: t("overview.whenToUse"),
        type: "heading",
      },
      {
        section: "overview",
        sectionTitle: t("overview.title"),
        content: t("overview.whenToUse.rapid"),
        type: "text",
      },
      {
        section: "overview",
        sectionTitle: t("overview.title"),
        content: t("overview.whenToUse.data"),
        type: "text",
      },
      {
        section: "overview",
        sectionTitle: t("overview.title"),
        content: t("overview.whenToUse.educational"),
        type: "text",
      },
      {
        section: "overview",
        sectionTitle: t("overview.title"),
        content: t("overview.whenToUse.clarity"),
        type: "text",
      },
      {
        section: "overview",
        sectionTitle: t("overview.title"),
        content: t("overview.whenToUse.functional"),
        type: "text",
      },
      {
        section: "overview",
        sectionTitle: t("overview.title"),
        content: t("overview.keyFeatures"),
        type: "heading",
      },
      {
        section: "overview",
        sectionTitle: t("overview.title"),
        content:
          t("overview.features.clean") +
          " - " +
          t("overview.features.clean.desc"),
        type: "text",
      },
      {
        section: "overview",
        sectionTitle: t("overview.title"),
        content:
          t("overview.features.functional") +
          " - " +
          t("overview.features.functional.desc"),
        type: "text",
      },
      {
        section: "overview",
        sectionTitle: t("overview.title"),
        content:
          t("overview.features.immutable") +
          " - " +
          t("overview.features.immutable.desc"),
        type: "text",
      },
    );

    // Language content
    content.push(
      {
        section: "language",
        sectionTitle: t("language.title"),
        content: t("language.title"),
        type: "heading",
      },
      {
        section: "language",
        sectionTitle: t("language.title"),
        content: t("language.variables"),
        type: "heading",
      },
      {
        section: "language",
        sectionTitle: t("language.title"),
        content: t("language.functions"),
        type: "heading",
      },
      {
        section: "language",
        sectionTitle: t("language.title"),
        content: t("language.controlFlow"),
        type: "heading",
      },
      {
        section: "language",
        sectionTitle: t("language.title"),
        content: t("language.dataStructures"),
        type: "heading",
      },
      {
        section: "language",
        sectionTitle: t("language.title"),
        content: t("language.arrays"),
        type: "heading",
      },
      {
        section: "language",
        sectionTitle: t("language.title"),
        content: t("language.objects"),
        type: "heading",
      },
      {
        section: "language",
        sectionTitle: t("language.title"),
        content: t("language.pipelines"),
        type: "heading",
      },
      {
        section: "language",
        sectionTitle: t("language.title"),
        content: t("language.errors"),
        type: "heading",
      },
      {
        section: "language",
        sectionTitle: t("language.title"),
        content: t("language.switch"),
        type: "heading",
      },
    );

    // Standard Library content
    content.push(
      {
        section: "stdlib",
        sectionTitle: t("stdlib.title"),
        content: t("stdlib.title"),
        type: "heading",
      },
      {
        section: "stdlib",
        sectionTitle: t("stdlib.title"),
        content: t("stdlib.modules"),
        type: "heading",
      },
      {
        section: "stdlib",
        sectionTitle: t("stdlib.title"),
        content: t("stdlib.arrays"),
        type: "heading",
      },
      {
        section: "stdlib",
        sectionTitle: t("stdlib.title"),
        content: t("stdlib.math"),
        type: "heading",
      },
    );

    // Examples content
    content.push(
      {
        section: "examples",
        sectionTitle: t("examples.title"),
        content: t("examples.title"),
        type: "heading",
      },
      {
        section: "examples",
        sectionTitle: t("examples.title"),
        content: t("examples.fibonacci"),
        type: "heading",
      },
      {
        section: "examples",
        sectionTitle: t("examples.title"),
        content: t("examples.dataProcessing"),
        type: "heading",
      },
    );

    // Comparisons content
    content.push(
      {
        section: "comparisons",
        sectionTitle: t("comparisons.title"),
        content: t("comparisons.title"),
        type: "heading",
      },
      {
        section: "comparisons",
        sectionTitle: t("comparisons.title"),
        content: t("comparisons.description"),
        type: "text",
      },
      {
        section: "comparisons",
        sectionTitle: t("comparisons.title"),
        content: t("comparisons.selectLanguages"),
        type: "heading",
      },
    );

    return content;
  }, [t]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    const results = searchableContent.filter((item) =>
      item.content.toLowerCase().includes(query),
    );

    const groupedResults = results.reduce(
      (acc, result) => {
        if (!acc[result.section]) acc[result.section] = [];
        if (acc[result.section].length < 5) {
          acc[result.section].push(result);
        }
        return acc;
      },
      {} as Record<string, SearchResult[]>,
    );

    return groupedResults;
  }, [searchQuery, searchableContent]);

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(
      `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi",
    );
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-300 text-black">
          {part}
        </mark>
      ) : (
        part
      ),
    );
  };

  const renderSearchResults = () => {
    if (!searchQuery.trim()) return null;

    const hasResults = Object.keys(searchResults).length > 0;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{t("search.results")}</h2>
        </div>

        {!hasResults ? (
          <div
            className={`text-center py-8 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm mt-2">{t("search.tryDifferent")}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(searchResults).map(([sectionId, results]) => {
              const section = sections.find((s) => s.id === sectionId);
              const SectionIcon = section?.icon || Book;

              return (
                <div
                  key={sectionId}
                  className={`border rounded-lg p-4 ${
                    isDarkMode
                      ? "border-gray-700 bg-gray-900"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <button
                    onClick={() => {
                      setActiveSection(sectionId);
                      setSearchQuery("");
                    }}
                    className={`flex items-center gap-2 mb-3 text-lg font-semibold hover:underline ${
                      isDarkMode
                        ? "text-blue-400 hover:text-blue-300"
                        : "text-blue-600 hover:text-blue-800"
                    }`}
                  >
                    <SectionIcon className="w-5 h-5" />
                    {section?.title}
                  </button>

                  <div className="space-y-2">
                    {results.map((result, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded border-l-2 ${
                          result.type === "heading"
                            ? isDarkMode
                              ? "border-blue-500 bg-gray-800"
                              : "border-blue-500 bg-blue-50"
                            : result.type === "code"
                              ? isDarkMode
                                ? "border-green-500 bg-gray-800"
                                : "border-green-500 bg-green-50"
                              : isDarkMode
                                ? "border-gray-600 bg-gray-800"
                                : "border-gray-300 bg-white"
                        }`}
                      >
                        <div
                          className={`text-sm font-mono ${
                            result.type === "heading"
                              ? "font-bold"
                              : result.type === "code"
                                ? "font-mono text-xs"
                                : ""
                          }`}
                        >
                          {result.type === "code" ? (
                            <pre className="whitespace-pre-wrap">
                              {highlightText(
                                result.content.slice(0, 200) +
                                  (result.content.length > 200 ? "..." : ""),
                                searchQuery,
                              )}
                            </pre>
                          ) : (
                            highlightText(
                              result.content.slice(0, 200) +
                                (result.content.length > 200 ? "..." : ""),
                              searchQuery,
                            )
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderComparisons = () => {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">{t("comparisons.title")}</h2>
          <p className="text-lg mb-6">{t("comparisons.description")}</p>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">
            {t("comparisons.selectLanguages")}
          </h3>
          <div className="flex flex-wrap gap-2">
            {availableComparisonLanguages.map((lang) => (
              <button
                key={lang}
                onClick={() => {
                  if (selectedComparisonLanguages.includes(lang)) {
                    if (selectedComparisonLanguages.length > 1) {
                      setSelectedComparisonLanguages(
                        selectedComparisonLanguages.filter((l) => l !== lang),
                      );
                    }
                  } else {
                    setSelectedComparisonLanguages([
                      ...selectedComparisonLanguages,
                      lang,
                    ]);
                  }
                }}
                className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors capitalize ${
                  selectedComparisonLanguages.includes(lang)
                    ? isDarkMode
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "bg-blue-500 border-blue-500 text-white"
                    : isDarkMode
                      ? "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          {languageComparisons.map((comparison, index) => (
            <div
              key={index}
              className={`border rounded-lg p-6 ${
                isDarkMode
                  ? "border-gray-700 bg-gray-900"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <h3 className="text-xl font-bold mb-2">{comparison.title}</h3>
              <p
                className={`mb-4 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
              >
                {comparison.description}
              </p>

              <div
                className="grid gap-4"
                style={{
                  gridTemplateColumns:
                    selectedComparisonLanguages.length === 1
                      ? "1fr"
                      : selectedComparisonLanguages.length === 2
                        ? "repeat(2, 1fr)"
                        : "repeat(auto-fit, minmax(300px, 1fr))",
                }}
              >
                {selectedComparisonLanguages.map((langCode) => {
                  const example = comparison.examples[langCode];
                  if (!example) return null;

                  return (
                    <div key={langCode}>
                      <div
                        className={`flex items-center gap-2 mb-2 p-2 rounded ${
                          isDarkMode ? "bg-gray-800" : "bg-white"
                        }`}
                      >
                        <h4 className="font-semibold capitalize">{langCode}</h4>
                      </div>
                      <CodeBlock
                        language={example.language}
                        filename={example.filename}
                      >
                        {example.code}
                      </CodeBlock>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (searchQuery.trim()) {
      return renderSearchResults();
    }

    switch (activeSection) {
      case "overview":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">{t("overview.title")}</h2>

            <div className="prose max-w-none">
              <p className="text-lg mb-6">{t("overview.description")}</p>

              <h3 className="text-lg font-semibold mb-3">
                {t("overview.whenToUse")}
              </h3>
              <ul
                className={`list-disc list-inside space-y-1 mb-6 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                <li>{t("overview.whenToUse.rapid")}</li>
                <li>{t("overview.whenToUse.data")}</li>
                <li>{t("overview.whenToUse.educational")}</li>
                <li>{t("overview.whenToUse.clarity")}</li>
                <li>{t("overview.whenToUse.functional")}</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3">
                {t("overview.keyFeatures")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div
                  className={`p-4 rounded-lg border ${isDarkMode ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-gray-50"}`}
                >
                  <h4 className="font-semibold mb-2">
                    {t("overview.features.clean")}
                  </h4>
                  <p className="text-sm">{t("overview.features.clean.desc")}</p>
                </div>
                <div
                  className={`p-4 rounded-lg border ${isDarkMode ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-gray-50"}`}
                >
                  <h4 className="font-semibold mb-2">
                    {t("overview.features.functional")}
                  </h4>
                  <p className="text-sm">
                    {t("overview.features.functional.desc")}
                  </p>
                </div>
                <div
                  className={`p-4 rounded-lg border ${isDarkMode ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-gray-50"}`}
                >
                  <h4 className="font-semibold mb-2">
                    {t("overview.features.immutable")}
                  </h4>
                  <p className="text-sm">
                    {t("overview.features.immutable.desc")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case "language":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">{t("language.title")}</h2>

            <div>
              <h3 className="text-lg font-semibold mb-3">
                {t("language.variables")}
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
              <h3 className="text-lg font-semibold mb-3">
                {t("language.functions")}
              </h3>
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
              <h3 className="text-lg font-semibold mb-3">
                {t("language.controlFlow")}
              </h3>
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
              <h3 className="text-lg font-semibold mb-3">
                {t("language.dataStructures")}
              </h3>

              <h4 className="font-medium mb-2">{t("language.arrays")}:</h4>
              <CodeBlock>
                {`let numbers = [1, 2, 3, 4, 5]
let mixed = [1, "hello", true, 3.14]

// Array operations return new arrays
let extended = numbers.push(6)        // [1, 2, 3, 4, 5, 6]
let length = numbers.len()         // 5

// Accessing elements
let first = numbers[0]`}
              </CodeBlock>

              <h4 className="font-medium mb-2 mt-4">
                {t("language.objects")}:
              </h4>
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
                {t("language.pipelines")}
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
              <h3 className="text-lg font-semibold mb-3">
                {t("language.errors")}
              </h3>
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
              <h3 className="text-lg font-semibold mb-3">
                {t("language.switch")}
              </h3>
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
            <h2 className="text-2xl font-bold mb-4">{t("stdlib.title")}</h2>

            <div>
              <h3 className="text-lg font-semibold mb-3">
                {t("stdlib.modules")}
              </h3>
              <CodeBlock>
                {`// Import specific functions from modules
@arrays(map, filter, reduce)
@math(sqrt, pow, abs)
@io(readFile, writeFile)`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">
                {t("stdlib.arrays")}
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
              <h3 className="text-lg font-semibold mb-3">{t("stdlib.math")}</h3>
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
            <h2 className="text-2xl font-bold mb-4">{t("examples.title")}</h2>

            <div>
              <h3 className="text-lg font-semibold mb-3">
                1. {t("examples.fibonacci")}
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
                2. {t("examples.dataProcessing")}
              </h3>
              <CodeBlock>
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

      case "comparisons":
        return renderComparisons();

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div
        className={`w-full mx-4 h-[90vh] rounded-xl ${
          isDarkMode ? "bg-black border-gray-700" : "bg-white border-gray-200"
        } border flex overflow-hidden`}
      >
        {/* Sidebar */}
        <div
          className={`w-64 ${
            isDarkMode ? "bg-black border-gray-700" : "bg-white border-gray-200"
          } border-r flex-shrink-0 flex flex-col`}
        >
          {/* Header */}
          <div
            className={`p-4 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
          >
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold">{t("docs.title")}</h1>
              <button
                onClick={onClose}
                className={`p-1 rounded transition-colors ${
                  isDarkMode
                    ? "hover:bg-gray-700 text-gray-300 hover:text-white"
                    : "hover:bg-gray-200 text-gray-600 hover:text-black"
                }`}
                aria-label={t("common.close")}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Language Selector */}
            <div className="mb-4">
              <LanguageSelector isDarkMode={isDarkMode} />
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              />
              <input
                type="text"
                placeholder={t("search.placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg text-sm border transition-colors ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-gray-500 focus:bg-gray-700"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-gray-400 focus:bg-gray-50"
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded transition-colors ${
                    isDarkMode
                      ? "hover:bg-gray-600 text-gray-400 hover:text-white"
                      : "hover:bg-gray-200 text-gray-500 hover:text-black"
                  }`}
                  aria-label={t("search.clear")}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 flex-1">
            <ul className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <li key={section.id}>
                    <button
                      onClick={() => {
                        setActiveSection(section.id);
                        setSearchQuery("");
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeSection === section.id && !searchQuery
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
