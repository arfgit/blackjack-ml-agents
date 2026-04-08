import type { AgentResult, StrategyDNA } from './cem'
import type { MCOdds } from './monteCarlo'

export interface RiskFactors {
  positionRisk: number
  countRisk: number
  momentumRisk: number
  combined: number
}

export interface FeaturedAgent {
  id: number
  dna: StrategyDNA
  fitness: number
  emaFitness: number
  bankroll: number
  positionFactor: number
  riskFactors: RiskFactors
  isChampion: boolean
  isChallenger: boolean
  isHotStreak: boolean
  profit: number
  winRate: number
  streak: number
  mcOdds: MCOdds | null
  roundsWon: number
}

const EMA_ALPHA = 0.15
const DETHRONE_THRESHOLD = 0.01
const DETHRONE_TICKS = 2
const STARTING_BANKROLL = 1000

export interface FeaturedAgentState {
  bankrolls: number[]
  eliminated: boolean[]
  frozenStats: { winRate: number; fitness: number; dna: StrategyDNA }[]
  emaMap: number[]
  roundWins: number[]
  streaks: number[]
  dethroneTicks: number
  championId: number
  currentRound: number
  initialized: boolean
}

export function createFeaturedState(): FeaturedAgentState {
  return {
    bankrolls: [],
    eliminated: [],
    frozenStats: [],
    emaMap: [],
    roundWins: [],
    streaks: [],
    dethroneTicks: 0,
    championId: 0,
    currentRound: 1,
    initialized: false,
  }
}

export function getDeviceAgentCount(): number {
  return 5
}

function ensureSlot(state: FeaturedAgentState, i: number) {
  while (state.bankrolls.length <= i) {
    state.bankrolls.push(STARTING_BANKROLL)
    state.eliminated.push(false)
    state.frozenStats.push({ winRate: 0, fitness: 0, dna: { threshold: 1, slope: 1.5, maxSpread: 8 } })
    state.emaMap.push(STARTING_BANKROLL)
    state.roundWins.push(0)
    state.streaks.push(0)
  }
}

function defaultAgent(id: number, dna: StrategyDNA): FeaturedAgent {
  return {
    id,
    dna,
    fitness: 0,
    emaFitness: 0,
    bankroll: 0,
    positionFactor: 0,
    riskFactors: { positionRisk: 0, countRisk: 0, momentumRisk: 0, combined: 0 },
    isChampion: false,
    isChallenger: false,
    isHotStreak: false,
    profit: 0,
    winRate: 0,
    streak: 0,
    mcOdds: null,
    roundsWon: 0,
  }
}

export function selectFeaturedAgents(
  agents: AgentResult[],
  count: number,
  state: FeaturedAgentState,
  reshuffled: boolean = false,
  trueCount: number = 0
): FeaturedAgent[] {
  const topAgents = agents.slice(0, count)
  for (let i = topAgents.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = topAgents[i]
    topAgents[i] = topAgents[j]
    topAgents[j] = tmp
  }

  if (!state.initialized) {
    for (let i = 0; i < count; i++) ensureSlot(state, i)
    state.initialized = true
  }

  for (let i = 0; i < count; i++) ensureSlot(state, i)

  if (reshuffled && state.initialized) {
    for (let i = 0; i < count; i++) {
      ensureSlot(state, i)
      if (!state.eliminated[i]) state.roundWins[i]++
      state.bankrolls[i] = STARTING_BANKROLL
      state.eliminated[i] = false
      state.frozenStats[i] = { winRate: 0, fitness: 0, dna: { threshold: 1, slope: 1.5, maxSpread: 8 } }
      state.streaks[i] = 0
    }
    state.currentRound++
    state.dethroneTicks = 0
  }

  const featured: FeaturedAgent[] = topAgents.map((agent, i) => {
    ensureSlot(state, i)

    if (state.eliminated[i]) {
      const d = defaultAgent(i, state.frozenStats[i].dna)
      d.fitness = state.frozenStats[i].fitness
      d.winRate = state.frozenStats[i].winRate
      d.roundsWon = state.roundWins[i]
      return d
    }

    state.bankrolls[i] = Math.max(0, state.bankrolls[i] + agent.totalProfit)

    if (state.bankrolls[i] <= 0) {
      state.bankrolls[i] = 0
      state.eliminated[i] = true
      const total = agent.wins + agent.losses + agent.draws
      state.frozenStats[i] = {
        winRate: total > 0 ? (agent.wins / total) * 100 : 0,
        fitness: agent.fitness,
        dna: { ...agent.dna },
      }
    }

    const prevEma = state.emaMap[i]
    state.emaMap[i] = EMA_ALPHA * state.bankrolls[i] + (1 - EMA_ALPHA) * prevEma

    if (agent.totalProfit > 0) {
      state.streaks[i] = Math.max(0, state.streaks[i]) + 1
    } else if (agent.totalProfit < 0) {
      state.streaks[i] = Math.min(0, state.streaks[i]) - 1
    } else {
      state.streaks[i] = 0
    }
    const streak = state.streaks[i]
    const isHotStreak = streak >= 3

    const total = agent.wins + agent.losses + agent.draws
    return {
      id: i,
      dna: agent.dna,
      fitness: agent.fitness,
      emaFitness: state.emaMap[i],
      bankroll: Math.round(state.bankrolls[i]),
      positionFactor: 1,
      riskFactors: { positionRisk: 1, countRisk: 1, momentumRisk: 1, combined: 1 },
      isChampion: false,
      isChallenger: false,
      isHotStreak,
      profit: agent.totalProfit,
      winRate: total > 0 ? (agent.wins / total) * 100 : 0,
      streak,
      mcOdds: null,
      roundsWon: state.roundWins[i],
    }
  })

  if (featured.length === 0) return featured

  const alive = featured.filter((a) => a.bankroll > 0)
  const maxBankroll = Math.max(...alive.map((a) => a.bankroll), 1)

  for (const agent of alive) {
    const ratio = agent.bankroll / maxBankroll

    let positionRisk: number
    if (ratio < 0.3) positionRisk = 2.5
    else if (ratio < 0.5) positionRisk = 1.8
    else if (ratio < 0.7) positionRisk = 1.3
    else if (ratio > 0.95) positionRisk = 0.7
    else positionRisk = 1.0

    let countRisk: number
    if (trueCount > 3) countRisk = 1.5
    else if (trueCount > 1) countRisk = 1.2
    else if (trueCount < -2) countRisk = 0.6
    else if (trueCount < -1) countRisk = 0.8
    else countRisk = 1.0

    let momentumRisk: number
    if (agent.streak <= -3) momentumRisk = 1.3
    else if (agent.streak >= 3) momentumRisk = 0.9
    else momentumRisk = 1.0

    const combined = Math.min(8, Math.max(0.5, positionRisk * countRisk * momentumRisk))
    agent.riskFactors = { positionRisk, countRisk, momentumRisk, combined }
    agent.positionFactor = combined
  }

  if (alive.length === 0) return featured

  const sorted = [...alive].sort((a, b) => b.emaFitness - a.emaFitness)
  const champCandidate = sorted[0]

  const currentChampAlive = alive.find((a) => a.id === state.championId)
  if (!currentChampAlive) {
    state.championId = champCandidate.id
    state.dethroneTicks = 0
  } else if (state.championId !== champCandidate.id) {
    const currentChampEma = state.emaMap[state.championId] ?? 0
    if (currentChampEma > 0 && (champCandidate.emaFitness - currentChampEma) / currentChampEma >= DETHRONE_THRESHOLD) {
      state.dethroneTicks++
      if (state.dethroneTicks >= DETHRONE_TICKS) {
        state.championId = champCandidate.id
        state.dethroneTicks = 0
      }
    } else {
      state.dethroneTicks = 0
    }
  }

  if (featured[state.championId] && featured[state.championId].bankroll > 0) {
    featured[state.championId].isChampion = true
  }
  for (const agent of sorted) {
    if (agent.id !== state.championId && agent.bankroll > 0) {
      featured[agent.id].isChallenger = true
      break
    }
  }

  return featured
}
