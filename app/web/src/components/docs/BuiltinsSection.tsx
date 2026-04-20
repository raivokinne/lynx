import { CodeBlock } from "./CodeBlock";

interface BuiltinsSectionProps {
	isDarkMode: boolean;
}

export const BuiltinsSection = ({ isDarkMode }: BuiltinsSectionProps) => {
	return (
		<div className="space-y-4">
			<h2 className="text-sm font-mono mb-3 text-neutral-300">built-in functions</h2>

			<div>
				<h3 className="text-xs font-mono mb-2 text-neutral-400">input/output</h3>

				<h4 className="text-xs font-mono mb-1 text-neutral-300">println(...values)</h4>
				<p className="text-xs font-mono mb-2 text-neutral-500">
					prints values to stdout with a newline
				</p>
				<CodeBlock isDarkMode={isDarkMode}>
					{`println("hello, world!")
println("answer:", 42)`}
				</CodeBlock>
			</div>

			<div>
				<h3 className="text-xs font-mono mb-2 text-neutral-400">type conversion</h3>

				<h4 className="text-xs font-mono mb-1 text-neutral-300">int(value)</h4>
				<p className="text-xs font-mono mb-2 text-neutral-500">
					converts value to integer
				</p>
				<CodeBlock isDarkMode={isDarkMode}>
					{`let x = int("42")        // 42
let y = int(3.14)       // 3`}
				</CodeBlock>

				<h4 className="text-xs font-mono mb-1 mt-2 text-neutral-300">float(value)</h4>
				<CodeBlock isDarkMode={isDarkMode}>
					{`let x = float("3.14")   // 3.14`}
				</CodeBlock>

				<h4 className="text-xs font-mono mb-1 mt-2 text-neutral-300">str(value)</h4>
				<CodeBlock isDarkMode={isDarkMode}>
					{`let x = str(42)         // "42"`}
				</CodeBlock>
			</div>

			<div>
				<h3 className="text-xs font-mono mb-2 text-neutral-400">collections</h3>

				<h4 className="text-xs font-mono mb-1 text-neutral-300">len(collection)</h4>
				<p className="text-xs font-mono mb-2 text-neutral-500">
					returns length of string, array, or hash
				</p>
				<CodeBlock isDarkMode={isDarkMode}>
					{`let arr = len([1, 2, 3])    // 3`}
				</CodeBlock>

				<h4 className="text-xs font-mono mb-1 mt-2 text-neutral-300">range(start, end)</h4>
				<CodeBlock isDarkMode={isDarkMode}>
					{`let nums = range(0, 5)  // [0,1,2,3,4]`}
				</CodeBlock>
			</div>

			<div>
				<h3 className="text-xs font-mono mb-2 text-neutral-400">utility</h3>

				<h4 className="text-xs font-mono mb-1 text-neutral-300">random()</h4>
				<p className="text-xs font-mono mb-2 text-neutral-500">
					returns random float 0.0-1.0
				</p>
				<CodeBlock isDarkMode={isDarkMode}>
					{`let dice = int(random() * 6) + 1`}
				</CodeBlock>

				<h4 className="text-xs font-mono mb-1 mt-2 text-neutral-300">sleep(ms)</h4>
				<CodeBlock isDarkMode={isDarkMode}>
					{`sleep(1000)  // wait 1 second`}
				</CodeBlock>
			</div>
		</div>
	);
};
