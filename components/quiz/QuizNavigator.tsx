import type { AnswerResult } from '@/types'

interface QuizNavigatorProps {
  total: number
  current: number
  answers: (AnswerResult | null)[]
  bookmarked?: boolean[]
  onJump: (index: number) => void
}

function getButtonStyle(
  index: number,
  current: number,
  result: AnswerResult | null,
  isBookmarked: boolean
): string {
  const base =
    'w-9 h-9 rounded-lg text-xs font-semibold transition-all duration-100 border-2'

  if (index === current) {
    return `${base} border-blue-500 bg-blue-500 text-white shadow-md`
  }
  if (result === 'correct') {
    return `${base} border-green-400 bg-green-100 text-green-700 hover:bg-green-200`
  }
  if (result === 'wrong') {
    return `${base} border-red-400 bg-red-100 text-red-700 hover:bg-red-200`
  }
  if (isBookmarked) {
    return `${base} border-yellow-400 bg-yellow-50 text-yellow-700 hover:bg-yellow-100`
  }
  return `${base} border-gray-200 bg-white text-gray-500 hover:border-gray-400 hover:bg-gray-50`
}

export default function QuizNavigator({
  total,
  current,
  answers,
  bookmarked = [],
  onJump,
}: QuizNavigatorProps) {
  const correctCount = answers.filter((a) => a === 'correct').length
  const wrongCount = answers.filter((a) => a === 'wrong').length
  const attemptedCount = answers.filter((a) => a !== null).length

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">문제 목록</h3>

      {/* 통계 */}
      <div className="flex gap-3 mb-4 text-xs">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-green-400 inline-block" />
          정답 {correctCount}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-red-400 inline-block" />
          오답 {wrongCount}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-gray-300 inline-block" />
          미풀이 {total - attemptedCount}
        </span>
      </div>

      {/* 번호 그리드 (5열) */}
      <div className="grid grid-cols-5 gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <button
            key={i}
            onClick={() => onJump(i)}
            aria-label={`${i + 1}번 문제`}
            aria-current={i === current ? 'true' : undefined}
            className={getButtonStyle(i, current, answers[i] ?? null, bookmarked[i] ?? false)}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* 범례 */}
      <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400 space-y-1">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm border-2 border-blue-500 bg-blue-500 inline-block" />
          현재 문제
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm border-2 border-yellow-400 bg-yellow-50 inline-block" />
          북마크
        </div>
      </div>
    </div>
  )
}
