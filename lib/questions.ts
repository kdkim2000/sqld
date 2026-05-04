import type { Question } from '@/types'
import part1ch1 from '@/data/questions/part1_ch1.json'
import part1ch2 from '@/data/questions/part1_ch2.json'
import part2ch1 from '@/data/questions/part2_ch1.json'
import part2ch2 from '@/data/questions/part2_ch2.json'
import part2ch3 from '@/data/questions/part2_ch3.json'

const CHAPTER_IDS = [
  'part1_ch1',
  'part1_ch2',
  'part2_ch1',
  'part2_ch2',
  'part2_ch3',
]

const CHAPTER_DATA: Record<string, Question[]> = {
  part1_ch1: part1ch1 as Question[],
  part1_ch2: part1ch2 as Question[],
  part2_ch1: part2ch1 as Question[],
  part2_ch2: part2ch2 as Question[],
  part2_ch3: part2ch3 as Question[],
}

export function getAllQuestions(): Question[] {
  return CHAPTER_IDS.flatMap((id) => CHAPTER_DATA[id] ?? [])
}

export function getQuestionsByChapter(chapterId: string): Question[] {
  return CHAPTER_DATA[chapterId] ?? []
}

export function getQuestionsByIds(ids: string[]): Question[] {
  const all = getAllQuestions()
  const idSet = new Set(ids)
  return all.filter((q) => idSet.has(q.id))
}

export function sampleExamQuestions(): Question[] {
  const part1 = getAllQuestions().filter((q) => q.part === 1)
  const part2 = getAllQuestions().filter((q) => q.part === 2)

  const shuffle = <T>(arr: T[]): T[] =>
    [...arr].sort(() => Math.random() - 0.5)

  return [
    ...shuffle(part1).slice(0, 10),
    ...shuffle(part2).slice(0, 40),
  ]
}

export { CHAPTER_IDS }
