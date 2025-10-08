package evaluator

import (
	"bufio"
	"fmt"
	"io"
	"lynx/pkg/object"
	"math/rand/v2"
	"net/http"
	"os"
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
}

func builtinType(args ...object.Object) object.Object {
	if len(args) != 1 {
		return newError("wrong number of arguments. got=%d, want=1", len(args))
	}

	obj := args[0]

	switch obj.(type) {
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
		return &object.String{Value: obj.(*object.Instance).Class.Name}
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
		return newError("wrong number of arguments. got=%d, want=2", len(args))
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
		return newError("wrong number of arguments. got=%d, want=1", len(args))
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
		return newError("wrong number of arguments. got=%d, want=1", len(args))
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
		return newError("wrong number of arguments. got=%d, want=1", len(args))
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
		return newError("wrong number of arguments. got=%d, want=1", len(args))
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
		return newError("wrong number of arguments. got=%d, want=1", len(args))
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
		return newError("wrong number of arguments. got=%d, want=1", len(args))
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
		return newError("wrong number of arguments. got=%d, want=2", len(args))
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
