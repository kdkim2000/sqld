import Head from 'next/head'
import Link from 'next/link'
import type { GetStaticProps } from 'next'
import type { ChapterMeta } from '@/types'
import { getAllChapters } from '@/lib/theory'

interface TheoryIndexProps {
  chapters: ChapterMeta[]
}

const PART_LABELS: Record<number, string> = {
  1: '1과목 데이터 모델링의 이해',
  2: '2과목 SQL 기본 및 활용',
}

export default function TheoryIndex({ chapters }: TheoryIndexProps) {
  const part1 = chapters.filter((c) => c.part === 1)
  const part2 = chapters.filter((c) => c.part === 2)

  function PartSection({ part, items }: { part: number; items: ChapterMeta[] }) {
    return (
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          {PART_LABELS[part]}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((chapter) => (
            <Link
              key={chapter.id}
              href={`/theory/${chapter.id}`}
              className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all group"
            >
              <p className="text-xs text-gray-500 mb-1">
                {part}과목 · {chapter.chapter}장
              </p>
              <p className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                {chapter.title}
              </p>
            </Link>
          ))}
        </div>
      </section>
    )
  }

  return (
    <>
      <Head>
        <title>이론 학습 | SQLD 합격길잡이</title>
      </Head>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">이론 학습</h1>
        <PartSection part={1} items={part1} />
        <PartSection part={2} items={part2} />
      </div>
    </>
  )
}

export const getStaticProps: GetStaticProps<TheoryIndexProps> = async () => {
  const chapters = getAllChapters()
  return { props: { chapters } }
}
