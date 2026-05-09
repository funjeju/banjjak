# ✨ Banjak — AI Video Generation SaaS

> **반짝, 영상 완성** — 프롬프트 한 줄로 만드는 화이트보드 애니메이션
> Korean for *"in a flash"* — Make videos in a Banjak.
>
> Built on Golpo API · Next.js 15 · Firebase · Vercel

---

## 📚 문서 구조

| # | 문서 | 역할 |
|---|---|---|
| 1 | **[CORE.md](./CORE.md)** | 🏛️ 마스터 청사진. 비전, 기능, 로드맵 |
| 2 | **[SETUP.md](./SETUP.md)** | 🛠️ 설치 단계별 가이드 (Windows/PowerShell) |
| 3 | **[ARCHITECTURE.md](./ARCHITECTURE.md)** | 🏗️ 폴더 구조, 데이터 흐름, 컴포넌트 트리 |
| 4 | **[API_GOLPO.md](./API_GOLPO.md)** | 🎬 Golpo API 엔드포인트, 페이로드, 에러 처리 |
| 5 | **[PRICING.md](./PRICING.md)** | 💰 토큰/구독 가격 모델, 계산 로직 |
| 6 | **[DATABASE.md](./DATABASE.md)** | 🗄️ Firestore 스키마, 보안 규칙 |
| 7 | **[AUTH.md](./AUTH.md)** | 🔐 Firebase Auth (Google + Email) |
| 8 | **[DESIGN.md](./DESIGN.md)** | 🎨 파스텔 톤 디자인 시스템 |
| 9 | **[CLAUDE.md](./CLAUDE.md)** | 🤖 Claude Code 작업 컨텍스트 |

---

## 🚀 30분 안에 시작하기

### 0. 사전 준비 (5분)
```powershell
# Node.js 버전 확인
node -v   # v18.17 이상 필요 (없으면 https://nodejs.org에서 LTS 설치)

# Claude Code 확인
claude --version
```

### 1. 프로젝트 생성 (5분)
```powershell
cd $HOME\Documents
mkdir banjak
cd banjak

npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
# ESLint? Yes / Turbopack? Yes
```

### 2. shadcn 초기화 (3분)
```powershell
npx shadcn@latest init
# 에러 시: npx shadcn@latest init --legacy-peer-deps

npx shadcn@latest add button card input label tabs dialog form toast separator dropdown-menu progress badge
```

### 3. MCP 연결 (5분)
```powershell
# Claude Code 안에서 실행
claude mcp add shadcn -- bunx -y @jpisnice/shadcn-ui-mcp-server
```

`/mcp` 명령으로 연결 확인.

### 4. Golpo Skill 설치 (3분)
```
# Claude Code 안에서
/plugin marketplace add Golpo-AI/golpo-claude-skill
/plugin install golpo@GolpoSkill
```

### 5. Firebase 프로젝트 생성 (5분)
1. https://console.firebase.google.com → 프로젝트 추가
2. Authentication 활성화 (Google + Email)
3. Firestore 생성 (asia-northeast3 = 서울)
4. SDK 구성 복사 → `.env.local`에 저장

### 6. 환경변수 설정 (3분)
프로젝트 루트에 `.env.local` 생성 ([CORE.md](./CORE.md) 참고):
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
GOLPO_API_KEY=...
GOLPO_BASE_URL=...
# (전체 목록은 CORE.md 11번 섹션)
```

### 7. 첫 실행 (1분)
```powershell
npm run dev
```
→ http://localhost:3000 ✅

---

## 🎯 핵심 기능 요약

### 메인 페이지
- 풀스크린 백그라운드 영상 (Golpo 데모, 약 2-3MB)
- 파스텔 톤 (핑크/라벤더/민트)
- "나도 제작해보기" CTA → `/create` 이동

### 회원가입 보너스
- 가입 즉시 **0.25 토큰** (15초 샘플 1회 무료)
- **원가 약 700원** ✅

### 영상 생성
- **입력**: 프롬프트 / 직접 원고 / PDF·DOCX 업로드
- **길이**: 15초 ~ 10분
- **비율**: 가로 16:9 (1536×1024) / 세로 9:16 (1024×1536) ⚠️ 720p는 API 미지원
- **스타일**: Sketch 3종 / Canvas 8종 (총 11종)
- **언어**: 44개 (한국어 기본)
- **음악**: 8종 미리듣기

### 가격 (KRW 단일 노출)
| 항목 | 가격 |
|---|---|
| 1 토큰 (=1분 영상) | 6,000원 |
| 단건 5 토큰 | 30,000원 |
| 구독 Light (10토큰/월) | **28,500원** |
| 구독 Standard (30토큰/월) | 82,650원 |
| 구독 Pro (100토큰/월) | 268,000원 |

> 구독 = 단건 대비 토큰 2배 + 5% 할인 (실질 ~52% 할인)
> 결제 시스템은 **Phase 4 진입 전 결정** (TossPayments / Stripe / 포트원)

### 마이페이지
- 영상 목록 (썸네일 + 프롬프트만 저장)
- mp4는 Golpo 호스팅 URL 사용 (자체 저장 X = 비용 절감)
- 토큰 잔액 + 구독 상태

---

## 🛡️ 보안 핵심

- ❌ Golpo API 키는 **절대** 클라이언트 노출 X
- ✅ 모든 API 호출은 Next.js API Routes 경유
- ✅ Firestore 보안 규칙로 사용자별 격리
- ✅ 토큰 차감은 서버 트랜잭션으로만

---

## ⚠️ 짚고 넘어갈 점

### Golpo API 제약
1. **해상도 직접 설정 불가**: 1536×1024 (가로) / 1024×1536 (세로) 고정
2. **영상 길이 옵션 고정**: 0.25(15초) / 0.5(30초) / 1 / 2 / 4 / 8 / 10분
3. **Sketch + Canvas 동시 사용 X**: 둘 중 하나만
4. **배경음악 커스텀 업로드 X**: 8종 프리셋만 (`bg_music`)
5. **API-Only 진입가**: $200 (약 28만원) 선결제

### Tailwind v4 호환
- shadcn 설치 시 `--legacy-peer-deps` 플래그 필요할 수 있음
- v4는 `tailwind.config.ts` 없이 `@theme` (CSS) 방식

---

## 📞 트러블슈팅

| 문제 | 해결 |
|---|---|
| `create-next-app` 실패 | `npm cache clean --force` 후 재시도 |
| shadcn ERESOLVE 에러 | `--legacy-peer-deps` 플래그 |
| MCP 연결 안 됨 | Claude Code 재시작 + `/mcp` 확인 |
| Firebase Functions 에러 | Blaze 플랜 필요 (종량제) |
| PowerShell 한글 깨짐 | `chcp 65001` |

자세한 내용은 [SETUP.md](./SETUP.md) 트러블슈팅 섹션 참고.

---

## 🗺️ 개발 로드맵 (예상 2-3주)

- **Week 1**: 인프라 + 인증 (Next.js, Firebase, MCP)
- **Week 2**: 영상 생성 핵심 (메인 페이지, 생성 폼, Golpo 연동)
- **Week 3**: 결제 + 마이페이지 + 배포

자세한 내용은 [CORE.md → 8. 개발 단계 로드맵](./CORE.md)

---

## 💡 작업 팁

### Claude Code 활용
프로젝트 루트에 [CLAUDE.md](./CLAUDE.md) 두면 Claude Code가 자동 참조.

작업 예시:
```
"파스텔 톤 메인 페이지 만들어줘. DESIGN.md 참고해서.
 백그라운드 영상은 /public/hero-bg.mp4 사용."
```

```
"Golpo API로 영상 생성하는 API Route 만들어줘. 
 API_GOLPO.md의 케이스 1 (15초 무료 샘플) 기준으로."
```

### Golpo Skill 활용
배경 영상 만들 때 Claude Code에서:
```
"음식 사진 PIZZA 같은 분위기의 15초 백그라운드 영상 
 만들어줘. modern_minimal 스타일, lofi 음악."
```

---

## 📌 다음 단계

1. ✅ 이 문서들 읽기
2. ✅ [SETUP.md](./SETUP.md) 따라 환경 구성
3. ✅ Firebase + Golpo API 키 발급
4. ✅ Claude Code에 `CLAUDE.md` 컨텍스트 등록
5. ✅ "메인 페이지부터 만들어줘" 시작!

---

**Built with**: Next.js 15 · React 19 · Tailwind v4 · shadcn/ui · Firebase · Vercel · Golpo API · TossPayments
