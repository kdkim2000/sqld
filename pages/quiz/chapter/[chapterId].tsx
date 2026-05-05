import { useState, useCallback } from 'react'
import { GetStaticPaths, GetStaticProps } from 'next'
import Link from 'next/link'
import Layout from '@/components/layout/Layout'
import QuestionCard from '@/components/quiz/QuestionCard'
import AnswerFeedback from '@/components/quiz/AnswerFeedback'
import QuizNavigator from '@/components/quiz/QuizNavigator'
import { getQuestionsByChapter } from '@/lib/questions'
import { CHAPTER_IDS, getChapterFullLabel } from '@/lib/chapters'
import { useProgress } from '@/context/ProgressContext'
import type { Question, AnswerResult } from '@/types'

interface Props {
  chapterId: string
  questions: Question[]
}

export default function ChapterQuiz({ chapterId, questions }: Props) {
  const { markAnswer, toggleBookmark, isBookmarked, progress } = useProgress()

  // 현재 문제 인덱스
  const [currentIndex, setCurrentIndex] = useState(0)
  // 각 문제에 대해 선택한 번호 저장
  const [selectedOptions, setSelectedOptions] = useState<(number | null)[]>(
    Array(questions.length).fill(null)
  )
  // 각 문제의 채점 결과
  const [sessionAnswers, setSessionAnswers] = useState<(AnswerResult | null)[]>(
    Array(questions.length).fill(null)
  )
  // 완료 여부
  const [completed, setCompleted] = useState(false)

  const currentQuestion = questions[currentIndex]
  const currentAnswer = sessionAnswers[currentIndex]
  const showResult = currentAnswer !== null

  const handleAnswer = useCallback(
    (result: AnswerResult, selectedIndex: number) => {
      setSelectedOptions((prev) => {
        const next = [...prev]
        next[currentIndex] = selectedIndex
        return next
      })
      setSessionAnswers((prev) => {
        const next = [...prev]
        next[currentIndex] = result
        return next
      })
      markAnswer(currentQuestion.id, result)
    },
    [currentIndex, currentQuestion.id, markAnswer]
  )

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      setCompleted(true)
    }
  }, [currentIndex, questions.length])

  const handleJump = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  const handleToggleBookmark = useCallback(() => {
    toggleBookmark(currentQuestion.id)
  }, [currentQuestion.id, toggleBookmark])

  // 결과 요약 화면
  if (completed) {
    const correctCount = sessionAnswers.filter((a) => a === 'correct').length
    const wrongCount = sessionAnswers.filter((a) => a === 'wrong').length
    const total = questions.length
    const percentage = Math.round((correctCount / total) * 100)
    const wrongQuestions = questions.filter((_, i) => sessionAnswers[i] === 'wrong')

    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center mb-6">
            <div
              className={`text-6xl font-bold mb-2 ${
                percentage >= 80 ? 'text-green-600' : percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}
            >
              {percentage}%
            </div>
            <p className="text-gray-600 text-lg mb-4">
              {total}문제 중 <span className="font-bold text-green-600">{correctCount}문제</span> 정답 /{' '}
              <span className="font-bold text-red-600">{wrongCount}문제</span> 오답
            </p>
            <p className="text-sm text-gray-500">{getChapterFullLabel(chapterId)}</p>
          </div>

          {/* 오답 목록 */}
          {wrongQuestions.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                오답 문제 ({wrongQuestions.length}개)
              </h2>
              <div className="space-y-3">
                {wrongQuestions.map((q, i) => {
                  const qIndex = questions.indexOf(q)
                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        setCompleted(false)
                        setCurrentIndex(qIndex)
                      }}
                      className="w-full text-left px-4 py-3 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 transition-colors"
                    >
                      <span className="text-sm font-semibold text-red-600 mr-2">
                        Q{qIndex + 1}.
                      </span>
                      <span className="text-sm text-gray-700 line-clamp-1">{q.content}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setCurrentIndex(0)
                setSelectedOptions(Array(questions.length).fill(null))
                setSessionAnswers(Array(questions.length).fill(null))
                setCompleted(false)
              }}
              className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors font-medium"
            >
              다시 풀기
            </button>
            <Link
              href="/quiz"
              className="px-6 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
            >
              문제 목록으로
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* 상단 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/quiz" className="text-sm text-blue-600 hover:underline">
              &larr; 문제 목록
            </Link>
            <h1 className="text-xl font-bold text-gray-900 mt-1">
              {getChapterFullLabel(chapterId)}
            </h1>
          </div>
        </div>

        <div className="flex gap-6">
          {/* 좌측: 문제 + 피드백 */}
          <div className="flex-1 min-w-0">
            <QuestionCard
              question={currentQuestion}
              questionNumber={currentIndex + 1}
              totalQuestions={questions.length}
              selectedOption={selectedOptions[currentIndex]}
              showResult={showResult}
              onAnswer={handleAnswer}
              isBookmarked={isBookmarked(currentQuestion.id)}
              onToggleBookmark={handleToggleBookmark}
            />

            {showResult && currentAnswer && (
              <AnswerFeedback
                question={currentQuestion}
                result={currentAnswer}
                selectedOption={selectedOptions[currentIndex] ?? 0}
                onNext={handleNext}
                isBookmarked={isBookmarked(currentQuestion.id)}
                onToggleBookmark={handleToggleBookmark}
                isLast={currentIndex === questions.length - 1}
              />
            )}
          </div>

          {/* 우측: 네비게이터 */}
          <div className="hidden lg:block w-52 flex-shrink-0">
            <QuizNavigator
              total={questions.length}
              current={currentIndex}
              answers={sessionAnswers}
              bookmarked={questions.map((q) => isBookmarked(q.id))}
              onJump={handleJump}
            />
          </div>
        </div>
      </div>
    </Layout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = CHAPTER_IDS.map((id) => ({
    params: { chapterId: id },
  }))
  return { paths, fallback: false }
}

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const chapterId = params?.chapterId as string
  const questions = getQuestionsByChapter(chapterId)

  if (!questions || questions.length === 0) {
    return { notFound: true }
  }

  return {
    props: {
      chapterId,
      questions,
    },
  }
}
