# Lynx Code Examples

This directory contains example Lynx programs demonstrating the language features.

## Running Examples

```bash
./lynx examples/complete.lynx
```

## Examples

| File               | Description                                 |
| ----------------- | ------------------------------------------- |
| [complete.lynx](./complete.lynx) | Complete syntax reference demonstrating all language features |

## Syntax Overview

### Variables

```lynx
let x = 10                    // mutable
let name = "Lynx"
const PI = 3.14159           // immutable
```

### Functions

```lynx
let add = fn(a, b) {
    return a + b
}
let double = fn(x) { x * 2 }   // arrow (implicit return)

let makeAdder = fn(n) {        // closure
    fn(x) { n + x }
}
```

### Control Flow

```lynx
if condition {
    // code
} else {
    // code
}

while condition {
    // code
}

for item in [1, 2, 3] {
    // code
}

switch value {
    case "A": { 1.0 }
    default: { 0.0 }
}
```

### Error Handling

```lynx
catch {
    // code that might error
} on err {
    // handle error
}
```

### Classes

```lynx
class Animal {
    let init = fn(name) {
        self.name = name
    }
}

class Dog(Animal) {
    let speak = fn() {
        self.name ++ " barks"
    }
}
```