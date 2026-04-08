import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import type { CEMState } from '@/lib/cem'
import type { RoundSnapshot } from './StatsPanel'
import MiniChart from './MiniChart'

interface LearningInsightsProps {
  state: CEMState | null
  roundHistory: RoundSnapshot[]
}

function Metric({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="text-center min-w-0">
      <span className={clsx('text-base sm:text-lg font-sans font-bold tabular-nums', color ?? 'text-text-primary')}>{value}</span>
      <span className="block text-[8px] sm:text-[9px] uppercase tracking-widest text-text-muted mt-0.5">{label}</span>
      {sub && <span className={clsx('block text-[8px] sm:text-[9px] font-sans tabular-nums', color ?? 'text-text-muted')}>{sub}</span>}
    </div>
  )
}

export default function LearningInsights({ state, roundHistory }: LearningInsightsProps) {
  const [expanded, setExpanded] = useState(false)

  if (!state || state.generation < 3) return null

  const history = state.fitnessHistory
  const avgHistory = state.avgHistory

  const bestTrend: 'up' | 'flat' | 'wait' =
    history.length <= 5 ? 'wait' :
    history.slice(-5).reduce((a, b) => a + b, 0) / 5 > history.slice(0, 5).reduce((a, b) => a + b, 0) / 5 ? 'up' : 'flat'

  const bestTrendText = {
    up: 'Trending up. Agents are finding better strategies over time.',
    flat: 'Flat or noisy. CEM is exploring but not yet converging on better strategies.',
    wait: 'Not enough data yet. Watch for the line to trend upward.',
  }

  const earlyAvg = avgHistory.length >= 10 ? avgHistory.slice(0, 5).reduce((a, b) => a + b, 0) / 5 : null
  const recentAvg = avgHistory.length >= 10 ? avgHistory.slice(-5).reduce((a, b) => a + b, 0) / 5 : null
  const avgImprovement = earlyAvg !== null && recentAvg !== null && earlyAvg !== 0
    ? ((recentAvg - earlyAvg) / Math.abs(earlyAvg)) * 100
    : null

  const avgTrend: 'rising' | 'dropping' | 'stable' =
    avgImprovement !== null && avgImprovement > 5 ? 'rising' :
    avgImprovement !== null && avgImprovement < -5 ? 'dropping' : 'stable'

  const avgTrendText = {
    rising: 'Population average is rising. The whole population is getting smarter, not just the elite.',
    dropping: 'Population average is dropping. This can happen during exploration phases.',
    stable: 'Relatively stable. The population is maintaining consistent performance.',
  }

  const thresholdDrift = Math.abs(state.bestDNA.threshold - 2.0)
  const isConverging = thresholdDrift < 1.5

  const totalRounds = roundHistory.length
  let roundProfitTrend: 'improving' | 'declining' | 'stable' = 'stable'
  if (totalRounds >= 3) {
    const recentRounds = roundHistory.slice(-3)
    const earlyRounds = roundHistory.slice(0, Math.min(3, totalRounds))
    const recentAvgProfit = recentRounds.reduce((s, r) => s + r.agentProfits.reduce((a, b) => a + b, 0), 0) / recentRounds.length
    const earlyAvgProfit = earlyRounds.reduce((s, r) => s + r.agentProfits.reduce((a, b) => a + b, 0), 0) / earlyRounds.length
    if (recentAvgProfit > earlyAvgProfit + 50) roundProfitTrend = 'improving'
    else if (recentAvgProfit < earlyAvgProfit - 50) roundProfitTrend = 'declining'
  }

  const trendColors = { improving: 'text-success', declining: 'text-danger', stable: 'text-text-muted' }
  const trendLabels = { improving: 'Improving', declining: 'Declining', stable: 'Stable' }

  return (
    <div className="rounded-xl border border-border bg-bg-secondary/60 backdrop-blur-sm overflow-visible">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 sm:px-4 py-3"
        aria-expanded={expanded}
      >
        <span className="text-[10px] font-mono text-text-secondary uppercase tracking-wider">
          Learning Progress
        </span>
        <span className="text-[10px] font-mono text-text-muted">
          {expanded ? 'collapse' : 'expand'}
        </span>
      </button>

      <motion.div
        animate={{ opacity: expanded ? 1 : 0, height: expanded ? 'auto' : 0 }}
        initial={false}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="overflow-hidden"
        aria-hidden={!expanded}
        inert={!expanded ? true : undefined}
      >
        <div className="px-3 sm:px-4 pb-4 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Metric
              label="Generations"
              value={state.generation.toLocaleString()}
            />
            <Metric
              label="Avg Fitness Trend"
              value={avgImprovement !== null ? `${avgImprovement > 0 ? '+' : ''}${avgImprovement.toFixed(1)}%` : '-'}
              sub="early vs recent"
              color={avgImprovement !== null ? (avgImprovement > 0 ? 'text-success' : 'text-danger') : undefined}
            />
            <Metric
              label="DNA Convergence"
              value={isConverging ? 'Converging' : 'Exploring'}
              sub={`T${state.bestDNA.threshold.toFixed(2)} S${state.bestDNA.slope.toFixed(2)}`}
              color={isConverging ? 'text-success' : 'text-accent'}
            />
            <Metric
              label="Round Trend"
              value={trendLabels[roundProfitTrend]}
              sub={`${totalRounds} rounds`}
              color={trendColors[roundProfitTrend]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="rounded-lg border border-border bg-bg-tertiary/30 p-3">
              <span className="text-[9px] uppercase tracking-widest text-text-muted block mb-2">Best Fitness Over Time</span>
              {history.length > 1 && (
                <div className="w-full overflow-hidden">
                  <MiniChart data={history} width={240} height={36} color="var(--color-accent)" />
                </div>
              )}
              <div className="mt-2 h-8 relative overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={bestTrend}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                    className="text-[10px] text-text-muted leading-relaxed absolute inset-x-0"
                  >
                    {bestTrendText[bestTrend]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-bg-tertiary/30 p-3">
              <span className="text-[9px] uppercase tracking-widest text-text-muted block mb-2">Avg Fitness Over Time</span>
              {avgHistory.length > 1 && (
                <div className="w-full overflow-hidden">
                  <MiniChart data={avgHistory} width={240} height={36} color="var(--color-warning)" />
                </div>
              )}
              <div className="mt-2 h-8 relative overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={avgTrend}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                    className="text-[10px] text-text-muted leading-relaxed absolute inset-x-0"
                  >
                    {avgTrendText[avgTrend]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {totalRounds >= 2 && (
            <div className="rounded-lg border border-border bg-bg-tertiary/30 p-3">
              <span className="text-[9px] uppercase tracking-widest text-text-muted block mb-2">Round-over-Round Performance</span>
              <div className="flex items-end gap-1 h-12">
                {roundHistory.map((r) => {
                  const totalProfit = r.agentProfits.reduce((a, b) => a + b, 0)
                  const maxAbs = Math.max(...roundHistory.map((rr) => Math.abs(rr.agentProfits.reduce((a, b) => a + b, 0))), 1)
                  const heightPct = Math.abs(totalProfit) / maxAbs * 100
                  const isPositive = totalProfit >= 0
                  return (
                    <div key={r.round} className="flex-1 flex flex-col items-center justify-end h-full min-w-0">
                      <div
                        className={clsx(
                          'w-full rounded-sm min-h-[2px]',
                          isPositive ? 'bg-success' : 'bg-danger'
                        )}
                        style={{ height: `${Math.max(4, heightPct)}%` }}
                      />
                      <span className="text-[7px] sm:text-[8px] font-sans text-text-muted mt-1 tabular-nums">R{r.round}</span>
                    </div>
                  )
                })}
              </div>
              <p className="text-[10px] text-text-muted mt-2 leading-relaxed">
                Green bars = total profit across all agents. Red bars = total loss. Look for bars getting greener over time.
              </p>
            </div>
          )}

          <div className="rounded-lg border border-border bg-bg-tertiary/30 p-3">
            <span className="text-[9px] uppercase tracking-widest text-text-muted block mb-2">What to Watch For</span>
            <ul className="space-y-1.5 text-[10px] sm:text-[11px] text-text-secondary leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-accent font-bold shrink-0">1</span>
                <span>Best fitness trending upward means CEM is finding better betting strategies each generation.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent font-bold shrink-0">2</span>
                <span>DNA threshold converging toward TC +1.5 to +2.5 means agents are discovering the real optimal counting threshold.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent font-bold shrink-0">3</span>
                <span>Agents betting more during ADV and less during DIS means they are using the count signal correctly.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent font-bold shrink-0">4</span>
                <span>Later rounds losing less money than early rounds means the population has evolved toward a more sustainable strategy.</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
