import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useProgress } from '@/context/ProgressContext'
import type { ChapterMeta, Stats } from '@/types'
import ProgressChart from '@/components/dashboard/ProgressChart'
import ChapterProgress from '@/components/dashboard/ChapterProgress'
import WeakChapters from '@/components/dashboard/WeakChapters'

// 챕터 목록 — lib/theory.ts 의 CHAPTERS 상수와 동기화 유지
// lib/theory.ts 가 Node.js fs 를 import 하므로 클라이언트에서 직접 import 불가
const CHAPTERS: ChapterMeta[] = [
  { id: 'part1_ch1', part: 1, chapter: 1, title: '데이터 모델링의 이해', questionCount: 0 },
  { id: 'part1_ch2', part: 1, chapter: 2, title: '데이터 모델과 성능', questionCount: 0 },
  { id: 'part2_ch1', part: 2, chapter: 1, title: 'SQL 기본', questionCount: 0 },
  { id: 'part2_ch2', part: 2, chapter: 2, title: 'SQL 활용', questionCount: 0 },
  { id: 'part2_ch3', part: 2, chapter: 3, title: 'SQL 최적화 기본 원리', questionCount: 0 },
]

// 챕터 ID -> 문제 ID 접두사 매핑 (문제 ID 형식: p{part}c{chapter}_{번호})
const CHAPTER_ID_PREFIX: Record<string, string> = {
  part1_ch1: 'p1c1_',
  part1_ch2: 'p1c2_',
  part2_ch1: 'p2c1_',
  part2_ch2: 'p2c2_',
  part2_ch3: 'p2c3_',
}

// 빠른 시작 버튼 목록
const QUICK_LINKS = [
  {
    href: '/theory/part1_ch1',
    label: '이론 학습 시작',
    desc: '개념부터 차근차근',
    icon: '📖',
    color: 'bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700',
  },
  {
    href: '/quiz/part1_ch1',
    label: '문제 풀기 시작',
    desc: '챕터별 연습 문제',
    icon: '✏️',
    color: 'bg-green-50 border-green-200 hover:bg-green-100 text-green-700',
  },
  {
    href: '/quiz/exam',
    label: '모의고사 시작',
    desc: '실전 시험 대비',
    icon: '🎯',
    color: 'bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-700',
  },
]

// 서버 사이드(SSR) 에서 localStorage 접근 방지용 초기 Stats
const INITIAL_STATS: Stats = {
  total: 0,
  attempted: 0,
  correct: 0,
  byChapter: {},
  byPart: { 1: { total: 0, correct: 0, attempted: 0 }, 2: { total: 0, correct: 0, attempted: 0 } },
}

/** 문제 ID 접두사로 챕터별 통계를 정확하게 집계 */
function computeChapterStats(
  answers: Record<string, string>
): Record<string, { attempted: number; correct: number }> {
  const result: Record<string, { attempted: number; correct: number }> = {}
  for (const chapterId of Object.keys(CHAPTER_ID_PREFIX)) {
    result[chapterId] = { attempted: 0, correct: 0 }
  }
  for (const [qId, verdict] of Object.entries(answers)) {
    if (verdict === 'skipped') continue
    for (const [chapterId, prefix] of Object.entries(CHAPTER_ID_PREFIX)) {
      if (qId.startsWith(prefix)) {
        result[chapterId].attempted++
        if (verdict === 'correct') result[chapterId].correct++
        break
      }
    }
  }
  return result
}

export default function Home() {
  const { stats, progress } = useProgress()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 하이드레이션 전에는 초기 stats 사용
  const displayStats: Stats = mounted ? stats : INITIAL_STATS
  const isFirstVisit = mounted && displayStats.attempted === 0

  // 문제 ID 접두사 기반으로 챕터별 통계 계산 (과목 혼합 방지)
  const chapterStats = useMemo(
    () => (mounted ? computeChapterStats(progress.answers) : {}),
    [mounted, progress.answers]
  )

  const totalPct =
    displayStats.total > 0
      ? Math.round((displayStats.attempted / displayStats.total) * 100)
      : 0
  const correctPct =
    displayStats.attempted > 0
      ? Math.round((displayStats.correct / displayStats.attempted) * 100)
      : 0

  const part1 = displayStats.byPart[1]
  const part2 = displayStats.byPart[2]
  const part1Pct = part1?.total > 0 ? Math.round((part1.attempted / part1.total) * 100) : 0
  const part2Pct = part2?.total > 0 ? Math.round((part2.attempted / part2.total) * 100) : 0

  return (
    <>
      <Head>
        <title>SQLD 시험 준비 — 대시보드</title>
        <meta name="description" content="SQLD 자격증 시험 이론 학습 및 예상문제 풀이 사이트" />
      </Head>

      <div className="max-w-5xl mx-auto space-y-6">
        {/* 1. 상단 진도 요약 카드 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {isFirstVisit ? 'SQLD 합격을 응원합니다!' : '학습 현황'}
              </h1>
              {isFirstVisit ? (
                <p className="text-sm text-gray-500 mt-1">
                  아래 버튼으로 이론 학습 또는 문제 풀기를 시작해보세요.
                </p>
              ) : (
                <p className="text-sm text-gray-500 mt-1">
                  전체{' '}
                  <span className="font-semibold text-gray-700">{displayStats.total}</span>
                  문항 중{' '}
                  <span className="font-semibold text-primary-600">{displayStats.attempted}</span>
                  문항 풀이 완료
                </p>
              )}
            </div>

            {!isFirstVisit && (
              <div className="flex gap-6 flex-wrap">
                <Stat label="풀이율" value={`${totalPct}%`} color="text-primary-600" />
                <Stat label="정답률" value={`${correctPct}%`} color="text-green-600" />
                <Stat label="정답 수" value={`${displayStats.correct}문항`} color="text-purple-600" />
              </div>
            )}
          </div>
        </div>

        {/* 2. 원형 차트 + 과목별 진도 + 빠른 시작 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 원형 차트 + 과목별 바 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center">
            <h2 className="text-sm font-semibold text-gray-500 mb-4 self-start">전체 정답률</h2>
            {mounted ? (
              <ProgressChart
                correct={displayStats.correct}
                total={displayStats.attempted}
                size={130}
              />
            ) : (
              <div className="w-[130px] h-[130px] rounded-full bg-gray-100 animate-pulse" />
            )}
            <div className="w-full mt-6 space-y-3">
              <PartBar label="1과목 데이터 모델링" pct={part1Pct} color="bg-blue-500" />
              <PartBar label="2과목 SQL" pct={part2Pct} color="bg-green-500" />
            </div>
          </div>

          {/* 빠른 시작 */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-500 mb-4">빠른 시작</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex flex-col items-center justify-center text-center gap-2 border rounded-xl p-5 transition-colors ${link.color}`}
                >
                  <span className="text-3xl">{link.icon}</span>
                  <span className="font-semibold text-sm">{link.label}</span>
                  <span className="text-xs opacity-70">{link.desc}</span>
                </Link>
              ))}
            </div>

            {!isFirstVisit && (
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/quiz/wrong"
                  className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:text-red-800 font-medium bg-red-50 border border-red-200 rounded-lg px-4 py-2 transition-colors hover:bg-red-100"
                >
                  오답 다시 풀기
                </Link>
                <Link
                  href="/quiz/bookmarks"
                  className="inline-flex items-center gap-1.5 text-sm text-yellow-700 hover:text-yellow-900 font-medium bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 transition-colors hover:bg-yellow-100"
                >
                  북마크 문제
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* 3. 취약 챕터 TOP 3 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-500 mb-4">취약 챕터 TOP 3</h2>
          <WeakChapters chapters={CHAPTERS} chapterStats={chapterStats} />
        </div>

        {/* 4. 챕터별 상세 진도 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-500 mb-4">챕터별 진도</h2>
          <ChapterProgress chapters={CHAPTERS} chapterStats={chapterStats} />
        </div>

        {/* 처음 방문 가이드 */}
        {isFirstVisit && (
          <div className="bg-primary-50 border border-primary-200 rounded-xl p-6">
            <h2 className="text-base font-bold text-primary-800 mb-3">학습 가이드</h2>
            <ol className="space-y-2 text-sm text-primary-700">
              <li className="flex items-start gap-2">
                <span className="font-bold shrink-0">1.</span>
                <span>
                  <Link href="/theory/part1_ch1" className="underline underline-offset-2 font-semibold">
                    이론 학습
                  </Link>
                  으로 개념을 먼저 익히세요.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold shrink-0">2.</span>
                <span>
                  <Link href="/quiz/part1_ch1" className="underline underline-offset-2 font-semibold">
                    챕터 문제 풀기
                  </Link>
                  로 이해도를 점검하세요.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold shrink-0">3.</span>
                <span>
                  취약 챕터를 집중 학습한 뒤{' '}
                  <Link href="/quiz/exam" className="underline underline-offset-2 font-semibold">
                    모의고사
                  </Link>
                  로 실전 감각을 키우세요.
                </span>
              </li>
            </ol>
            <div className="mt-4">
              <Link
                href="/theory/part1_ch1"
                className="inline-block bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors"
              >
                지금 시작하기
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

// 내부 헬퍼 컴포넌트

interface StatProps {
  label: string
  value: string
  color: string
}

function Stat({ label, value, color }: StatProps) {
  return (
    <div className="text-center">
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </div>
  )
}

interface PartBarProps {
  label: string
  pct: number
  color: string
}

function PartBar({ label, pct, color }: PartBarProps) {
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{label}</span>
        <span className="font-medium">{pct}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
