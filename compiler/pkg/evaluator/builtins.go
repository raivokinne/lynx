package evaluator

import (
	"bufio"
	"crypto/md5"
	"crypto/sha1"
	"crypto/sha256"
	"crypto/sha512"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"lynx/pkg/object"
	"math/rand/v2"
	"net/http"
	"os"
	"os/user"
	"runtime"
	"strconv"
	"strings"
	"time"
)

var builtins = map[string]*object.Builtin{}

func RegisterBuiltins() {
	builtins["println"] = &object.Builtin{Fn: builtinPrint}
	builtins["len"] = &object.Builtin{Fn: builtinLen}
	builtins["range"] = &object.Builtin{Fn: builtinRange}
	builtins["_http_get"] = &object.Builtin{Fn: builtinHttpGet}
	builtins["_http_post"] = &object.Builtin{Fn: builtinHttpPost}
	builtins["random"] = &object.Builtin{Fn: builtinRandom}
	builtins["_read"] = &object.Builtin{Fn: builtinRead}
	builtins["_write"] = &object.Builtin{Fn: builtinWrite}
	builtins["sleep"] = &object.Builtin{Fn: builtinSleep}
	builtins["_readLine"] = &object.Builtin{Fn: builtinReadLine}
	builtins["int"] = &object.Builtin{Fn: builtinInt}
	builtins["float"] = &object.Builtin{Fn: builtinFloat}
	builtins["str"] = &object.Builtin{Fn: builtinStr}
	builtins["type"] = &object.Builtin{Fn: builtinType}
	builtins["copy"] = &object.Builtin{Fn: builtinCopy}
	builtins["_formatPrint"] = &object.Builtin{Fn: builtinFormatPrint}
	builtins["_readFile"] = &object.Builtin{Fn: builtinReadFile}
	builtins["_writeFile"] = &object.Builtin{Fn: builtinWriteFile}
	builtins["_http_put"] = &object.Builtin{Fn: builtinHttpPut}
	builtins["_http_delete"] = &object.Builtin{Fn: builtinHttpDelete}
	builtins["_http_head"] = &object.Builtin{Fn: builtinHttpHead}
	builtins["_timestamp"] = &object.Builtin{Fn: builtinTimestamp}
	builtins["_unix"] = &object.Builtin{Fn: builtinUnix}
	builtins["_unixNano"] = &object.Builtin{Fn: builtinUnixNano}
	builtins["_formatTime"] = &object.Builtin{Fn: builtinFormatTime}
	builtins["_parseTime"] = &object.Builtin{Fn: builtinParseTime}
	builtins["_weekday"] = &object.Builtin{Fn: builtinWeekday}
	builtins["_month"] = &object.Builtin{Fn: builtinMonth}
	builtins["_getEnv"] = &object.Builtin{Fn: builtinGetEnv}
	builtins["_setEnv"] = &object.Builtin{Fn: builtinSetEnv}
	builtins["_exit"] = &object.Builtin{Fn: builtinExit}
	builtins["_cwd"] = &object.Builtin{Fn: builtinCwd}
	builtins["_home"] = &object.Builtin{Fn: builtinHome}
	builtins["_temp"] = &object.Builtin{Fn: builtinTemp}
	builtins["_arch"] = &object.Builtin{Fn: builtinArch}
	builtins["_platform"] = &object.Builtin{Fn: builtinPlatform}
	builtins["_version"] = &object.Builtin{Fn: builtinVersion}
	builtins["_hostname"] = &object.Builtin{Fn: builtinHostname}
	builtins["_user"] = &object.Builtin{Fn: builtinUser}
	builtins["_args"] = &object.Builtin{Fn: builtinArgs}
	builtins["_mkdir"] = &object.Builtin{Fn: builtinMkdir}
	builtins["_rmdir"] = &object.Builtin{Fn: builtinRmdir}
	builtins["_remove"] = &object.Builtin{Fn: builtinRemove}
	builtins["_rename"] = &object.Builtin{Fn: builtinRename}
	builtins["_stat"] = &object.Builtin{Fn: builtinStat}
	builtins["_listDir"] = &object.Builtin{Fn: builtinListDir}
	builtins["_md5"] = &object.Builtin{Fn: builtinMd5}
	builtins["_sha1"] = &object.Builtin{Fn: builtinSha1}
	builtins["_sha256"] = &object.Builtin{Fn: builtinSha256}
	builtins["_sha512"] = &object.Builtin{Fn: builtinSha512}
	builtins["_jsonParse"] = &object.Builtin{Fn: builtinJsonParse}
	builtins["_jsonStringify"] = &object.Builtin{Fn: builtinJsonStringify}
}

func builtinType(args ...object.Object) object.Object {
	if len(args) != 1 {
		return newError("wrong number of arguments. got %d, expected 1", len(args))
	}

	obj := args[0]

	switch obj := obj.(type) {
	case *object.Integer:
		return &object.String{Value: "int"}
	case *object.Float:
		return &object.String{Value: "float"}
	case *object.String:
		return &object.String{Value: "str"}
	case *object.Boolean:
		return &object.String{Value: "bool"}
	case *object.Array:
		return &object.String{Value: "array"}
	case *object.Hash:
		return &object.String{Value: "hash"}
	case *object.Function:
		return &object.String{Value: "function"}
	case *object.Builtin:
		return &object.String{Value: "builtin"}
	case *object.Null:
		return &object.String{Value: "null"}
	case *object.Class:
		return &object.String{Value: "class"}
	case *object.Instance:
		return &object.String{Value: obj.Class.Name}
	case *object.Module:
		return &object.String{Value: "module"}
	case *object.Error:
		return &object.String{Value: "error"}
	default:
		return &object.String{Value: "unknown"}
	}
}

func builtinCopy(args ...object.Object) object.Object {
	if len(args) != 2 {
		return newError("wrong number of arguments. got %d, expected 2", len(args))
	}

	destArr, ok := args[0].(*object.Array)
	if !ok {
		return newError("first argument must be an array, got %s", args[0].Type())
	}

	srcArr, ok := args[1].(*object.Array)
	if !ok {
		return newError("second argument must be an array, got %s", args[1].Type())
	}

	copyCount := min(len(srcArr.Elements), len(destArr.Elements))

	for i := range copyCount {
		destArr.Elements[i] = srcArr.Elements[i]
	}

	return &object.Integer{Value: int64(copyCount)}
}

func builtinStr(args ...object.Object) object.Object {
	if len(args) != 1 {
		return newError("wrong number of arguments. got %d, expected 1", len(args))
	}

	switch arg := args[0].(type) {
	case *object.String:
		return arg
	case *object.Integer:
		return &object.String{Value: strconv.FormatInt(arg.Value, 10)}
	case *object.Float:
		return &object.String{Value: strconv.FormatFloat(arg.Value, 'f', -1, 64)}
	case *object.Boolean:
		if arg.Value {
			return &object.String{Value: "true"}
		}
		return &object.String{Value: "false"}
	default:
		return newError("argument to `str` must be STRING, INTEGER, FLOAT, or BOOLEAN. got=%s", arg.Type())
	}
}

func builtinInt(args ...object.Object) object.Object {
	if len(args) != 1 {
		return newError("wrong number of arguments. got %d, expected 1", len(args))
	}

	switch arg := args[0].(type) {
	case *object.String:
		i, err := strconv.ParseInt(arg.Value, 10, 64)
		if err != nil {
			return newError("cannot convert string to int: %s", err.Error())
		}
		return &object.Integer{Value: i}

	case *object.Float:
		return &object.Integer{Value: int64(arg.Value)}

	case *object.Boolean:
		if arg.Value {
			return &object.Integer{Value: 1}
		}
		return &object.Integer{Value: 0}

	case *object.Integer:
		return arg

	default:
		return newError("argument to `int` must be STRING, FLOAT, BOOLEAN, or INTEGER. got=%s", arg.Type())
	}
}

func builtinFloat(args ...object.Object) object.Object {
	if len(args) != 1 {
		return newError("wrong number of arguments. got %d, expected 1", len(args))
	}

	switch arg := args[0].(type) {
	case *object.String:
		f, err := strconv.ParseFloat(arg.Value, 64)
		if err != nil {
			return newError("cannot convert string to float: %s", err.Error())
		}
		return &object.Float{Value: f}

	case *object.Integer:
		return &object.Float{Value: float64(arg.Value)}

	case *object.Boolean:
		if arg.Value {
			return &object.Float{Value: 1.0}
		}
		return &object.Float{Value: 0.0}

	case *object.Float:
		return arg

	default:
		return newError("argument to `float` must be STRING, INTEGER, FLOAT, or BOOLEAN. got=%s", arg.Type())
	}
}

func builtinReadLine(args ...object.Object) object.Object {
	if len(args) != 0 {
		return newError("wrong number of arguments. got=%d, want=0", len(args))
	}
	reader := bufio.NewReader(os.Stdin)
	text, _ := reader.ReadString('\n')
	text = strings.TrimRight(text, "\r\n")

	return &object.String{Value: text}
}

func builtinSleep(args ...object.Object) object.Object {
	if len(args) != 1 {
		return newError("wrong number of arguments. got %d, expected 1", len(args))
	}
	switch arg := args[0].(type) {
	case *object.Integer:
		time.Sleep(time.Duration(arg.Value) * time.Millisecond)
	default:
		return newError("argument to sleep must be an integer")
	}
	return NULL
}

func builtinRandom(args ...object.Object) object.Object {
	if len(args) != 0 {
		return newError("wrong number of arguments. got=%d, want=0", len(args))
	}
	return &object.Float{Value: rand.Float64()}
}

func builtinRead(args ...object.Object) object.Object {
	if len(args) != 0 {
		return newError("wrong number of arguments. got=%d, want=0", len(args))
	}
	var s string
	fmt.Scanln(&s)
	return &object.String{Value: s}
}

func builtinWrite(args ...object.Object) object.Object {
	if len(args) != 1 {
		return newError("wrong number of arguments. got %d, expected 1", len(args))
	}
	switch arg := args[0].(type) {
	case *object.String:
		fmt.Print(arg.Value)
	default:
		return newError("argument to write must be STRING, got %T", arg)
	}
	return NULL
}

func builtinLen(args ...object.Object) object.Object {
	if len(args) != 1 {
		return newError("wrong number of arguments. got %d, expected 1", len(args))
	}
	switch arg := args[0].(type) {
	case *object.Array:
		return &object.Integer{Value: int64(len(arg.Elements))}
	case *object.String:
		return &object.Integer{Value: int64(len(arg.Value))}
	case *object.Hash:
		return &object.Integer{Value: int64(len(arg.Pairs))}
	default:
		return newError("argument to `len` not supported, got %T", arg)
	}
}

func builtinRange(args ...object.Object) object.Object {
	if len(args) != 2 {
		return newError("wrong number of arguments. got %d, expected 2", len(args))
	}
	start, ok1 := args[0].(*object.Integer)
	end, ok2 := args[1].(*object.Integer)
	if !ok1 || !ok2 {
		return newError("range expects two integers")
	}
	var arr []object.Object
	for i := start.Value; i < end.Value; i++ {
		arr = append(arr, &object.Integer{Value: i})
	}
	return &object.Array{Elements: arr}
}

func builtinHttpGet(args ...object.Object) object.Object {
	if len(args) != 1 {
		return newError("http_get expects 1 argument")
	}
	url, ok := args[0].(*object.String)
	if !ok {
		return newError("http_get expects a string")
	}
	resp, err := http.Get(url.Value)
	if err != nil {
		return newError("%s", err.Error())
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	return &object.String{Value: string(body)}
}

func builtinHttpPost(args ...object.Object) object.Object {
	if len(args) != 3 {
		return newError("http_post expects 3 arguments: url, contentType, body")
	}
	url, ok1 := args[0].(*object.String)
	contentType, ok2 := args[1].(*object.String)
	bodyStr, ok3 := args[2].(*object.String)
	if !ok1 || !ok2 || !ok3 {
		return newError("http_post expects (string, string, string)")
	}
	resp, err := http.Post(url.Value, contentType.Value, strings.NewReader(bodyStr.Value))
	if err != nil {
		return newError("%s", err.Error())
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	return &object.String{Value: string(body)}
}

func builtinPrint(args ...object.Object) object.Object {
	out := []string{}
	for _, arg := range args {
		out = append(out, arg.Inspect())
	}
	fmt.Println(strings.Join(out, ""))
	return NULL
}

func builtinFormatPrint(args ...object.Object) object.Object {
	if len(args) < 1 {
		return newError("_formatPrint expects at least 1 argument")
	}
	format, ok := args[0].(*object.String)
	if !ok {
		return newError("_formatPrint expects first argument to be a string")
	}
	return &object.String{Value: format.Value}
}

func builtinReadFile(args ...object.Object) object.Object {
	if len(args) != 1 {
		return newError("_readFile expects 1 argument")
	}
	path, ok := args[0].(*object.String)
	if !ok {
		return newError("_readFile expects a string")
	}
	data, err := os.ReadFile(path.Value)
	if err != nil {
		return &object.String{Value: ""}
	}
	return &object.String{Value: string(data)}
}

func builtinWriteFile(args ...object.Object) object.Object {
	if len(args) != 2 {
		return newError("_writeFile expects 2 arguments: path, content")
	}
	path, ok1 := args[0].(*object.String)
	content, ok2 := args[1].(*object.String)
	if !ok1 || !ok2 {
		return newError("_writeFile expects (string, string)")
	}
	err := os.WriteFile(path.Value, []byte(content.Value), 0644)
	if err != nil {
		return newError("%s", err.Error())
	}
	return NULL
}

func builtinHttpPut(args ...object.Object) object.Object {
	if len(args) != 3 {
		return newError("_http_put expects 3 arguments: url, contentType, body")
	}
	url, ok1 := args[0].(*object.String)
	contentType, ok2 := args[1].(*object.String)
	body, ok3 := args[2].(*object.String)
	if !ok1 || !ok2 || !ok3 {
		return newError("_http_put expects (string, string, string)")
	}
	req, err := http.NewRequest("PUT", url.Value, strings.NewReader(body.Value))
	if err != nil {
		return newError("%s", err.Error())
	}
	req.Header.Set("Content-Type", contentType.Value)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return newError("%s", err.Error())
	}
	defer resp.Body.Close()
	respBody, _ := io.ReadAll(resp.Body)
	return &object.String{Value: string(respBody)}
}

func builtinHttpDelete(args ...object.Object) object.Object {
	if len(args) != 1 {
		return newError("_http_delete expects 1 argument")
	}
	url, ok := args[0].(*object.String)
	if !ok {
		return newError("_http_delete expects a string")
	}
	req, err := http.NewRequest("DELETE", url.Value, nil)
	if err != nil {
		return newError("%s", err.Error())
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return newError("%s", err.Error())
	}
	defer resp.Body.Close()
	respBody, _ := io.ReadAll(resp.Body)
	return &object.String{Value: string(respBody)}
}

func builtinHttpHead(args ...object.Object) object.Object {
	if len(args) != 1 {
		return newError("_http_head expects 1 argument")
	}
	url, ok := args[0].(*object.String)
	if !ok {
		return newError("_http_head expects a string")
	}
	req, err := http.NewRequest("HEAD", url.Value, nil)
	if err != nil {
		return newError("%s", err.Error())
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return newError("%s", err.Error())
	}
	defer resp.Body.Close()
	m := map[string]object.Object{
		"status": &object.Integer{Value: int64(resp.StatusCode)},
	}
	pairs := map[object.HashKey]object.HashPair{}
	for k, v := range m {
		key := &object.String{Value: k}
		pairs[key.HashKey()] = object.HashPair{Key: &object.String{Value: k}, Value: v}
	}
	return &object.Hash{Pairs: pairs}
}

func builtinTimestamp(args ...object.Object) object.Object {
	return &object.Integer{Value: time.Now().UnixMilli()}
}

func builtinUnix(args ...object.Object) object.Object {
	return &object.Integer{Value: time.Now().Unix()}
}

func builtinUnixNano(args ...object.Object) object.Object {
	return &object.Integer{Value: time.Now().UnixNano()}
}

func builtinFormatTime(args ...object.Object) object.Object {
	if len(args) < 2 {
		return newError("_formatTime expects 2 arguments: timestamp, format")
	}
	ts, ok1 := args[0].(*object.Integer)
	format, ok2 := args[1].(*object.String)
	if !ok1 || !ok2 {
		return newError("_formatTime expects (int, string)")
	}
	t := time.UnixMilli(ts.Value)
	result := t.Format(format.Value)
	return &object.String{Value: result}
}

func builtinParseTime(args ...object.Object) object.Object {
	if len(args) < 2 {
		return newError("_parseTime expects 2 arguments: dateString, format")
	}
	dateStr, ok1 := args[0].(*object.String)
	format, ok2 := args[1].(*object.String)
	if !ok1 || !ok2 {
		return newError("_parseTime expects (string, string)")
	}
	t, err := time.Parse(format.Value, dateStr.Value)
	if err != nil {
		return &object.Integer{Value: 0}
	}
	return &object.Integer{Value: t.UnixMilli()}
}

func builtinWeekday(args ...object.Object) object.Object {
	if len(args) != 1 {
		return newError("_weekday expects 1 argument")
	}
	ts, ok := args[0].(*object.Integer)
	if !ok {
		return newError("_weekday expects an integer")
	}
	t := time.UnixMilli(ts.Value)
	return &object.Integer{Value: int64(t.Weekday())}
}

func builtinMonth(args ...object.Object) object.Object {
	if len(args) != 1 {
		return newError("_month expects 1 argument")
	}
	ts, ok := args[0].(*object.Integer)
	if !ok {
		return newError("_month expects an integer")
	}
	t := time.UnixMilli(ts.Value)
	return &object.Integer{Value: int64(t.Month()) - 1}
}

func builtinGetEnv(args ...object.Object) object.Object {
	if len(args) != 1 {
		return newError("_getEnv expects 1 argument")
	}
	key, ok := args[0].(*object.String)
	if !ok {
		return newError("_getEnv expects a string")
	}
	return &object.String{Value: os.Getenv(key.Value)}
}

func builtinSetEnv(args ...object.Object) object.Object {
	if len(args) != 2 {
		return newError("_setEnv expects 2 arguments")
	}
	key, ok1 := args[0].(*object.String)
	value, ok2 := args[1].(*object.String)
	if !ok1 || !ok2 {
		return newError("_setEnv expects (string, string)")
	}
	os.Setenv(key.Value, value.Value)
	return NULL
}

func builtinExit(args ...object.Object) object.Object {
	code := 0
	if len(args) == 1 {
		if c, ok := args[0].(*object.Integer); ok {
			code = int(c.Value)
		}
	}
	os.Exit(code)
	return NULL
}

func builtinCwd(args ...object.Object) object.Object {
	dir, _ := os.Getwd()
	return &object.String{Value: dir}
}

func builtinHome(args ...object.Object) object.Object {
	home, _ := os.UserHomeDir()
	return &object.String{Value: home}
}

func builtinTemp(args ...object.Object) object.Object {
	return &object.String{Value: os.TempDir()}
}

func builtinArch(args ...object.Object) object.Object {
	return &object.String{Value: runtime.GOARCH}
}

func builtinPlatform(args ...object.Object) object.Object {
	return &object.String{Value: runtime.GOOS}
}

func builtinVersion(args ...object.Object) object.Object {
	return &object.String{Value: "1.0.0"}
}

func builtinHostname(args ...object.Object) object.Object {
	name, _ := os.Hostname()
	return &object.String{Value: name}
}

func builtinUser(args ...object.Object) object.Object {
	usr, err := user.Current()
	if err != nil {
		return &object.String{Value: ""}
	}
	return &object.String{Value: usr.Name}
}

func builtinArgs(args ...object.Object) object.Object {
	return &object.Array{Elements: []object.Object{}}
}

func builtinMkdir(args ...object.Object) object.Object {
	if len(args) != 1 {
		return newError("_mkdir expects 1 argument")
	}
	path, ok := args[0].(*object.String)
	if !ok {
		return newError("_mkdir expects a string")
	}
	err := os.MkdirAll(path.Value, 0755)
	if err != nil {
		return newError("%s", err.Error())
	}
	return NULL
}

func builtinRmdir(args ...object.Object) object.Object {
	if len(args) != 1 {
		return newError("_rmdir expects 1 argument")
	}
	path, ok := args[0].(*object.String)
	if !ok {
		return newError("_rmdir expects a string")
	}
	err := os.Remove(path.Value)
	if err != nil {
		return newError("%s", err.Error())
	}
	return NULL
}

func builtinRemove(args ...object.Object) object.Object {
	return builtinRmdir(args...)
}

func builtinRename(args ...object.Object) object.Object {
	if len(args) != 2 {
		return newError("_rename expects 2 arguments")
	}
	old, ok1 := args[0].(*object.String)
	new, ok2 := args[1].(*object.String)
	if !ok1 || !ok2 {
		return newError("_rename expects (string, string)")
	}
	err := os.Rename(old.Value, new.Value)
	if err != nil {
		return newError("%s", err.Error())
	}
	return NULL
}

func builtinStat(args ...object.Object) object.Object {
	if len(args) != 1 {
		return newError("_stat expects 1 argument")
	}
	path, ok := args[0].(*object.String)
	if !ok {
		return newError("_stat expects a string")
	}
	info, err := os.Stat(path.Value)
	if err != nil {
		return NULL
	}
	m := map[string]object.Object{
		"name":    &object.String{Value: info.Name()},
		"size":    &object.Integer{Value: info.Size()},
		"modTime": &object.Integer{Value: info.ModTime().UnixMilli()},
	}
	if info.IsDir() {
		m["type"] = &object.String{Value: "dir"}
	} else {
		m["type"] = &object.String{Value: "file"}
	}
	pairs := map[object.HashKey]object.HashPair{}
	for k, v := range m {
		key := &object.String{Value: k}
		pairs[key.HashKey()] = object.HashPair{Key: key, Value: v}
	}
	return &object.Hash{Pairs: pairs}
}

func builtinListDir(args ...object.Object) object.Object {
	if len(args) != 1 {
		return newError("_listDir expects 1 argument")
	}
	path, ok := args[0].(*object.String)
	if !ok {
		return newError("_listDir expects a string")
	}
	entries, err := os.ReadDir(path.Value)
	if err != nil {
		return &object.Array{Elements: []object.Object{}}
	}
	var elements []object.Object
	for _, e := range entries {
		elements = append(elements, &object.String{Value: e.Name()})
	}
	return &object.Array{Elements: elements}
}

func builtinMd5(args ...object.Object) object.Object {
	if len(args) != 1 {
		return newError("_md5 expects 1 argument")
	}
	data, ok := args[0].(*object.String)
	if !ok {
		return newError("_md5 expects a string")
	}
	h := md5.New()
	h.Write([]byte(data.Value))
	return &object.String{Value: hex.EncodeToString(h.Sum(nil))}
}

func builtinSha1(args ...object.Object) object.Object {
	if len(args) != 1 {
		return newError("_sha1 expects 1 argument")
	}
	data, ok := args[0].(*object.String)
	if !ok {
		return newError("_sha1 expects a string")
	}
	h := sha1.New()
	h.Write([]byte(data.Value))
	return &object.String{Value: hex.EncodeToString(h.Sum(nil))}
}

func builtinSha256(args ...object.Object) object.Object {
	if len(args) != 1 {
		return newError("_sha256 expects 1 argument")
	}
	data, ok := args[0].(*object.String)
	if !ok {
		return newError("_sha256 expects a string")
	}
	h := sha256.New()
	h.Write([]byte(data.Value))
	return &object.String{Value: hex.EncodeToString(h.Sum(nil))}
}

func builtinSha512(args ...object.Object) object.Object {
	if len(args) != 1 {
		return newError("_sha512 expects 1 argument")
	}
	data, ok := args[0].(*object.String)
	if !ok {
		return newError("_sha512 expects a string")
	}
	h := sha512.New()
	h.Write([]byte(data.Value))
	return &object.String{Value: hex.EncodeToString(h.Sum(nil))}
}

func builtinJsonParse(args ...object.Object) object.Object {
	if len(args) != 1 {
		return newError("_jsonParse expects 1 argument")
	}
	text, ok := args[0].(*object.String)
	if !ok {
		return newError("_jsonParse expects a string")
	}
	var result interface{}
	err := json.Unmarshal([]byte(text.Value), &result)
	if err != nil {
		return newError("%s", err.Error())
	}
	return convertJSON(result)
}

func builtinJsonStringify(args ...object.Object) object.Object {
	if len(args) != 1 {
		return newError("_jsonStringify expects 1 argument")
	}
	data := args[0]
	jsonData, err := json.Marshal(data.Inspect())
	if err != nil {
		return newError("%s", err.Error())
	}
	return &object.String{Value: string(jsonData)}
}

func convertJSON(v interface{}) object.Object {
	switch val := v.(type) {
	case map[string]interface{}:
		pairs := map[object.HashKey]object.HashPair{}
		for k, vv := range val {
			key := &object.String{Value: k}
		pairs[key.HashKey()] = object.HashPair{
				Key:   &object.String{Value: k},
				Value: convertJSON(vv),
			}
		}
		return &object.Hash{Pairs: pairs}
	case []interface{}:
		var elements []object.Object
		for _, e := range val {
			elements = append(elements, convertJSON(e))
		}
		return &object.Array{Elements: elements}
	case float64:
		return &object.Float{Value: val}
	case string:
		return &object.String{Value: val}
	case bool:
		return &object.Boolean{Value: val}
	case nil:
		return NULL
	default:
		return NULL
	}
}
