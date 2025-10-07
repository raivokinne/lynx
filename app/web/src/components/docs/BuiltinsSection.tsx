import { CodeBlock } from "./CodeBlock";

interface BuiltinsSectionProps {
    isDarkMode: boolean;
}

export const BuiltinsSection = ({ isDarkMode }: BuiltinsSectionProps) => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Built-in Functions</h2>

            <div>
                <h3 className="text-lg font-semibold mb-3">Input/Output</h3>

                <h4 className="font-medium mb-2">println(...values)</h4>
                <p className="text-sm mb-2 opacity-80">
                    Prints values to stdout with a newline.
                </p>
                <CodeBlock isDarkMode={isDarkMode}>
                    {`println("Hello, World!")
println("The answer is:", 42)
println("Multiple", "values", "separated", "by", "spaces")`}
                </CodeBlock>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-3">Type Conversion</h3>

                <h4 className="font-medium mb-2">int(value)</h4>
                <p className="text-sm mb-2 opacity-80">
                    Converts a value to an integer.
                </p>
                <CodeBlock isDarkMode={isDarkMode}>
                    {`let x = int("42")        // 42
let y = int(3.14)       // 3
let z = int(true)       // 1`}
                </CodeBlock>

                <h4 className="font-medium mb-2 mt-4">float(value)</h4>
                <p className="text-sm mb-2 opacity-80">
                    Converts a value to a float.
                </p>
                <CodeBlock isDarkMode={isDarkMode}>
                    {`let x = float("3.14")   // 3.14
let y = float(42)       // 42.0
let z = float("2.5e2")  // 250.0`}
                </CodeBlock>

                <h4 className="font-medium mb-2 mt-4">str(value)</h4>
                <p className="text-sm mb-2 opacity-80">
                    Converts a value to a string.
                </p>
                <CodeBlock isDarkMode={isDarkMode}>
                    {`let x = str(42)         // "42"
let y = str(3.14)       // "3.14"
let z = str(true)       // "true"`}
                </CodeBlock>

                <h4 className="font-medium mb-2 mt-4">type(value)</h4>
                <p className="text-sm mb-2 opacity-80">
                    Returns the type of a value as a string.
                </p>
                <CodeBlock isDarkMode={isDarkMode}>
                    {`println(type(42))           // "int"
println(type(3.14))         // "float"
println(type("hello"))      // "str"
println(type([1, 2, 3]))    // "array"
println(type({"a": 1}))     // "hash"

class Dog {
    let init = fn(name) {
        self.name = name
    }
}
let dog = Dog("Buddy")
println(type(dog))          // "Dog"`}
                </CodeBlock>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-3">Collections</h3>

                <h4 className="font-medium mb-2">len(collection)</h4>
                <p className="text-sm mb-2 opacity-80">
                    Returns the length of a string, array, or hash.
                </p>
                <CodeBlock isDarkMode={isDarkMode}>
                    {`let arrLen = len([1, 2, 3, 4])        // 4
let strLen = len("hello")             // 5
let hashLen = len({"a": 1, "b": 2})   // 2`}
                </CodeBlock>

                <h4 className="font-medium mb-2 mt-4">
                    range(start, end, [step])
                </h4>
                <p className="text-sm mb-2 opacity-80">
                    Creates an array of numbers from start to end (exclusive).
                </p>
                <CodeBlock isDarkMode={isDarkMode}>
                    {`let nums = range(0, 5)           // [0, 1, 2, 3, 4]

// Usage in loops
for i in range(0, 5) {
    println(i)
}`}
                </CodeBlock>

                <h4 className="font-medium mb-2 mt-4">copy(dest, src)</h4>
                <p className="text-sm mb-2 opacity-80">
                    Copies elements from source array to destination array.
                    Returns number of elements copied.
                </p>
                <CodeBlock isDarkMode={isDarkMode}>
                    {`let dest = [0, 0, 0, 0, 0]
let src = [1, 2, 3]
let n = copy(dest, src)
println(dest)  // [1, 2, 3, 0, 0]
println(n)     // 3`}
                </CodeBlock>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-3">Utility</h3>

                <h4 className="font-medium mb-2">random()</h4>
                <p className="text-sm mb-2 opacity-80">
                    Returns a random float between 0.0 and 1.0.
                </p>
                <CodeBlock isDarkMode={isDarkMode}>
                    {`let rand = random()              // e.g., 0.7234
let dice = int(random() * 6) + 1 // Random number 1-6
let coin = random() < 0.5        // true or false`}
                </CodeBlock>

                <h4 className="font-medium mb-2 mt-4">sleep(milliseconds)</h4>
                <p className="text-sm mb-2 opacity-80">
                    Pauses execution for the specified number of milliseconds.
                </p>
                <CodeBlock isDarkMode={isDarkMode}>
                    {`println("Starting...")
sleep(1000)  // Wait 1 second
println("Done!")

// Animation loop
for i in range(0, 5) {
    println("Frame", i)
    sleep(100)  // 100ms delay
}`}
                </CodeBlock>
            </div>
        </div>
    );
};
