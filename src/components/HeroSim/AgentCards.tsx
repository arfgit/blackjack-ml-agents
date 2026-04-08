import clsx from 'clsx'
import type { FeaturedAgent } from '@/lib/featuredAgents'
import type { SampleHand } from '@/hooks/useTrainingWorker'
import PlayingCard from './PlayingCard'

function OddsBar({ odds }: { odds: { pWin: number; pPush: number; pLose: number } }) {
  return (
    <div className="flex h-1.5 rounded-full overflow-hidden bg-bg-tertiary" role="img" aria-label={`Win ${odds.pWin.toFixed(0)}%, Push ${odds.pPush.toFixed(0)}%, Lose ${odds.pLose.toFixed(0)}%`}>
      <div className="bg-success transition-all duration-500 ease-in" style={{ width: `${odds.pWin}%` }} />
      <div className="bg-warning transition-all duration-500 ease-in" style={{ width: `${odds.pPush}%` }} />
      <div className="bg-danger transition-all duration-500 ease-in" style={{ width: `${odds.pLose}%` }} />
    </div>
  )
}

function Stat({ label, value, muted }: { label: string; value: string | number; muted?: boolean }) {
  return (
    <div className="flex justify-between text-[10px]">
      <span className="text-text-muted uppercase tracking-wider">{label}</span>
      <span className={clsx('font-mono tabular-nums', muted ? 'text-text-muted' : 'text-text-primary')}>{value}</span>
    </div>
  )
}

function CrownIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor" className="shrink-0 drop-shadow-[0_0_4px_rgba(34,211,238,0.6)]" style={{ marginTop: '-1px' }}>
      <path d="M1 16h18v2H1zm1-1L0 6l5 3.5L10 2l5 7.5L20 6l-2 9z"/>
    </svg>
  )
}

function StarIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 drop-shadow-[0_0_3px_rgba(251,191,36,0.5)]" style={{ marginTop: '-1px' }}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>
    </svg>
  )
}

const resultColors = { win: 'text-success', lose: 'text-danger', push: 'text-warning' }
const countStateColors = { advantage: 'text-success', neutral: 'text-text-muted', disadvantage: 'text-danger' }
const countStateLabels = { advantage: 'ADV', neutral: 'NEU', disadvantage: 'DIS' }

interface AgentCardsProps {
  agents: FeaturedAgent[]
  sampleHands: SampleHand[]
}

export default function AgentCards({ agents, sampleHands }: AgentCardsProps) {
  return (
    <div className="flex flex-wrap sm:flex-nowrap gap-2 justify-center sm:justify-start">
      {agents.map((agent) => {
        const hand = sampleHands[agent.id]
        const isBusted = agent.bankroll <= 0

        return (
          <div
            key={agent.id}
            className={clsx(
              'relative p-1.5 sm:p-3 rounded-lg border bg-bg-secondary/60 backdrop-blur-sm overflow-hidden w-[calc(50%-4px)] sm:w-0 sm:flex-1',
              isBusted && 'opacity-40 grayscale',
              !isBusted && agent.isHotStreak && !agent.isChampion && !agent.isChallenger && 'border-orange-500/40 shadow-[0_0_10px_rgba(249,115,22,0.12)]',
              !isBusted && agent.isChampion && 'border-accent/60 shadow-[0_0_12px_rgba(34,211,238,0.15)]',
              !isBusted && agent.isChallenger && 'border-warning/50 border-dashed shadow-[0_0_12px_rgba(251,191,36,0.12)]',
              !isBusted && !agent.isChampion && !agent.isChallenger && !agent.isHotStreak && 'border-border'
            )}
          >
            {!isBusted && agent.isChampion && (
              <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent pointer-events-none" />
            )}
            {!isBusted && agent.isChallenger && (
              <div className="absolute inset-0 bg-gradient-to-b from-warning/5 to-transparent pointer-events-none animate-pulse" style={{ animationDuration: '2s' }} />
            )}
            {!isBusted && agent.isHotStreak && !agent.isChampion && !agent.isChallenger && (
              <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent pointer-events-none" />
            )}

            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-text-muted">
                  Agent {agent.id + 1}
                </span>
                {isBusted && (
                  <span className="text-[9px] font-bold text-text-muted px-1.5 py-0.5 rounded bg-bg-tertiary border border-border leading-none">
                    OUT
                  </span>
                )}
                {!isBusted && agent.isChampion && (
                  <div className="flex items-center gap-1">
                    <span className="inline-flex items-center gap-[3px] text-[9px] font-bold text-accent px-1.5 py-0.5 rounded bg-accent/10 border border-accent/20 leading-none">
                      <CrownIcon />
                      CHAMP
                    </span>
                    {agent.isHotStreak && (
                      <span className="text-[8px] font-bold text-orange-400 px-1 py-0.5 rounded bg-orange-500/10 border border-orange-500/20 leading-none">
                        HOT
                      </span>
                    )}
                  </div>
                )}
                {!isBusted && agent.isChallenger && (
                  <div className="flex items-center gap-1">
                    <span className="inline-flex items-center gap-[3px] text-[9px] font-bold text-warning px-1.5 py-0.5 rounded bg-warning/10 border border-warning/20 border-dashed leading-none">
                      <StarIcon />
                      CHAL
                    </span>
                    {agent.isHotStreak && (
                      <span className="text-[8px] font-bold text-orange-400 px-1 py-0.5 rounded bg-orange-500/10 border border-orange-500/20 leading-none">
                        HOT
                      </span>
                    )}
                  </div>
                )}
                {!isBusted && agent.isHotStreak && !agent.isChampion && !agent.isChallenger && (
                  <span className="text-[9px] font-bold text-orange-400 px-1.5 py-0.5 rounded bg-orange-500/10 border border-orange-500/20 leading-none">
                    HOT
                  </span>
                )}
              </div>

              <div className="mb-2 min-h-[52px]">
                {!isBusted && hand ? (
                  <>
                    <div className="flex gap-0.5 mb-1">
                      {hand.playerCards.map((card, i) => (
                        <PlayingCard key={`${card}-${i}`} value={card} index={i} size="sm" />
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px]">
                      <span className={clsx('font-mono font-semibold w-7', resultColors[hand.result])}>
                        {hand.result.toUpperCase()}
                      </span>
                      <span className="text-text-muted font-mono tabular-nums w-8">
                        {(hand.bet * agent.positionFactor).toFixed(1)}x
                      </span>
                      <span className={clsx('font-mono w-5', countStateColors[hand.countState])}>
                        {countStateLabels[hand.countState]}
                      </span>
                      {agent.positionFactor > 1 && (
                        <span className="text-danger text-[8px] font-mono">risky</span>
                      )}
                      {agent.positionFactor < 1 && (
                        <span className="text-success text-[8px] font-mono">safe</span>
                      )}
                    </div>
                  </>
                ) : isBusted ? (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-[10px] text-text-muted font-mono">Bankrupt</span>
                  </div>
                ) : null}
              </div>

              <div className="border-t border-border/30 pt-2 space-y-0.5">
                <Stat label="Bankroll" value={isBusted ? '$0' : `$${agent.bankroll.toLocaleString()}`} muted={isBusted} />
                <Stat label="Win %" value={`${agent.winRate.toFixed(1)}%`} muted={isBusted} />
                <Stat label="Thresh" value={`TC ${agent.dna.threshold.toFixed(1)}`} muted={isBusted} />
                {!isBusted && agent.streak !== 0 && (
                  <Stat
                    label="Streak"
                    value={`${agent.streak > 0 ? '+' : ''}${agent.streak}`}
                    muted={false}
                  />
                )}
              </div>

              {!isBusted && agent.mcOdds && (
                <div className="mt-2">
                  <OddsBar odds={agent.mcOdds} />
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
