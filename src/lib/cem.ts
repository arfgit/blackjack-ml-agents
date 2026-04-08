import { createShoe } from './blackjack/shoe'
import { trueCount } from './blackjack/count'
import { playRound } from './blackjack/resolve'

export interface StrategyDNA {
  threshold: number
  slope: number
  maxSpread: number
}

export interface AgentResult {
  dna: StrategyDNA
  fitness: number
  totalProfit: number
  handsPlayed: number
  wins: number
  losses: number
  draws: number
}

export function betFromDNA(dna: StrategyDNA, tc: number, positionFactor: number = 1): number {
  let baseBet: number
  if (tc < dna.threshold) {
    baseBet = 1
  } else {
    baseBet = 1 + dna.slope * (tc - dna.threshold)
  }
  return Math.min(dna.maxSpread * positionFactor, baseBet * positionFactor)
}

function gaussian(): number {
  let u = 0, v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
}

export function samplePopulation(
  mean: StrategyDNA,
  stddev: StrategyDNA,
  size: number
): StrategyDNA[] {
  const pop: StrategyDNA[] = []
  for (let i = 0; i < size; i++) {
    pop.push({
      threshold: Math.max(-1, Math.min(5, mean.threshold + stddev.threshold * gaussian())),
      slope: Math.max(0.5, Math.min(3, mean.slope + stddev.slope * gaussian())),
      maxSpread: Math.max(2, Math.min(12, mean.maxSpread + stddev.maxSpread * gaussian())),
    })
  }
  return pop
}

export function simulateAgent(dna: StrategyDNA, handsToPlay: number): AgentResult {
  const shoe = createShoe(6)
  let totalProfit = 0
  let wins = 0, losses = 0, draws = 0

  for (let i = 0; i < handsToPlay; i++) {
    const tc = trueCount(shoe)
    const bet = betFromDNA(dna, tc)
    const outcome = playRound(shoe, bet)
    totalProfit += outcome.payout

    if (outcome.result === 'win') wins++
    else if (outcome.result === 'lose') losses++
    else draws++
  }

  return {
    dna,
    fitness: totalProfit,
    totalProfit,
    handsPlayed: handsToPlay,
    wins,
    losses,
    draws,
  }
}

export interface CEMState {
  mean: StrategyDNA
  stddev: StrategyDNA
  generation: number
  bestFitness: number
  avgFitness: number
  bestDNA: StrategyDNA
  fitnessHistory: number[]
  avgHistory: number[]
}

export function initCEMState(): CEMState {
  return {
    mean: { threshold: 2.0, slope: 1.0, maxSpread: 8 },
    stddev: { threshold: 1.0, slope: 0.5, maxSpread: 3 },
    generation: 0,
    bestFitness: -Infinity,
    avgFitness: 0,
    bestDNA: { threshold: 2.0, slope: 1.0, maxSpread: 8 },
    fitnessHistory: [],
    avgHistory: [],
  }
}

export function cemStep(
  state: CEMState,
  populationSize: number,
  eliteFraction: number,
  handsPerAgent: number
): { state: CEMState; agents: AgentResult[] } {
  const population = samplePopulation(state.mean, state.stddev, populationSize)
  const results = population.map((dna) => simulateAgent(dna, handsPerAgent))

  results.sort((a, b) => b.fitness - a.fitness)
  const eliteCount = Math.max(2, Math.floor(populationSize * eliteFraction))
  const elites = results.slice(0, eliteCount)

  const newMean: StrategyDNA = { threshold: 0, slope: 0, maxSpread: 0 }
  for (const e of elites) {
    newMean.threshold += e.dna.threshold / eliteCount
    newMean.slope += e.dna.slope / eliteCount
    newMean.maxSpread += e.dna.maxSpread / eliteCount
  }

  const newStddev: StrategyDNA = { threshold: 0, slope: 0, maxSpread: 0 }
  for (const e of elites) {
    newStddev.threshold += (e.dna.threshold - newMean.threshold) ** 2 / eliteCount
    newStddev.slope += (e.dna.slope - newMean.slope) ** 2 / eliteCount
    newStddev.maxSpread += (e.dna.maxSpread - newMean.maxSpread) ** 2 / eliteCount
  }
  newStddev.threshold = Math.max(0.3, Math.sqrt(newStddev.threshold))
  newStddev.slope = Math.max(0.15, Math.sqrt(newStddev.slope))
  newStddev.maxSpread = Math.max(0.5, Math.sqrt(newStddev.maxSpread))

  const bestResult = results[0]
  const avgFitness = results.reduce((s, r) => s + r.fitness, 0) / results.length

  const fitnessHistory = [...state.fitnessHistory, bestResult.fitness].slice(-50)
  const avgHistory = [...state.avgHistory, avgFitness].slice(-50)

  return {
    state: {
      mean: newMean,
      stddev: newStddev,
      generation: state.generation + 1,
      bestFitness: Math.max(state.bestFitness, bestResult.fitness),
      avgFitness,
      bestDNA: bestResult.fitness > state.bestFitness ? bestResult.dna : state.bestDNA,
      fitnessHistory,
      avgHistory,
    },
    agents: results,
  }
}
