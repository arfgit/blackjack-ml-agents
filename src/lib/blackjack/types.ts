export type Card = number

export type HandResult = 'win' | 'lose' | 'push'

export interface RoundOutcome {
  result: HandResult
  payout: number
  playerTotal: number
  dealerTotal: number
  playerCards: Card[]
  dealerCards: Card[]
}

export interface ShoeState {
  cards: Card[]
  index: number
  runningCount: number
}
