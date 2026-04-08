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

      <footer className="border-t border-border py-6 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <p className="text-xs text-text-muted">&copy; {new Date().getFullYear()} Anthony Feliz</p>
          <div className="flex items-center gap-3">
            <a href="https://github.com/arfgit" target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-accent">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z"/></svg>
            </a>
            <a href="https://linkedin.com/in/anthonyfeliz" target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-accent">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z"/></svg>
            </a>
          </div>
        </div>
      </footer>

      <ScrollToTop />
    </div>
  )
}
