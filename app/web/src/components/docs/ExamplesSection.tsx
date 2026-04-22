import { useTranslation } from "../../hooks/useTranslation";
import { CodeBlock } from "./CodeBlock";

interface ExamplesSectionProps {
	isDarkMode: boolean;
}

export const ExamplesSection = ({ isDarkMode }: ExamplesSectionProps) => {
	const { t } = useTranslation();

	return (
		<div className="space-y-4">
			<h2 className="text-sm font-mono mb-3 text-neutral-300">{t("examples.title")}</h2>

			<div>
				<h3 className="text-xs font-mono mb-2 text-neutral-400">
					1. {t("examples.fibonacci")}
				</h3>
				<CodeBlock isDarkMode={isDarkMode}>
					{`// Recursive implementation
let fibonacci = fn(n) {
    if n <= 1 {
        return n
    }
    return fibonacci(n - 1) + fibonacci(n - 2)
}

// Optimized iterative version
let fibonacciIter = fn(n) {
    if n <= 1 { return n }

    let a = 0
    let b = 1
    let i = 2

    while i <= n {
        let temp = a + b
        a = b
        b = temp
        i = i + 1
    }

    return b
}

println("Fibonacci(10):", fibonacciIter(10))`}
				</CodeBlock>
			</div>

			<div>
				<h3 className="text-xs font-mono mb-2 text-neutral-400">
					2. {t("examples.dataProcessing")}
				</h3>
				<CodeBlock isDarkMode={isDarkMode}>
					{`@json

let users = [
    {"name": "alice", "age": 25, "active": true},
    {"name": "bob", "age": 17, "active": true},
    {"name": "charlie", "age": 30, "active": false}
]

// Filter active users over 18
let activeAdults = []
for user in users {
    if user["age"] >= 18 and user["active"] {
        activeAdults = activeAdults + [user]
    }
}

println("Active adults:", activeAdults)`}
				</CodeBlock>
			</div>

			<div>
				<h3 className="text-xs font-mono mb-2 text-neutral-400">3. {t("examples.rpg")}</h3>
				<CodeBlock isDarkMode={isDarkMode}>
					{`const MAX_HEALTH = 100

class Character {
    let init = fn(name, health) {
        self.name = name
        self.health = health
    }

    let isAlive = fn() {
        return self.health > 0
    }

    let takeDamage = fn(amount) {
        self.health = self.health - amount
        if self.health < 0 {
            self.health = 0
        }
    }
}

class Player(Character) {
    let init = fn(name) {
        self.name = name
        self.health = MAX_HEALTH
        self.gold = 0
    }

    let attack = fn(target) {
        let dmg = 10 + int(5 * random())
        println(self.name, " attacks ", target.name, " for ", dmg, " damage!")
        target.takeDamage(dmg)
    }
}

class Enemy(Character) {
    let init = fn(name, health) {
        self.name = name
        self.health = health
    }

    let attack = fn(player) {
        let dmg = 5 + int(5 * random())
        println(self.name, " attacks ", player.name, " for ", dmg, " damage!")
        player.takeDamage(dmg)
    }
}

let main = fn() {
    println("Battle start!")
    let player = Player("Hero")
    let enemy = Enemy("Goblin", 50)

    while player.isAlive() and enemy.isAlive() {
        player.attack(enemy)
        if enemy.isAlive() {
            enemy.attack(player)
        }
        println("Player HP:", player.health, " Enemy HP:", enemy.health)
    }

    if player.isAlive() {
        println("You won!")
    } else {
        println("You died!")
    }
}

main()`}
				</CodeBlock>
			</div>
		</div>
	);
};
