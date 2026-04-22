import { useTranslation } from "../../hooks/useTranslation";
import { CodeBlock } from "./CodeBlock";

interface LanguageSectionProps {
	isDarkMode: boolean;
}

export const LanguageSection = ({ isDarkMode }: LanguageSectionProps) => {
	const { t } = useTranslation();

	return (
		<div className="space-y-4">
			<h2 className="text-sm font-mono mb-3 text-neutral-300">{t("language.title")}</h2>

			<div>
				<h3 className="text-xs font-mono mb-2 text-neutral-400">
					{t("language.variables")}
				</h3>
				<CodeBlock isDarkMode={isDarkMode}>
					{`// mutable variables
let name = "lynx"
let version = 1.0

// constants (immutable)
const PI = 3.14159
const MAX_USERS = 100

// type inference works automatically
let numbers = [1, 2, 3, 4, 5]
let user = {"name": "alice", "age": 30}`}
				</CodeBlock>
			</div>

			<div>
				<h3 className="text-xs font-mono mb-2 text-neutral-400">
					{t("language.functions")}
				</h3>
				<CodeBlock isDarkMode={isDarkMode}>
					{`// basic function
let greet = fn(name) {
    return "hello, " ++ name ++ "!"
}

// function with multiple parameters
let add = fn(a, b) {
    return a + b
}

// higher-order function
let applyTwice = fn(f, x) {
    return f(f(x))
}

// arrow syntax
let double = fn(x) { x * 2 }`}
				</CodeBlock>
			</div>

			<div>
				<h3 className="text-xs font-mono mb-2 text-neutral-400">
					{t("language.classes")}
				</h3>
				<CodeBlock isDarkMode={isDarkMode}>
					{`// define a class
class animal {
    let init = fn(name, age) {
        self.name = name
        self.age = age
    }

    let speak = fn() {
        return self.name ++ " makes a sound"
    }
}

// inheritance
class dog(animal) {
    let init = fn(name, age, breed) {
        self.name = name
        self.age = age
        self.breed = breed
    }

    let speak = fn() {
        return self.name ++ " says: woof!"
    }
}`}
				</CodeBlock>
			</div>

			<div>
				<h3 className="text-xs font-mono mb-2 text-neutral-400">
					{t("language.controlFlow")}
				</h3>
				<CodeBlock isDarkMode={isDarkMode}>
					{`// if-else statements
let x = 0
if x > 0 {
    println("positive")
} else if x < 0 {
    println("negative")
} else {
    println("zero")
}

// while loops
let i = 0
while i < 10 {
    println(i)
    i = i + 1
}

// for-range loops
for item in [1, 2, 3, 4, 5] {
    println(item)
}

// for with index
for item, index in ["a", "b", "c"] {
    println(index, ":", item)
}

// break and continue
for i in range(0, 100) {
    if i % 2 == 0 { continue }
    if i > 10 { break }
    println(i)
}`}
				</CodeBlock>
			</div>

			<div>
				<h3 className="text-xs font-mono mb-2 text-neutral-400">
					{t("language.switch")}
				</h3>
				<CodeBlock isDarkMode={isDarkMode}>
					{`let processGrade = fn(grade) {
    switch grade {
        case "A": { return 4.0 }
        case "B": { return 3.0 }
        case "C": { return 2.0 }
        default: { return 0.0 }
    }
}

// pattern matching in switch
let describe = fn(value) {
    switch value {
        case 0: "zero"
        case x if x > 0: "positive"
        case x if x < 0: "negative"
        default: "unknown"
    }
}`}
				</CodeBlock>
			</div>

			<div>
				<h3 className="text-xs font-mono mb-2 text-neutral-400">
					{t("language.dataStructures")}
				</h3>

				<h4 className="text-xs font-mono mb-1 text-neutral-500">{t("language.arrays")}:</h4>
				<CodeBlock isDarkMode={isDarkMode}>
					{`let numbers = [1, 2, 3, 4, 5]

// array methods
let extended = numbers.push(6)     // add element
let first = numbers.head()        // first element
let rest = numbers.tail()         // all but first
let length = len(numbers)       // length
let isEmpty = len(numbers) == 0  // check empty
let hasThree = contains(numbers, 3)

// access elements
let first = numbers[0]
let last = numbers[-1]
let slice = numbers[1:3]`}
				</CodeBlock>

				<h4 className="text-xs font-mono mb-1 mt-3 text-neutral-500">{t("language.objects")}:</h4>
				<CodeBlock isDarkMode={isDarkMode}>
					{`let person = {
    "name": "alice",
    "age": 30,
    "city": "nyc"
}

// access
let name = person["name"]
let age = person.age

// modify (returns new object)
let updated = person.set("age", 31)
let removed = person.delete("city")
let hasCity = person.contains("city")`}
				</CodeBlock>

				<h4 className="text-xs font-mono mb-1 mt-3 text-neutral-500">{t("language.tuples")}:</h4>
				<CodeBlock isDarkMode={isDarkMode}>
					{`let coordinates = (10, 20)
let person = ("alice", 30, true)

// destructuring
let (x, y) = coordinates
let (name, age, active) = person

// access by index
let first = coordinates[0]`}
				</CodeBlock>
			</div>

			<div>
				<h3 className="text-xs font-mono mb-2 text-neutral-400">
					{t("language.pipelines")}
				</h3>
				<CodeBlock isDarkMode={isDarkMode}>
					{`let numbers = [1, 2, 3, 4, 5]

// pipeline style
let result = numbers
    |> map(fn(x) { x * 2 })
    |> filter(fn(x) { x % 4 == 0 })
    |> reduce(fn(acc, x) { acc + x }, 0)

// chaining in traditional style
let result2 = filter(map(numbers, fn(x) { x * 2 }), fn(x) { x > 2 })`}
				</CodeBlock>
			</div>

			<div>
				<h3 className="text-xs font-mono mb-2 text-neutral-400">
					{t("language.errors")}
				</h3>
				<CodeBlock isDarkMode={isDarkMode}>
					{`let divide = fn(a, b) {
    if b == 0 {
        error "division by zero"
    }
    return a / b
}

let safeDivide = fn(x, y) {
    catch err {
        return divide(x, y)
    } on {
        println("error:", err)
        return 0
    }
}

// catch multiple operations
let processData = fn(data) {
    catch err {
        let validated = validate(data)
        let processed = transform(validated)
        return processed
    } on {
        return null
    }
}`}
				</CodeBlock>
			</div>
		</div>
	);
};