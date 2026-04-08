import type { ShoeState, RoundOutcome } from './types'
import { dealCard } from './shoe'
import { updateCount } from './count'
import { handValue } from './deal'

export function playRound(shoe: ShoeState, betAmount: number): RoundOutcome {
  const playerCards = [drawAndCount(shoe), drawAndCount(shoe)]
  const dealerCards = [drawAndCount(shoe), drawAndCount(shoe)]

  let playerTotal = handValue(playerCards)
  while (playerTotal < 17) {
    playerCards.push(drawAndCount(shoe))
    playerTotal = handValue(playerCards)
  }

  let dealerTotal = handValue(dealerCards)
  while (dealerTotal < 17) {
    dealerCards.push(drawAndCount(shoe))
    dealerTotal = handValue(dealerCards)
  }

  let result: RoundOutcome['result']
  let payout: number

  if (playerTotal > 21) {
    result = 'lose'
    payout = -betAmount
  } else if (dealerTotal > 21 || playerTotal > dealerTotal) {
    result = 'win'
    payout = betAmount
  } else if (playerTotal === dealerTotal) {
    result = 'push'
    payout = 0
  } else {
    result = 'lose'
    payout = -betAmount
  }

  return { result, payout, playerTotal, dealerTotal, playerCards, dealerCards }
}

function drawAndCount(shoe: ShoeState) {
  const card = dealCard(shoe)
  updateCount(shoe, card)
  return card
}
