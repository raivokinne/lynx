import { CodeBlock } from "./CodeBlock";
import { useTranslation } from "../../hooks/useTranslation";

interface BuiltinsSectionProps {
	isDarkMode: boolean;
}

export const BuiltinsSection = ({ isDarkMode }: BuiltinsSectionProps) => {
	const { t } = useTranslation();

	return (
		<div className="space-y-4">
			<h2 className="text-sm font-mono mb-3 text-neutral-300">{t("builtins.title")}</h2>

			<div>
				<h3 className="text-xs font-mono mb-2 text-neutral-400">{t("builtins.io")}</h3>

				<h4 className="text-xs font-mono mb-1 text-neutral-300">{t("builtins.println")}</h4>
				<p className="text-xs font-mono mb-2 text-neutral-500">
					{t("builtins.println.desc")}
				</p>
				<CodeBlock isDarkMode={isDarkMode}>
					{`println("hello, world!")
println("answer:", 42)`}
				</CodeBlock>
			</div>

			<div>
				<h3 className="text-xs font-mono mb-2 text-neutral-400">{t("builtins.typeConversion")}</h3>

				<h4 className="text-xs font-mono mb-1 text-neutral-300">{t("builtins.int")}</h4>
				<p className="text-xs font-mono mb-2 text-neutral-500">
					{t("builtins.int.desc")}
				</p>
				<CodeBlock isDarkMode={isDarkMode}>
					{`let x = int("42")        // 42
let y = int(3.14)       // 3`}
				</CodeBlock>

				<h4 className="text-xs font-mono mb-1 mt-2 text-neutral-300">{t("builtins.float")}</h4>
				<CodeBlock isDarkMode={isDarkMode}>
					{`let x = float("3.14")   // 3.14`}
				</CodeBlock>

				<h4 className="text-xs font-mono mb-1 mt-2 text-neutral-300">{t("builtins.str")}</h4>
				<CodeBlock isDarkMode={isDarkMode}>
					{`let x = str(42)         // "42"`}
				</CodeBlock>
			</div>

			<div>
				<h3 className="text-xs font-mono mb-2 text-neutral-400">{t("builtins.collections")}</h3>

				<h4 className="text-xs font-mono mb-1 text-neutral-300">{t("builtins.len")}</h4>
				<p className="text-xs font-mono mb-2 text-neutral-500">
					{t("builtins.len.desc")}
				</p>
				<CodeBlock isDarkMode={isDarkMode}>
					{`let arr = len([1, 2, 3])    // 3`}
				</CodeBlock>

				<h4 className="text-xs font-mono mb-1 mt-2 text-neutral-300">{t("builtins.range")}</h4>
				<CodeBlock isDarkMode={isDarkMode}>
					{`let nums = range(0, 5)  // [0,1,2,3,4]`}
				</CodeBlock>
			</div>

			<div>
				<h3 className="text-xs font-mono mb-2 text-neutral-400">{t("builtins.utility")}</h3>

				<h4 className="text-xs font-mono mb-1 text-neutral-300">{t("builtins.random")}</h4>
				<p className="text-xs font-mono mb-2 text-neutral-500">
					{t("builtins.random.desc")}
				</p>
				<CodeBlock isDarkMode={isDarkMode}>
					{`let dice = int(random() * 6) + 1`}
				</CodeBlock>

				<h4 className="text-xs font-mono mb-1 mt-2 text-neutral-300">{t("builtins.sleep")}</h4>
				<p className="text-xs font-mono mb-2 text-neutral-500">
					{t("builtins.sleep.desc")}
				</p>
				<CodeBlock isDarkMode={isDarkMode}>
					{`sleep(1000)  // wait 1 second`}
				</CodeBlock>
			</div>
		</div>
	);
};