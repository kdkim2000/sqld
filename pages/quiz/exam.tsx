import { useState, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import Layout from '@/components/layout/Layout'
import QuestionCard from '@/components/quiz/QuestionCard'
import QuizNavigator from '@/components/quiz/QuizNavigator'
import ExamTimer from '@/components/quiz/ExamTimer'
import { useProgress } from '@/context/ProgressContext'
import { saveExamResult } from '@/lib/progress'
import { sampleExamQuestions } from '@/lib/questions'
import type { Question, AnswerResult, ExamResult } from '@/types'

const EXAM_DURATION = 90 * 60 // 90분 (초)

type ExamPhase = 'ready' | 'ongoing' | 'result'

export default function ExamPage() {
  const { markAnswer, toggleBookmark, isBookmarked } = useProgress()

  const [phase, setPhase] = useState<ExamPhase>('ready')
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  // 선택한 보기 (1-based, 0 = 미선택)
  const [selectedOptions, setSelectedOptions] = useState<number[]>([])
  // 세션 내 채점 결과
  const [sessionAnswers, setSessionAnswers] = useState<(AnswerResult | null)[]>([])
  const [examResult, setExamResult] = useState<ExamResult | null>(null)
  const startTimeRef = useRef<number>(0)
  const timedOutRef = useRef(false)

  // 시험 시작 시 문제 로드 (클라이언트 사이드에서 랜덤 샘플링)
  useEffect(() => {
    if (phase === 'ongoing' && questions.length === 0) {
      const qs: Question[] = sampleExamQuestions()
      setQuestions(qs)
      setSelectedOptions(Array(qs.length).fill(0))
      setSessionAnswers(Array(qs.length).fill(null))
    }
  }, [phase, questions.length])

  const handleStart = useCallback(() => {
    startTimeRef.current = Date.now()
    timedOutRef.current = false
    setPhase('ongoing')
  }, [])

  const handleSelect = useCallback(
    (optionIndex: number) => {
      if (phase !== 'ongoing') return
      setSelectedOptions((prev) => {
        const next = [...prev]
        next[currentIndex] = optionIndex
        return next
      })
    },
    [currentIndex, phase]
  )

  // 모의고사에서는 선택해도 즉시 정답 공개 안 함
  // handleAnswer를 QuestionCard에 맞게 래핑
  const handleAnswer = useCallback(
    (_result: AnswerResult, selectedIndex: number) => {
      handleSelect(selectedIndex)
    },
    [handleSelect]
  )

  const gradeExam = useCallback(
    (timeTaken: number) => {
      if (questions.length === 0) return

      const part1Questions = questions.filter((q) => q.part === 1)
      const part2Questions = questions.filter((q) => q.part === 2)

      let part1Correct = 0
      let part2Correct = 0
      const answersRecord: Record<string, number> = {}
      const newSessionAnswers: AnswerResult[] = []

      questions.forEach((q, i) => {
        const selected = selectedOptions[i] ?? 0
        answersRecord[q.id] = selected
        const result: AnswerResult = selected === q.answer ? 'correct' : selected === 0 ? 'skipped' : 'wrong'
        newSessionAnswers.push(result)
        markAnswer(q.id, result)

        if (result === 'correct') {
          if (q.part === 1) part1Correct++
          else part2Correct++
        }
      })

      setSessionAnswers(newSessionAnswers)

      // 점수 계산: 각 과목 100점 만점 환산
      const part1Score =
        part1Questions.length > 0
          ? Math.round((part1Correct / part1Questions.length) * 100)
          : 0
      const part2Score =
        part2Questions.length > 0
          ? Math.round((part2Correct / part2Questions.length) * 100)
          : 0

      // 총점: 1과목 20% + 2과목 80% 가중 평균 (또는 단순 평균)
      // SQLD 기준: 1과목 20문항, 2과목 40문항이 정석이나 여기서는 10+40 샘플
      // 단순히 전체 정답 / 전체 문제 * 100
      const totalCorrect = part1Correct + part2Correct
      const totalScore = Math.round((totalCorrect / questions.length) * 100)

      const result: ExamResult = {
        date: new Date().toISOString(),
        score: totalScore,
        part1Score,
        part2Score,
        totalTime: timeTaken,
        answers: answersRecord,
      }

      saveExamResult(result)
      setExamResult(result)
      setPhase('result')
    },
    [questions, selectedOptions, markAnswer]
  )

  const handleSubmit = useCallback(() => {
    const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000)
    gradeExam(timeTaken)
  }, [gradeExam])

  const handleTimeUp = useCallback(() => {
    if (timedOutRef.current) return
    timedOutRef.current = true
    const timeTaken = EXAM_DURATION
    gradeExam(timeTaken)
  }, [gradeExam])

  // 준비 화면
  if (phase === 'ready') {
    return (
      <Layout>
        <div className="max-w-lg mx-auto text-center py-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">SQLD 모의고사</h1>
            <p className="text-gray-500 mb-6">
              1과목 10문항 + 2과목 40문항 = 총 50문항<br />
              제한 시간: 90분
            </p>
            <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
              <h2 className="font-semibold text-blue-800 mb-2 text-sm">합격 기준</h2>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>- 총점 60점 이상</li>
                <li>- 1과목 40점 이상 (과락 없어야 함)</li>
                <li>- 2과목 40점 이상 (과락 없어야 함)</li>
              </ul>
            </div>
            <button
              onClick={handleStart}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors"
            >
              시험 시작
            </button>
            <Link href="/quiz" className="block mt-3 text-sm text-gray-500 hover:text-gray-700">
              돌아가기
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  // 결과 화면
  if (phase === 'result' && examResult) {
    const passed =
      examResult.score >= 60 &&
      examResult.part1Score >= 40 &&
      examResult.part2Score >= 40

    const totalMinutes = Math.floor(examResult.totalTime / 60)
    const totalSeconds = examResult.totalTime % 60

    const correctCount = sessionAnswers.filter((a) => a === 'correct').length
    const wrongCount = sessionAnswers.filter((a) => a === 'wrong').length
    const skippedCount = sessionAnswers.filter((a) => a === 'skipped').length

    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          {/* 합격/불합격 헤더 */}
          <div
            className={`rounded-xl p-8 text-center mb-6 ${
              passed ? 'bg-green-50 border-2 border-green-400' : 'bg-red-50 border-2 border-red-400'
            }`}
          >
            <p className={`text-4xl font-black mb-1 ${passed ? 'text-green-700' : 'text-red-700'}`}>
              {passed ? '합격' : '불합격'}
            </p>
            <p className="text-5xl font-bold text-gray-900 mb-2">{examResult.score}점</p>
            <p className="text-gray-500 text-sm">
              소요 시간: {totalMinutes}분 {totalSeconds}초
            </p>
          </div>

          {/* 과목별 점수 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">과목별 점수</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">1과목 (데이터 모델링)</p>
                <p
                  className={`text-3xl font-bold ${
                    examResult.part1Score >= 40 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {examResult.part1Score}점
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {examResult.part1Score >= 40 ? '과락 없음' : '과락'}
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">2과목 (SQL 기본·활용)</p>
                <p
                  className={`text-3xl font-bold ${
                    examResult.part2Score >= 40 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {examResult.part2Score}점
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {examResult.part2Score >= 40 ? '과락 없음' : '과락'}
                </p>
              </div>
            </div>
          </div>

          {/* 풀이 통계 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">풀이 통계</h2>
            <div className="flex justify-around text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">{correctCount}</p>
                <p className="text-xs text-gray-500">정답</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{wrongCount}</p>
                <p className="text-xs text-gray-500">오답</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-400">{skippedCount}</p>
                <p className="text-xs text-gray-500">미응답</p>
              </div>
            </div>
          </div>

          {/* 문제별 결과 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">문제별 결과</h2>
            <div className="grid grid-cols-10 gap-1.5">
              {questions.map((q, i) => {
                const result = sessionAnswers[i]
                return (
                  <div
                    key={q.id}
                    className={`h-8 w-full rounded text-xs font-bold flex items-center justify-center ${
                      result === 'correct'
                        ? 'bg-green-100 text-green-700'
                        : result === 'wrong'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                    title={`Q${i + 1}: ${result ?? '미응답'}`}
                  >
                    {i + 1}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setPhase('ready')
                setQuestions([])
                setCurrentIndex(0)
                setSelectedOptions([])
                setSessionAnswers([])
                setExamResult(null)
                timedOutRef.current = false
              }}
              className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium"
            >
              다시 보기
            </button>
            <Link
              href="/quiz"
              className="px-6 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium"
            >
              문제 목록으로
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  // 시험 진행 중
  if (questions.length === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">문제를 불러오는 중...</p>
        </div>
      </Layout>
    )
  }

  const currentQuestion = questions[currentIndex]
  const currentSelected = selectedOptions[currentIndex] ?? 0
  const answeredCount = selectedOptions.filter((s) => s > 0).length

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* 시험 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">SQLD 모의고사</h1>
            <p className="text-sm text-gray-500">
              {answeredCount}/{questions.length} 문항 응답 완료
            </p>
          </div>
          <ExamTimer totalSeconds={EXAM_DURATION} onTimeUp={handleTimeUp} />
        </div>

        <div className="flex gap-6">
          {/* 문제 영역 (모의고사는 즉시 피드백 없음) */}
          <div className="flex-1 min-w-0">
            <QuestionCard
              question={currentQuestion}
              questionNumber={currentIndex + 1}
              totalQuestions={questions.length}
              selectedOption={currentSelected > 0 ? currentSelected : null}
              showResult={false}
              onAnswer={handleAnswer}
              isBookmarked={isBookmarked(currentQuestion.id)}
              onToggleBookmark={() => toggleBookmark(currentQuestion.id)}
            />

            {/* 이전/다음 버튼 */}
            <div className="flex justify-between mt-4">
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="px-5 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-sm"
              >
                이전 문제
              </button>
              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex((prev) => prev + 1)}
                  className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium text-sm"
                >
                  다음 문제
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="px-5 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 font-bold text-sm"
                >
                  답안 제출
                </button>
              )}
            </div>

            {/* 최종 제출 버튼 (언제든지 제출 가능) */}
            {currentIndex < questions.length - 1 && (
              <div className="mt-3 text-right">
                <button
                  onClick={handleSubmit}
                  className="text-sm text-purple-600 hover:text-purple-800 underline"
                >
                  지금 바로 제출하기
                </button>
              </div>
            )}
          </div>

          {/* 우측 네비게이터 */}
          <div className="hidden lg:block w-52 flex-shrink-0">
            <QuizNavigator
              total={questions.length}
              current={currentIndex}
              answers={selectedOptions.map((s) =>
                s > 0 ? ('skipped' as AnswerResult) : null
              )}
              bookmarked={questions.map((q) => isBookmarked(q.id))}
              onJump={setCurrentIndex}
            />
            <div className="mt-3 text-xs text-gray-500 text-center">
              회색: 미응답, 파란 테두리: 현재
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
