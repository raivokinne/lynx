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
				<CodeBlock isDarkMode={isDarkMode}>{`// import specific functions
@math(sqrt, pow, abs)
@io(readFile, writeFile)
@net(httpGet, httpPost)

// import entire module
@import("math")
@import("io")
@import("net")

// use module functions
math.sqrt(16)  // 4.0
io.readFile("data.txt")`}</CodeBlock>
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
				<h3 className="text-xs font-mono mb-2 text-neutral-400">@io</h3>
				<CodeBlock isDarkMode={isDarkMode}>
					{`// basic I/O
io.readLine()              // read from stdin
io.read()                 // read single input
io.write("hello")          // write to stdout
io.print("hello")          // print with newline
io.println("hello")       // print with newline

// file operations
let content = io.readFile("data.txt")
io.writeFile("output.txt", "hello world")

// string processing
let lines = io.lines("a\\nb\\nc")     // ["a", "b", "c"]
let words = io.words("hello world")    // ["hello", "world"]
let split = io.split("a,b,c", ",")    // ["a", "b", "c"]
let joined = io.join(["a", "b"], "-") // "a-b"

// string manipulation
let trimmed = io.trim("  hello  ")  // "hello"
let upper = io.upper("hello")      // "HELLO"
let lower = io.lower("HELLO")    // "hello"
let replaced = io.replace("hello", "l", "r")  // "herro"

// checks
let hasIt = io.contains("hello", "ell")  // true
let starts = io.startsWith("hello", "hel")  // true
let ends = io.endsWith("hello", "llo")      // true`}
				</CodeBlock>
			</div>

			<div>
				<h3 className="text-xs font-mono mb-2 text-neutral-400">@net</h3>
				<CodeBlock isDarkMode={isDarkMode}>
					{`// HTTP requests
let response = net.httpGet("https://api.example.com/data")
let post = net.httpPost("https://api.example.com/submit", "application/json", "{}")

// URL parsing
let parts = net.parseUrl("https://example.com:8080/path")
// parts = { "protocol": "https", "host": "example.com:8080", "path": "/path" }

// query string
let encoded = net.queryEncode({ "page": "1", "limit": "10" })
// "page=1&limit=10"
let decoded = net.queryDecode("page=1&limit=10")
// { "page": "1", "limit": "10" }

// base64
let encoded = net.base64Encode("hello")  // "aGVsbG8="
let decoded = net.base64Decode("aGVsbG8=")  // "hello"`}
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
let formatted = time.format(now, "%Y-%m-%d %H:%M:%S")
let iso = time.iso()         // ISO 8601 format
let weekday = time.weekday(now)   // "Monday", "Tuesday", etc.
let month = time.monthName(now)   // "January", "February", etc.

// calculations
let later = time.add(now, 1, "hours")
let sooner = time.sub(now, 30, "minutes")
let diff = time.diff(start, end)

// human readable duration
let dur = time.durHuman(3661000)  // "6m 10s"
let dur2 = time.durHuman(90000)   // "1m 30s"

// sleep
time.sleep(1000)  // wait 1000ms`}
				</CodeBlock>
			</div>

			<div>
				<h3 className="text-xs font-mono mb-2 text-neutral-400">@os</h3>
				<CodeBlock isDarkMode={isDarkMode}>
					{`// environment
let home = os.home()          // "/home/user"
let cwd = os.cwd()            // current working dir
let temp = os.temp()          // temp directory
let user = os.user()          // current user

// platform info
let arch = os.arch()         // "arm64", "amd64"
let platform = os.platform()  // "darwin", "linux", "windows"
let hostname = os.hostname()  // "mycomputer"

// env variables
let path = os.env("PATH")
os.setEnv("MY_VAR", "value")

// file system
let exists = os.exists("file.txt")
let info = os.stat("file.txt")
// info = { "name": "...", "size": 100, "type": "file", "modTime": 1234567890 }

os.mkdir("newdir")
os.remove("oldfile.txt")
os.rename("old.txt", "new.txt")

let files = os.listDir(".")  // ["file1.txt", "file2.txt"]`}
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
// \`{"name":"Lynx"}\`
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

			<div>
				<h3 className="text-xs font-mono mb-2 text-neutral-400">@sort</h3>
				<CodeBlock isDarkMode={isDarkMode}>
					{`// sorting algorithms
let arr = [5, 2, 8, 1, 9]
let sorted = sort.bubble(arr)       // bubble sort
let sorted = sort.insertion(arr)     // insertion sort
let sorted = sort.selection(arr)   // selection sort
let sorted = sort.quick(arr)        // quicksort
let sorted = sort.merge(arr)         // merge sort
let sorted = sort.heap(arr)         // heap sort
let sorted = sort.radix(arr)        // radix sort

// utility
let shuffled = sort.shuffle(arr)     // random shuffle
let reversed = sort.reverse(arr)      // reverse order
let isSorted = sort.isSorted(arr)     // check if sorted`}
				</CodeBlock>
			</div>

			<div>
				<h3 className="text-xs font-mono mb-2 text-neutral-400">@rand</h3>
				<CodeBlock isDarkMode={isDarkMode}>
					{`// random numbers
let n = rand.int(1, 100)        // random int 1-100
let f = rand.float(0, 1)        // random float 0.0-1.0
let b = rand.bool()              // true or false

// random strings
let s = rand.string(16)         // random alphanumeric
let hex = rand.hex(8)            // random hex string
let alpha = rand.alpha(8)          // random letters

// random from array
let item = rand.element(["a", "b", "c"])
let shuffled = rand.shuffle([1, 2, 3, 4, 5])
let sample = rand.sample([1, 2, 3], 2)   // 2 random elements`}
				</CodeBlock>
			</div>

			<div>
				<h3 className="text-xs font-mono mb-2 text-neutral-400">@iter</h3>
				<CodeBlock isDarkMode={isDarkMode}>
					{`let nums = [1, 2, 3, 4, 5]

// map/filter/reduce
let doubled = iter.map(nums, fn(x) { x * 2 })
let evens = iter.filter(nums, fn(x) { x % 2 == 0 })
let sum = iter.reduce(nums, fn(a, b) { a + b }, 0)

// search
let found = iter.find(nums, fn(x) { x > 3 })     // 4
let idx = iter.findIndex(nums, fn(x) { x > 3 })   // 3
let has = iter.some(nums, fn(x) { x > 4 })         // true
let all = iter.every(nums, fn(x) { x > 0 })        // true

// array utilities
let chunked = iter.chunk([1, 2, 3, 4, 5], 2)  // [[1,2], [3,4], [5]]
let taken = iter.take(nums, 3)          // [1, 2, 3]
let skipped = iter.skip(nums, 2)       // [3, 4, 5]
let zipped = iter.zip([1, 2], ["a", "b"])  // [[1, "a"], [2, "b"]]
let enumerated = iter.enumerate(["a", "b"])  // [[0, "a"], [1, "b"]]
let uniq = iter.unique([1, 2, 2, 3])  // [1, 2, 3]`}
				</CodeBlock>
			</div>

			<div>
				<h3 className="text-xs font-mono mb-2 text-neutral-400">@fmt</h3>
				<CodeBlock isDarkMode={isDarkMode}>
					{`// sprintf-style formatting
let s = fmt.sprintf("Name: %s, Age: %d", "Lynx", 1)
// "Name: Lynx, Age: 1"

// number bases
let hex = fmt.hex(255)       // "ff"
let oct = fmt.oct(255)       // "377"
let bin = fmt.bin(5)         // "101"

// padding
let padded = fmt.padLeft("42", 6, "0")   // "000042"
let padded = fmt.padRight("hi", 6)       // "hi    "
let centered = fmt.center("hi", 6)    // "  hi  "

// wrapping
let lines = fmt.wrap("Lorem ipsum dolor", 10)
// ["Lorem", "ipsum", "dolor"]`}
				</CodeBlock>
			</div>

			<div>
				<h3 className="text-xs font-mono mb-2 text-neutral-400">@re (regex)</h3>
				<CodeBlock isDarkMode={isDarkMode}>
					{`// pattern matching
let matched = re.match("\\d+", "123abc")     // true/false
let search = re.search("\\d+", "abc123")  // match object or null
let found = re.find("\\d+", "123abc")    // first match
let all = re.findAll("\\d+", "1 2 3")   // ["1", "2", "3"]

// replace/split
let replaced = re.replace("\\d+", "abc123", "#")  // "abc#"
let parts = re.split("\\s+", "a b c")           // ["a", "b", "c"]

// pattern escaping
let escaped = re.escape("file.txt")  // "file\\.txt"`}
				</CodeBlock>
			</div>
		</div>
	);
};