import { MATH_CHAPTERS } from './mathTopics'

export const MIN_PASS_PERCENT = 80
export const NIDA_PLUS_PLAN   = 'nida_plus'

export interface TopicResult {
  topicId?: string
  percent:  number
}

// Flat list of all topic IDs in sequential order
export const ALL_TOPIC_IDS: string[] = MATH_CHAPTERS.flatMap(ch => ch.topics.map(t => t.id))

// For free-tier: returns Set of unlocked topic IDs based on 80% completion of the previous
export function getUnlockedTopics(results: TopicResult[]): Set<string> {
  const unlocked = new Set<string>()

  for (let i = 0; i < ALL_TOPIC_IDS.length; i++) {
    if (i === 0) {
      unlocked.add(ALL_TOPIC_IDS[i])
    } else {
      const prevId = ALL_TOPIC_IDS[i - 1]
      const prevPassed = results.some(r => r.topicId === prevId && r.percent >= MIN_PASS_PERCENT)
      if (prevPassed) unlocked.add(ALL_TOPIC_IDS[i])
    }
  }

  return unlocked
}

// Best percent the user has achieved on a given topic
export function getBestPercent(results: TopicResult[], topicId: string): number {
  const hits = results.filter(r => r.topicId === topicId)
  return hits.length ? Math.max(...hits.map(r => r.percent)) : 0
}
