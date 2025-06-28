package object

type Env struct {
	store map[string]Object
	outer *Env
}

func New() *Env {
	return &Env{
		store: make(map[string]Object),
	}
}

func (e *Env) Set(name string, val Object) Object {
	e.store[name] = val
	return val
}

func (e *Env) Assign(name string, val Object) Object {
	if _, ok := e.store[name]; ok {
		e.store[name] = val
		return val
	}
	if e.outer != nil {
		return e.outer.Assign(name, val)
	}
	return val
}

func (e *Env) Get(name string) (Object, bool) {
	obj, ok := e.store[name]
	if !ok && e.outer != nil {
		return e.outer.Get(name)
	}
	return obj, ok
}

func (e *Env) NewEnclosedEnv() *Env {
	enclosed := New()
	enclosed.outer = e
	return enclosed
}
