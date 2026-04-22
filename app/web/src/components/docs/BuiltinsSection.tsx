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
				<h3 className="text-xs font-mono mb-2 text-neutral-400">{t("builtins.ioFunctions")}</h3>

				<h4 className="text-xs font-mono mb-1 text-neutral-300">_readLine</h4>
				<p className="text-xs font-mono mb-2 text-neutral-500">Reads a line from stdin</p>
				<CodeBlock isDarkMode={isDarkMode}>
					{`let name = _readLine()`}
				</CodeBlock>

				<h4 className="text-xs font-mono mb-1 mt-2 text-neutral-300">_read</h4>
				<p className="text-xs font-mono mb-2 text-neutral-500">Reads input from stdin</p>
				<CodeBlock isDarkMode={isDarkMode}>
					{`let input = _read()`}
				</CodeBlock>

				<h4 className="text-xs font-mono mb-1 mt-2 text-neutral-300">_write</h4>
				<p className="text-xs font-mono mb-2 text-neutral-500">Writes to stdout without newline</p>
				<CodeBlock isDarkMode={isDarkMode}>
					{`_write("hello")`}
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

				<h4 className="text-xs font-mono mb-1 mt-2 text-neutral-300">type</h4>
				<p className="text-xs font-mono mb-2 text-neutral-500">Returns the type of a value as a string</p>
				<CodeBlock isDarkMode={isDarkMode}>
					{`type(42)            // "int"
type("hello")       // "str"
type([1, 2, 3])    // "array"
type({})            // "hash"`}
				</CodeBlock>
			</div>

			<div>
				<h3 className="text-xs font-mono mb-2 text-neutral-400">{t("builtins.collections")}</h3>

				<h4 className="text-xs font-mono mb-1 text-neutral-300">{t("builtins.len")}</h4>
				<p className="text-xs font-mono mb-2 text-neutral-500">
					{t("builtins.len.desc")}
				</p>
				<CodeBlock isDarkMode={isDarkMode}>
					{`let arr = len([1, 2, 3])    // 3
let str = len("hello")        // 5
let hash = len({"a": 1})     // 1`}
				</CodeBlock>

				<h4 className="text-xs font-mono mb-1 mt-2 text-neutral-300">{t("builtins.range")}</h4>
				<p className="text-xs font-mono mb-2 text-neutral-500">Creates an array of integers from start to end (exclusive)</p>
				<CodeBlock isDarkMode={isDarkMode}>
					{`let nums = range(0, 5)  // [0, 1, 2, 3, 4]
let nums = range(1, 4)   // [1, 2, 3]`}
				</CodeBlock>

				<h4 className="text-xs font-mono mb-1 mt-2 text-neutral-300">copy</h4>
				<p className="text-xs font-mono mb-2 text-neutral-500">Copies elements from source to destination array</p>
				<CodeBlock isDarkMode={isDarkMode}>
					{`let dest = [0, 0, 0]
let src = [1, 2, 3]
copy(dest, src)  // dest is now [1, 2, 3]`}
				</CodeBlock>
			</div>

			<div>
				<h3 className="text-xs font-mono mb-2 text-neutral-400">{t("builtins.networking")}</h3>

				<h4 className="text-xs font-mono mb-1 text-neutral-300">_http_get</h4>
				<p className="text-xs font-mono mb-2 text-neutral-500">Performs an HTTP GET request</p>
				<CodeBlock isDarkMode={isDarkMode}>
					{`let response = _http_get("https://api.example.com/data")`}
				</CodeBlock>

				<h4 className="text-xs font-mono mb-1 mt-2 text-neutral-300">_http_post</h4>
				<p className="text-xs font-mono mb-2 text-neutral-500">Performs an HTTP POST request</p>
				<CodeBlock isDarkMode={isDarkMode}>
					{`_http_post("https://api.example.com/submit", "application/json", "{}")`}
				</CodeBlock>

				<h4 className="text-xs font-mono mb-1 mt-2 text-neutral-300">_http_put</h4>
				<p className="text-xs font-mono mb-2 text-neutral-500">Performs an HTTP PUT request</p>
				<CodeBlock isDarkMode={isDarkMode}>
					{`_http_put("https://api.example.com/update", "application/json", "{}")`}
				</CodeBlock>

				<h4 className="text-xs font-mono mb-1 mt-2 text-neutral-300">_http_delete</h4>
				<p className="text-xs font-mono mb-2 text-neutral-500">Performs an HTTP DELETE request</p>
				<CodeBlock isDarkMode={isDarkMode}>
					{`_http_delete("https://api.example.com/resource/1")`}
				</CodeBlock>

				<h4 className="text-xs font-mono mb-1 mt-2 text-neutral-300">_http_head</h4>
				<p className="text-xs font-mono mb-2 text-neutral-500">Performs an HTTP HEAD request</p>
				<CodeBlock isDarkMode={isDarkMode}>
					{`let info = _http_head("https://api.example.com/file")
// returns { "status": 200 }`}
				</CodeBlock>
			</div>

			<div>
				<h3 className="text-xs font-mono mb-2 text-neutral-400">{t("builtins.time")}</h3>

				<h4 className="text-xs font-mono mb-1 text-neutral-300">_timestamp</h4>
				<p className="text-xs font-mono mb-2 text-neutral-500">Returns current time in milliseconds</p>
				<CodeBlock isDarkMode={isDarkMode}>
					{`let now = _timestamp()`}
				</CodeBlock>

				<h4 className="text-xs font-mono mb-1 mt-2 text-neutral-300">_unix</h4>
				<p className="text-xs font-mono mb-2 text-neutral-500">Returns current time in seconds since epoch</p>
				<CodeBlock isDarkMode={isDarkMode}>
					{`let seconds = _unix()`}
				</CodeBlock>

				<h4 className="text-xs font-mono mb-1 mt-2 text-neutral-300">_unixNano</h4>
				<p className="text-xs font-mono mb-2 text-neutral-500">Returns current time in nanoseconds since epoch</p>
				<CodeBlock isDarkMode={isDarkMode}>
					{`let nanos = _unixNano()`}
				</CodeBlock>

				<h4 className="text-xs font-mono mb-1 mt-2 text-neutral-300">_formatTime</h4>
				<p className="text-xs font-mono mb-2 text-neutral-500">Formats a timestamp with Go time format string</p>
				<CodeBlock isDarkMode={isDarkMode}>
					{`_formatTime(_timestamp(), "%Y-%m-%d")  // "2024-01-15"`}
				</CodeBlock>

				<h4 className="text-xs font-mono mb-1 mt-2 text-neutral-300">_parseTime</h4>
				<p className="text-xs font-mono mb-2 text-neutral-500">Parses a date string and returns timestamp</p>
				<CodeBlock isDarkMode={isDarkMode}>
					{`_parseTime("2024-01-15", "%Y-%m-%d")`}
				</CodeBlock>

				<h4 className="text-xs font-mono mb-1 mt-2 text-neutral-300">_weekday</h4>
				<p className="text-xs font-mono mb-2 text-neutral-500">Returns weekday (0=Sunday, 6=Saturday)</p>
				<CodeBlock isDarkMode={isDarkMode}>
					{`_weekday(_timestamp())  // 1 for Monday`}
				</CodeBlock>

				<h4 className="text-xs font-mono mb-1 mt-2 text-neutral-300">_month</h4>
				<p className="text-xs font-mono mb-2 text-neutral-500">Returns month (0=January, 11=December)</p>
				<CodeBlock isDarkMode={isDarkMode}>
					{`_month(_timestamp())  // 0 for January`}
				</CodeBlock>
			</div>

			<div>
				<h3 className="text-xs font-mono mb-2 text-neutral-400">{t("builtins.os")}</h3>

				<h4 className="text-xs font-mono mb-1 text-neutral-300">_getEnv</h4>
				<p className="text-xs font-mono mb-2 text-neutral-500">Gets an environment variable</p>
				<CodeBlock isDarkMode={isDarkMode}>
					{`_getEnv("PATH")`}
				</CodeBlock>

				<h4 className="text-xs font-mono mb-1 mt-2 text-neutral-300">_setEnv</h4>
				<p className="text-xs font-mono mb-2 text-neutral-500">Sets an environment variable</p>
				<CodeBlock isDarkMode={isDarkMode}>
					{`_setEnv("MY_VAR", "value")`}
				</CodeBlock>

				<h4 className="text-xs font-mono mb-1 mt-2 text-neutral-300">_cwd</h4>
				<p className="text-xs font-mono mb-2 text-neutral-500">Returns current working directory</p>
				<CodeBlock isDarkMode={isDarkMode}>
					{`_cwd()`}
				</CodeBlock>

				<h4 className="text-xs font-mono mb-1 mt-2 text-neutral-300">_home</h4>
				<p className="text-xs font-mono mb-2 text-neutral-500">Returns user home directory</p>
				<CodeBlock isDarkMode={isDarkMode}>
					{`_home()`}
				</CodeBlock>

				<h4 className="text-xs font-mono mb-1 mt-2 text-neutral-300">_temp</h4>
				<p className="text-xs font-mono mb-2 text-neutral-500">Returns temp directory path</p>
				<CodeBlock isDarkMode={isDarkMode}>
					{`_temp()`}
				</CodeBlock>

				<h4 className="text-xs font-mono mb-1 mt-2 text-neutral-300">_arch</h4>
				<p className="text-xs font-mono mb-2 text-neutral-500">Returns system architecture</p>
				<CodeBlock isDarkMode={isDarkMode}>
					{`_arch()`}
				</CodeBlock>

				<h4 className="text-xs font-mono mb-1 mt-2 text-neutral-300">_platform</h4>
				<p className="text-xs font-mono mb-2 text-neutral-500">Returns OS name (darwin, linux, windows)</p>
				<CodeBlock isDarkMode={isDarkMode}>
					{`_platform()`}
				</CodeBlock>

				<h4 className="text-xs font-mono mb-1 mt-2 text-neutral-300">_hostname</h4>
				<p className="text-xs font-mono mb-2 text-neutral-500">Returns system hostname</p>
				<CodeBlock isDarkMode={isDarkMode}>
					{`_hostname()`}
				</CodeBlock>

				<h4 className="text-xs font-mono mb-1 mt-2 text-neutral-300">_user</h4>
				<p className="text-xs font-mono mb-2 text-neutral-500">Returns current username</p>
				<CodeBlock isDarkMode={isDarkMode}>
					{`_user()`}
				</CodeBlock>

				<h4 className="text-xs font-mono mb-1 mt-2 text-neutral-300">_exit</h4>
				<p className="text-xs font-mono mb-2 text-neutral-500">Exits the program with optional code</p>
				<CodeBlock isDarkMode={isDarkMode}>
					{`_exit(0)  // normal exit
_exit(1)  // error exit`}
				</CodeBlock>
			</div>

			<div>
				<h3 className="text-xs font-mono mb-2 text-neutral-400">{t("builtins.fileSystem")}</h3>

				<h4 className="text-xs font-mono mb-1 text-neutral-300">_readFile</h4>
				<p className="text-xs font-mono mb-2 text-neutral-500">Reads entire file contents</p>
				<CodeBlock isDarkMode={isDarkMode}>
					{`let content = _readFile("data.txt")`}
				</CodeBlock>

				<h4 className="text-xs font-mono mb-1 mt-2 text-neutral-300">_writeFile</h4>
				<p className="text-xs font-mono mb-2 text-neutral-500">Writes content to file</p>
				<CodeBlock isDarkMode={isDarkMode}>
					{`_writeFile("output.txt", "hello world")`}
				</CodeBlock>

				<h4 className="text-xs font-mono mb-1 mt-2 text-neutral-300">_mkdir</h4>
				<p className="text-xs font-mono mb-2 text-neutral-500">Creates a directory</p>
				<CodeBlock isDarkMode={isDarkMode}>
					{`_mkdir("newdir")`}
				</CodeBlock>

				<h4 className="text-xs font-mono mb-1 mt-2 text-neutral-300">_remove</h4>
				<p className="text-xs font-mono mb-2 text-neutral-500">Removes a file or directory</p>
				<CodeBlock isDarkMode={isDarkMode}>
					{`_remove("oldfile.txt")`}
				</CodeBlock>

				<h4 className="text-xs font-mono mb-1 mt-2 text-neutral-300">_rename</h4>
				<p className="text-xs font-mono mb-2 text-neutral-500">Renames/moves a file</p>
				<CodeBlock isDarkMode={isDarkMode}>
					{`_rename("old.txt", "new.txt")`}
				</CodeBlock>

				<h4 className="text-xs font-mono mb-1 mt-2 text-neutral-300">_stat</h4>
				<p className="text-xs font-mono mb-2 text-neutral-500">Returns file information</p>
				<CodeBlock isDarkMode={isDarkMode}>
					{`let info = _stat("file.txt")
// { "name": "...", "size": 100, "type": "file", "modTime": 1234567890 }`}
				</CodeBlock>

				<h4 className="text-xs font-mono mb-1 mt-2 text-neutral-300">_listDir</h4>
				<p className="text-xs font-mono mb-2 text-neutral-500">Lists directory contents</p>
				<CodeBlock isDarkMode={isDarkMode}>
					{`let files = _listDir(".")
// ["file1.txt", "file2.txt"]`}
				</CodeBlock>
			</div>

			<div>
				<h3 className="text-xs font-mono mb-2 text-neutral-400">{t("builtins.crypto")}</h3>

				<h4 className="text-xs font-mono mb-1 text-neutral-300">_md5</h4>
				<p className="text-xs font-mono mb-2 text-neutral-500">Computes MD5 hash</p>
				<CodeBlock isDarkMode={isDarkMode}>
					{`_md5("hello")  // "5d41402abc4b2a76b9719d911017c592"`}
				</CodeBlock>

				<h4 className="text-xs font-mono mb-1 mt-2 text-neutral-300">_sha1</h4>
				<p className="text-xs font-mono mb-2 text-neutral-500">Computes SHA-1 hash</p>
				<CodeBlock isDarkMode={isDarkMode}>
					{`_sha1("hello")  // "aaf4c61ddcc5e8..."`}
				</CodeBlock>

				<h4 className="text-xs font-mono mb-1 mt-2 text-neutral-300">_sha256</h4>
				<p className="text-xs font-mono mb-2 text-neutral-500">Computes SHA-256 hash</p>
				<CodeBlock isDarkMode={isDarkMode}>
					{`_sha256("hello")  // "2cf24dba5..."`}
				</CodeBlock>

				<h4 className="text-xs font-mono mb-1 mt-2 text-neutral-300">_sha512</h4>
				<p className="text-xs font-mono mb-2 text-neutral-500">Computes SHA-512 hash</p>
				<CodeBlock isDarkMode={isDarkMode}>
					{`_sha512("hello")  // "9b71d784..."`}
				</CodeBlock>
			</div>

			<div>
				<h3 className="text-xs font-mono mb-2 text-neutral-400">{t("builtins.json")}</h3>

				<h4 className="text-xs font-mono mb-1 text-neutral-300">_jsonParse</h4>
				<p className="text-xs font-mono mb-2 text-neutral-500">Parses a JSON string into objects</p>
				<CodeBlock isDarkMode={isDarkMode}>
					{`let obj = _jsonParse('{"name": "Lynx"}')
let arr = _jsonParse('[1, 2, 3]')`}
				</CodeBlock>

				<h4 className="text-xs font-mono mb-1 mt-2 text-neutral-300">_jsonStringify</h4>
				<p className="text-xs font-mono mb-2 text-neutral-500">Converts value to JSON string</p>
				<CodeBlock isDarkMode={isDarkMode}>
					{`_jsonStringify({ "name": "Lynx" })`}
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