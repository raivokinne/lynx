import { useTranslation } from "../../hooks/useTranslation";
import { CodeBlock } from "./CodeBlock";

interface StdLibSectionProps {
	isDarkMode: boolean;
}

export const StdLibSection = ({ isDarkMode }: StdLibSectionProps) => {
	const { t } = useTranslation();

	return (
		<div className="space-y-4">
			<h2 className="text-sm font-mono mb-3 text-neutral-300">{t("stdlib.title")}</h2>

			<div>
				<h3 className="text-xs font-mono mb-2 text-neutral-400">{t("stdlib.modules")}</h3>
				<CodeBlock isDarkMode={isDarkMode}>{`@arrays(map, filter, reduce)`}</CodeBlock>
			</div>

			<div>
				<h3 className="text-xs font-mono mb-2 text-neutral-400">{t("stdlib.arrays")}</h3>
				<CodeBlock isDarkMode={isDarkMode}>
					{`@arrays(map, filter, reduce, sort)

let nums = [1, 2, 3, 4, 5]
let doubled = map(nums, fn(x) { x * 2 })
let evens = filter(nums, fn(x) { x % 2 == 0 })
let sum = reduce(nums, fn(a, b) { a + b }, 0)`}
				</CodeBlock>
			</div>

			<div>
				<h3 className="text-xs font-mono mb-2 text-neutral-400">{t("stdlib.math")}</h3>
				<CodeBlock isDarkMode={isDarkMode}>
					{`@math(sqrt, pow, abs, pi)

let area = pi * pow(radius, 2)
let dist = sqrt(pow(x2-x1, 2) + pow(y2-y1, 2))`}
				</CodeBlock>
			</div>
		</div>
	);
};
