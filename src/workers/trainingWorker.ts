import { cemStep, initCEMState, betFromDNA } from '../lib/cem'
import type { CEMState, AgentResult } from '../lib/cem'
import { createShoe, decksRemaining, needsReshuffle, reshuffleShoe } from '../lib/blackjack/shoe'
import { trueCount } from '../lib/blackjack/count'
import { playRound } from '../lib/blackjack/resolve'
import type { ShoeState } from '../lib/blackjack/types'

interface StartMessage {
  type: 'start'
  config: { populationSize: number; handsPerAgent: number; eliteFraction: number }
  savedState?: CEMState | null
  startRound?: number
}

interface ControlMessage {
  type: 'pause' | 'resume' | 'stop'
}

type IncomingMessage = StartMessage | ControlMessage

export interface SampleHand {
  agentIndex: number
  playerCards: number[]
  dealerCards: number[]
  trueCount: number
  runningCount: number
  bet: number
  result: 'win' | 'lose' | 'push'
  countState: 'advantage' | 'neutral' | 'disadvantage'
  countAwareness: number
}

export interface ShoeInfo {
  cardsRemaining: number
  totalCards: number
  decksRemaining: number
  runningCount: number
  trueCount: number
  round: number
  reshuffled: boolean
}

export interface GenerationMessage {
  type: 'generation'
  data: {
    state: CEMState
    agents: AgentResult[]
    handsPerSec: number
    sampleHands: SampleHand[]
    dealerCards: number[]
    shoe: ShoeInfo
  }
}

let running = false
let paused = false
let state: CEMState = initCEMState()
let config = { populationSize: 48, handsPerAgent: 400, eliteFraction: 0.2 }
let lastTime = performance.now()
let totalHands = 0

let sharedShoe: ShoeState = createShoe(6)
let currentRound = 1

function runGeneration() {
  if (!running || paused) return

  const start = performance.now()
  const result = cemStep(state, config.populationSize, config.eliteFraction, config.handsPerAgent)
  state = result.state
  const elapsed = performance.now() - start

  totalHands += config.populationSize * config.handsPerAgent
  const now = performance.now()
  const timeSinceLast = (now - lastTime) / 1000
  const handsPerSec = timeSinceLast > 0 ? (config.populationSize * config.handsPerAgent) / timeSinceLast : 0
  lastTime = now

  let reshuffled = false

  if (needsReshuffle(sharedShoe)) {
    reshuffleShoe(sharedShoe)
    currentRound++
    reshuffled = true
  }

  const tc = trueCount(sharedShoe)
  const rc = sharedShoe.runningCount
  const indexBefore = sharedShoe.index

  const sharedOutcome = playRound(sharedShoe, 1)

  if (!reshuffled && sharedShoe.index < indexBefore) {
    currentRound++
    reshuffled = true
  }

  const tcAfter = trueCount(sharedShoe)
  const topCount = Math.min(5, result.agents.length)

  const sampleHands: SampleHand[] = []
  for (let i = 0; i < topCount; i++) {
    const agentDNA = result.agents[i]?.dna ?? state.bestDNA
    const distFromThresh = tc - agentDNA.threshold
    const agentCountState: 'advantage' | 'neutral' | 'disadvantage' =
      distFromThresh >= 0 ? 'advantage' :
      distFromThresh < -2 ? 'disadvantage' : 'neutral'

    const bet = betFromDNA(agentDNA, tc)
    sampleHands.push({
      agentIndex: i,
      playerCards: sharedOutcome.playerCards,
      dealerCards: sharedOutcome.dealerCards,
      trueCount: Math.round(tc * 10) / 10,
      runningCount: rc,
      bet: Math.round(bet * 10) / 10,
      result: sharedOutcome.result,
      countState: agentCountState,
      countAwareness: Math.round(Math.abs(distFromThresh) * 10) / 10,
    })
  }

  const shoeInfo: ShoeInfo = {
    cardsRemaining: sharedShoe.cards.length - sharedShoe.index,
    totalCards: sharedShoe.cards.length,
    decksRemaining: Math.round(decksRemaining(sharedShoe) * 10) / 10,
    runningCount: sharedShoe.runningCount,
    trueCount: Math.round(tcAfter * 10) / 10,
    round: currentRound,
    reshuffled,
  }

  self.postMessage({
    type: 'generation',
    data: {
      state: result.state,
      agents: result.agents,
      handsPerSec: Math.round(handsPerSec),
      sampleHands,
      dealerCards: sharedOutcome.dealerCards,
      shoe: shoeInfo,
    },
  } satisfies GenerationMessage)

  const delay = Math.max(800, 1000 - elapsed)
  setTimeout(runGeneration, delay)
}

self.onmessage = (e: MessageEvent<IncomingMessage>) => {
  const msg = e.data

  switch (msg.type) {
    case 'start':
      config = msg.config
      state = msg.savedState ?? initCEMState()
      sharedShoe = createShoe(6)
      currentRound = msg.startRound ?? 1
      running = true
      paused = false
      lastTime = performance.now()
      totalHands = 0
      runGeneration()
      break

    case 'pause':
      paused = true
      break

    case 'resume':
      if (paused) {
        paused = false
        lastTime = performance.now()
        runGeneration()
      }
      break

    case 'stop':
      running = false
      paused = false
      break
  }
}
