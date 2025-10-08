import { useTranslation } from "../../hooks/useTranslation";
import { CodeBlock } from "./CodeBlock";

interface ExamplesSectionProps {
  isDarkMode: boolean;
}

export const ExamplesSection = ({ isDarkMode }: ExamplesSectionProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">{t("examples.title")}</h2>

      <div>
        <h3 className="text-lg font-semibold mb-3">
          1. {t("examples.fibonacci")}
        </h3>
        <CodeBlock isDarkMode={isDarkMode}>
          {`@arrays(map)

// Recursive implementation
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

let sequence = map(range(0, 10), fibonacciIter)
println("Fibonacci sequence:", sequence)`}
        </CodeBlock>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">
          2. {t("examples.dataProcessing")}
        </h3>
        <CodeBlock isDarkMode={isDarkMode}>
          {`@arrays(filter, map, reduce, sort)

let processUserData = fn(rawData) {
    return rawData
        |> filter(fn(user) { user.age >= 18 })           // Adults only
        |> filter(fn(user) { user.active })              // Active users
        |> map(fn(user) {                                // Normalize names
            return user.name.upper().trim()
        })
}

let users = [
    {"name": "  alice  ", "age": 25, "active": true},
    {"name": "bob", "age": 17, "active": true},
    {"name": "charlie", "age": 30, "active": false},
    {"name": "diana", "age": 28, "active": true}
]

let processedNames = processUserData(users)
println("Processed users:", processedNames)`}
        </CodeBlock>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-3">3. {t("examples.rpg")}</h3>
        <CodeBlock isDarkMode={isDarkMode}>
          {`const MAX_HEALTH = 100
const MAX_ENEMIES = 3

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

    let heal = fn(amount) {
        self.health = self.health + amount
        if self.health > MAX_HEALTH {
            self.health = MAX_HEALTH
        }
    }
}

class Player(Character) {
    let init = fn(name) {
        self.name = name
        self.health = MAX_HEALTH
        self.inventory = ["Potion"]
        self.gold = 0
    }

    let attack = fn(enemy) {
        let dmg = int(random() * 20) + 5
        println(self.name, " hits ", enemy.name, " for ", dmg, " damage!")
        enemy.takeDamage(dmg)
    }

    let healSelf = fn() {
        let hasPotion = false
        for item in self.inventory {
            if item == "Potion" {
                hasPotion = true
            }
        }

        if hasPotion {
            self.inventory = self.inventory.filter(fn(i) { return i != "Potion" })
            self.heal(30)
            println("You used a potion! Health:", self.health)
        } else {
            println("No potions left!")
        }
    }

    let loot = fn(enemy) {
        if !enemy.isAlive() {
            let goldFound = int(random() * 20)
            self.gold = self.gold + goldFound
            println("You looted ", goldFound, " gold from ", enemy.name)

            if random() < 0.3 {
                self.inventory = self.inventory.push("Potion")
                println("You found a potion!")
            }
        }
    }
}

class Enemy(Character) {
    let init = fn(name, health, power) {
        self.name = name
        self.health = health
        self.power = power
    }

    let attack = fn(player) {
        let dmg = int(random() * self.power) + 1
        println(self.name, " attacks ", player.name, " for ", dmg, " damage!")
        player.takeDamage(dmg)
    }
}

let generateEnemies = fn() {
    let names = ["Goblin", "Orc", "Slime", "Skeleton"]
    let enemies = []
    let i = 0
    while i < MAX_ENEMIES {
        let n = names[int(random() * len(names))]
        let h = int(random() * 50) + 30
        let p = int(random() * 15) + 5
        enemies = enemies.push(Enemy(n, h, p))
        i = i + 1
    }
    return enemies
}

let printStats = fn(player, enemies) {
    println("\\n=== BATTLE STATUS ===")
    println("Player Health:", player.health, "/", MAX_HEALTH)
    println("Gold:", player.gold)
    println("Potions:", len(player.inventory.filter(fn(i) { return i == "Potion" })))
    println("\\nEnemies:")
    for e in enemies {
        println("-", e.name, "HP:", e.health)
    }
    println("====================\\n")
}

let processAction = fn(player, enemies, action) {
    switch action {
        case "attack": {
            let target = enemies[0]
            player.attack(target)
            if !target.isAlive() {
                println(target.name, " has been defeated!")
                player.loot(target)
                enemies = enemies.filter(fn(e) { return e.isAlive() })
            }
        }
        case "heal": {
            player.healSelf()
        }
        default: {
            println("Unknown action:", action)
        }
    }
    return enemies
}

let safeTurn = fn(player, enemies, action) {
    catch {
        enemies = processAction(player, enemies, action)
        for e in enemies {
            if e.isAlive() {
                e.attack(player)
            }
        }
    } on err {
        println("Error during action:", err)
    }
    return enemies
}

let main = fn() {
    println("Welcome to LynxRPG!")
    let player = Player("Raivo")
    let enemies = generateEnemies()

    println("\\nEnemies approaching:")
    for e in enemies {
        println("- ", e.name, " with ", e.health, " HP")
    }

    while player.isAlive() and len(enemies) > 0 {
        sleep(500)

        printStats(player, enemies)

        println("Choose action: [attack] or [heal]")
        let action = ["attack", "heal"][int(random() * 2)]
        println("> Action chosen:", action)

        enemies = safeTurn(player, enemies, action)

        if !player.isAlive() {
          println("You have been defeated...")
        }

        sleep(800)
    }

    if player.isAlive() and len(enemies) == 0 {
        println("Victory! You defeated all enemies!")
        println("Final Gold:", player.gold)
        println("Final Health:", player.health)
    }
}

main()`}
        </CodeBlock>
      </div>
    </div>
  );
};
