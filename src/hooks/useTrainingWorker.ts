import { useEffect, useRef, useState, useCallback } from 'react'
import type { CEMState, AgentResult } from '@/lib/cem'
import type { GenerationMessage, SampleHand, ShoeInfo } from '@/workers/trainingWorker'
export type { SampleHand, ShoeInfo }
import { loadSnapshot, saveSnapshot } from '@/lib/persistence'

interface TrainingState {
  cemState: CEMState | null
  agents: AgentResult[]
  handsPerSec: number
  isRunning: boolean
  sampleHands: SampleHand[]
  dealerCards: number[]
  shoe: ShoeInfo | null
}

function getDeviceBudget() {
  const w = window.innerWidth
  const cores = navigator.hardwareConcurrency ?? 4

  if (w < 640) return { populationSize: 24, handsPerAgent: 200 }
  if (w < 1024) return { populationSize: 36, handsPerAgent: 400 }
  return { populationSize: Math.min(60, cores * 12), handsPerAgent: 600 }
}

export function useTrainingWorker() {
  const workerRef = useRef<Worker | null>(null)
  const saveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const latestStateRef = useRef<CEMState | null>(null)
  const lastRoundRef = useRef(1)

  const [state, setState] = useState<TrainingState>({
    cemState: null,
    agents: [],
    handsPerSec: 0,
    isRunning: false,
    sampleHands: [],
    dealerCards: [],
    shoe: null,
  })

  const start = useCallback(() => {
    if (workerRef.current) return

    const worker = new Worker(
      new URL('../workers/trainingWorker.ts', import.meta.url),
      { type: 'module' }
    )

    worker.onmessage = (e: MessageEvent<GenerationMessage>) => {
      if (e.data.type === 'generation') {
        const { state: cemState, agents, handsPerSec, sampleHands, dealerCards, shoe } = e.data.data
        latestStateRef.current = cemState
        if (shoe) lastRoundRef.current = shoe.round
        setState({ cemState, agents, handsPerSec, isRunning: true, sampleHands, dealerCards, shoe })
      }
    }

    const budget = getDeviceBudget()
    const savedState = loadSnapshot()

    worker.postMessage({
      type: 'start',
      config: { ...budget, eliteFraction: 0.2 },
      savedState,
      startRound: lastRoundRef.current,
    })

    workerRef.current = worker
    setState((s) => ({ ...s, isRunning: true }))

    saveTimerRef.current = setInterval(() => {
      if (latestStateRef.current) {
        saveSnapshot(latestStateRef.current)
      }
    }, 5000)
  }, [])

  const pause = useCallback(() => {
    workerRef.current?.postMessage({ type: 'pause' })
    setState((s) => ({ ...s, isRunning: false }))
  }, [])

  const resume = useCallback(() => {
    workerRef.current?.postMessage({ type: 'resume' })
    setState((s) => ({ ...s, isRunning: true }))
  }, [])

  useEffect(() => {
    start()
    return () => {
      workerRef.current?.postMessage({ type: 'stop' })
      workerRef.current?.terminate()
      workerRef.current = null
      if (saveTimerRef.current) clearInterval(saveTimerRef.current)
      if (latestStateRef.current) saveSnapshot(latestStateRef.current)
    }
  }, [start])

  return { ...state, pause, resume }
}
