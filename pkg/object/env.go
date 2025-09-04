package object

import "fmt"

type Env struct {
	store  map[string]Object
	consts map[string]bool
	outer  *Env
	Dir    string
}

func New(dir string) *Env {
	return &Env{
		store:  make(map[string]Object),
		consts: make(map[string]bool),
		Dir:    dir,
	}
}

func (e *Env) Set(name string, val Object, isConst bool) Object {
	e.store[name] = val
	if isConst {
		e.consts[name] = true
	}
	return val
}

func (e *Env) Assign(name string, val Object) Object {
	if isConst, ok := e.consts[name]; ok && isConst {
		return &Error{Message: fmt.Sprintf("cannot assign to constant: %s", name)}
	}
	if _, ok := e.store[name]; ok {
		e.store[name] = val
		return val
	}
	if e.outer != nil {
		return e.outer.Assign(name, val)
	}
	return &Error{Message: fmt.Sprintf("undefined variable: %s", name)}
}

func (e *Env) Get(name string) (Object, bool) {
	obj, ok := e.store[name]
	if !ok && e.outer != nil {
		return e.outer.Get(name)
	}
	return obj, ok
}

func (e *Env) NewEnclosedEnv() *Env {
	enclosed := New(e.Dir)
	enclosed.outer = e
	return enclosed
}
