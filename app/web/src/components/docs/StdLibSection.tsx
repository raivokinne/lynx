import { useTranslation } from "../../hooks/useTranslation";
import { CodeBlock } from "./CodeBlock";

interface StdLibSectionProps {
    isDarkMode: boolean;
}

export const StdLibSection = ({ isDarkMode }: StdLibSectionProps) => {
    const { t } = useTranslation();

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">{t("stdlib.title")}</h2>

            <div>
                <h3 className="text-lg font-semibold mb-3">
                    {t("stdlib.modules")}
                </h3>
                <CodeBlock isDarkMode={isDarkMode}>
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
                <CodeBlock isDarkMode={isDarkMode}>
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
                <CodeBlock isDarkMode={isDarkMode}>
                    {`@math(sin, cos, tan, sqrt, pow, abs, floor, ceil, round, pi, e)

let area = pi * pow(radius, 2)
let distance = sqrt(pow(x2 - x1, 2) + pow(y2 - y1, 2))
let rounded = round(3.14159, 2) // 3.14`}
                </CodeBlock>
            </div>
        </div>
    );
};

