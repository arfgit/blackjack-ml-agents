import type { Card } from './types'

export function handValue(cards: Card[]): number {
  let sum = 0
  let aces = 0
  for (const c of cards) {
    if (c === 1) {
      aces++
      sum += 11
    } else {
      sum += c
    }
  }
  while (sum > 21 && aces > 0) {
    sum -= 10
    aces--
  }
  return sum
}

export function isSoft(cards: Card[]): boolean {
  let sum = 0
  let aces = 0
  for (const c of cards) {
    if (c === 1) {
      aces++
      sum += 11
    } else {
      sum += c
    }
  }
  while (sum > 21 && aces > 0) {
    sum -= 10
    aces--
  }
  return aces > 0
}
