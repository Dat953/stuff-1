# 🚀 Cả Lớp Đánh Boss

> **A real-time multiplayer boss-battle web game for classrooms.**
> Everyone joins, attacks together, and the player who lands the killing blow is crowned the winner!

**Made by [Le Minh Dat](https://github.com/Dat953) · [GitHub Repository](https://github.com/Dat953/stuff-1)**

---

## 🎮 Gameplay

1. **Join the battle** — Enter your name to join the match.
2. **Attack the Boss** — Click the attack button to deal 5–20 random damage.
3. **Watch the HP bar drop** — All players see the boss health update every 2 seconds.
4. **Last hit wins** — Whoever delivers the killing blow is declared the **🏆 Winner** in the victory screen.
5. **Reset & replay** — Any player can reset the boss for a new round.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🧑‍🤝‍🧑 Multiplayer | Multiple players can join from different devices on the same network |
| ⚔️ Real-time Polling | Game state syncs automatically every 2 seconds |
| 🏆 Last-Hit Winner | The player who kills the boss is displayed as the champion |
| 💥 Damage Popups | Floating damage numbers animate on each hit |
| 🎉 Victory Confetti | Confetti explosion when the boss is defeated |
| 🔄 Game Reset | Instantly reset the boss and start a new round |

---

## 🛠 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Icons**: [Lucide React](https://lucide.dev/)
- **Effects**: [canvas-confetti](https://www.npmjs.com/package/canvas-confetti)
- **State**: In-memory server store via `globalThis` (works with Next.js hot-reload)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm

### Install & Run

```bash
# Clone the repository
git clone https://github.com/Dat953/stuff-1.git
cd stuff-1

# Install dependencies
npm install
# or
pnpm install

# Start the development server
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

For multiplayer, all players must connect to the **same server**. Share the network URL shown in the terminal (e.g. `http://192.168.x.x:3000`).

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── attack/route.ts   # POST - Handle player attacks
│   │   ├── join/route.ts     # POST - Register a player
│   │   ├── reset/route.ts    # POST - Reset the game
│   │   └── state/route.ts    # GET  - Return current game state
│   ├── globals.css           # Global styles & animations
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main game UI
└── lib/
    └── gameStore.ts          # In-memory game state store
```

---

## 👨‍💻 Author

**Le Minh Dat**
- GitHub: [@Dat953](https://github.com/Dat953)
- Repository: [stuff-1](https://github.com/Dat953/stuff-1)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
