import { motion } from 'framer-motion'
import clsx from 'clsx'

type Suit = 'heart' | 'diamond' | 'spade' | 'club'
type CardValue = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K'

interface PlayingCardProps {
  value: number
  faceDown?: boolean
  index?: number
  size?: 'sm' | 'md'
}

const SUITS: Suit[] = ['spade', 'heart', 'diamond', 'club']

function numToValue(n: number): CardValue {
  if (n === 1) return 'A'
  if (n >= 2 && n <= 9) return String(n) as CardValue
  return '10'
}

function numToSuit(n: number): Suit {
  return SUITS[n % 4]
}

const suitSymbols: Record<Suit, string> = {
  heart: '♥',
  diamond: '♦',
  spade: '♠',
  club: '♣',
}

export default function PlayingCard({ value, faceDown, index = 0, size = 'sm' }: PlayingCardProps) {
  const cardValue = numToValue(value)
  const suit = numToSuit(value + index)
  const isRed = suit === 'heart' || suit === 'diamond'

  const sizeClasses = size === 'md' ? 'w-12 h-[4.2rem]' : 'w-9 h-[3.15rem]'
  const textSize = size === 'md' ? 'text-[10px]' : 'text-[8px]'
  const suitSize = size === 'md' ? 'text-lg' : 'text-sm'

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, rotateY: faceDown ? 180 : 0 }}
      animate={{ opacity: 1, y: 0, rotateY: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
      className={clsx(
        sizeClasses,
        'rounded-md flex flex-col items-center justify-between py-1 px-1 select-none shrink-0',
        faceDown
          ? 'bg-accent-dim/40 border border-accent/20'
          : 'bg-white dark:bg-zinc-100 border border-zinc-300 shadow-sm',
      )}
      style={{ perspective: '400px' }}
    >
      {faceDown ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-5 h-7 rounded-sm border border-accent/30 bg-accent/10" />
        </div>
      ) : (
        <>
          <div className={clsx('self-start leading-none font-mono font-bold', textSize, isRed ? 'text-red-600' : 'text-zinc-900')}>
            {cardValue}
          </div>
          <div className={clsx(suitSize, isRed ? 'text-red-600' : 'text-zinc-900')}>
            {suitSymbols[suit]}
          </div>
          <div className={clsx('self-end leading-none font-mono font-bold rotate-180', textSize, isRed ? 'text-red-600' : 'text-zinc-900')}>
            {cardValue}
          </div>
        </>
      )}
    </motion.div>
  )
}
