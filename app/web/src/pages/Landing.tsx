import { ArrowRight, Github } from "lucide-react";
import { Link } from "react-router-dom";

// Landing page showcasing Lynx language features
const codeExample = `let numbers = [1, 2, 3, 4, 5]
let result = numbers
    |> filter(fn(x) { x > 2 })
    |> map(fn(x) { x * 2 })
    |> reduce(fn(a, b) { a + b }, 0)
println("Result:", result)
`;

const features = [
  {
    title: "Clean Syntax",
    description:
      "No unnecessary parentheses in control structures, minimal punctuation, and intuitive operators.",
  },
  {
    title: "Functional Programming",
    description:
      "First-class functions, closures, higher-order functions, and powerful pipeline operators.",
  },
  {
    title: "Immutable by Default",
    description:
      "Arrays and strings are immutable, promoting safer concurrent programming and easier reasoning.",
  },
  {
    title: "Pattern Matching",
    description:
      "Elegant destructuring and matching capabilities for complex data handling.",
  },
];

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-neutral-300 font-mono">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 hover:text-white transition-colors"
          >
            <img src="/logo.png" alt="logo" className="w-5 h-5" />
            <span className="text-sm font-bold">lynx</span>
          </Link>
          <div className="flex items-center gap-4 text-xs">
            <Link to="/docs" className="hover:text-white transition-colors">
              docs
            </Link>
            <a
              href="https://github.com/raivokinne/lynx"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <Github className="w-3 h-3" />
              github
            </a>
            <Link
              to="/register"
              className="bg-neutral-700 hover:bg-neutral-600 text-white px-3 py-1 transition-colors"
            >
              get started
            </Link>
          </div>
        </div>
      </nav>

      <section className="pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block px-3 py-1 rounded bg-neutral-900 border border-neutral-700 text-xs mb-8">
            <span className="text-neutral-400">v1.0.0</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-6 text-white leading-tight">
            a programming language
            <br />
            <span className="text-neutral-400">that gets out of your way.</span>
          </h1>
          <p className="text-sm text-neutral-500 mb-10 max-w-xl mx-auto">
            clean, minimal, and focused on simplicity. write expressive code
            without sacrificing readability.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/editor"
              className="w-full sm:w-auto bg-white hover:bg-neutral-200 text-black px-6 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              try the editor
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://github.com/raivokinne/lynx"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-neutral-800 hover:bg-neutral-700 text-white px-6 py-3 text-sm font-medium transition-colors"
            >
              view on github
            </a>
          </div>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-lg overflow-hidden border border-neutral-800 bg-neutral-900">
            <div className="flex items-center gap-2 px-3 py-2 bg-neutral-800 border-b border-neutral-700">
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-600" />
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-600" />
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-600" />
              <span className="ml-3 text-xs text-neutral-500">hello.lynx</span>
            </div>
            <div className="p-4 text-left overflow-x-auto">
              <pre className="text-xs md:text-sm">
                <code>{codeExample}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-16 px-4 border-t border-neutral-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-bold text-center mb-10 text-white">
            why lynx?
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-4 rounded border border-neutral-800 hover:border-neutral-600 transition-colors"
              >
                <h3 className="text-sm font-bold mb-2 text-white">
                  {feature.title}
                </h3>
                <p className="text-xs text-neutral-500">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-t border-neutral-800">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-lg font-bold mb-4 text-white">
            ready to try lynx?
          </h2>
          <p className="text-xs text-neutral-500 mb-8">
            start writing clean, expressive code in seconds. no installation
            required.
          </p>
          <Link
            to="/editor"
            className="inline-flex items-center gap-2 bg-white hover:bg-neutral-200 text-black px-6 py-3 text-sm font-medium transition-colors"
          >
            try the online editor
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="py-8 px-4 border-t border-neutral-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-600">
          <div className="flex items-center gap-2">
            <span className="font-bold">lynx</span>
          </div>
          <p>© 2026 lynx programming language</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
