# 🏗️ ARCHITECTURE.md — 시스템 아키텍처

> 시스템 전체 구조, 데이터 흐름, 컴포넌트 트리.

---

## 🌐 1. 시스템 다이어그램

```
┌─────────────────────────────────────────────────────────────┐
│                      USER (Browser)                         │
│              Next.js Client Components                      │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTPS
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   VERCEL (Edge Network)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Next.js 15 (App Router)                    │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────┐   │   │
│  │  │ Server      │  │ API Routes   │  │ Static     │   │   │
│  │  │ Components  │  │ /api/*       │  │ /public    │   │   │
│  │  └─────────────┘  └──────────────┘  └────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
└──┬────────────────┬──────────────────────┬────────────────┬─┘
   │                │                      │                │
   ▼                ▼                      ▼                ▼
┌──────────┐  ┌──────────┐  ┌────────────────────┐  ┌─────────┐
│ Firebase │  │ Firebase │  │   Golpo API        │  │ Toss    │
│ Auth     │  │Firestore │  │ /generate, /status │  │Payments │
└──────────┘  └──────────┘  └────────────────────┘  └─────────┘
                    │
                    ▼
              ┌──────────┐
              │ Firebase │
              │ Storage  │
              └──────────┘
```

---

## 📂 2. 폴더 구조 (상세)

```
banjak/
│
├── app/                              # Next.js App Router
│   ├── (auth)/                       # 인증 라우트 그룹
│   │   ├── sign-in/
│   │   │   └── page.tsx
│   │   ├── sign-up/
│   │   │   └── page.tsx
│   │   └── layout.tsx                # 인증 페이지 공통 레이아웃
│   │
│   ├── (main)/                       # 메인 라우트 그룹
│   │   ├── page.tsx                  # 랜딩 (메인 페이지)
│   │   ├── create/
│   │   │   └── page.tsx              # 영상 생성
│   │   ├── dashboard/
│   │   │   ├── page.tsx              # 마이페이지
│   │   │   └── [videoId]/page.tsx    # 영상 상세
│   │   ├── pricing/
│   │   │   └── page.tsx              # 요금제
│   │   ├── billing/
│   │   │   ├── page.tsx              # 결제/구독 관리
│   │   │   └── success/page.tsx      # 결제 성공
│   │   └── layout.tsx                # 메인 레이아웃 (헤더, 푸터)
│   │
│   ├── api/                          # API Routes (서버)
│   │   ├── generate/route.ts         # POST: 영상 생성
│   │   ├── status/[jobId]/route.ts   # GET: 작업 상태
│   │   ├── upload/route.ts           # POST: 파일 업로드
│   │   ├── auth/
│   │   │   └── session/route.ts      # POST/DELETE: 세션 쿠키
│   │   ├── payments/
│   │   │   ├── confirm/route.ts      # 결제 검증
│   │   │   └── webhook/route.ts      # Toss webhook
│   │   └── user/
│   │       └── balance/route.ts      # GET: 토큰 잔액
│   │
│   ├── layout.tsx                    # 루트 레이아웃
│   ├── globals.css                   # Tailwind + CSS variables
│   ├── error.tsx                     # 에러 바운더리
│   ├── not-found.tsx                 # 404
│   └── loading.tsx                   # 글로벌 로딩
│
├── components/                       # React 컴포넌트
│   ├── ui/                           # shadcn 컴포넌트
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   │
│   ├── home/                         # 메인 페이지
│   │   ├── HeroSection.tsx
│   │   ├── BackgroundVideo.tsx
│   │   ├── StyleShowcase.tsx
│   │   ├── PricingPreview.tsx
│   │   └── Testimonials.tsx
│   │
│   ├── create/                       # 영상 생성 폼
│   │   ├── CreateForm.tsx            # 메인 폼 (orchestrator)
│   │   ├── InputModeTab.tsx          # 프롬프트/원고/PDF 탭
│   │   ├── PromptInput.tsx
│   │   ├── ScriptInput.tsx
│   │   ├── DocumentUpload.tsx
│   │   ├── DurationSelector.tsx      # 영상 길이
│   │   ├── AspectRatioToggle.tsx     # 가로/세로
│   │   ├── StyleSelector.tsx         # Sketch/Canvas 갤러리
│   │   ├── VoiceSelector.tsx
│   │   ├── LanguageSelector.tsx
│   │   ├── MusicPicker.tsx           # 8종 미리듣기
│   │   ├── CreditEstimator.tsx       # 실시간 크레딧 표시
│   │   └── GeneratingScreen.tsx      # 생성 중 화면
│   │
│   ├── dashboard/                    # 마이페이지
│   │   ├── VideoGrid.tsx
│   │   ├── VideoCard.tsx
│   │   ├── TokenBalance.tsx
│   │   └── SubscriptionStatus.tsx
│   │
│   ├── auth/                         # 인증
│   │   ├── GoogleSignInButton.tsx
│   │   ├── EmailSignInForm.tsx
│   │   └── EmailSignUpForm.tsx
│   │
│   ├── billing/
│   │   ├── TokenPackages.tsx
│   │   ├── SubscriptionPlans.tsx
│   │   └── PaymentMethod.tsx
│   │
│   └── shared/                       # 공통
│       ├── Header.tsx
│       ├── Footer.tsx
│       ├── ThemeToggle.tsx
│       └── LoadingSpinner.tsx
│
├── lib/                              # 비즈니스 로직
│   ├── firebase/
│   │   ├── client.ts                 # 클라이언트 SDK
│   │   ├── admin.ts                  # Admin SDK
│   │   └── auth.ts                   # 인증 헬퍼
│   │
│   ├── golpo/
│   │   ├── client.ts                 # Golpo API 클라이언트
│   │   ├── types.ts                  # TypeScript 타입
│   │   ├── constants.ts              # 스타일/음악/언어 상수
│   │   ├── generate.ts               # 생성 호출
│   │   ├── poll.ts                   # 상태 폴링
│   │   └── upload.ts                 # 파일 업로드
│   │
│   ├── tokens/
│   │   ├── calculator.ts             # 크레딧/가격 계산
│   │   └── transactions.ts           # 트랜잭션 헬퍼
│   │
│   ├── payments/
│   │   ├── toss.ts                   # TossPayments 클라이언트
│   │   └── webhook.ts                # Webhook 검증
│   │
│   ├── hooks/                        # React Hooks
│   │   ├── useAuth.ts
│   │   ├── useTokenBalance.ts
│   │   ├── useVideoGeneration.ts
│   │   └── useJobStatus.ts
│   │
│   └── utils.ts                      # 공통 유틸
│
├── contexts/
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
│
├── public/                           # 정적 파일
│   ├── hero-bg.mp4                   # 배경 영상 (~2-3MB)
│   ├── hero-poster.webp
│   ├── samples/                      # 11개 스타일 샘플
│   │   ├── sketch-classic.webp
│   │   ├── canvas-neon.webp
│   │   └── ...
│   ├── music/                        # 8개 BGM 미리듣기 (15초씩)
│   │   ├── jazz.mp3
│   │   ├── lofi.mp3
│   │   └── ...
│   ├── icons/
│   ├── logo.svg
│   └── favicon.ico
│
├── docs/                             # 프로젝트 문서
│   ├── CORE.md
│   ├── SETUP.md
│   ├── ARCHITECTURE.md
│   ├── API_GOLPO.md
│   ├── PRICING.md
│   ├── DATABASE.md
│   ├── AUTH.md
│   └── DESIGN.md
│
├── functions/                        # Firebase Functions (선택)
│   ├── src/
│   │   ├── index.ts
│   │   ├── webhooks/                 # Toss webhook
│   │   ├── schedules/                # cron jobs
│   │   └── triggers/                 # Firestore triggers
│   ├── package.json
│   └── tsconfig.json
│
├── middleware.ts                     # Next.js 미들웨어 (인증 보호)
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts                # (v4는 선택)
├── components.json                   # shadcn 설정
├── .mcp.json                         # MCP 설정
├── .env.local                        # 환경변수
├── .env.example                      # 예시
├── .gitignore
├── package.json
├── README.md
└── CLAUDE.md                         # Claude Code 컨텍스트
```

---

## 🔄 3. 데이터 흐름 — 영상 생성

```
[1] 사용자 (Client Component)
    ↓ 폼 제출
[2] /api/generate (Server Route)
    ├─ Firebase Auth 토큰 검증
    ├─ Firestore에서 토큰 잔액 확인
    ├─ Golpo API 페이로드 구성
    └─ POST /api/v1/videos/generate
    ↓
[3] Golpo API
    ← { job_id, video_id }
    ↓
[4] /api/generate
    ├─ Firestore에 video doc 생성 (status: 'pending')
    ├─ 토큰 차감 (트랜잭션)
    └─ 클라이언트에 jobId 반환
    ↓
[5] 클라이언트 (useJobStatus 훅)
    ├─ 5초마다 GET /api/status/{jobId}
    ↓
[6] /api/status/{jobId}
    └─ GET Golpo /api/v1/videos/status/{job_id}
    ↓
[7] status === 'completed'
    ├─ Firestore의 video doc 업데이트 (videoUrl, thumbnailUrl)
    └─ 클라이언트에 완료 알림
    ↓
[8] 사용자에게 영상 표시
```

---

## 🎬 4. 컴포넌트 트리 (영상 생성 페이지)

```
<CreatePage>
  └─ <CreateForm>
       ├─ <InputModeTab>
       │    ├─ <PromptInput />          (탭 1)
       │    ├─ <ScriptInput />          (탭 2)
       │    └─ <DocumentUpload />       (탭 3)
       │
       ├─ <Section title="영상 설정">
       │    ├─ <DurationSelector />     (15초~10분)
       │    └─ <AspectRatioToggle />    (가로/세로)
       │
       ├─ <Section title="스타일">
       │    └─ <StyleSelector>
       │         ├─ <Tab "Sketch" />    (3종)
       │         └─ <Tab "Canvas" />    (8종)
       │
       ├─ <Section title="음성 & 음악">
       │    ├─ <VoiceSelector />        (4종)
       │    ├─ <LanguageSelector />     (44개)
       │    └─ <MusicPicker />          (8종 미리듣기)
       │
       ├─ <Section title="추가 옵션">
       │    ├─ <VoiceInstructions />   (선택)
       │    └─ <VideoInstructions />   (선택)
       │
       └─ <FooterBar>
            ├─ <CreditEstimator />     (실시간 표시)
            └─ <SubmitButton />
  
  {/* 생성 중일 때 */}
  └─ <GeneratingScreen jobId={jobId} />
       └─ uses useJobStatus(jobId)
```

---

## 🔌 5. API Routes 명세

| 경로 | 메서드 | 설명 | 인증 |
|---|---|---|---|
| `/api/generate` | POST | 영상 생성 작업 시작 | ✅ |
| `/api/status/[jobId]` | GET | 작업 상태 폴링 | ✅ |
| `/api/upload` | POST | PDF/이미지/오디오 업로드 | ✅ |
| `/api/auth/session` | POST | 세션 쿠키 생성 | - |
| `/api/auth/session` | DELETE | 세션 쿠키 삭제 | ✅ |
| `/api/user/balance` | GET | 토큰 잔액 조회 | ✅ |
| `/api/payments/confirm` | POST | 결제 검증 | ✅ |
| `/api/payments/webhook` | POST | Toss webhook | 서명 검증 |

### 표준 응답 형식

#### 성공
```json
{ 
  "success": true, 
  "data": { ... } 
}
```

#### 에러
```json
{ 
  "success": false, 
  "error": { 
    "code": "INSUFFICIENT_TOKENS", 
    "message": "토큰이 부족합니다." 
  } 
}
```

---

## 🪝 6. 주요 React Hooks

### `useAuth`
```typescript
const { user, loading } = useAuth();
// user: Firebase User | null
```

### `useTokenBalance`
```typescript
const { balance, refresh } = useTokenBalance();
// 실시간 (onSnapshot)
```

### `useVideoGeneration`
```typescript
const { generate, isGenerating, jobId } = useVideoGeneration();
await generate({ prompt, timing, ... });
```

### `useJobStatus`
```typescript
const { status, progress, videoUrl } = useJobStatus(jobId);
// 자동 폴링 (5초 → 30초 backoff)
```

---

## 📦 7. 상태 관리

### 글로벌 상태 (Context)
- `AuthContext`: 현재 로그인 사용자
- `ThemeContext`: 다크모드 (선택)

### 서버 상태 (TanStack Query / SWR — 선택)
- 토큰 잔액
- 영상 목록
- 결제 내역

### 폼 상태 (React Hook Form + Zod)
- 영상 생성 폼
- 회원가입 폼

```typescript
// 예시: 영상 생성 폼
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const generateSchema = z.object({
  prompt: z.string().min(5, '5자 이상 입력해주세요').optional(),
  newScript: z.string().optional(),
  timing: z.enum(['0.25', '0.5', '1', '2', '4', '8', '10']),
  videoType: z.enum(['long', 'short']),
  // ...
}).refine(data => data.prompt || data.newScript, {
  message: '프롬프트 또는 원고가 필요합니다',
});

const form = useForm({
  resolver: zodResolver(generateSchema),
});
```

---

## ⚡ 8. 성능 최적화 전략

### 페이지 단위
- **Static**: 메인, 가격, 약관 등 → `force-static`
- **SSR**: 마이페이지 (사용자 데이터)
- **CSR**: 영상 생성 페이지 (인터랙션 많음)

### 이미지
- `next/image` 사용 → WebP 자동 변환
- 샘플 갤러리: lazy loading + blur placeholder
- 백그라운드 영상: poster image 우선 표시

### 영상 폴링 최적화
- 클라이언트에서만 폴링 (불필요한 서버 부하 X)
- 탭 비활성 시 폴링 중단 (`document.visibilityState`)
- 완료 시 즉시 unsubscribe

### 코드 분할
- 무거운 컴포넌트는 `dynamic import`
  ```typescript
  const HeavyEditor = dynamic(() => import('./HeavyEditor'), { 
    ssr: false,
    loading: () => <Skeleton /> 
  });
  ```

### Vercel Edge
- API Routes 중 인증/검증 단순한 것은 Edge Runtime으로
  ```typescript
  export const runtime = 'edge';
  ```

---

## 🔍 9. 모니터링 & 로깅

### 클라이언트
- Vercel Analytics (자동)
- Sentry (선택, 에러 추적)

### 서버
- Vercel Logs (자동)
- Firebase Functions logs

### 비즈니스 메트릭 (Firestore에 기록)
```typescript
// 영상 생성 시도/성공/실패 카운터
db.collection('metrics').doc(`${date}-generates`).set({
  attempted: increment(1),
  succeeded: increment(success ? 1 : 0),
  failed: increment(success ? 0 : 1),
}, { merge: true });
```

---

## 🚀 10. 배포 흐름

```
[로컬 개발] git push origin main
    ↓
[Vercel] 자동 빌드 + 미리보기 URL 생성
    ↓
[QA] 미리보기에서 테스트
    ↓
[Merge to main] → Production 배포
    ↓
[Vercel Production] banjak.app
```

### Vercel 환경변수 분리
- Development: `localhost`용
- Preview: PR 미리보기용
- Production: 본 서비스용

---

## 🛠️ 11. 개발 워크플로우

### 새 기능 개발
```
1. 브랜치 생성: feat/feature-name
2. CLAUDE.md에 컨텍스트 추가
3. Claude Code로 구현
4. 로컬 테스트 (npm run dev)
5. PR → Vercel 미리보기 자동 생성
6. 코드 리뷰 (Self 또는 팀)
7. Merge → 자동 배포
```

### CLAUDE.md 활용
프로젝트 루트의 `CLAUDE.md`에 다음 작성 → Claude Code가 매번 자동 참조:

```markdown
# CLAUDE.md

## 프로젝트 개요
- Stack: Next.js 15 + Tailwind v4 + shadcn + Firebase + Vercel
- 목표: Golpo API 기반 AI 영상 생성 SaaS

## 코드 규칙
- 함수형 React, 커스텀 훅 분리
- TypeScript strict
- 에러는 toast로 사용자 알림
- Firebase Admin SDK는 서버에서만

## 디자인
- 파스텔 톤 (DESIGN.md 참고)
- 모서리 둥글게 (rounded-2xl 이상)
- 부드러운 그림자

## 작업 시 참고 문서
- 기능 추가: CORE.md
- API 호출: API_GOLPO.md
- 가격: PRICING.md
- DB: DATABASE.md
- 인증: AUTH.md
```

---

## 📚 12. 참고

- Next.js 15 App Router: https://nextjs.org/docs/app
- shadcn/ui: https://ui.shadcn.com
- Firebase 통합 패턴: https://firebase.google.com/docs/web/setup
- Vercel 배포: https://vercel.com/docs/frameworks/nextjs
