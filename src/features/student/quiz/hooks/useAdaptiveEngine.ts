import { useState, useCallback } from 'react'

type Difficulty = 'easy' | 'medium' | 'hard'

export const DIFFICULTY_LABELS = ['Çox Asan', 'Asan', 'Orta', 'Orta-Yuxarı', 'Çox Çətin'] as const
export const DIFFICULTY_COLORS = ['#4CAF50', '#8BC34A', '#FFB74D', '#FF8A65', '#ef5350'] as const

export function thetaToLevel(theta: number): 0 | 1 | 2 | 3 | 4 {
  if (theta >= 0.8) return 4
  if (theta >= 0.6) return 3
  if (theta >= 0.4) return 2
  if (theta >= 0.2) return 1
  return 0
}

// Simplified IRT: correct on hard = big boost; wrong on easy = big drop
function irtUpdate(theta: number, difficulty: Difficulty, correct: boolean): number {
  const step  = difficulty === 'hard' ? 0.15 : difficulty === 'medium' ? 0.10 : 0.05
  const delta = correct ? step : -(0.20 - step)
  return Math.max(0, Math.min(1, theta + delta))
}

export function useAdaptiveEngine() {
  const [theta,    setTheta]    = useState(0.5)
  const [answered, setAnswered] = useState(0)

  const recordAnswer = useCallback((difficulty: Difficulty | undefined, correct: boolean) => {
    setTheta(prev => irtUpdate(prev, difficulty ?? 'medium', correct))
    setAnswered(prev => prev + 1)
  }, [])

  const level = thetaToLevel(theta)
  return {
    theta,
    answered,
    recordAnswer,
    level,
    label: DIFFICULTY_LABELS[level],
    color: DIFFICULTY_COLORS[level],
  }
}
