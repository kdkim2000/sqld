import Head from 'next/head'
import Link from 'next/link'
import type { GetStaticPaths, GetStaticProps } from 'next'
import type { ChapterMeta } from '@/types'
import { getAllChapters, getChapterMeta, getChapterContent } from '@/lib/theory'
import TheoryContent from '@/components/theory/TheoryContent'

interface TheoryPageProps {
  chapter: ChapterMeta
  content: string
}

export default function TheoryPage({ chapter, content }: TheoryPageProps) {
  return (
    <>
      <Head>
        <title>{chapter.title} | SQLD 합격길잡이</title>
      </Head>
      <div className="max-w-3xl mx-auto">
        {/* 브레드크럼 */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link href="/theory" className="hover:text-blue-700 transition-colors">
            이론 학습
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{chapter.title}</span>
        </nav>

        {/* 챕터 헤더 */}
        <div className="mb-6">
          <p className="text-sm text-blue-600 font-medium mb-1">
            {chapter.part}과목 · {chapter.chapter}장
          </p>
          <h1 className="text-2xl font-bold text-gray-900">{chapter.title}</h1>
        </div>

        {/* 이론 본문 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 md:p-8">
          <TheoryContent content={content} />
        </div>

        {/* 하단 네비게이션 */}
        <div className="mt-6 flex justify-between">
          <Link
            href="/theory"
            className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
          >
            목차로 돌아가기
          </Link>
          <Link
            href={`/quiz?chapter=${chapter.id}`}
            className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            관련 문제 풀기
          </Link>
        </div>
      </div>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const chapters = getAllChapters()
  const paths = chapters.map((c) => ({ params: { chapterId: c.id } }))
  return { paths, fallback: false }
}

export const getStaticProps: GetStaticProps<TheoryPageProps> = async ({ params }) => {
  const chapterId = params?.chapterId as string
  const chapter = getChapterMeta(chapterId)

  if (!chapter) {
    return { notFound: true }
  }

  const content = getChapterContent(chapterId)
  return { props: { chapter, content } }
}
