import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { ProgressStore, AnswerResult, Stats } from '@/types'
import {
  loadProgress,
  saveProgress,
  markAnswer as markAnswerUtil,
  toggleBookmark as toggleBookmarkUtil,
  getStats,
  resetProgress as resetProgressUtil,
} from '@/lib/progress'

interface ProgressContextValue {
  progress: ProgressStore
  stats: Stats
  markAnswer: (id: string, result: AnswerResult) => void
  toggleBookmark: (id: string) => void
  resetProgress: () => void
  isBookmarked: (id: string) => boolean
}

const ProgressContext = createContext<ProgressContextValue | null>(null)

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<ProgressStore>({
    answers: {},
    bookmarks: [],
    lastVisited: null,
    examHistory: [],
  })
  const [stats, setStats] = useState<Stats>({
    total: 0,
    attempted: 0,
    correct: 0,
    byChapter: {},
    byPart: { 1: { total: 0, correct: 0, attempted: 0 }, 2: { total: 0, correct: 0, attempted: 0 } },
  })

  useEffect(() => {
    const stored = loadProgress()
    setProgress(stored)
    setStats(getStats())
  }, [])

  const refresh = useCallback(() => {
    setProgress(loadProgress())
    setStats(getStats())
  }, [])

  const markAnswer = useCallback((id: string, result: AnswerResult) => {
    markAnswerUtil(id, result)
    refresh()
  }, [refresh])

  const toggleBookmark = useCallback((id: string) => {
    toggleBookmarkUtil(id)
    refresh()
  }, [refresh])

  const resetProgress = useCallback(() => {
    resetProgressUtil()
    refresh()
  }, [refresh])

  const isBookmarked = useCallback(
    (id: string) => progress.bookmarks.includes(id),
    [progress.bookmarks]
  )

  return (
    <ProgressContext.Provider value={{ progress, stats, markAnswer, toggleBookmark, resetProgress, isBookmarked }}>
      {children}
    </ProgressContext.Provider>
  )
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider')
  return ctx
}
