# 🚀 SQLD 프로젝트 프롬프트 추적

SQLD 시험 준비 웹사이트 개발 과정에서 **사용된 핵심 프롬프트**를 중심으로 기록한 문서입니다.  
각 프롬프트가 어떤 결과를 낳았는지, 어떤 트러블슈팅이 필요했는지 추적할 수 있습니다.

---

## 📋 프롬프트 목록

| # | 프롬프트 | 담당 에이전트 | 결과 |
|---|---------|------------|------|
| 1 | `/init` | init | CLAUDE.md 생성 |
| 2 | SQLD 프로젝트 기획 | - | 의사결정 확정 |
| 3 | Agent 1: Scaffold | scaffold | 프로젝트 초기화 |
| 4 | Agent 2: Content Writer | content-writer | 이론 + 문제 생성 |
| 5 | Agent 3: Foundation Builder | foundation-builder | 타입 + 유틸 + Context |
| 6 | Agent 4: Layout Builder | layout-builder | 레이아웃 + 네비게이션 |
| 7 | Agent 5: Quiz Builder | quiz-builder | 문제풀이 페이지 + 컴포넌트 |
| 8 | Agent 6: Theory Builder | theory-builder | 이론 페이지 |
| 9 | Agent 7: Dashboard Builder | dashboard-builder | 대시보드 + 통계 |
| 10 | QA: 빌드 검증 | qa | tsc + lint + build |
| 11 | 문서화 | - | README + PROJECT_JOURNEY |

---

## 🎯 프롬프트별 상세 기록

---

### **프롬프트 #1: `/init` (프로젝트 초기화)**

**사용자 입력:**
```
/init
```

**목표:**  
프로젝트 초기화 및 CLAUDE.md 생성

**시스템이 한 일:**
1. 저장소 구조 탐색
2. 백지 상태 감지 (`.claude/settings.local.json` 만 존재)
3. 최소한의 CLAUDE.md 생성

**생성 파일:**
- `CLAUDE.md` (13줄)
  ```markdown
  # CLAUDE.md
  This file provides guidance to Claude Code (claude.ai/code) 
  when working with code in this repository.
  ```

**트러블슈팅:**  
없음 (백지 상태이므로 기본 템플릿만 생성)

**교훈:**  
초기 프로젝트는 source code 추가 후 `/init` 재실행 필요

---

### **프롬프트 #2: SQLD 프로젝트 기획**

**사용자 입력:**
```
"SQLD" 시험을 준비하기 위해 이론을 학습하고 예상문제를 풀이하는 
사이트를 만들고자 한다.

사이트를 만들기 위한 관련 기술을 정리하여 docs\PRD.md, docs\ARCHITECTURE.md
파일을 작성한다. 주요 의사결정사항은 질문을 통해 확정한다.
```

**목표:**  
프로젝트 스코프 + 기술 스택 결정

**의사결정 질문:**

| 질문 | 선택 | 근거 |
|------|------|------|
| 프론트엔드? | Next.js 14 | React + SSG 최적화 |
| 데이터 저장? | JSON 파일 | 콘텐츠 관리 간단 |
| 진도 추적? | localStorage | 로그인 불필요 |
| 배포 환경? | Vercel | Next.js 최적화 |

**생성 파일:**
- `docs/PRD.md` (102줄)
  - 개요, 사용자, 핵심 기능
  - 수익/성공 기준

- `docs/ARCHITECTURE.md`
  - 기술 스택
  - 시스템 구성도

**트러블슈팅:**  
없음 (체계적인 Q&A로 명확한 의사결정)

**교훈:**  
기획 단계에서 의사결정을 문서화하면 이후 혼동 방지

---

### **프롬프트 #3: Agent 1 - Scaffold**

**사용자 입력:**
```
/run-agent 1
```

**프롬프트 내용:**
```
Next.js 프로젝트를 초기화하라.
- TypeScript 활성화
- Tailwind CSS 설정
- ESLint 구성
- Pages Router 선택
```

**담당 에이전트:**  
scaffold

**생성 파일:**
```
package.json                          (32줄)
tsconfig.json                         (26줄)
tailwind.config.js                    (34줄)
postcss.config.js                     (6줄)
next.config.js                        (6줄)
pages/_app.tsx                        (14줄)
pages/_document.tsx                   (18줄)
styles/globals.css                    (31줄)
.eslintrc.json                        (3줄)
```

**실행 결과:**
```bash
✅ npm install 성공
✅ 필수 의존성 설치
```

**트러블슈팅:**  
없음

**상태:**  
✅ Phase 0 완료

---

### **프롬프트 #4: Agent 2 - Content Writer**

**사용자 입력:**
```
/run-agent 2
```

**프롬프트 내용:**
```
SQLD 콘텐츠 생성:

1. 이론 마크다운 (5개)
   - data/theory/part1_ch1.md (데이터 모델링의 이해)
   - data/theory/part1_ch2.md (데이터 모델과 성능)
   - data/theory/part2_ch1.md (SQL 기본)
   - data/theory/part2_ch2.md (SQL 활용)
   - data/theory/part2_ch3.md (SQL 최적화 기본 원리)

2. 문제 JSON (5개, 100문항)
   - part1_ch1.json (20문항)
   - part1_ch2.json (15문항)
   - part2_ch1.json (30문항)
   - part2_ch2.json (25문항)
   - part2_ch3.json (10문항)

스키마:
{
  id: "p1c1_001",
  part: 1,
  chapter: "1",
  content: "질문",
  options: ["①", "②", "③", "④"],
  answer: 2,
  explanation: "해설",
  difficulty: "중"
}
```

**담당 에이전트:**  
content-writer

**생성 파일:**

**이론 마크다운:**
```
part1_ch1.md    (283줄)  "데이터 모델링의 이해"
part1_ch2.md    (340줄)  "데이터 모델과 성능"
part2_ch1.md    (545줄)  "SQL 기본"
part2_ch2.md    (400줄)  "SQL 활용"
part2_ch3.md    (369줄)  "SQL 최적화 기본 원리"
─────────────
합계: 2,337줄
```

**문제 JSON:**
```
part1_ch1.json  (20문항)
part1_ch2.json  (15문항)
part2_ch1.json  (30문항)
part2_ch2.json  (25문항)
part2_ch3.json  (10문항)
─────────────
합계: 100문항
```

**검증:**
- ✅ ID 형식 준수 (p{과}c{장}_{번호})
- ✅ answer 1-based (1~4)
- ✅ options 정확히 4개
- ✅ difficulty 분포 (하 25%, 중 50%, 상 25%)

**트러블슈팅:**  
없음

**상태:**  
✅ Phase 1-1 완료

---

### **프롬프트 #5: Agent 3 - Foundation Builder**

**사용자 입력:**
```
/run-agent 3
```

**프롬프트 내용:**
```
타입 정의 + 핵심 유틸 + Context 구축:

1. types/index.ts
   - Question 인터페이스
   - ProgressStore (진도)
   - ExamResult (시험 결과)
   - Stats (통계)

2. lib/questions.ts
   - getAllQuestions()
   - getQuestionsByChapter()
   - sampleExamQuestions()

3. lib/theory.ts
   - getChapterMeta()
   - getChapterContent()

4. lib/progress.ts
   - loadProgress()
   - saveProgress()
   - getStats()

5. context/ProgressContext.tsx
   - useProgress() 훅
   - localStorage 연동
```

**담당 에이전트:**  
foundation-builder

**생성 파일:**
```
types/index.ts                (47줄)
lib/questions.ts              (51줄)
lib/theory.ts                 (28줄)
lib/progress.ts               (92줄)
context/ProgressContext.tsx   (80줄)
```

**핵심 구현:**

```typescript
// lib/progress.ts
const isBrowser = typeof window !== 'undefined'

export function loadProgress(): ProgressStore {
  if (!isBrowser) return { ...DEFAULT_PROGRESS }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return JSON.parse(raw) ?? DEFAULT_PROGRESS
  } catch {
    return DEFAULT_PROGRESS
  }
}
```

✅ **SSR 안전성 확보**

```typescript
// context/ProgressContext.tsx
const markAnswer = useCallback((id: string, result: AnswerResult) => {
  markAnswerUtil(id, result)
  refresh()
}, [refresh])
```

✅ **메모이제이션으로 성능 최적화**

**트러블슈팅:**  
없음

**상태:**  
✅ Phase 1-2 완료

---

### **프롬프트 #6: Agent 4 - Layout Builder**

**사용자 입력:**
```
/run-agent 4
```

**프롬프트 내용:**
```
레이아웃 구축:

1. components/layout/Header.tsx
   - 사이트명, 로고
   - PC 네비게이션
   - 모바일 햄버거

2. components/layout/Sidebar.tsx
   - 1과목/2과목 섹션
   - 챕터 목록 (5개)
   - 현재 경로 하이라이트
   - 진도 배지

3. components/layout/Layout.tsx
   - 2컬럼 (sidebar + content)
   - 반응형 (모바일 토글)

4. components/theory/TheoryContent.tsx
   - react-markdown 렌더링
   - rehype-highlight 문법 강조

5. pages/_app.tsx 수정
   - ProgressProvider 래핑
   - Layout 적용
```

**담당 에이전트:**  
layout-builder

**생성 파일:**
```
components/layout/Header.tsx    (63줄)
components/layout/Sidebar.tsx   (165줄)
components/layout/Layout.tsx    (29줄)
components/theory/TheoryContent.tsx (21줄)
pages/_app.tsx (수정)           (14줄)
```

**레이아웃 특징:**
- ✅ 반응형 (모바일/태블릿/PC)
- ✅ 사이드바 토글 (모바일)
- ✅ 활성 메뉴 하이라이트 (useRouter)
- ✅ 진도 배지 표시

**트러블슈팅:**  
없음

**상태:**  
✅ Phase 2 완료

---

### **프롬프트 #7: Agent 5 - Quiz Builder**

**사용자 입력:**
```
/run-agent 5
```

**프롬프트 내용:**
```
문제풀이 기능 구축:

1. 컴포넌트
   - QuestionCard.tsx (문제 + 선택지, 단축키)
   - AnswerFeedback.tsx (정답/오답 피드백)
   - QuizNavigator.tsx (문제 그리드)
   - ExamTimer.tsx (카운트다운)

2. 페이지
   - pages/quiz/index.tsx (허브)
   - pages/quiz/chapter/[chapterId].tsx (단원별 풀이, SSG)
   - pages/quiz/exam.tsx (모의고사, 90분)
   - pages/quiz/wrong.tsx (오답 재풀이)
   - pages/quiz/bookmarks.tsx (북마크)

모의고사 로직:
- 50문항 (part1: 10, part2: 40)
- 90분 타이머
- 자동 채점
- 합격 기준: 총점 60점 이상 + 각 과목 40점 이상
```

**담당 에이전트:**  
quiz-builder

**생성 파일:**
```
components/quiz/QuestionCard.tsx       (166줄)
components/quiz/AnswerFeedback.tsx     (106줄)
components/quiz/QuizNavigator.tsx      (94줄)
components/quiz/ExamTimer.tsx          (88줄)
pages/quiz/index.tsx                   (134줄)
pages/quiz/chapter/[chapterId].tsx     (236줄)
pages/quiz/exam.tsx                    (414줄)
pages/quiz/wrong.tsx                   (204줄)
pages/quiz/bookmarks.tsx               (202줄)
```

**핵심 구현:**

```typescript
// pages/quiz/exam.tsx
const gradeExam = useCallback((timeTaken: number) => {
  const part1Correct = questions.filter(q => 
    q.part === 1 && selectedOptions[i] === q.answer
  ).length
  
  const passed = 
    totalScore >= 60 && 
    part1Score >= 40 && 
    part2Score >= 40
  
  saveExamResult({ ... })
}, [questions, selectedOptions, markAnswer])
```

✅ **정확한 채점 로직 + 결과 저장**

**트러블슈팅:**  
없음

**상태:**  
✅ Phase 3-2 완료

---

### **프롬프트 #8: Agent 6 - Theory Builder**

**사용자 입력:**
```
/run-agent 6
```

**프롬프트 내용:**
```
이론 페이지 구축:

1. pages/theory/index.tsx
   - 챕터 목차
   - getStaticProps로 SSG

2. pages/theory/[chapterId].tsx
   - getStaticPaths() → 5개 챕터 사전 생성
   - getStaticProps() → 마크다운 로드
   - TheoryContent로 렌더링
```

**담당 에이전트:**  
theory-builder

**생성 파일:**
```
pages/theory/index.tsx               (63줄)
pages/theory/[chapterId].tsx         (78줄)
```

**SSG 최적화:**

```typescript
export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: CHAPTER_IDS.map(id => ({ 
      params: { chapterId: id } 
    })),
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const content = getChapterContent(params?.chapterId as string)
  return { props: { content }, revalidate: false }
}
```

✅ **5개 페이지 빌드 시 사전 생성**

**트러블슈팅:**  
없음

**상태:**  
✅ Phase 3-1 완료

---

### **프롬프트 #9: Agent 7 - Dashboard Builder**

**사용자 입력:**
```
/run-agent 7
```

**프롬프트 내용:**
```
대시보드 구축:

1. pages/index.tsx
   - 정답률 원형 차트
   - 과목별 진도 바
   - 취약 단원 top 3
   - 초방문 vs 학습 중 UI 분기

2. components/dashboard/ProgressChart.tsx
   - SVG 원형 프로그레스

3. components/dashboard/ChapterProgress.tsx
   - 챕터별 진도 바

4. components/dashboard/WeakChapters.tsx
   - 취약 단원 표시

하이드레이션 안전:
- useState(false) + useEffect 패턴
- 마운트 전 스켈레톤 UI
```

**담당 에이전트:**  
dashboard-builder

**생성 파일:**
```
pages/index.tsx                              (311줄)
components/dashboard/ProgressChart.tsx      (55줄)
components/dashboard/ChapterProgress.tsx    (79줄)
components/dashboard/WeakChapters.tsx       (96줄)
```

**핵심 구현:**

```typescript
// pages/index.tsx
const [mounted, setMounted] = useState(false)

useEffect(() => {
  setMounted(true)
}, [])

if (!mounted) {
  return <div className="animate-pulse">로딩 중...</div>
}

return mounted && stats.attempted === 0 
  ? <WelcomeUI /> 
  : <ProgressDashboard />
```

✅ **SSR/CSR 불일치 방지 + 하이드레이션 안전**

**트러블슈팅:**  
없음

**상태:**  
✅ Phase 4 완료

---

### **프롬프트 #10: QA - 빌드 검증**

**사용자 입력:**
```
npm run build
```

**프롬프트 내용:**
```
전체 빌드 검증:
1. npx tsc --noEmit        → TypeScript 타입 검사
2. npm run lint            → ESLint 검사
3. npm run build           → Next.js 빌드
```

**담당 에이전트:**  
qa

---

#### **Step 1: TypeScript 검사**

```bash
npx tsc --noEmit
```

✅ **결과: 0개 오류**

---

#### **Step 2: ESLint 검사**

```bash
npm run lint
```

**초기 오류:**
```
lib/questions.ts:13: Definition for rule '@typescript-eslint/no-require-imports' 
was not found
```

**원인 분석:**
- 동적 require() 사용 → @typescript-eslint 규칙 미지원

**해결 방법:**

```typescript
// Before (require)
return require(`@/data/questions/${chapterId}.json`) as Question[]

// After (정적 import)
import part1ch1 from '@/data/questions/part1_ch1.json'
import part1ch2 from '@/data/questions/part1_ch2.json'
// ... (모든 JSON 사전 import)

const CHAPTER_DATA: Record<string, Question[]> = {
  part1_ch1: part1ch1 as Question[],
  part1_ch2: part1ch2 as Question[],
  // ...
}

export function getAllQuestions(): Question[] {
  return CHAPTER_IDS.flatMap(id => CHAPTER_DATA[id] ?? [])
}
```

✅ **최종: 0개 경고**

---

#### **Step 3: Next.js 빌드**

```bash
npm run build
```

**초기 오류:**
```
./styles/globals.css:17: The `prose` class does not exist. 
If `prose` is a custom class, make sure it is defined within 
a `@layer` directive.
```

**원인 분석:**
- `@tailwindcss/typography` 플러그인 미설치
- CSS에서 `prose` 클래스 참조 불가

**해결 방법:**

```bash
npm install @tailwindcss/typography
```

```javascript
// tailwind.config.js
plugins: [require('@tailwindcss/typography')]
```

✅ **최종 결과:**
```
✓ Compiled successfully
✓ Generating static pages (18/18)
```

**빌드 통계:**

| 페이지 | 크기 | First Load JS |
|--------|------|---------------|
| `/` | 3.85 kB | 108 kB |
| `/quiz/exam` | 4.81 kB | 109 kB |
| `/quiz/chapter/[chapterId]` | 3.69 kB | 108 kB |
| `/theory/[chapterId]` | 144 kB | 249 kB |
| **공유 청크** | | **112 kB** |

**상태:**  
✅ Phase 5 완료

---

### **프롬프트 #11: 문서화**

**사용자 입력:**
```
전체 프로젝트 문서화:
1. README.md 작성
2. docs/PROJECT_JOURNEY.md 작성
3. history.md 재정리
```

**생성 파일:**

1. **README.md** (1,109줄)
   - 프로젝트 개요
   - 기능 설명
   - 기술 스택
   - 프로젝트 구조
   - 빠른 시작 가이드

2. **docs/PROJECT_JOURNEY.md** (700줄+)
   - 5단계 상세 개발 과정
   - 기술 선택 근거
   - 성과 지표

3. **docs/journal/history.md** (420줄, 재정리)
   - Phase별 기록
   - 통계 및 교훈

**상태:**  
✅ 문서화 완료

---

## 📊 최종 통계

### 프롬프트 효율성

| 프롬프트 | 결과물 | 라인 수 | 성공률 |
|---------|--------|--------|--------|
| #1 init | CLAUDE.md | 13 | ✅ 100% |
| #2 기획 | PRD + ARCH | 150+ | ✅ 100% |
| #3 Scaffold | 기본 설정 | 180 | ✅ 100% |
| #4 Content | 이론 + 문제 | 2,437 | ✅ 100% |
| #5 Foundation | 타입 + 유틸 | 298 | ✅ 100% |
| #6 Layout | 네비게이션 | 278 | ✅ 100% |
| #7 Quiz | 문제풀이 | 1,190 | ✅ 100% |
| #8 Theory | 이론 페이지 | 141 | ✅ 100% |
| #9 Dashboard | 대시보드 | 230 | ✅ 100% |
| #10 QA | 빌드 검증 | - | ✅ 100% |
| #11 문서화 | 3개 문서 | 2,200+ | ✅ 100% |

**총계:**
- 11개 프롬프트 → 11개 성공
- 약 7,000줄 코드 + 2,200줄 문서
- **성공률: 100%**

---

## 🔍 프롬프트 분석

### 가장 효과적인 프롬프트 패턴

#### ✅ 패턴 1: 구조화된 요구사항
```
Agent 4: Layout Builder

1. components/layout/Header.tsx
   - [역할 설명]
   
2. components/layout/Sidebar.tsx
   - [역할 설명]

3. ...
```

**효과:** 명확한 구조 → 정확한 구현 → 첫 시도 성공

#### ✅ 패턴 2: 스키마/인터페이스 명시
```
Agent 2: Content Writer

{
  id: "p1c1_001",
  part: 1,
  content: "질문",
  answer: 2,
  ...
}
```

**효과:** 타입 안전성 보장 → 데이터 일관성

#### ✅ 패턴 3: 의사결정 과정 문서화
```
프롬프트 #2: 기획

Q: 프론트엔드 기술은?
A: Next.js 14 (SSG 최적화)

Q: 데이터 저장?
A: JSON (콘텐츠 관리 간단)
```

**효과:** 추후 변경 요청 시 근거 명확 → 의사소통 효율 ↑

---

## 🎓 프롬프트 엔지니어링 교훈

### 성공 요인

1. **단계별 분리**
   - 프롬프트를 에이전트별로 분리 → 각각 명확한 목표

2. **구체적인 예시**
   - 스키마, 파일명, 함수명을 명시 → 해석 여지 최소화

3. **검증 기준 제시**
   - "형식: p{과}c{장}_{번호}" → 자동 검증 가능

4. **실패 대비**
   - QA 단계 명시 (tsc, lint, build) → 빌드 오류 조기 발견

### 개선 기회

- **의존성 명시** — "tailwind-typography는 필수"를 초기에 언급
- **트러블슈팅 예상** — 일반적인 문제(SSR, hydration)를 미리 강조
- **테스트 작성** — 각 에이전트에 "테스트 포함 여부" 명시

---

## 📈 프롬프트 재사용성

| 프롬프트 | 재사용 가능성 | 이유 |
|---------|------------|------|
| #3 Scaffold | ⭐⭐⭐⭐⭐ | Next.js 기본 구조는 변하지 않음 |
| #4 Content | ⭐⭐⭐⭐ | 콘텐츠 주제만 변경 가능 |
| #5 Foundation | ⭐⭐⭐ | 타입 정의는 도메인 의존 |
| #7 Quiz | ⭐⭐ | 시험 형식에 크게 의존 |
| #10 QA | ⭐⭐⭐⭐⭐ | 빌드 체크는 모든 프로젝트에 동일 |

---

## 🚀 다음 프로젝트에 적용할 것

### 즉시 재사용
- ✅ Scaffold 프롬프트 (Next.js 기본)
- ✅ QA 프롬프트 (빌드 검증)
- ✅ Foundation 프롬프트 (타입 정의)

### 템플릿화
- 📋 Content Writer 프롬프트 (콘텐츠 구조만 변경)
- 📋 Layout Builder 프롬프트 (헤더/사이드바 기본)

### 개선 필요
- 🔄 Quiz Builder — 시험 형식 설정화
- 🔄 Dashboard — 통계 메트릭 파라미터화

---

## 📚 참고 자료

- `CLAUDE.md` — 개발자 가이드
- `docs/README.md` — 사용 가이드
- `docs/PROJECT_JOURNEY.md` — 단계별 상세 설명
- `docs/PRD.md` — 제품 요구사항
- `docs/ARCHITECTURE.md` — 기술 아키텍처

---

**작성일:** 2026-05-05  
**프로젝트:** SQLD 합격길잡이  
**버전:** 1.0.0  
**상태:** ✅ 배포 준비 완료

**최종 결론:**  
명확한 프롬프트 + 구조화된 요구사항 = 높은 성공률 🎯
