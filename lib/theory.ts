import fs from 'fs'
import path from 'path'
import type { ChapterMeta } from '@/types'

const CHAPTERS: ChapterMeta[] = [
  { id: 'part1_ch1', part: 1, chapter: 1, title: '데이터 모델링의 이해', questionCount: 0 },
  { id: 'part1_ch2', part: 1, chapter: 2, title: '데이터 모델과 성능',   questionCount: 0 },
  { id: 'part2_ch1', part: 2, chapter: 1, title: 'SQL 기본',            questionCount: 0 },
  { id: 'part2_ch2', part: 2, chapter: 2, title: 'SQL 활용',            questionCount: 0 },
  { id: 'part2_ch3', part: 2, chapter: 3, title: 'SQL 최적화 기본 원리', questionCount: 0 },
]

export function getAllChapters(): ChapterMeta[] {
  return CHAPTERS
}

export function getChapterMeta(id: string): ChapterMeta | undefined {
  return CHAPTERS.find((c) => c.id === id)
}

export function getChapterContent(id: string): string {
  const filePath = path.join(process.cwd(), 'data', 'theory', `${id}.md`)
  try {
    return fs.readFileSync(filePath, 'utf-8')
  } catch {
    return `# ${CHAPTERS.find((c) => c.id === id)?.title ?? id}\n\n> 콘텐츠 준비 중입니다.`
  }
}
