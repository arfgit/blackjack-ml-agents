import { createShoe, dealCard } from './blackjack/shoe'
import { updateCount } from './blackjack/count'
import { handValue } from './blackjack/deal'
import type { ShoeState } from './blackjack/types'

export interface MCOdds {
  pWin: number
  pPush: number
  pLose: number
}

const cache = new Map<string, MCOdds>()
const MAX_CACHE = 500

function cacheKey(playerTotal: number, dealerUpCard: number, tcBucket: number): string {
  return `${playerTotal}-${dealerUpCard}-${tcBucket}`
}

function drawAndCount(shoe: ShoeState) {
  const card = dealCard(shoe)
  updateCount(shoe, card)
  return card
}

function biasShoeForCount(shoe: ShoeState, targetTc: number): void {
  const decksLeft = Math.max(1, (shoe.cards.length - shoe.index) / 52)
  shoe.runningCount = Math.round(targetTc * decksLeft)
}

function simulateFromState(playerTotal: number, dealerUpCard: number, tc: number): 'win' | 'push' | 'lose' {
  const shoe = createShoe(6)
  biasShoeForCount(shoe, tc)

  const dealerCards = [dealerUpCard]
  dealerCards.push(drawAndCount(shoe))
  let dealerTotal = handValue(dealerCards)

  while (dealerTotal < 17) {
    dealerCards.push(drawAndCount(shoe))
    dealerTotal = handValue(dealerCards)
  }

  if (playerTotal > 21) return 'lose'
  if (dealerTotal > 21) return 'win'
  if (playerTotal > dealerTotal) return 'win'
  if (playerTotal === dealerTotal) return 'push'
  return 'lose'
}

export function monteCarloOdds(
  playerTotal: number,
  dealerUpCard: number,
  tc: number,
  rollouts: number
): MCOdds {
  const tcBucket = Math.round(tc)
  const key = cacheKey(playerTotal, dealerUpCard, tcBucket)

  if (cache.has(key)) return cache.get(key)!

  let wins = 0, pushes = 0, losses = 0

  for (let i = 0; i < rollouts; i++) {
    const result = simulateFromState(playerTotal, dealerUpCard, tc)
    if (result === 'win') wins++
    else if (result === 'push') pushes++
    else losses++
  }

  const total = wins + pushes + losses
  const odds: MCOdds = {
    pWin: (wins / total) * 100,
    pPush: (pushes / total) * 100,
    pLose: (losses / total) * 100,
  }

  if (cache.size >= MAX_CACHE) {
    const firstKey = cache.keys().next().value
    if (firstKey !== undefined) cache.delete(firstKey)
  }
  cache.set(key, odds)

  return odds
}
