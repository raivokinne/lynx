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
				<CodeBlock isDarkMode={isDarkMode}>{`// import modules
@time
@math
@json
@crypto

// use module functions
math.sqrt(16)  // 4.0
time.now()`}</CodeBlock>
			</div>

			<div>
				<h3 className="text-xs font-mono mb-2 text-neutral-400">@math</h3>
				<CodeBlock isDarkMode={isDarkMode}>
					{`// constants
let pi = math.pi           // 3.14159...
let e = math.e            // 2.71828...

// basic math
let abs = math.abs(-5)     // 5
let floor = math.floor(3.7) // 3
let ceil = math.ceil(3.2)   // 4
let round = math.round(3.5)  // 4

// power and roots
let sqrt = math.sqrt(16)    // 4.0
let pow = math.pow(2, 8)     // 256.0
let pow2 = math.pow(2, -2)   // 0.25

// min/max/clamp
let min = math.min(3, 7)    // 3
let max = math.max(3, 7)     // 7
let clamp = math.clamp(15, 0, 10)  // 10

// trigonometry
let sin = math.sin(math.radians(30))  // ~0.5
let cos = math.cos(math.radians(60)) // ~0.5

// angle conversion
let deg = math.degrees(3.14159)   // ~180.0
let rad = math.radians(180)        // ~3.14159`}
				</CodeBlock>
			</div>

			<div>
				<h3 className="text-xs font-mono mb-2 text-neutral-400">@time</h3>
				<CodeBlock isDarkMode={isDarkMode}>
					{`// current time
let now = time.now()         // milliseconds since epoch
let ts = time.unix()         // seconds since epoch
let nano = time.unixNano()   // nanoseconds since epoch

// formatting
let formatted = time.format(now, "2006-01-02 15:04")
let iso = time.iso()         // ISO 8601 format
let weekday = time.weekday(now)   // "Monday", "Tuesday", etc.
let month = time.monthName(now)   // "January", "February", etc.

// calculations
let later = time.add(now, 1, "hours")
let sooner = time.sub(now, 30, "minutes")
let diff = time.diff(start, end)

// human readable duration
let dur = time.durHuman(3661000)  // "1h 1m"
let dur2 = time.durHuman(90000)   // "1m 30s"

// sleep
time.sleep(1000)  // wait 1000ms`}
				</CodeBlock>
			</div>

			<div>
				<h3 className="text-xs font-mono mb-2 text-neutral-400">@json</h3>
				<CodeBlock isDarkMode={isDarkMode}>
					{`// parse JSON string
let obj = json.parse('{"name": "Lynx", "age": 1}')
let arr = json.parse('[1, 2, 3]')

// stringify to JSON
let str = json.stringify({ "name": "Lynx" })
let pretty = json.pretty({ "name": "Lynx" })

// clone/copy
let copy = json.clone(obj)

// merge objects
let merged = json.merge({ "a": 1 }, { "b": 2 })
// { "a": 1, "b": 2 }

// utilities
let has = json.has(obj, "name")     // true
let keys = json.keys(obj)           // ["name", "age"]
let vals = json.values(obj)          // ["Lynx", 1]`}
				</CodeBlock>
			</div>

			<div>
				<h3 className="text-xs font-mono mb-2 text-neutral-400">@crypto</h3>
				<CodeBlock isDarkMode={isDarkMode}>
					{`// hash functions
let md5 = crypto.md5("hello")        // "5d41402abc4b2a76b9719d911017c592"
let sha1 = crypto.sha1("hello")       // "aaf4c61ddcc5e8..."
let sha256 = crypto.sha256("hello")   // "2cf24dba5..."
let sha512 = crypto.sha512("hello")   // "9b71d784..."

// random generation
let random = crypto.random(16)      // [255, 124, 53, ...]
let hex = crypto.randomHex(32)        // "a3f1c2d4..."
let uuid = crypto.uuid()             // uuid string

// hex encoding
let encoded = crypto.hexEncode([104, 105])  // "6869"
let decoded = crypto.hexDecode("6869")     // [104, 105]`}
				</CodeBlock>
			</div>
		</div>
	);
};
