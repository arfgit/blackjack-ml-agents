import type { Card, ShoeState } from './types'

const DECK: Card[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10]

export function createShoe(deckCount: number = 6): ShoeState {
  const cards: Card[] = []
  for (let d = 0; d < deckCount; d++) {
    for (let s = 0; s < 4; s++) {
      cards.push(...DECK)
    }
  }
  shuffle(cards)
  return { cards, index: 0, runningCount: 0 }
}

function shuffle(arr: Card[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = arr[i]
    arr[i] = arr[j]
    arr[j] = tmp
  }
}

export function dealCard(shoe: ShoeState): Card {
  if (shoe.index >= shoe.cards.length * 0.75) {
    const fresh = createShoe(6)
    shoe.cards = fresh.cards
    shoe.index = 0
    shoe.runningCount = 0
  }
  const card = shoe.cards[shoe.index++]
  return card
}

export function decksRemaining(shoe: ShoeState): number {
  return Math.max(1, (shoe.cards.length - shoe.index) / 52)
}

export function needsReshuffle(shoe: ShoeState): boolean {
  return shoe.index >= shoe.cards.length * 0.75
}

export function reshuffleShoe(shoe: ShoeState): void {
  const fresh = createShoe(6)
  shoe.cards = fresh.cards
  shoe.index = 0
  shoe.runningCount = 0
}
