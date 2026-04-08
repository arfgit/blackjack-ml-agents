# Blackjack ML Agents

An interactive simulation of AI agents learning to play blackjack through evolutionary optimization. Built as a visual demonstration of machine learning, algorithmic thinking, and systems design.

## What It Does

Five agents compete at a shared 6-deck blackjack table. Each agent has a unique betting strategy defined by three parameters (threshold, slope, max spread) that determine how they size bets based on the Hi-Lo card count. The Cross-Entropy Method evolves these strategies over generations, selecting the top performers and refining the population toward optimal bet-sizing.

## How It Works

**Cross-Entropy Method (CEM):** A population-based optimization algorithm. Each generation samples strategies from a distribution, simulates hundreds of hands per strategy, selects the elite performers, and updates the distribution toward the winners. Over time, the population converges on strategies that minimize losses against the house edge.

**Hi-Lo Card Counting:** All agents share a persistent 6-deck shoe. Cards 2-6 = +1, 7-9 = 0, 10-A = -1. The running count is normalized by decks remaining to produce a true count. Each agent interprets the true count relative to their own threshold to determine whether they have an advantage.

**Position-Aware Risk:** Agents behind the leader bet more aggressively (up to 2.5x) to catch up. Leaders play conservatively (0.8x) to protect their bankroll. The count signal and recent streak further modulate bet sizing, creating a combined risk factor between 0.5x and 8x.

**Rounds:** The shoe reshuffles at 75% penetration, starting a new round. Bankrupt agents (bankroll hits $0) are eliminated until the next round, when all agents revive with fresh $1,000. EMA-smoothed bankroll carries across rounds so past performance influences future rankings.

## Key Features

- Live blackjack table with dealer cards and per-agent hands
- Per-agent card counting with individual threshold interpretation
- Champion/Challenger dethrone system with sustained performance requirement
- Hot streak detection (3+ consecutive profitable generations)
- Round history with click-to-view past round snapshots
- Learning Progress dashboard with fitness trends, DNA convergence, and round-over-round performance
- Interactive legend with hover tooltips explaining every metric
- All training runs in a Web Worker to keep the UI at 60fps
- localStorage persistence to resume training across sessions

## Stack

- Vite + React + TypeScript
- Tailwind CSS
- Framer Motion
- Zustand
- Web Workers

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```
