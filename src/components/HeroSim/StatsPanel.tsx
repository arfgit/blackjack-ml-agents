import { useState, useRef, useEffect } from 'react'
import clsx from 'clsx'
import type { CEMState } from '@/lib/cem'
import type { ShoeInfo } from '@/hooks/useTrainingWorker'
import MiniChart from './MiniChart'

export interface RoundSnapshot {
  round: number
  generation: number
  bestFitness: number
  avgFitness: number
  bestDNA: { threshold: number; slope: number }
  agentBankrolls: number[]
  agentProfits: number[]
  championId: number
}

interface StatsPanelProps {
  state: CEMState | null
  handsPerSec: number
  isRunning: boolean
  onToggle: () => void
  shoe: ShoeInfo | null
  roundHistory: RoundSnapshot[]
}

function Tooltip({ children, tip }: { children: React.ReactNode; tip: string }) {
  const [show, setShow] = useState(false)
  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
      tabIndex={0}
    >
      {children}
      {show && (
        <div className="absolute z-[70] bottom-full left-0 mb-2 px-3 py-2 rounded-lg bg-bg-secondary border border-border shadow-lg text-[11px] text-text-secondary leading-relaxed w-52 pointer-events-none">
          {tip}
          <div className="absolute top-full left-3 -mt-px w-2 h-2 rotate-45 bg-bg-secondary border-r border-b border-border" />
        </div>
      )}
    </div>
  )
}

function InfoIcon() {
  return (
    <svg width="8" height="8" viewBox="0 0 20 20" fill="currentColor" className="text-text-muted/40 shrink-0 inline-block ml-0.5">
      <circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <text x="10" y="14" textAnchor="middle" fontSize="11" fontWeight="600" fontFamily="serif">i</text>
    </svg>
  )
}

function Stat({ label, value, color, tip }: { label: string; value: string | number; color?: string; tip?: string }) {
  const content = (
    <div className="flex flex-col min-w-0">
      <span className="text-[9px] uppercase tracking-widest text-text-muted inline-flex items-center gap-0.5 whitespace-nowrap">
        {label}
        {tip && <InfoIcon />}
      </span>
      <span className={clsx('text-xs font-mono font-semibold tabular-nums truncate', color ?? 'text-text-primary')}>{value}</span>
    </div>
  )
  if (tip) return <Tooltip tip={tip}>{content}</Tooltip>
  return content
}

function RoundScroller({ children, className }: { children: React.ReactNode; className?: string }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showRightShadow, setShowRightShadow] = useState(false)
  const [showLeftShadow, setShowLeftShadow] = useState(false)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    function check() {
      if (!el) return
      const canScrollRight = el.scrollWidth > el.clientWidth && el.scrollLeft + el.clientWidth < el.scrollWidth - 2
      const canScrollLeft = el.scrollLeft > 2
      setShowRightShadow(canScrollRight)
      setShowLeftShadow(canScrollLeft)
    }
    check()
    el.addEventListener('scroll', check, { passive: true })
    const observer = new ResizeObserver(check)
    observer.observe(el)
    return () => {
      el.removeEventListener('scroll', check)
      observer.disconnect()
    }
  }, [])

  return (
    <div className={clsx('relative', className)}>
      {showLeftShadow && (
        <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-bg-secondary/80 to-transparent pointer-events-none rounded-l z-10" />
      )}
      <div ref={scrollRef} className="flex items-center gap-1 overflow-x-auto scrollbar-none">
        {children}
      </div>
      {showRightShadow && (
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-bg-secondary/80 to-transparent pointer-events-none rounded-r z-10" />
      )}
    </div>
  )
}

export default function StatsPanel({ state, handsPerSec, isRunning, onToggle, shoe, roundHistory }: StatsPanelProps) {
  const [selectedRound, setSelectedRound] = useState<number | null>(null)

  if (!state) return null

  const history = state.fitnessHistory
  let fitnessChange = ''
  let fitnessColor = 'text-text-muted'
  if (history.length >= 2) {
    const prev = history[history.length - 2]
    const curr = history[history.length - 1]
    if (prev !== 0) {
      const pct = ((curr - prev) / Math.abs(prev)) * 100
      fitnessChange = `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`
      fitnessColor = pct > 0 ? 'text-success' : pct < 0 ? 'text-danger' : 'text-text-muted'
    }
  }

  const pastRound = selectedRound !== null ? roundHistory.find((r) => r.round === selectedRound) : null

  return (
    <div className="rounded-lg border border-border bg-bg-secondary/60 backdrop-blur-sm p-3 overflow-visible">
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isRunning ? 'bg-success animate-pulse' : 'bg-text-muted'}`} />
          <Tooltip tip="Cross-Entropy Method, a population-based optimization algorithm. Samples strategies, simulates them, selects the top performers, and updates the distribution each generation.">
            <span className="text-[10px] font-mono text-text-secondary cursor-default inline-flex items-center gap-1 shrink-0">
              CEM Training
              <InfoIcon />
            </span>
          </Tooltip>

          {shoe && (roundHistory.length > 0 || shoe.round > 0) && (
            <RoundScroller className="flex-1 min-w-0">
              {roundHistory.map((r, idx) => (
                <button
                  key={`round-${r.round}-${idx}`}
                  onClick={() => setSelectedRound(selectedRound === r.round ? null : r.round)}
                  className={clsx(
                    'text-[9px] font-mono px-1.5 py-0.5 rounded shrink-0',
                    selectedRound === r.round
                      ? 'bg-accent/20 text-accent'
                      : 'text-text-muted hover:text-text-secondary hover:bg-bg-tertiary'
                  )}
                >
                  R{r.round}
                </button>
              ))}
              <button
                onClick={() => setSelectedRound(null)}
                className={clsx(
                  'text-[9px] font-mono px-1.5 py-0.5 rounded shrink-0',
                  selectedRound === null ? 'bg-accent/10 text-accent' : 'text-text-muted hover:text-text-secondary hover:bg-bg-tertiary'
                )}
              >
                R{shoe.round} <span className="text-[8px]">live</span>
              </button>
            </RoundScroller>
          )}
        </div>

        <button
          onClick={onToggle}
          className="text-[10px] font-mono text-text-muted hover:text-accent shrink-0"
          aria-label={isRunning ? 'Pause training' : 'Resume training'}
        >
          [{isRunning ? 'pause' : 'resume'}]
        </button>
      </div>

      {pastRound ? (
        <div className="p-2 rounded bg-bg-tertiary/50 border border-border/50 mb-3 overflow-visible">
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-2 min-w-0">
            <Stat label={`R${pastRound.round} Gen`} value={pastRound.generation} tip={`Total generations completed in round ${pastRound.round} before the shoe reshuffled.`} />
            <Stat label="Best" value={pastRound.bestFitness.toFixed(0)} tip="Highest fitness (profit) any strategy achieved during this round." />
            <Stat label="Avg" value={pastRound.avgFitness.toFixed(0)} tip="Average fitness across the population at the end of this round." />
            <Stat label="Champ" value={`Agent ${pastRound.championId + 1}`} color="text-accent" tip="The agent with the highest EMA-smoothed bankroll when this round ended." />
            <Stat label="DNA" value={`T${pastRound.bestDNA.threshold.toFixed(1)} S${pastRound.bestDNA.slope.toFixed(1)}`} tip="Best strategy's threshold (T) and slope (S) at end of round. T = when to bet big, S = how aggressively." />
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[9px] font-mono">
            {pastRound.agentBankrolls.map((b, i) => {
              const profit = pastRound.agentProfits[i] ?? 0
              return (
                <span key={i} className={clsx('tabular-nums whitespace-nowrap', b <= 0 ? 'text-text-muted line-through' : 'text-text-secondary')}>
                  A{i + 1}: ${b.toLocaleString()}
                  {profit !== 0 && (
                    <span className={clsx('ml-1', profit > 0 ? 'text-success' : 'text-danger')}>
                      ({profit > 0 ? '+' : ''}{profit})
                    </span>
                  )}
                </span>
              )
            })}
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3 mb-3">
            <Stat label="Gen" value={state.generation} tip="Current generation. Each generation samples, simulates, and selects the best strategies." />
            <Stat label="Best" value={state.bestFitness.toFixed(0)} tip="All-time highest fitness (profit) achieved by any strategy across all generations." />
            <Stat label="Avg" value={state.avgFitness.toFixed(0)} tip="Average fitness of the current generation's entire population." />
            <Stat label="Δ Fit" value={fitnessChange || '-'} color={fitnessColor} tip="Percentage change in best fitness from the previous generation. Green = improving, red = declining." />
            <Stat label="H/s" value={handsPerSec.toLocaleString()} tip="Hands simulated per second across the entire population in the Web Worker." />
            <Stat label="DNA" value={`T${state.bestDNA.threshold.toFixed(1)} S${state.bestDNA.slope.toFixed(1)}`} tip="Best strategy's threshold (T) and slope (S). T = true count to start betting big. S = how aggressively bets scale." />
          </div>

          {history.length > 1 && (
            <div className="flex items-center gap-3">
              <span className="text-[9px] uppercase tracking-widest text-text-muted shrink-0">Fitness</span>
              <MiniChart data={history} width={200} height={24} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
