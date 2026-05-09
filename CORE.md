# 🎬 Banjak — AI 영상 생성 플랫폼

> **CORE 문서** — 이 문서는 프로젝트의 마스터 청사진입니다. 모든 docs는 이 문서를 기준으로 작동합니다.

---

## 📌 1. 프로젝트 개요

| 항목 | 내용 |
| --- | --- |
| **사이트명** | Banjak (임시) |
| **카테고리** | AI 영상 생성 SaaS |
| **타겟 유저** | 콘텐츠 크리에이터, 교육자, 마케터, 1인 사업자 |
| **핵심 가치 제안** | "프롬프트 한 줄 → 화이트보드 애니메이션 영상 1분 안에" |
| **수익 모델** | 토큰 단건 구매 + 월간 구독 (2배 토큰 + 5% 할인) |
| **결제 시스템** | 🔶 추후 결정 (후보: 토스페이먼츠 / 스트라이프 / 카카오페이) |
| **노출 통화** | KRW 단일 (한국 타겟 우선, 글로벌 확장 시 USD 추가) |
| **레퍼런스 디자인** | ByteDance Dreamina (파스텔 톤, 풀스크린 영상 배경) |

---

## 🛠️ 2. 기술 스택

### Frontend
- **Next.js 15** (App Router, TypeScript, Turbopack)
- **React 19**
- **Tailwind CSS v4** (inline theming, no config 파일)
- **shadcn/ui** (UI 컴포넌트)
- **next-themes** (다크모드)
- **Framer Motion** (애니메이션, 선택)

### Backend & Infra
- **Firebase**
  - Auth (Google + Email/Password)
  - Firestore (사용자, 영상 메타데이터, 토큰 잔액)
  - Storage (사용자 업로드 임시 저장, 썸네일)
  - Functions (서버리스 백엔드, API 키 보호)
- **Vercel** (Next.js 호스팅, Edge Functions)
- **Golpo API** (영상 생성 엔진)
- **결제 시스템** 🔶 **추후 결정** (Phase 4 진입 전 확정)
  - 후보 1: TossPayments (한국 우선, 카카오페이/네이버페이 통합)
  - 후보 2: Stripe (글로벌 확장 시 자연스러움)
  - 후보 3: 카카오페이 + 네이버페이 직접 연동

### MCP & Skills (개발 도구)
- **shadcn MCP** (UI 컴포넌트 자동 설치)
- **Firebase MCP** (Firestore 스키마 자동 생성)
- **Vercel MCP** (배포 자동화, 선택)
- **Golpo Skill** (Claude Code에서 영상 테스트 생성)

---

## 🎯 3. 핵심 기능 요약

### 3-1. 메인 페이지 (`/`)
- **풀스크린 백그라운드 영상**: Golpo로 생성한 데모 영상 (저용량 mp4, 자동 재생/음소거/루프)
- **파스텔 톤** UI (소프트 핑크, 라벤더, 민트, 크림)
- **메인 히어로 카피**: "프롬프트 한 줄로 만드는 AI 영상"
- **CTA 버튼**: "나도 제작해보기" → `/create` 페이지로 이동
- **샘플 갤러리**: Golpo 11개 스타일 + 8개 음악 미리보기

### 3-2. 회원가입 / 로그인 (`/auth`)
- **Google OAuth** (1-click)
- **Email + Password** (이메일 인증 포함)
- 신규 가입 시: **15초 샘플 영상 1회 무료 생성권 지급**

### 3-3. 영상 생성 (`/create`)
- **입력 방식 탭**: 프롬프트 / 직접 원고 / PDF·DOCX 업로드
- **영상 길이**: 15초 / 30초 / 1분 / 2분 / 4분 / 8분(베타) / 10분(베타)
- **영상 비율**: 가로 16:9 (1536×1024) / 세로 9:16 (1024×1536)
- **스타일 선택** (총 11종, 갤러리 형태):
  - Sketch 3종: Classic / Improved / Formal
  - Canvas 8종: Chalkboard B&W, 네온, 화이트보드, 모던 미니멀, Playful, Technical, Editorial, Sharpie
- **음성 선택** (4종): 여성1·2 / 남성1·2 (미리듣기)
- **언어 선택** (44개): 한국어 기본
- **배경음악** (8종, 미리듣기): jazz / lofi / whimsical / dramatic / engaging / hyper / inspirational / documentary
- **실시간 크레딧 계산** 표시
- **생성 진행률** 표시 (폴링 5초 → 30초 backoff)

### 3-4. 마이페이지 (`/dashboard`)
- 프로필 + 토큰 잔액 / 구독 상태
- **영상 히스토리**: 프롬프트 + 썸네일만 저장 (영상 파일은 Golpo 호스팅 URL 링크)
- 영상 다운로드, 재공개/비공개 토글, 삭제
- 결제 내역, 구독 관리

### 3-5. 요금제 페이지 (`/pricing`)
- 토큰 단건 구매 + 월간 구독 비교
- 자세한 내용은 `PRICING.md` 참고

---

## 🔄 4. 데이터 흐름 (영상 생성)

```
[사용자] 폼 작성 + "생성" 클릭
   ↓
[Next.js Client] → POST /api/generate
   ↓
[Next.js Server (API Route)]
   ├─ Firebase Auth로 사용자 인증
   ├─ Firestore에서 토큰 잔액 확인
   ├─ 잔액 부족 → 결제 페이지 리다이렉트
   └─ 잔액 충분 → 진행
   ↓
[Golpo API] POST /api/v1/videos/generate
   ← job_id 반환
   ↓
[Firestore] 영상 작업 저장 (status: pending)
   ↓
[Client] job_id로 status 폴링 시작
   ↓
[Next.js API] GET /api/status/{job_id}
   ↓
[Golpo API] GET /api/v1/videos/status/{job_id}
   ← 상태 반환 (pending / processing / completed)
   ↓
[완료 시]
   ├─ Firestore에 video_url, thumbnail 저장
   ├─ 사용자 토큰 차감
   └─ 클라이언트에 영상 URL 전달
```

> 자세한 API 흐름은 `API_GOLPO.md` 참고

---

## 🎨 5. 디자인 시스템 (한 눈에)

### 컬러 팔레트 (파스텔)
```
Primary:    #FFD6E8 (소프트 핑크)
Secondary:  #C9B6FF (라벤더)
Accent:     #B5EAD7 (민트)
Background: #FFF9F0 (크림)
Text:       #4A4A4A (소프트 차콜)
Muted:      #E8E8F4 (라이트 그레이)
```

### 타이포그래피
- 헤딩: `Pretendard` 또는 `Inter` (영문)
- 본문: `Pretendard`
- 모노: `JetBrains Mono` (코드 표시)

> 자세한 디자인 가이드는 `DESIGN.md` 참고

---

## 💰 6. 가격 모델 요약

### 원가 기준
- Golpo: 1분 영상 = $2 (약 2,800원)
- 마진율: 2배

### 토큰 (단건 구매)
- 1 토큰 = 1분 영상
- **1 토큰 = 6,000원**

### 월간 구독 (구독자 = 토큰 2배 + 5% 할인)
| 플랜 | 월 구독료 | 토큰 | 단건 환산 가치 |
|---|---|---|---|
| Light | 28,500원 | 10 토큰 | 60,000원 (52% 할인) |
| Standard | 85,500원 | 30 토큰 | 180,000원 |
| Pro | 285,000원 | 100 토큰 | 600,000원 |

> 자세한 계산 근거는 `PRICING.md` 참고

---

## 📂 7. 폴더 구조 (목표)

```
banjak/
├── app/
│   ├── (auth)/              # 회원가입/로그인 그룹
│   │   ├── sign-in/page.tsx
│   │   └── sign-up/page.tsx
│   ├── (main)/
│   │   ├── page.tsx         # 메인 (랜딩)
│   │   ├── create/page.tsx  # 영상 생성
│   │   ├── dashboard/page.tsx  # 마이페이지
│   │   └── pricing/page.tsx
│   ├── api/
│   │   ├── generate/route.ts   # Golpo /generate 프록시
│   │   ├── status/route.ts     # Golpo /status 프록시
│   │   ├── upload/route.ts     # 파일 업로드 프록시
│   │   ├── webhook/payment/route.ts  # 결제 webhook
│   │   └── auth/[...]/route.ts  # NextAuth (선택)
│   └── layout.tsx
├── components/
│   ├── ui/                  # shadcn 컴포넌트
│   ├── home/                # 메인 페이지 컴포넌트
│   │   ├── HeroSection.tsx
│   │   ├── BackgroundVideo.tsx
│   │   └── StyleGallery.tsx
│   ├── create/              # 생성 폼 컴포넌트
│   │   ├── PromptInput.tsx
│   │   ├── StyleSelector.tsx
│   │   ├── MusicPicker.tsx
│   │   └── DurationSelector.tsx
│   └── dashboard/
├── lib/
│   ├── firebase/
│   │   ├── client.ts        # 클라이언트 SDK
│   │   ├── admin.ts         # Server-side admin SDK
│   │   └── auth.ts          # 인증 헬퍼
│   ├── golpo/
│   │   ├── client.ts        # Golpo API 클라이언트
│   │   ├── types.ts         # 타입 정의
│   │   └── constants.ts     # 스타일/음악/언어 상수
│   ├── tokens/
│   │   └── calculator.ts    # 크레딧 계산 로직
│   └── utils.ts
├── public/
│   ├── samples/             # 11개 스타일 샘플 썸네일
│   └── music/               # 8개 BGM 미리듣기 (15초)
├── docs/                    # 이 문서들
│   ├── CORE.md
│   ├── SETUP.md
│   ├── ARCHITECTURE.md
│   ├── API_GOLPO.md
│   ├── PRICING.md
│   ├── DATABASE.md
│   ├── AUTH.md
│   └── DESIGN.md
├── .env.local               # 환경변수
├── .mcp.json                # MCP 설정
├── components.json          # shadcn 설정
├── tsconfig.json
├── next.config.ts
└── package.json
```

> 자세한 구조 설명은 `ARCHITECTURE.md` 참고

---

## 🚦 8. 개발 단계 로드맵

### Phase 1: 인프라 구축 (1~2일)
- ✅ Next.js 15 + Tailwind v4 + shadcn 세팅
- ✅ MCP 연결 (shadcn, Firebase)
- ✅ Golpo Skill 설치
- ✅ Firebase 프로젝트 생성 + 연동
- ✅ Vercel 프로젝트 연결

### Phase 2: 인증 + DB (2~3일)
- 🔲 Firebase Auth (Google + Email)
- 🔲 Firestore 스키마 구성
- 🔲 보호된 라우트 (middleware)

### Phase 3: 영상 생성 핵심 기능 (3~5일)
- 🔲 메인 페이지 (백그라운드 영상)
- 🔲 영상 생성 폼 (스타일 갤러리, 음악 미리듣기)
- 🔲 Golpo API 연동
- 🔲 작업 폴링 + 진행률 표시

### Phase 4: 마이페이지 + 결제 (3~5일)
- 🔲 영상 히스토리 (프롬프트 + 썸네일)
- 🔲 토큰 잔액/구독 상태 표시
- 🔲 TossPayments 연동
- 🔲 결제 webhook → 토큰 충전

### Phase 5: 마무리 (2~3일)
- 🔲 SEO 메타태그
- 🔲 에러 처리 / 토스트 알림
- 🔲 모바일 반응형 점검
- 🔲 Vercel 배포

---

## 📚 9. 관련 문서

| 문서 | 내용 |
|---|---|
| **`SETUP.md`** | Node.js부터 첫 실행까지 단계별 설치 가이드 |
| **`ARCHITECTURE.md`** | 폴더 구조, 컴포넌트 트리, 데이터 흐름 상세 |
| **`API_GOLPO.md`** | Golpo API 엔드포인트, 페이로드, 에러 처리 |
| **`PRICING.md`** | 토큰/구독 가격 계산 근거, UI 카피 |
| **`DATABASE.md`** | Firestore 컬렉션 스키마, 보안 규칙 |
| **`AUTH.md`** | Firebase Auth 흐름, 미들웨어, 세션 관리 |
| **`DESIGN.md`** | 컬러, 타이포, 컴포넌트, 인터랙션 가이드 |

---

## 🔐 10. 환경변수 (.env.local)

```bash
# === Firebase (Public) ===
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# === Firebase Admin (Server only) ===
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# === Golpo API (Server only - 절대 클라이언트 노출 X) ===
GOLPO_API_KEY=
GOLPO_BASE_URL=

# === 결제 시스템 (서버) - 🔶 추후 결정 ===
# Phase 4 진입 전 결정 후 활성화
# TossPayments 옵션:
# TOSS_SECRET_KEY=
# NEXT_PUBLIC_TOSS_CLIENT_KEY=
# Stripe 옵션:
# STRIPE_SECRET_KEY=
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# === App ===
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## 🚨 11. 보안 체크리스트

- [ ] Golpo API 키는 **절대** 클라이언트에 노출 X (서버 API Route에서만 사용)
- [ ] Firebase 보안 규칙로 Firestore 접근 제어
- [ ] 영상 생성 전 토큰 잔액 서버에서 검증
- [ ] 결제 webhook 서명 검증
- [ ] Rate limiting (사용자당 동시 1개 작업)
- [ ] 업로드 파일 크기 제한 (15MB) + MIME 검증
- [ ] CORS 설정
- [ ] CSP 헤더

---

## 📞 12. 참고 자료

- [Golpo API 문서](https://video.golpoai.com/api-docs/endpoints/v1)
- [Golpo Claude Code Skill](https://github.com/Golpo-AI/golpo-claude-skill)
- [Next.js 15 문서](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Firebase 문서](https://firebase.google.com/docs)
- [Vercel 문서](https://vercel.com/docs)
- [TossPayments 개발자센터](https://docs.tosspayments.com/)
