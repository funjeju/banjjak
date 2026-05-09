# CLAUDE.md

> 이 파일은 Claude Code가 프로젝트 작업 시 자동으로 참조하는 **컨텍스트 파일**입니다.
> 새로운 작업을 시작할 때마다 Claude는 이 파일을 먼저 읽습니다.

---

## 🎯 프로젝트 개요

**Banjak (반짝)** — AI 영상 생성 SaaS

- **브랜드 의미**: 한국어 "반짝" = "in a flash, sparkling"
- **태그라인**: "반짝, 영상 완성" / "Make videos in a Banjak"
- **Stack**: Next.js 15 + React 19 + TypeScript + Tailwind v4 + shadcn/ui + Firebase + Vercel
- **외부 API**: Golpo API (영상 생성)
- **결제**: 🔶 추후 결정 (Phase 4 진입 전 — TossPayments / Stripe / 포트원 중 선택)
- **타겟**: 한국 우선 → 글로벌 확장 (K-flavor 브랜드 포지셔닝)
- **노출 통화**: KRW 단일 (글로벌 확장 시 USD 추가)
- **수익 모델**: 토큰 단건 + 월 구독 (2x 토큰 + 5% 할인)
- **레퍼런스 디자인**: ByteDance Dreamina (파스텔, 풀스크린 영상 배경)

---

## 📚 작업 전 반드시 참조할 문서

| 작업 종류 | 참조 문서 |
|---|---|
| **신규 기능 추가** | `docs/CORE.md` |
| **설치/세팅 문제** | `docs/SETUP.md` |
| **폴더/컴포넌트 구조** | `docs/ARCHITECTURE.md` |
| **Golpo API 연동** | `docs/API_GOLPO.md` |
| **가격/토큰/구독** | `docs/PRICING.md` |
| **Firestore DB** | `docs/DATABASE.md` |
| **로그인/인증** | `docs/AUTH.md` |
| **UI 디자인** | `docs/DESIGN.md` |

---

## 🛠️ 코드 규칙

### TypeScript
- `strict: true` 유지
- `any` 사용 금지 (불가피하면 `unknown` 후 narrow)
- 함수 시그니처에 명시적 반환 타입

### React
- **함수형 컴포넌트만** 사용
- **'use client' 지시어**는 필요한 경우만 (서버 컴포넌트 우선)
- 상태/이벤트 로직은 **커스텀 훅**으로 분리 (`lib/hooks/`)
- Props는 interface로 정의

### 파일 명명
- 컴포넌트: PascalCase (`VideoCard.tsx`)
- 훅: camelCase (`useAuth.ts`)
- 유틸: kebab-case (`format-date.ts`)
- 페이지: `page.tsx`, 레이아웃: `layout.tsx`

### Import 순서
```typescript
// 1. React / Next
import { useState } from 'react';
import Image from 'next/image';

// 2. 외부 라이브러리
import { motion } from 'framer-motion';

// 3. 내부 lib
import { auth } from '@/lib/firebase/client';

// 4. 컴포넌트
import { Button } from '@/components/ui/button';

// 5. 타입
import type { Video } from '@/lib/golpo/types';
```

---

## 🎨 디자인 시스템

### 컬러 (파스텔)
- Primary: `#FFB5D8` (핑크)
- Secondary: `#B8A9FF` (라벤더)
- Accent: `#A8E6CF` (민트)
- BG: `#FFFCF7` (크림)
- Text: `#3D3654` (짙은 보라)

### 컴포넌트 스타일
- 모서리: 카드 `rounded-3xl`, 입력 `rounded-2xl`, 버튼 `rounded-full`
- 그림자: 부드럽고 보라톤 (`shadow-[0_4px_24px_rgba(184,169,255,0.08)]`)
- 호버: 살짝 확대 (`hover:scale-105`) + 그림자 강화
- 트랜지션: 모든 인터랙션 `transition-all duration-200`

### 아이콘
- `lucide-react` 사용 (shadcn 기본)

---

## 🔐 보안 원칙

### 절대 클라이언트 노출 금지
- `GOLPO_API_KEY` (서버 API Routes에서만)
- `TOSS_SECRET_KEY`
- `FIREBASE_PRIVATE_KEY`

### Firestore 접근
- 클라이언트는 **읽기 전용** + 본인 데이터만
- 토큰 잔액 변경 / 영상 생성은 **반드시 서버 API Routes 경유**
- 보안 규칙은 `firestore.rules`에 명시

### API Route 패턴
```typescript
export async function POST(req: Request) {
  // 1. 인증 확인
  const decoded = await verifyAuth(req);
  if (!decoded) return unauthorized();
  
  // 2. 입력 검증 (Zod)
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return badRequest();
  
  // 3. 권한/잔액 확인
  // ...
  
  // 4. 트랜잭션으로 처리
  await db.runTransaction(async (tx) => { ... });
  
  return Response.json({ success: true, data });
}
```

---

## 🎬 Golpo API 연동 핵심 규칙

### 페이로드 필수 사항
- `prompt` 또는 `new_script` 둘 중 하나 필수
- `timing`: 0.25, 0.5, 1, 2, 4, 8, 10 중 하나
- `video_type`: 'long' 또는 'short'
- `language`: 'ko' (기본)

### Sketch vs Canvas (둘 중 하나만!)
```typescript
// Sketch
{ use_lineart_2_style: 'false' | 'true' | 'advanced' }

// Canvas
{ 
  use_2_0_style: true,
  image_style: 'modern_minimal' | 'neon' | ... 
}

// ❌ 둘 다 동시 사용 금지
```

### 폴링 패턴
- 5초 간격 시작 → 30초까지 지수 backoff
- 최대 60회 시도 (약 5분)
- 실패 응답에 `detail` 필드 확인

---

## 💰 가격 시스템 핵심

### 환산
- $1 = 1,400원 (`USD_TO_KRW` 상수)
- 1분 영상 원가 = $2 = 2,800원
- 1 토큰 = 6,000원 (단건)

### 토큰 차감 시 항상 트랜잭션
```typescript
await db.runTransaction(async (tx) => {
  // 1. 현재 잔액 읽기
  // 2. 잔액 충분한지 확인 → 부족하면 throw
  // 3. 잔액 차감
  // 4. transactions 컬렉션에 로그 기록
});
```

---

## 🔄 자주 쓰는 명령어

### 개발
```powershell
npm run dev          # 로컬 서버
npm run build        # 빌드
npm run lint         # 린트
```

### shadcn 컴포넌트 추가
```powershell
npx shadcn@latest add [component-name]
# 또는 MCP로: "shadcn에서 dialog 컴포넌트 추가해줘"
```

### Golpo Skill 테스트
```
"15초 영상으로 광합성을 설명해줘. modern_minimal 스타일."
```

### Firebase 배포
```powershell
firebase deploy --only firestore:rules
firebase deploy --only functions
```

### Vercel 배포
```powershell
vercel --prod
```

---

## 🚦 작업 흐름

### 새 기능 추가 시
1. **`CORE.md` 확인** — 이미 정의된 기능인지
2. **관련 문서 검토** — 어떤 파일/구조가 필요한지
3. **타입 정의 먼저** (`lib/{domain}/types.ts`)
4. **API Route 작성** (서버 로직)
5. **컴포넌트 작성** (UI)
6. **테스트** (로컬 → 미리보기)

### 버그 수정 시
1. 어떤 문서/규칙 위반인지 확인
2. 재현 → 수정 → 테스트
3. 동일 패턴이 다른 곳에도 있는지 검색

---

## 🎯 우선순위

작업 충돌 시:
1. **보안** > 기능 > 디자인 > 성능
2. **서버 사이드 처리** > 클라이언트 처리
3. **Firestore 트랜잭션** > 단발 쓰기
4. **타입 안전성** > 코드 간결성

---

## ⚠️ 자주 하는 실수 방지

❌ Golpo API를 클라이언트에서 직접 호출
✅ `/api/generate` 등 Server Route 경유

❌ 토큰 잔액을 클라이언트에서 직접 차감
✅ Firestore 트랜잭션 (서버)

❌ `localStorage`로 인증 토큰 저장
✅ Firebase Auth + httpOnly 세션 쿠키

❌ Sketch + Canvas 동시 활성화
✅ 둘 중 하나만, UI에서 명시적 분리

❌ 영상 mp4 파일을 자체 저장
✅ Golpo URL 사용 (썸네일만 Storage)

❌ 가격 하드코딩
✅ `lib/tokens/calculator.ts`에 중앙화

---

## 📌 현재 진행 상황

(작업 중에 업데이트)

- [x] 프로젝트 초기 세팅
- [x] 문서화 (docs/)
- [ ] Next.js 프로젝트 생성
- [ ] shadcn 초기화
- [ ] MCP 연결 (shadcn, Firebase)
- [ ] Golpo Skill 설치
- [ ] Firebase Auth 구현
- [ ] 메인 페이지
- [ ] 영상 생성 폼
- [ ] 마이페이지
- [ ] 결제 시스템

---

## 📞 도움이 필요할 때

- 명확하지 않으면 → 사용자에게 질문 (가정 X)
- 외부 라이브러리 사용 시 → 최신 버전 확인
- 에러 발생 시 → docs/SETUP.md 트러블슈팅 섹션 먼저 확인
