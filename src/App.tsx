import { motion } from 'framer-motion'
import HeroSim from '@/components/HeroSim/HeroSim'
import ScrollToTop from '@/components/ui/ScrollToTop'

export default function App() {
  return (
    <div className="min-h-screen relative">
      <div className="sticky top-0 h-screen pointer-events-none z-0 overflow-hidden -mb-[100vh]" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1a0f] via-bg to-bg opacity-30" />
        <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[140%] h-[60%] rounded-[50%] border border-[#1a3a1f]/15" />
        <div className="absolute top-[35%] left-1/2 -translate-x-1/2 w-[120%] h-[50%] rounded-[50%] border border-[#1a3a1f]/8" />
      </div>

      <div className="absolute top-6 right-6 sm:right-10 text-right z-10 select-none pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.08 }}
          transition={{ duration: 1.5 }}
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold tracking-tight whitespace-nowrap">
            Anthony Feliz
          </h1>
          <p className="text-xs sm:text-sm font-mono mt-1.5 tracking-wide">
            Software Engineer &middot; Machine Learning
          </p>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">
            Blackjack ML Agents
          </h2>
          <p className="text-sm text-text-secondary mt-2 max-w-2xl">
            Five agents compete at a shared 6-deck table, evolving bet-sizing strategies through the
            Cross-Entropy Method. Each agent tracks the Hi-Lo card count to detect favorable conditions,
            betting aggressively when high cards remain and conservatively when the deck favors the dealer.
            Position-aware risk scaling lets trailing agents make desperate plays while leaders protect their bankroll.
          </p>
        </motion.div>

        <HeroSim />
      </div>

      <footer className="border-t border-border py-6 px-6 text-center">
        <p className="text-xs text-text-muted">&copy; {new Date().getFullYear()} Anthony Feliz</p>
      </footer>

      <ScrollToTop />
    </div>
  )
}
