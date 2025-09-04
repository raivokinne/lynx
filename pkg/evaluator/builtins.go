package evaluator

import (
	"fmt"
	"lynx/pkg/object"
)

var builtins = map[string]*object.Builtin{
	"len": {
		Fn: func(args ...object.Object) object.Object {
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
		},
	},
	"range": {
		Fn: func(args ...object.Object) object.Object {
			if len(args) != 2 {
				return newError("wrong number of arguments. got=%d, want=2", len(args))
			}
			switch arg := args[0].(type) {
			case *object.Integer:
				switch arg2 := args[1].(type) {
				case *object.Integer:
					var arr []object.Object
					for i := int64(0); i < arg2.Value; i++ {
						arr = append(arr, &object.Integer{Value: i})
					}
					return &object.Array{Elements: arr}
				default:
					return newError("second argument to `range` not supported, got %T", arg2)
				}
			default:
				return newError("first argument to `range` not supported, got %T", arg)
			}
		},
	},
	"prompt": {
		Fn: func(args ...object.Object) object.Object {
			if len(args) != 1 {
				return newError("wrong number of arguments. got=%d, want=1", len(args))
			}

			switch arg := args[0].(type) {
			case *object.String:
				fmt.Print(arg.Value)
				var s string
				fmt.Scanln(&s)
				return &object.String{Value: s}
			default:
				return newError("argument to `prompt` not supported, got %T", arg)
			}
		},
	},
	"print": {
		Fn: func(args ...object.Object) object.Object {
			for i, arg := range args {
				if i > 0 {
					fmt.Print(" ")
				}
				fmt.Print(arg.Inspect() + "\n")
			}
			return NULL
		},
	},
}
