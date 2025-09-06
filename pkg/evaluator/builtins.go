package evaluator

import (
	"fmt"
	"io"
	"lynx/pkg/object"
	"math/rand/v2"
	"net/http"
	"strings"
	"time"
)

var builtins = map[string]*object.Builtin{}

func RegisterBuiltins() {
	builtins["print"] = &object.Builtin{Fn: builtinPrint}
	builtins["len"] = &object.Builtin{Fn: builtinLen}
	builtins["prompt"] = &object.Builtin{Fn: builtinPrompt}
	builtins["range"] = &object.Builtin{Fn: builtinRange}
	builtins["http_get"] = &object.Builtin{Fn: builtinHttpGet}
	builtins["http_post"] = &object.Builtin{Fn: builtinHttpPost}
	builtins["random"] = &object.Builtin{Fn: builtinRandom}
	builtins["read"] = &object.Builtin{Fn: builtinRead}
	builtins["write"] = &object.Builtin{Fn: builtinWrite}
	builtins["sleep"] = &object.Builtin{Fn: builtinSleep}
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

func builtinPrompt(args ...object.Object) object.Object {
	if len(args) != 1 {
		return newError("wrong number of arguments. got=%d, want=1", len(args))
	}
	msg, ok := args[0].(*object.String)
	if !ok {
		return newError("argument to `prompt` must be a string")
	}
	fmt.Print(msg.Value)
	var s string
	fmt.Scanln(&s)
	return &object.String{Value: s}
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
	for i, arg := range args {
		if i > 0 {
			fmt.Print(" ")
		}
		fmt.Println(arg.Inspect())
	}
	return NULL
}
