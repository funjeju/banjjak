# 🎬 API_GOLPO.md — Golpo API 연동 가이드

> 모든 Golpo API 호출은 **서버 사이드** (Next.js API Routes)에서만 수행. 클라이언트에서 직접 호출 금지.

---

## 🔑 1. 인증

### Headers
```http
x-api-key: YOUR_GOLPO_API_KEY
Content-Type: application/json
```

### Base URL
- API 키 발급 시 함께 제공됨
- `.env.local`의 `GOLPO_BASE_URL`에 저장

### 보안 원칙
- ✅ **서버에서만 사용** (`process.env.GOLPO_API_KEY`)
- ❌ `NEXT_PUBLIC_` 접두사 사용 금지
- ❌ 클라이언트 컴포넌트에서 직접 호출 금지

---

## 📡 2. 엔드포인트

| 메서드 | 경로 | 용도 |
|---|---|---|
| POST | `/api/v1/videos/generate` | 영상 생성 작업 시작 |
| POST | `/api/v1/videos/upload-file` | PDF/이미지/오디오 업로드 |
| GET | `/api/v1/videos/status/{job_id}` | 작업 진행 상태 확인 |
| GET | `/api/v1/videos` | 영상 목록 조회 |
| GET | `/api/v1/videos/{video_id}` | 단일 영상 조회 |
| PATCH | `/api/v1/videos/{video_id}` | 메타데이터 수정 (title, is_public) |
| DELETE | `/api/v1/videos/{video_id}` | 영상 삭제 |

---

## 🎥 3. 영상 생성 (`/generate`)

### 최소 페이로드 (프롬프트 모드)

```json
{
  "prompt": "양자역학에 대해 백과사전식으로 설명해줘",
  "timing": 1,
  "language": "ko",
  "video_type": "long",
  "style": "solo-female-3",
  "bg_music": "engaging",
  "use_2_0_style": true,
  "image_style": "modern_minimal"
}
```

### 원고 모드 (직접 작성한 대본)

```json
{
  "new_script": "양자역학은 미시 세계의 물리 법칙입니다. ...",
  "timing": 1,
  "language": "ko",
  "video_type": "long",
  "style": "solo-male-3"
}
```

> ⚠️ **`new_script` 제약**: 1분당 최대 1,050자 (한글 기준 동일)

### PDF 업로드 모드

1. 먼저 `/upload-file`로 업로드 → `file_url` 받기
2. `upload_urls`에 넣어서 `/generate` 호출

```json
{
  "prompt": "이 보고서를 영상으로 요약해줘",
  "upload_urls": ["https://.../file.pdf"],
  "timing": 2,
  "language": "ko"
}
```

---

## 📋 4. 주요 파라미터 정리

### 4-1. 영상 길이 (`timing`)
| 값 | 길이 | 크레딧 | 원가(KRW, 내부) | 사용자 노출가(KRW) |
|---|---|---|---|---|
| 0.25 | 15초 | 0.5 | 700 | 1,500 |
| 0.5 | 30초 | 1 | 1,400 | 3,000 |
| 1 | 1분 | 2 | 2,800 | 6,000 |
| 2 | 2분 | 4 | 5,600 | 12,000 |
| 4 | 4분 | 8 | 11,200 | 24,000 |
| 8 | 8분 (Beta) | 16 | 22,400 | 48,000 |
| 10 | 10분 (Beta) | 20 | 28,000 | 60,000 |
| `"auto"` | 자동 결정 | 가변 | - | - |

> 환율 기준: $1 = 1,400원 (변동 시 재계산 필요)
> 사용자 UI에는 **KRW만** 표시

### 4-2. 영상 비율 (`video_type`)
| 값 | 비율 | 해상도 | 용도 |
|---|---|---|---|
| `"long"` | 16:9 | 1536×1024 | YouTube, 일반 |
| `"short"` | 9:16 | 1024×1536 | TikTok, Reels, Shorts |

### 4-3. 음성 (`style`)
| 값 | 설명 |
|---|---|
| `"solo-female-3"` (기본) | 여성 1 |
| `"solo-female-4"` | 여성 2 |
| `"solo-male-3"` | 남성 1 |
| `"solo-male-4"` | 남성 2 |

### 4-4. 영상 엔진 — 둘 중 하나만 선택 ⚠️

#### 옵션 A: Golpo Sketch (`use_lineart_2_style`)
```json
{ "use_lineart_2_style": "false" }   // Classic
{ "use_lineart_2_style": "true" }    // Improved
{ "use_lineart_2_style": "advanced" }// Formal
```

#### 옵션 B: Golpo Canvas (`use_2_0_style: true` + `image_style`)
```json
{
  "use_2_0_style": true,
  "image_style": "modern_minimal"  // 8종 중 선택
}
```

`image_style` 값:
- `"chalkboard_white"` — 칠판 (흑백)
- `"neon"` — 네온 칠판
- `"whiteboard"` — 화이트보드
- `"modern_minimal"` — 모던 미니멀
- `"playful"` — 발랄
- `"technical"` — 기술 도식
- `"editorial"` — 에디토리얼
- `"marker"` — 샤피 마커

> ❌ Sketch와 Canvas **동시 사용 금지** (한 번에 하나만)

### 4-5. 배경음악 (`bg_music`) — 8종
```
"jazz" | "lofi" | "whimsical" | "dramatic" |
"engaging" | "hyper" | "inspirational" | "documentary"
```

### 4-6. 언어 (`language`) — 44개 지원
```
"ko" — 한국어 (또는 "korean")
"en" — 영어
"ja" — 일본어
"zh" — 중국어
... 외 40개
```

### 4-7. 디스플레이 언어 (`display_language`)
> Canvas 모드에서만 작동. 나레이션과 화면 텍스트 언어를 분리할 때 사용.

```json
{
  "language": "ko",          // 한국어 나레이션
  "display_language": "en",  // 영어 자막/화면 텍스트
  "use_2_0_style": true
}
```

---

## 🔄 5. 작업 흐름 (Job Flow)

```
1. POST /generate
   ← Response: { job_id, video_id }

2. GET /status/{job_id}  (5초 → 30초 backoff 폴링)
   ← Response: { status: "pending" | "processing" | "completed" | "failed", video_url? }

3. status === "completed" 시
   ← video_url로 mp4 다운로드 또는 사용자에게 표시
```

### 폴링 코드 예시 (TypeScript)

```typescript
// lib/golpo/client.ts
async function pollJobStatus(jobId: string, maxAttempts = 60) {
  let delay = 5000; // 시작 5초
  const maxDelay = 30000; // 최대 30초

  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(
      `${process.env.GOLPO_BASE_URL}/api/v1/videos/status/${jobId}`,
      { headers: { 'x-api-key': process.env.GOLPO_API_KEY! } }
    );
    const data = await res.json();

    if (data.status === 'completed') return data;
    if (data.status === 'failed') throw new Error(data.detail);

    await new Promise((r) => setTimeout(r, delay));
    delay = Math.min(delay * 1.2, maxDelay); // 점진적 증가
  }

  throw new Error('Job timeout');
}
```

---

## 🛡️ 6. Next.js API Route 예시

### `app/api/generate/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { calculateCredits } from '@/lib/tokens/calculator';

export async function POST(req: NextRequest) {
  try {
    // 1. 인증 확인
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;

    // 2. 페이로드 검증
    const body = await req.json();
    const { prompt, new_script, timing, video_type, style, bg_music, ...rest } = body;

    if (!prompt && !new_script) {
      return NextResponse.json({ error: 'prompt or new_script required' }, { status: 400 });
    }

    // 3. 토큰 잔액 확인
    const requiredCredits = calculateCredits(timing);
    const userDoc = await adminDb.collection('users').doc(uid).get();
    const balance = userDoc.data()?.tokenBalance ?? 0;

    if (balance < requiredCredits) {
      return NextResponse.json({ error: 'Insufficient tokens' }, { status: 402 });
    }

    // 4. Golpo API 호출
    const golpoRes = await fetch(
      `${process.env.GOLPO_BASE_URL}/api/v1/videos/generate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.GOLPO_API_KEY!,
        },
        body: JSON.stringify({
          prompt,
          new_script,
          timing,
          video_type,
          style,
          bg_music,
          ...rest,
        }),
      }
    );

    if (!golpoRes.ok) {
      const errorBody = await golpoRes.json();
      return NextResponse.json({ error: errorBody.detail }, { status: golpoRes.status });
    }

    const { job_id, video_id } = await golpoRes.json();

    // 5. Firestore에 작업 기록 + 토큰 차감
    await adminDb.runTransaction(async (tx) => {
      tx.update(adminDb.collection('users').doc(uid), {
        tokenBalance: balance - requiredCredits,
      });
      tx.set(adminDb.collection('videos').doc(video_id), {
        userId: uid,
        jobId: job_id,
        videoId: video_id,
        prompt: prompt || null,
        newScript: new_script || null,
        status: 'pending',
        creditsUsed: requiredCredits,
        params: { timing, video_type, style, bg_music, ...rest },
        createdAt: new Date(),
      });
    });

    return NextResponse.json({ jobId: job_id, videoId: video_id });
  } catch (err: any) {
    console.error('[generate] error', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

---

## ⚠️ 7. 에러 처리

### HTTP 상태 코드
| 코드 | 의미 | 처리 |
|---|---|---|
| 200 | 성공 | 정상 처리 |
| 400 | 잘못된 요청 | 페이로드 검증 |
| 401 | API 키 오류 | 환경변수 재확인 |
| 403 | 요금제 권한 부족 | 사용자에게 안내 |
| 404 | 리소스 없음 | ID 확인 |
| 422 | 검증 실패 | `detail` 필드 확인 |
| 429 | Rate Limit | 지수 백오프 재시도 |
| 500 | 서버 에러 | 재시도 후 알림 |

### 응답 형식

```json
{
  "detail": "Invalid use_lineart_2_style. Supported values: 'true', 'false', 'advanced'."
}
```

---

## 📤 8. 파일 업로드

### 두 단계 흐름

```typescript
// 1. presigned URL 받기
const uploadRes = await fetch(`${BASE_URL}/api/v1/videos/upload-file`, {
  method: 'POST',
  headers: { 'x-api-key': API_KEY },
  body: formData, // multipart/form-data
});
const { upload_url, file_url, content_type } = await uploadRes.json();

// 2. presigned URL에 PUT으로 파일 업로드
await fetch(upload_url, {
  method: 'PUT',
  headers: { 'Content-Type': content_type },
  body: fileBuffer,
});

// 3. /generate에서 file_url 사용
```

### 제약사항
- 최대 파일 크기: **15MB**
- 지원 형식:
  - 문서: PDF, DOCX, PPTX, TXT
  - 오디오: MP3, WAV, M4A, OGG
  - 비디오: MP4, MOV, AVI, MKV
  - 이미지: JPG, PNG, GIF, WEBP
- **문서 URL은 1회용** — 추출 후 삭제됨, 재사용 불가
- 오디오 URL은 영구 사용 가능

---

## 🌟 9. 사용 케이스별 페이로드

### 케이스 1: 신규 가입 무료 샘플 (15초)
```json
{
  "prompt": "{사용자 프롬프트}",
  "timing": 0.25,
  "language": "ko",
  "video_type": "long",
  "style": "solo-female-3",
  "bg_music": "engaging",
  "use_2_0_style": true,
  "image_style": "modern_minimal",
  "include_watermark": false
}
```
원가: **약 700원** | 판매가 환산: **1,500원**

### 케이스 2: 한국어 나레이션 + 영어 자막 (1분)
```json
{
  "prompt": "K-Pop의 글로벌 영향력을 설명해줘",
  "timing": 1,
  "language": "ko",
  "display_language": "en",
  "video_type": "long",
  "style": "solo-female-4",
  "bg_music": "inspirational",
  "use_2_0_style": true,
  "image_style": "editorial"
}
```

### 케이스 3: PDF 보고서 → 4분 요약 영상
```json
{
  "prompt": "이 보고서의 핵심 내용을 4분으로 요약",
  "upload_urls": ["{file_url}"],
  "timing": 4,
  "language": "ko",
  "video_type": "long",
  "style": "solo-male-3",
  "bg_music": "documentary",
  "use_2_0_style": true,
  "image_style": "technical"
}
```

### 케이스 4: 세로형 숏폼 (30초, TikTok용)
```json
{
  "prompt": "오늘의 1분 과학 상식",
  "timing": 0.5,
  "language": "ko",
  "video_type": "short",
  "style": "solo-female-3",
  "bg_music": "hyper",
  "use_2_0_style": true,
  "image_style": "playful",
  "pen_style": "marker"
}
```

---

## 🧪 10. 로컬 테스트

### Claude Code의 Golpo Skill 활용
```
Claude Code에서 자연어로:
"민주주의의 역사를 1분 영상으로 만들어줘. modern_minimal 스타일에 lofi 배경음악으로."
```
→ Skill이 자동으로 API 호출 → mp4 다운로드

### 직접 cURL 테스트 (PowerShell)
```powershell
curl -X POST "https://api.golpoai.com/api/v1/videos/generate" `
  -H "x-api-key: YOUR_KEY" `
  -H "Content-Type: application/json" `
  -d '{\"prompt\": \"테스트\", \"timing\": 0.25, \"language\": \"ko\"}'
```

---

## 📚 11. 참고

- 공식 문서: https://video.golpoai.com/api-docs/endpoints/v1
- Skill GitHub: https://github.com/Golpo-AI/golpo-claude-skill
- 페이로드 예시 6선: https://video.golpoai.com/guide/golpo-ai-video-api-payload-examples
