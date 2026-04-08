import type { Card, ShoeState } from './types'

export function hiLoValue(card: Card): number {
  if (card >= 2 && card <= 6) return 1
  if (card >= 7 && card <= 9) return 0
  return -1
}

export function updateCount(shoe: ShoeState, card: Card): void {
  shoe.runningCount += hiLoValue(card)
}

export function trueCount(shoe: ShoeState): number {
  const remaining = Math.max(1, (shoe.cards.length - shoe.index) / 52)
  return shoe.runningCount / remaining
}
