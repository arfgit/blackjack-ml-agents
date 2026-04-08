import clsx from 'clsx'
import PlayingCard from './PlayingCard'
import type { ShoeInfo } from '@/hooks/useTrainingWorker'

interface DealerBarProps {
  dealerCards: number[]
  isRunning: boolean
  shoe: ShoeInfo | null
}

const countStateColors = {
  advantage: 'text-success',
  neutral: 'text-text-muted',
  disadvantage: 'text-danger',
}

function getCountState(tc: number): 'advantage' | 'neutral' | 'disadvantage' {
  if (tc > 2) return 'advantage'
  if (tc < -1) return 'disadvantage'
  return 'neutral'
}

export default function DealerBar({ dealerCards, isRunning, shoe }: DealerBarProps) {
  const penetration = shoe ? ((shoe.totalCards - shoe.cardsRemaining) / shoe.totalCards) * 100 : 0
  const countState = shoe ? getCountState(shoe.trueCount) : 'neutral'

  return (
    <div className="rounded-xl border border-border bg-bg-secondary/60 backdrop-blur-sm px-3 sm:px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-mono text-text-secondary uppercase tracking-wider shrink-0">Dealer</span>

        <div className="flex gap-1 overflow-x-auto scrollbar-none shrink min-w-0">
          {dealerCards.length > 0 ? (
            dealerCards.map((card, i) => (
              <PlayingCard key={`dealer-${card}-${i}`} value={card} index={i} size="md" />
            ))
          ) : (
            <>
              <PlayingCard value={0} faceDown index={0} size="md" />
              <PlayingCard value={0} faceDown index={1} size="md" />
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          <div className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-success animate-pulse' : 'bg-text-muted'}`} />
          <span className="text-[9px] text-text-muted font-mono">{isRunning ? 'Live' : 'Paused'}</span>
        </div>
      </div>

      {shoe && (
        <div className="flex items-center gap-3 sm:gap-4 mt-2 pt-2 border-t border-border/30">
          <div className="text-center">
            <span className="text-[8px] text-text-muted uppercase tracking-widest block">Cards</span>
            <span className="text-[10px] font-mono font-semibold text-text-primary tabular-nums">{shoe.cardsRemaining}/{shoe.totalCards}</span>
          </div>
          <div className="text-center hidden sm:block">
            <span className="text-[8px] text-text-muted uppercase tracking-widest block">Decks</span>
            <span className="text-[10px] font-mono font-semibold text-text-primary tabular-nums">{shoe.decksRemaining}</span>
          </div>
          <div className="text-center">
            <span className="text-[8px] text-text-muted uppercase tracking-widest block">RC</span>
            <span className={clsx('text-[10px] font-mono font-semibold tabular-nums', countStateColors[countState])}>
              {shoe.runningCount > 0 ? '+' : ''}{shoe.runningCount}
            </span>
          </div>
          <div className="text-center">
            <span className="text-[8px] text-text-muted uppercase tracking-widest block">TC</span>
            <span className={clsx('text-[10px] font-mono font-semibold tabular-nums', countStateColors[countState])}>
              {shoe.trueCount > 0 ? '+' : ''}{shoe.trueCount}
            </span>
          </div>
          <div className="flex-1 min-w-8 max-w-20">
            <span className="text-[8px] text-text-muted uppercase tracking-widest block text-center">Pen</span>
            <div className="w-full h-1.5 rounded-full bg-bg-tertiary overflow-hidden mt-0.5">
              <div
                className={clsx(
                  'h-full rounded-full transition-all duration-500',
                  penetration > 70 ? 'bg-danger' : penetration > 50 ? 'bg-warning' : 'bg-accent'
                )}
                style={{ width: `${penetration}%` }}
              />
            </div>
          </div>
          <div className="text-center hidden sm:block">
            <span className="text-[8px] text-text-muted uppercase tracking-widest block">Round</span>
            <span className="text-[10px] font-mono font-semibold text-text-primary tabular-nums">{shoe.round}</span>
          </div>
        </div>
      )}
    </div>
  )
}
