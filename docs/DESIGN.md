# 🎨 DESIGN.md — UI/UX 디자인 시스템

> 레퍼런스: ByteDance Dreamina, Runway, Synthesia
> 톤앤매너: 부드러운 파스텔 + 미니멀 + 친근함 + 신뢰감

---

## 🎨 1. 컬러 팔레트

### 메인 컬러 (파스텔 톤)
| 이름 | HEX | 용도 |
|---|---|---|
| **Primary** | `#FFB5D8` | CTA 버튼, 강조 |
| **Primary Soft** | `#FFD6E8` | 호버, 라이트 배경 |
| **Secondary** | `#B8A9FF` | 라벤더 (보조 액션) |
| **Secondary Soft** | `#D6CCFF` | 라벤더 라이트 |
| **Accent** | `#A8E6CF` | 민트 (성공, 확인) |
| **Accent Soft** | `#C9F0DC` | 민트 라이트 |
| **Warning** | `#FFD3A5` | 피치 (경고) |
| **Error** | `#FFB1A8` | 산호 (에러) |

### 뉴트럴
| 이름 | HEX | 용도 |
|---|---|---|
| **BG Cream** | `#FFFCF7` | 메인 배경 |
| **BG White** | `#FFFFFF` | 카드 배경 |
| **BG Gray** | `#F5F4F8` | 섹션 배경 |
| **Text Dark** | `#3D3654` | 본문 (검정 대신 짙은 보라) |
| **Text Mid** | `#7A7388` | 보조 텍스트 |
| **Text Light** | `#B5AFC2` | placeholder |
| **Border** | `#EAE5F1` | 테두리 |

### Tailwind v4 변수 정의 (`globals.css`)

```css
@import "tailwindcss";

@theme {
  --color-primary: #FFB5D8;
  --color-primary-soft: #FFD6E8;
  --color-secondary: #B8A9FF;
  --color-accent: #A8E6CF;
  --color-bg-cream: #FFFCF7;
  --color-bg-gray: #F5F4F8;
  --color-text-dark: #3D3654;
  --color-text-mid: #7A7388;
  --color-border: #EAE5F1;

  --font-sans: 'Pretendard', 'Inter', system-ui, sans-serif;
  --font-display: 'Pretendard', 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}

:root {
  --background: var(--color-bg-cream);
  --foreground: var(--color-text-dark);
}
```

---

## ✏️ 2. 타이포그래피

### 폰트
- **본문**: `Pretendard` (한글 최적) — `npm install pretendard`
- **영문 디스플레이**: `Inter` 또는 `Cabinet Grotesk`
- **모노**: `JetBrains Mono`

### 크기 스케일 (모바일 우선)
| 토큰 | 크기 | 용도 |
|---|---|---|
| `text-xs` | 12px | 캡션, 메타 |
| `text-sm` | 14px | 보조 텍스트 |
| `text-base` | 16px | 본문 |
| `text-lg` | 18px | 강조 본문 |
| `text-xl` | 20px | 서브 헤딩 |
| `text-2xl` | 24px | H3 |
| `text-3xl` | 30px | H2 |
| `text-4xl` | 36px | H1 (모바일) |
| `text-5xl` | 48px | Hero (데스크톱) |
| `text-6xl` | 60px | Hero 강조 |
| `text-7xl` | 72px | 메가 히어로 |

### 굵기
- 본문: `font-normal` (400)
- 강조: `font-medium` (500)
- 헤딩: `font-semibold` (600)
- 히어로: `font-bold` (700)

---

## 🧩 3. 핵심 컴포넌트 디자인

### 3-1. 버튼

#### Primary (메인 CTA)
```tsx
<Button className="bg-primary text-text-dark hover:bg-primary-soft 
                   rounded-full px-8 py-3 text-base font-medium
                   shadow-soft transition-all hover:scale-105">
  나도 제작해보기
</Button>
```

스타일:
- 모서리: `rounded-full` (완전 둥근)
- 그림자: 부드러운 박스 그림자 `shadow-soft`
- 호버: 1.05배 확대 + 색상 약간 밝게

#### Secondary (보조)
```tsx
<Button variant="outline" 
        className="border-2 border-secondary text-secondary 
                   rounded-full hover:bg-secondary-soft">
  자세히 보기
</Button>
```

#### Ghost (텍스트 버튼)
```tsx
<Button variant="ghost" 
        className="text-text-mid hover:text-text-dark hover:bg-bg-gray">
  취소
</Button>
```

### 3-2. 카드

#### 기본 카드
```tsx
<div className="bg-white rounded-3xl p-6 
                shadow-[0_4px_24px_rgba(184,169,255,0.08)]
                border border-border
                hover:shadow-[0_8px_32px_rgba(184,169,255,0.12)]
                transition-all duration-300">
  {children}
</div>
```

특징:
- 모서리: `rounded-3xl` (24px) — 매우 부드러운 라운드
- 그림자: 보라색 톤 + 매우 부드러움 (8% opacity)
- 호버: 그림자 더 짙게, 살짝 부유

#### 스타일 갤러리 카드
```tsx
<div className="relative rounded-2xl overflow-hidden 
                aspect-video group cursor-pointer">
  <Image src={thumbnail} fill className="object-cover" />
  <div className="absolute inset-0 bg-gradient-to-t 
                  from-black/60 to-transparent
                  opacity-0 group-hover:opacity-100 transition" />
  <span className="absolute bottom-3 left-3 text-white font-medium 
                   opacity-0 group-hover:opacity-100">
    {styleName}
  </span>
</div>
```

### 3-3. 입력 필드

```tsx
<Input 
  className="bg-bg-gray border-0 rounded-2xl px-5 py-4 
             text-base placeholder:text-text-light
             focus:ring-2 focus:ring-primary focus:bg-white" 
/>
```

### 3-4. 라디오 버튼 (영상 길이 선택)

```tsx
<RadioGroup className="grid grid-cols-3 md:grid-cols-7 gap-2">
  {['15초', '30초', '1분', '2분', '4분', '8분', '10분'].map(t => (
    <RadioGroupItem
      value={t}
      className="rounded-2xl border-2 px-4 py-3 cursor-pointer
                 data-[state=checked]:bg-primary-soft 
                 data-[state=checked]:border-primary
                 data-[state=checked]:text-primary
                 hover:bg-bg-gray transition"
    >
      {t}
    </RadioGroupItem>
  ))}
</RadioGroup>
```

---

## 🎬 4. 메인 페이지 레이아웃

### 4-1. Hero 섹션

```tsx
<section className="relative h-screen w-full overflow-hidden">
  {/* 배경 영상 */}
  <video
    autoPlay muted loop playsInline
    className="absolute inset-0 w-full h-full object-cover"
    poster="/hero-poster.webp"
  >
    <source src="/hero-bg.mp4" type="video/mp4" />
  </video>
  
  {/* 파스텔 오버레이 */}
  <div className="absolute inset-0 bg-gradient-to-br 
                  from-primary-soft/60 via-cream/40 to-secondary-soft/60 
                  backdrop-blur-[2px]" />
  
  {/* 컨텐츠 */}
  <div className="relative z-10 flex flex-col items-center justify-center 
                  h-full text-center px-4">
    <span className="px-4 py-1.5 bg-white/80 rounded-full 
                     text-sm font-medium text-text-mid mb-6">
      ✨ AI로 만드는 화이트보드 영상
    </span>
    
    <h1 className="text-5xl md:text-7xl font-bold text-text-dark 
                   leading-tight mb-4">
      프롬프트 한 줄로<br />
      <span className="bg-gradient-to-r from-primary to-secondary 
                       bg-clip-text text-transparent">
        영상이 완성됩니다
      </span>
    </h1>
    
    <p className="text-lg md:text-xl text-text-mid mb-10 max-w-2xl">
      교육, 마케팅, SNS 콘텐츠를 1분 만에. 
      회원가입하면 15초 샘플 영상이 무료예요.
    </p>
    
    <Button size="lg" 
            className="bg-primary hover:bg-primary-soft 
                       rounded-full px-10 py-6 text-lg shadow-xl">
      나도 제작해보기 →
    </Button>
  </div>
</section>
```

### 4-2. 백그라운드 영상 최적화

#### 파일 사양
- 형식: **MP4 (H.264)** — 최대 호환성
- 해상도: **1280×720** (720p) — 데스크톱 최적
- 길이: **15~30초** 루프
- 비트레이트: **800kbps~1.2Mbps** — 용량 < 3MB
- 프레임레이트: 24~30fps
- 음성: **제거** (autoplay 정책)
- 첫 프레임: poster 이미지로 추출 (`hero-poster.webp`)

#### 압축 명령어 (ffmpeg)
```bash
ffmpeg -i original.mp4 \
  -vf "scale=1280:720" \
  -c:v libx264 -crf 28 -preset slow \
  -an \
  -movflags +faststart \
  hero-bg.mp4
```

#### 모바일 대응
```tsx
{/* 모바일에서는 정적 이미지로 대체 */}
<video className="hidden md:block ...">...</video>
<Image src="/hero-poster-mobile.webp" 
       alt="" fill 
       className="md:hidden object-cover" />
```

---

## 🖼️ 5. 영상 생성 페이지 (`/create`)

### 5-1. 레이아웃

```
┌──────────────────────────────────────────────┐
│  [헤더 + 토큰 잔액 표시]                       │
├──────────────────────────────────────────────┤
│                                              │
│  Step 1. 무엇을 만들까요?                     │
│  [ 프롬프트 ] [ 직접 원고 ] [ PDF 업로드 ]    │
│  ┌────────────────────────────────────────┐ │
│  │ 입력 영역 (탭에 따라 변경)              │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  Step 2. 어떻게 만들까요?                     │
│  ┌──────────┐ ┌──────────┐                  │
│  │ 영상 길이 │ │ 비율     │                  │
│  └──────────┘ └──────────┘                  │
│                                              │
│  Step 3. 어떤 스타일?                         │
│  [Sketch 3종] [Canvas 8종] - 갤러리 형태      │
│                                              │
│  Step 4. 음성 & 음악                          │
│  [음성 4종] [언어] [BGM 8종 미리듣기]         │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │ 💰 예상 사용 토큰: 1 토큰 (6,000원)     │ │
│  │ [    영상 생성 시작    ]                │ │
│  └────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

### 5-2. 스타일 갤러리 컴포넌트

```tsx
<Tabs defaultValue="sketch">
  <TabsList className="bg-bg-gray rounded-full p-1">
    <TabsTrigger value="sketch" 
                 className="rounded-full px-6 
                            data-[state=active]:bg-white">
      🖋️ Sketch (화이트보드)
    </TabsTrigger>
    <TabsTrigger value="canvas" 
                 className="rounded-full px-6
                            data-[state=active]:bg-white">
      🎨 Canvas (다양한 스타일)
    </TabsTrigger>
  </TabsList>
  
  <TabsContent value="sketch">
    <div className="grid grid-cols-3 gap-4 mt-6">
      {sketchStyles.map(s => <StyleCard key={s.id} {...s} />)}
    </div>
  </TabsContent>
  
  <TabsContent value="canvas">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
      {canvasStyles.map(s => <StyleCard key={s.id} {...s} />)}
    </div>
  </TabsContent>
</Tabs>
```

### 5-3. 음악 미리듣기 컴포넌트

```tsx
<div className="space-y-2">
  {musicTracks.map(track => (
    <button
      key={track.id}
      onClick={() => playPreview(track.id)}
      className={cn(
        "w-full flex items-center gap-4 p-3 rounded-2xl",
        "border-2 transition-all",
        selected === track.id 
          ? "border-primary bg-primary-soft/30" 
          : "border-border hover:bg-bg-gray"
      )}
    >
      <span className="text-2xl">{track.emoji}</span>
      <div className="flex-1 text-left">
        <p className="font-medium">{track.name}</p>
        <p className="text-sm text-text-mid">{track.description}</p>
      </div>
      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
        {playing === track.id ? '⏸' : '▶'}
      </div>
    </button>
  ))}
</div>
```

---

## 📊 6. 마이페이지 (`/dashboard`)

### 6-1. 영상 카드 (썸네일 + 프롬프트만)

```tsx
<div className="bg-white rounded-3xl p-4 shadow-soft 
                hover:shadow-md transition group">
  {/* 썸네일 */}
  <div className="relative aspect-video rounded-2xl overflow-hidden mb-3">
    <Image src={thumbnail} fill className="object-cover" />
    <button className="absolute inset-0 flex items-center justify-center
                       bg-black/0 group-hover:bg-black/40 transition">
      <span className="opacity-0 group-hover:opacity-100 
                       text-white text-3xl">▶</span>
    </button>
    <span className="absolute top-2 right-2 px-2 py-1 
                     bg-black/60 text-white text-xs rounded-full">
      {duration}
    </span>
  </div>
  
  {/* 프롬프트 (3줄 클램프) */}
  <p className="text-sm text-text-dark line-clamp-3 mb-3">
    {prompt}
  </p>
  
  {/* 메타 + 액션 */}
  <div className="flex items-center justify-between text-xs text-text-mid">
    <span>{createdAt}</span>
    <DropdownMenu>
      <DropdownMenuTrigger>⋯</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>다운로드</DropdownMenuItem>
        <DropdownMenuItem>공개/비공개</DropdownMenuItem>
        <DropdownMenuItem className="text-error">삭제</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</div>
```

---

## 🎬 7. 인터랙션 & 애니메이션

### 7-1. 페이지 전환
```tsx
// Framer Motion (선택)
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, ease: 'easeOut' }}
>
  {children}
</motion.div>
```

### 7-2. 영상 생성 진행률 (스켈레톤 + 프로그레스)
```tsx
<div className="bg-gradient-to-r from-primary-soft via-secondary-soft to-accent-soft
                bg-[length:200%_100%] animate-shimmer
                rounded-3xl p-8 text-center">
  <div className="text-2xl font-medium mb-2">영상 생성 중...</div>
  <div className="text-sm text-text-mid">
    {status === 'pending' && '대기열에서 기다리는 중'}
    {status === 'processing' && '화면을 그리고 있어요'}
    {status === 'finalizing' && '거의 다 됐어요!'}
  </div>
  <Progress value={progress} className="mt-4" />
</div>
```

### 7-3. 토스트 알림 (sonner)
```tsx
toast.success('영상이 완성되었어요! 🎉');
toast.error('토큰이 부족해요. 충전해주세요.');
toast('생성 시작', { 
  description: '예상 소요 시간: 1~2분',
  icon: '⏱️' 
});
```

---

## 📱 8. 반응형 브레이크포인트

| 이름 | 너비 | 디자인 우선순위 |
|---|---|---|
| `sm` | 640px+ | 태블릿 세로 |
| `md` | 768px+ | 태블릿 가로 |
| `lg` | 1024px+ | **노트북 (메인)** |
| `xl` | 1280px+ | 데스크톱 |
| `2xl` | 1536px+ | 와이드 모니터 |

> 모바일 (< 640px)은 핵심 기능만, 데스크톱 우선 디자인.

---

## 🌗 9. 다크모드 (선택)

```tsx
// app/layout.tsx
import { ThemeProvider } from 'next-themes';

<ThemeProvider attribute="class" defaultTheme="light" enableSystem>
  {children}
</ThemeProvider>
```

다크모드 시 컬러 변환:
- BG Cream → `#1A1625`
- Text Dark → `#F5F2FA`
- Primary는 동일 (파스텔 유지)

---

## ✨ 10. 마이크로 인터랙션 체크리스트

- [ ] 버튼 호버 시 `scale-105` + 그림자 강조
- [ ] 카드 호버 시 `translate-y-[-2px]` 부유 효과
- [ ] 입력 필드 포커스 시 부드러운 outline
- [ ] 영상 카드 호버 시 재생 아이콘 페이드인
- [ ] 토큰 차감 시 카운터 애니메이션 (`framer-motion`)
- [ ] 페이지 로딩 시 skeleton (`shadcn skeleton`)
- [ ] 성공/실패 토스트 (`sonner`)
- [ ] 영상 생성 중 그라디언트 shimmer

---

## 🎯 11. 디자인 점검 리스트

### 출시 전
- [ ] 모든 페이지 모바일 점검
- [ ] 컬러 대비 비율 WCAG AA 통과 (4.5:1 이상)
- [ ] alt 태그 / aria-label 추가
- [ ] 다크모드 대응 (선택)
- [ ] 로딩 상태 / 에러 상태 디자인
- [ ] 빈 상태 (Empty State) 디자인
- [ ] 일관된 spacing (8의 배수: 8/16/24/32/48/64)

---

## 📚 12. 디자인 영감

- ByteDance Dreamina: https://dreamina.bytedance.com
- Synthesia: https://synthesia.io
- Runway: https://runway.ml
- Linear (UI 디테일): https://linear.app
- Vercel (그라디언트): https://vercel.com
