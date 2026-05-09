# 🚀 SETUP.md — 설치 & 환경 구성 가이드

> Windows + PowerShell 기준. macOS/Linux는 명령어 일부 다름 (각 단계에 표기).

---

## ✅ 사전 요구사항

| 도구 | 최소 버전 | 확인 명령 |
|---|---|---|
| **Node.js** | v18.17 이상 (권장 v20 LTS) | `node -v` |
| **npm** | v10 이상 | `npm -v` |
| **Git** | 최신 | `git --version` |
| **Python** | 3.8+ (Golpo Skill용) | `python --version` |
| **Claude Code** | 최신 | `claude --version` |

---

## 📦 STEP 1: 프로젝트 폴더 생성 + Next.js 15 초기화

### 1-1. 폴더 생성

**PowerShell:**
```powershell
cd $HOME\Documents
mkdir banjak
cd banjak
```

**macOS/Linux:**
```bash
cd ~
mkdir banjak && cd banjak
```

### 1-2. Next.js 15 최신 버전 설치

```powershell
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```

설치 중 질문 답변:
- ✅ Would you like to use ESLint? → **Yes**
- ✅ Would you like to use Turbopack? → **Yes**
- ✅ Would you like to customize the import alias (@/*)? → **No**

> 💡 이 명령어 하나로 Next.js 15 + React 19 + TypeScript + Tailwind v4가 한 번에 설치됩니다.

### 1-3. 설치 확인

```powershell
npm run dev
```
→ http://localhost:3000 접속해서 Next.js 시작 페이지 확인 → Ctrl+C 종료

---

## 🎨 STEP 2: shadcn/ui 초기화

### 2-1. shadcn CLI 실행

```powershell
npx shadcn@latest init
```

옵션 선택:
- Style → **Default** (또는 New York)
- Base color → **Slate** (또는 Zinc)
- CSS variables → **Yes**

> ⚠️ **에러 발생 시** (ERESOLVE peer dependency):
> ```powershell
> npx shadcn@latest init --legacy-peer-deps
> ```
> Next.js 15 + React 19 환경에서 자주 발생하는 이슈. `--legacy-peer-deps` 플래그로 해결.

### 2-2. 기본 컴포넌트 설치

```powershell
npx shadcn@latest add button card input label select textarea radio-group tabs dialog form toast separator avatar dropdown-menu scroll-area sheet skeleton sonner badge progress
```

설치 후 `components/ui/` 폴더 확인.

---

## 🔌 STEP 3: MCP 연결

### 3-1. shadcn MCP 추가 (Jpisnice 버전 - 가장 인기)

**GitHub Personal Access Token 발급 (선택)**:
- https://github.com/settings/tokens 에서 발급 (rate limit 5,000/h)
- 발급 안 해도 60/h로 동작은 함

**Claude Code 안에서**:
```bash
claude mcp add shadcn -- bunx -y @jpisnice/shadcn-ui-mcp-server --github-api-key ghp_YOUR_TOKEN
```

토큰 없이 사용:
```bash
claude mcp add shadcn -- bunx -y @jpisnice/shadcn-ui-mcp-server
```

### 3-2. 또는 공식 shadcn MCP (`.mcp.json`에 추가)

프로젝트 루트에 `.mcp.json` 파일 생성:

```json
{
  "mcpServers": {
    "shadcn": {
      "command": "npx",
      "args": ["-y", "shadcn@latest", "mcp"]
    }
  }
}
```

### 3-3. Firebase MCP 추가

`.mcp.json`에 추가:

```json
{
  "mcpServers": {
    "firebase": {
      "command": "npx",
      "args": ["-y", "@gannonh/firebase-mcp"],
      "env": {
        "SERVICE_ACCOUNT_KEY_PATH": "./firebase-key.json",
        "FIREBASE_STORAGE_BUCKET": "banjak.appspot.com"
      }
    }
  }
}
```

> 🔐 `firebase-key.json`은 Firebase Console → 프로젝트 설정 → 서비스 계정 → "새 비공개 키 생성"에서 다운로드.
> **반드시 `.gitignore`에 추가** (절대 커밋 X)

### 3-4. MCP 연결 확인

Claude Code 재시작 후:
```
/mcp
```
→ shadcn ● connected, firebase ● connected 가 보여야 함

---

## 🎬 STEP 4: Golpo Skill 설치

### 4-1. Skill 설치 (Claude Code 내부에서)

```
/plugin marketplace add Golpo-AI/golpo-claude-skill
/plugin install golpo@GolpoSkill
```

> ⚠️ 대소문자 구분: `golpo` (플러그인) / `GolpoSkill` (마켓플레이스)

### 4-2. Python `requests` 라이브러리 설치

```powershell
pip install --user requests
```

### 4-3. Golpo API 키 발급

1. https://video.golpoai.com/api-docs 접속
2. **API-Only Tier** 구매 ($200 = 200 크레딧, 약 28만원)
3. 대시보드에서 API 키 + Base URL 복사
4. `.env.local`에 저장:
   ```
   GOLPO_API_KEY=your_key_here
   GOLPO_BASE_URL=https://api.golpoai.com
   ```

### 4-4. Skill 첫 실행 테스트

Claude Code에서:
```
"하늘이 파란 이유를 15초 영상으로 만들어줘"
```
→ API 키 입력 요청 → 입력 후 영상 자동 생성 → `~/Golpo/videos/`에 mp4 저장

---

## 🔥 STEP 5: Firebase 프로젝트 연결

### 5-1. Firebase CLI 설치

```powershell
npm install -g firebase-tools
firebase login
```

### 5-2. Firebase 프로젝트 생성

1. https://console.firebase.google.com 접속
2. "프로젝트 추가" → 이름: `banjak`
3. **사용 설정할 서비스**:
   - ✅ Authentication (Google + Email/Password)
   - ✅ Firestore Database (Native mode, asia-northeast3 = 서울)
   - ✅ Storage (asia-northeast3)
   - ✅ Functions (Blaze 플랜 필요 — 종량제, 무료 티어 큼)

### 5-3. 프로젝트 초기화

```powershell
firebase init
```

선택:
- ✅ Firestore
- ✅ Functions (TypeScript, ESLint Yes)
- ✅ Storage
- ✅ Hosting (선택, Vercel 쓸거면 스킵)

### 5-4. Firebase SDK 설치

```powershell
npm install firebase firebase-admin
```

### 5-5. 환경변수 설정

Firebase Console → 프로젝트 설정 → 일반 → 웹 앱 추가 → SDK 설정 복사

`.env.local`에 추가:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=banjak.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=banjak
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=banjak.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### 5-6. Auth 활성화

Firebase Console → Authentication → 시작하기:
- ✅ **Google** 활성화 (지원 이메일 입력)
- ✅ **이메일/비밀번호** 활성화
- (선택) 이메일 링크 로그인

---

## ▲ STEP 6: Vercel 연결

### 6-1. Vercel CLI 설치

```powershell
npm install -g vercel
vercel login
```

### 6-2. 프로젝트 연결

```powershell
vercel link
```
→ 새 프로젝트 생성 또는 기존 프로젝트 연결

### 6-3. 환경변수 동기화

`.env.local`의 모든 변수를 Vercel 대시보드 → Settings → Environment Variables 에 복사

또는 CLI로:
```powershell
vercel env pull .env.local
```

### 6-4. 첫 배포 (선택, 나중에)

```powershell
vercel --prod
```

---

## 📁 STEP 7: 디렉토리 구조 생성

Claude Code에 다음 프롬프트 입력:

```
다음 폴더 구조를 만들어줘:

app/
├── (auth)/sign-in/page.tsx
├── (auth)/sign-up/page.tsx
├── (main)/page.tsx (메인)
├── (main)/create/page.tsx
├── (main)/dashboard/page.tsx
├── (main)/pricing/page.tsx
└── api/
    ├── generate/route.ts
    ├── status/[jobId]/route.ts
    └── upload/route.ts

components/
├── home/
├── create/
└── dashboard/

lib/
├── firebase/client.ts
├── firebase/admin.ts
├── golpo/client.ts
├── golpo/types.ts
├── golpo/constants.ts
└── tokens/calculator.ts

각 파일은 빈 export {}; 만 넣어서 placeholder로 만들어줘.
```

---

## ✔️ STEP 8: 최종 확인

### 8-1. 의존성 점검

```powershell
npm install
npm run build
```

빌드 성공 → 모든 세팅 OK ✅

### 8-2. Git 초기 커밋

```powershell
git init
git add .
git commit -m "chore: initial project setup with Next.js 15 + Tailwind v4 + shadcn + Firebase"
```

### 8-3. `.gitignore` 확인

다음 항목들이 포함되어야 함:
```
.env*
firebase-key.json
node_modules/
.next/
.vercel
~/Golpo/
```

---

## 🆘 트러블슈팅

### ❌ `create-next-app` 실패
```powershell
npm cache clean --force
npx create-next-app@latest . --typescript --tailwind --app
```

### ❌ shadcn init 시 ERESOLVE 에러
```powershell
npx shadcn@latest init --legacy-peer-deps
```

### ❌ Tailwind v4 설정 안 됨
`app/globals.css` 첫 줄 확인:
```css
@import "tailwindcss";
```
(v4는 `@tailwind base/components/utilities` 안 씀)

### ❌ MCP 연결 실패
```
/mcp
```
→ status가 `pending`이면 Claude Code 완전 재시작

### ❌ 한글 깨짐 (PowerShell)
```powershell
chcp 65001
```

---

## 📌 다음 단계

세팅 완료 후 → `ARCHITECTURE.md`로 이동해서 코드 작성 시작
