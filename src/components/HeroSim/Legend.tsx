import { useState } from 'react'
import { motion } from 'framer-motion'
import { Info, X } from 'lucide-react'
import clsx from 'clsx'

interface LegendItemProps {
  label: string
  color?: string
  badge?: boolean
  dashed?: boolean
  tooltip: string
}

function LegendItem({ label, color = 'text-text-muted', badge, dashed, tooltip }: LegendItemProps) {
  const [showTip, setShowTip] = useState(false)

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
      onFocus={() => setShowTip(true)}
      onBlur={() => setShowTip(false)}
      tabIndex={0}
    >
      <span
        className={clsx(
          'flex items-center gap-1 text-[10px] sm:text-[11px] cursor-default',
          badge && 'font-mono font-bold px-1 sm:px-1.5 py-0.5 rounded border',
          badge && !dashed && color === 'text-accent' && 'bg-accent/10 border-accent/20',
          badge && !dashed && color === 'text-orange-400' && 'bg-orange-500/10 border-orange-500/20',
          badge && dashed && 'bg-warning/10 border-warning/20 border-dashed',
          badge && color === 'text-text-muted' && 'bg-bg-tertiary border-border',
          !badge && 'font-mono font-semibold',
          color
        )}
        aria-label={`${label}: ${tooltip}`}
      >
        {label}
        <Info size={8} className="text-text-muted/50 shrink-0" />
      </span>

      {showTip && (
        <div className="absolute z-[70] bottom-full left-0 mb-2 px-3 py-2 rounded-lg bg-bg-secondary border border-border shadow-lg text-[11px] text-text-secondary leading-relaxed w-48 sm:w-56 pointer-events-none">
          <div className="font-semibold text-text-primary mb-0.5">{label}</div>
          {tooltip}
          <div className="absolute top-full left-3 -mt-px w-2 h-2 rotate-45 bg-bg-secondary border-r border-b border-border" />
        </div>
      )}
    </div>
  )
}

function Divider() {
  return <div className="h-3 border-l border-border hidden sm:block" />
}

const DETAIL_HEIGHT = 300

export default function Legend() {
  const [showDetail, setShowDetail] = useState(true)

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border bg-bg-secondary/60 backdrop-blur-sm p-3 sm:p-4 overflow-visible">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <LegendItem label="CHAMP" color="text-accent" badge tooltip="Agent with the highest EMA-smoothed bankroll. Takes the crown when sustained performance beats all others." />
          <LegendItem label="CHAL" color="text-warning" badge dashed tooltip="Second-highest EMA bankroll. If it exceeds the champion by 1%+ for 2 consecutive generations, it dethrones them." />
          <LegendItem label="OUT" color="text-text-muted" badge tooltip="Bankrupt. Bankroll hit $0. Eliminated until the shoe reshuffles and a new round begins." />
          <LegendItem label="HOT" color="text-orange-400" badge tooltip="On a hot streak. 3+ consecutive profitable generations. Any agent can be HOT, including the champion and challenger." />

          <Divider />

          <LegendItem label="WIN" color="text-success" tooltip="Agent's hand beat the dealer. Bankroll increases by the bet amount." />
          <LegendItem label="LOSE" color="text-danger" tooltip="Dealer's hand beat the agent. Bankroll decreases by the bet amount." />
          <LegendItem label="PUSH" color="text-warning" tooltip="Tie. Same hand total as dealer. No money gained or lost." />

          <Divider />

          <LegendItem label="risky" color="text-danger" tooltip="Agent is behind the leader and betting 1.5–10x more aggressively to catch up. Higher reward, higher risk of going bust." />
          <LegendItem label="safe" color="text-success" tooltip="Agent is the leader and betting 0.8x to protect their bankroll advantage." />

          <Divider />

          <LegendItem label="ADV" color="text-success" tooltip="True count > 2. More high cards (10s, Aces) remain in the shoe, giving the player an advantage. Agents bet bigger here." />
          <LegendItem label="NEU" color="text-text-muted" tooltip="True count between -1 and 2. No significant edge for player or dealer." />
          <LegendItem label="DIS" color="text-danger" tooltip="True count < -1. More low cards remain, giving the dealer an advantage. Smart agents bet minimum here." />

          <Divider />

          <LegendItem label="RC" color="text-text-secondary" tooltip="Running Count. Cumulative Hi-Lo count since last shuffle. Cards 2-6 = +1, 7-9 = 0, 10-A = -1." />
          <LegendItem label="TC" color="text-text-secondary" tooltip="True Count. Running count divided by decks remaining. The normalized signal agents use to size bets." />
          <LegendItem label="Pen" color="text-text-secondary" tooltip="Penetration. How deep into the 6-deck shoe we are. Reshuffles at 75%, starting a new round." />

          <button
            onClick={() => setShowDetail(!showDetail)}
            className="ml-auto flex items-center gap-1 text-text-muted hover:text-accent shrink-0 text-[10px] sm:text-[11px]"
            aria-expanded={showDetail}
          >
            {showDetail ? <X size={12} /> : <Info size={12} />}
            <span className="font-mono">{showDetail ? 'Close' : 'Learn more'}</span>
          </button>
        </div>
      </div>

      <div className="relative" style={{ minHeight: showDetail ? `${DETAIL_HEIGHT}px` : '0px' }}>
        <motion.div
          animate={{ opacity: showDetail ? 1 : 0, y: showDetail ? 0 : -8 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className={showDetail ? '' : 'pointer-events-none'}
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="rounded-lg border border-border bg-bg-secondary/40 p-5">
              <h4 className="text-sm font-display font-semibold text-text-primary mb-2">Cross-Entropy Method</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Agents evolve strategies using CEM, a population-based optimization algorithm.
                Each generation, the top performers pass their DNA to the next. Strategies are
                randomly distributed across agents so no position has an inherent advantage.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-bg-secondary/40 p-5">
              <h4 className="text-sm font-display font-semibold text-text-primary mb-2">Strategy DNA</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Each agent has three genes: <span className="font-mono text-text-primary">threshold</span> (when to bet big),
                <span className="font-mono text-text-primary"> slope</span> (how aggressively), and
                <span className="font-mono text-text-primary"> max spread</span> (maximum multiplier).
                DNA is shuffled across agents each generation for fair competition.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-bg-secondary/40 p-5">
              <h4 className="text-sm font-display font-semibold text-text-primary mb-2">Hi-Lo Card Counting</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                All agents share a 6-deck shoe. Cards 2–6 = +1, 7–9 = 0, 10–A = −1.
                The <span className="font-mono text-text-primary">true count</span> (RC ÷ decks remaining)
                tells agents when the deck favors them. Higher TC = more high cards left = bigger bets.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-bg-secondary/40 p-5">
              <h4 className="text-sm font-display font-semibold text-text-primary mb-2">Bankroll &amp; Risk</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Every agent starts with $1,000 per round. Agents behind bet up to 10x more aggressively.
                Leaders play 0.8x safer. Hit $0 and you're eliminated until the next round.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-bg-secondary/40 p-5">
              <h4 className="text-sm font-display font-semibold text-text-primary mb-2">Dealer &amp; Shoe</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                The dealer draws from a shared 6-deck shoe (312 cards). At 75% penetration the shoe
                reshuffles and a new round begins. Running count and true count reset on reshuffle.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-bg-secondary/40 p-5">
              <h4 className="text-sm font-display font-semibold text-text-primary mb-2">Rounds &amp; Rankings</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                When the shoe reshuffles, bankrupt agents revive with fresh $1,000. EMA-smoothed
                bankroll carries across rounds so past performance matters. Any agent can take the
                crown through sustained outperformance.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
