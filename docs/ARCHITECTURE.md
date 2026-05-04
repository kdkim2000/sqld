# ARCHITECTURE — SQLD 시험 준비 사이트

## 기술 스택

| 레이어 | 기술 | 선택 이유 |
|--------|------|---------|
| 프레임워크 | Next.js 14 (Pages Router) | SSG로 정적 빌드, Vercel 최적화 |
| 언어 | TypeScript | 타입 안전성, IDE 자동완성 |
| 스타일링 | Tailwind CSS | 빠른 UI 구성, 반응형 용이 |
| 상태관리 | React Context + localStorage | 서버 없이 진도 저장 |
| 마크다운 | react-markdown + rehype-highlight | 이론 콘텐츠 렌더링 |
| 배포 | Vercel | GitHub push 자동 배포 |

---

## 프로젝트 구조

```
sqld/
├── pages/
│   ├── index.tsx                  # 대시보드
│   ├── theory/
│   │   ├── index.tsx              # 이론 목차
│   │   └── [chapterId].tsx        # 챕터 본문 (SSG)
│   └── quiz/
│       ├── index.tsx              # 문제풀이 메뉴
│       ├── chapter/[chapterId].tsx # 단원별 풀이
│       ├── exam.tsx               # 모의고사
│       ├── wrong.tsx              # 오답 재풀이
│       └── bookmarks.tsx          # 북마크 문제
├── components/
│   ├── layout/
│   │   ├── Layout.tsx             # 공통 레이아웃 (헤더, 사이드바)
│   │   └── Sidebar.tsx
│   ├── theory/
│   │   └── TheoryContent.tsx      # 마크다운 렌더러
│   ├── quiz/
│   │   ├── QuestionCard.tsx       # 문제 카드 (보기 포함)
│   │   ├── AnswerFeedback.tsx     # 정답/오답 피드백 + 해설
│   │   ├── QuizNavigator.tsx      # 문제 번호 네비게이션
│   │   └── ExamTimer.tsx          # 모의고사 타이머
│   └── dashboard/
│       ├── ProgressChart.tsx      # 정답률 차트
│       └── WeakChapterList.tsx    # 취약 챕터 목록
├── lib/
│   ├── questions.ts               # 문제 데이터 로드·필터 유틸
│   ├── theory.ts                  # 이론 데이터 로드 유틸
│   └── progress.ts                # localStorage 읽기/쓰기
├── context/
│   └── ProgressContext.tsx        # 전역 진도 상태 (Context API)
├── types/
│   └── index.ts                   # 공통 타입 정의
├── data/
│   ├── questions/
│   │   ├── part1_ch1.json         # 1과목 1장 문제
│   │   ├── part1_ch2.json
│   │   ├── part2_ch1.json         # 2과목 1장 문제
│   │   ├── part2_ch2.json
│   │   └── part2_ch3.json
│   └── theory/
│       ├── part1_ch1.md           # 이론 본문 (마크다운)
│       ├── part1_ch2.md
│       ├── part2_ch1.md
│       ├── part2_ch2.md
│       └── part2_ch3.md
└── public/
```

---

## 데이터 모델

### 문제 (Question)

```typescript
// types/index.ts
interface Question {
  id: string;            // "p1c1_001" (과목-챕터-번호)
  part: 1 | 2;           // 과목
  chapter: string;       // "p1c1" | "p2c1" 등
  content: string;       // 문제 본문 (마크다운 가능)
  options: string[];     // 보기 4개
  answer: number;        // 정답 인덱스 (0-3)
  explanation: string;   // 해설
  tags?: string[];       // 키워드 태그 (예: "JOIN", "정규화")
}
```

### JSON 파일 예시

```json
// data/questions/part2_ch1.json
[
  {
    "id": "p2c1_001",
    "part": 2,
    "chapter": "p2c1",
    "content": "다음 중 SQL의 DDL 명령어가 아닌 것은?",
    "options": ["CREATE", "ALTER", "INSERT", "DROP"],
    "answer": 2,
    "explanation": "INSERT는 DML(Data Manipulation Language)에 해당합니다.",
    "tags": ["DDL", "DML"]
  }
]
```

### 진도 데이터 (localStorage)

```typescript
interface ProgressStore {
  answers: Record<string, 'correct' | 'wrong' | 'skipped'>;
  bookmarks: string[];
  lastVisited: {
    type: 'theory' | 'quiz';
    id: string;
  };
  examHistory: ExamResult[];
}

interface ExamResult {
  date: string;        // ISO 8601
  score: number;
  totalTime: number;   // 초
  answers: Record<string, number>;  // questionId → 선택 인덱스
}
```

---

## 상태 관리

```
ProgressContext (전역)
  ├── answers: Record<questionId, result>
  ├── bookmarks: string[]
  ├── markAnswer(id, result) → localStorage 즉시 저장
  ├── toggleBookmark(id)
  └── getStats() → 과목별·챕터별 통계 계산
```

- **읽기**: 페이지 첫 렌더 시 `localStorage`에서 초기값 로드 (`useEffect`)
- **쓰기**: `markAnswer` 호출 시 상태 업데이트 + `localStorage` 동시 저장
- **SSR 주의**: `localStorage`는 브라우저 전용이므로 `typeof window !== 'undefined'` 가드 필요

---

## 페이지별 데이터 흐름

### 이론 페이지 (`/theory/[chapterId]`)
```
getStaticPaths  →  data/theory/*.md 파일 목록에서 경로 생성
getStaticProps  →  해당 .md 파일 읽어 HTML로 파싱 후 props 전달
컴포넌트        →  TheoryContent에서 react-markdown으로 렌더링
```

### 문제 풀이 페이지 (`/quiz/chapter/[chapterId]`)
```
getStaticProps  →  data/questions/[chapterId].json 로드
컴포넌트        →  QuestionCard 순서대로 표시
사용자 선택     →  ProgressContext.markAnswer() 호출
정답 확인       →  AnswerFeedback 표시 + 해설 공개
```

### 모의고사 (`/quiz/exam`)
```
클라이언트 사이드  →  전체 JSON에서 비율대로 샘플링 (1과목 10, 2과목 40)
ExamTimer         →  90분 카운트다운, 종료 시 자동 제출
결과 저장         →  ExamResult → localStorage.examHistory
```

---

## 빌드 및 배포

```bash
npm run dev      # 개발 서버 (localhost:3000)
npm run build    # 정적 빌드 (SSG)
npm run start    # 프로덕션 서버 (로컬 확인용)
npm run lint     # ESLint 검사
```

**Vercel 배포 흐름**:
```
git push → Vercel 자동 감지 → npm run build → 전 세계 CDN 배포
```

- `main` 브랜치 → 프로덕션 URL
- PR 브랜치 → 미리보기 URL (자동 생성)

---

## 주요 설계 결정 및 근거

| 결정 | 근거 |
|------|------|
| Pages Router (App Router 아님) | Next.js 14 App Router는 학습 곡선이 있고, SSG 패턴이 Pages Router에서 더 직관적 |
| JSON 파일로 문제 관리 | DB 없이 Git으로 문제 버전 관리, PR로 문제 추가/수정 가능 |
| localStorage (서버 없이) | 회원가입 없이 즉시 사용 가능, 개인정보 수집 불필요 |
| 마크다운으로 이론 저장 | 이론 콘텐츠 수정이 용이하고 코드 블록·표 표현 가능 |
| SSG (Static Site Generation) | 문제 데이터가 정적이므로 SSG로 빌드 후 CDN 서빙이 최적 |
