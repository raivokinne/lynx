# Lynx Programming Language

A clean, minimal programming language focused on simplicity and functional programming.

## Installation

```bash
# Clone the repository
git clone https://github.com/raivokinne/lynx.git
cd lynx/compiler

# Build
go build -o lynx .

# Run
./lynx yourprogram.lynx
```

Or download pre-built binaries from the [releases page](https://github.com/raivokinne/lynx/releases).

## Quick Start

Try your first Lynx program:

```bash
./lynx ../examples/hello_world.lynx
```

See the [examples](./examples) directory for more demo programs.

## Web IDE

Run the web-based code editor:

```bash
cd lynx/app/web 
npm install 
npm run dev
cd lynx/app/server
npm install
npm start
```

Then open http://localhost:5173 in your browser.

### Demo Account

You can try the web IDE without registering:

- **Username:** demo
- **Password:** Demo@123

Or create your own account via the registration page.

## Documentation

See [lynxlang.site/docs](https://lynxlang.site/docs) for full documentation.

## License

[WTFPL](http://www.wtfpl.net/about/)