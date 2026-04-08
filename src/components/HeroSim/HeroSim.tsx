import { useRef, useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useTrainingWorker } from '@/hooks/useTrainingWorker'
import { selectFeaturedAgents, getDeviceAgentCount, createFeaturedState } from '@/lib/featuredAgents'
import type { FeaturedAgent, FeaturedAgentState } from '@/lib/featuredAgents'
import { monteCarloOdds } from '@/lib/monteCarlo'
import type { MCOdds } from '@/lib/monteCarlo'
import DealerBar from './BlackjackTable'
import AgentCards from './AgentCards'
import StatsPanel from './StatsPanel'
import type { RoundSnapshot } from './StatsPanel'
import LearningInsights from './LearningInsights'
import Legend from './Legend'

export default function HeroSim() {
  const { cemState, agents, handsPerSec, isRunning, sampleHands, dealerCards, shoe, pause, resume } = useTrainingWorker()
  const featuredStateRef = useRef<FeaturedAgentState>(createFeaturedState())
  const prevOddsRef = useRef<Map<string, MCOdds>>(new Map())
  const [featured, setFeatured] = useState<FeaturedAgent[]>([])
  const [roundHistory, setRoundHistory] = useState<RoundSnapshot[]>([])

  const agentCount = getDeviceAgentCount()

  useEffect(() => {
    if (agents.length === 0) return

    const reshuffled = shoe?.reshuffled ?? false

    if (reshuffled && cemState && shoe) {
      const endedRound = shoe.round - 1
      if (endedRound < 1) { /* skip invalid */ }
      else {
      const snapshot: RoundSnapshot = {
        round: endedRound,
        generation: cemState.generation,
        bestFitness: cemState.bestFitness,
        avgFitness: cemState.avgFitness,
        bestDNA: { threshold: cemState.bestDNA.threshold, slope: cemState.bestDNA.slope },
        agentBankrolls: featuredStateRef.current.bankrolls.map((b) => Math.round(b)),
        agentProfits: featuredStateRef.current.bankrolls.map((b) => Math.round(b - 1000)),
        championId: featuredStateRef.current.championId,
      }
      setRoundHistory((prev) => {
        const filtered = prev.filter((s) => s.round !== snapshot.round)
        return [...filtered, snapshot].slice(-20)
      })
      }
    }

    const tc = shoe?.trueCount ?? 0
    const selected = selectFeaturedAgents(agents, agentCount, featuredStateRef.current, reshuffled, tc)

    const rollouts = window.innerWidth < 640 ? 100 : window.innerWidth < 1024 ? 200 : 300
    const newOdds = new Map<string, MCOdds>()

    for (const agent of selected) {
      if (agent.isChampion || agent.isChallenger) {
        const key = `${agent.dna.threshold.toFixed(2)}-${agent.dna.slope.toFixed(2)}`
        const cached = prevOddsRef.current.get(key)
        if (cached) {
          agent.mcOdds = cached
        } else {
          agent.mcOdds = monteCarloOdds(17, 7, agent.dna.threshold, rollouts)
        }
        if (agent.mcOdds) newOdds.set(key, agent.mcOdds)
      }
    }

    prevOddsRef.current = newOdds
    setFeatured(selected)
  }, [agents, agentCount, shoe, cemState])

  const handleToggle = useCallback(() => {
    if (isRunning) pause()
    else resume()
  }, [isRunning, pause, resume])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.2 }}
      className="w-full space-y-3"
    >
      <DealerBar dealerCards={dealerCards} isRunning={isRunning} shoe={shoe} />
      <AgentCards agents={featured} sampleHands={sampleHands} />
      <StatsPanel
        state={cemState}
        handsPerSec={handsPerSec}
        isRunning={isRunning}
        onToggle={handleToggle}
        shoe={shoe}
        roundHistory={roundHistory}
      />
      <LearningInsights state={cemState} roundHistory={roundHistory} />
      <Legend />
    </motion.div>
  )
}
