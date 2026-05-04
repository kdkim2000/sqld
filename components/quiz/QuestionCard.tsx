import { useEffect } from 'react'
import type { Question, AnswerResult } from '@/types'

interface QuestionCardProps {
  question: Question
  questionNumber: number
  totalQuestions: number
  selectedOption: number | null
  showResult: boolean
  onAnswer: (result: AnswerResult, selectedIndex: number) => void
  isBookmarked: boolean
  onToggleBookmark: () => void
}

const DIFFICULTY_LABEL: Record<string, string> = {
  '하': '쉬움',
  '중': '보통',
  '상': '어려움',
}

const DIFFICULTY_COLOR: Record<string, string> = {
  '하': 'bg-green-100 text-green-700',
  '중': 'bg-yellow-100 text-yellow-700',
  '상': 'bg-red-100 text-red-700',
}

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedOption,
  showResult,
  onAnswer,
  isBookmarked,
  onToggleBookmark,
}: QuestionCardProps) {
  // 키보드 단축키: 숫자 1~4로 보기 선택
  useEffect(() => {
    if (showResult) return
    const handleKey = (e: KeyboardEvent) => {
      const num = parseInt(e.key, 10)
      if (num >= 1 && num <= 4) {
        handleSelect(num)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showResult, question.id])

  function handleSelect(optionIndex: number) {
    if (showResult) return
    const result: AnswerResult = optionIndex === question.answer ? 'correct' : 'wrong'
    onAnswer(result, optionIndex)
  }

  function getOptionStyle(optionIndex: number): string {
    const base =
      'w-full text-left px-4 py-3 rounded-lg border-2 transition-all duration-150 text-sm leading-relaxed'

    if (!showResult) {
      if (selectedOption === optionIndex) {
        return `${base} border-blue-500 bg-blue-50 text-blue-900`
      }
      return `${base} border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 cursor-pointer`
    }

    // 정답 공개 시
    if (optionIndex === question.answer) {
      return `${base} border-green-500 bg-green-50 text-green-900`
    }
    if (selectedOption === optionIndex && optionIndex !== question.answer) {
      return `${base} border-red-500 bg-red-50 text-red-900`
    }
    return `${base} border-gray-200 bg-white text-gray-500`
  }

  const difficulty = question.difficulty ?? '중'

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* 문제 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-500">
            {questionNumber} / {totalQuestions}
          </span>
          {question.difficulty && (
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${DIFFICULTY_COLOR[difficulty] ?? 'bg-gray-100 text-gray-600'}`}
            >
              {DIFFICULTY_LABEL[difficulty] ?? difficulty}
            </span>
          )}
          {question.tags && question.tags.length > 0 && (
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {question.tags[0]}
            </span>
          )}
        </div>
        <button
          onClick={onToggleBookmark}
          aria-label={isBookmarked ? '북마크 해제' : '북마크 추가'}
          className={`p-1.5 rounded-lg transition-colors ${
            isBookmarked
              ? 'text-yellow-500 hover:text-yellow-600'
              : 'text-gray-300 hover:text-yellow-400'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={isBookmarked ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={2}
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
            />
          </svg>
        </button>
      </div>

      {/* 문제 본문 */}
      <p className="text-gray-900 font-medium text-base leading-relaxed mb-6 whitespace-pre-wrap">
        {question.content}
      </p>

      {/* 선택지 */}
      <div className="space-y-2">
        {question.options.map((option, idx) => {
          const optionIndex = idx + 1
          return (
            <button
              key={optionIndex}
              onClick={() => handleSelect(optionIndex)}
              disabled={showResult}
              className={getOptionStyle(optionIndex)}
            >
              <span className="font-semibold mr-2">{optionIndex}.</span>
              {option}
              {showResult && optionIndex === question.answer && (
                <span className="ml-2 text-green-600 font-bold">✓</span>
              )}
              {showResult &&
                selectedOption === optionIndex &&
                optionIndex !== question.answer && (
                  <span className="ml-2 text-red-600 font-bold">✗</span>
                )}
            </button>
          )
        })}
      </div>

      {/* 키보드 안내 */}
      {!showResult && (
        <p className="mt-4 text-xs text-gray-400 text-right">
          키보드 1~4 키로 선택 가능
        </p>
      )}
    </div>
  )
}
