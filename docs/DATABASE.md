# 🗄️ DATABASE.md — Firestore 스키마 설계

> Firestore (NoSQL document DB) 사용. 컬렉션-문서 구조.

---

## 📚 1. 컬렉션 개요

| 컬렉션 | 용도 | 문서 ID 전략 |
|---|---|---|
| `users` | 사용자 프로필 + 토큰 잔액 | Firebase Auth UID |
| `videos` | 생성된 영상 메타데이터 | Golpo `video_id` |
| `subscriptions` | 활성 구독 정보 | Auth UID |
| `transactions` | 결제/사용 트랜잭션 로그 | auto |
| `payments` | 결제 기록 | TossPayments orderId |

---

## 👤 2. `users` 컬렉션

```typescript
interface User {
  uid: string;                    // Firebase Auth UID
  email: string;
  displayName: string;
  photoURL?: string;
  
  // 인증
  emailVerified: boolean;
  authProvider: 'google' | 'email';
  
  // 토큰 시스템
  tokenBalance: number;            // 소수점 가능 (0.25, 0.5, ...)
  freeSampleUsed: boolean;         // 무료 15초 샘플 사용 여부
  
  // 구독 (있을 경우만)
  activeSubscription?: {
    plan: 'light' | 'standard' | 'pro';
    startedAt: Timestamp;
    nextBillingAt: Timestamp;
    autoRenew: boolean;
    cancelledAt?: Timestamp;
  };
  
  // 통계
  totalVideosCreated: number;
  totalTokensUsed: number;
  totalSpentKrw: number;
  
  // 메타
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt: Timestamp;
}
```

### 신규 가입 시 초기값
```typescript
{
  tokenBalance: 0.25,             // 무료 샘플 (15초)
  freeSampleUsed: false,
  totalVideosCreated: 0,
  totalTokensUsed: 0,
  totalSpentKrw: 0,
  createdAt: serverTimestamp(),
}
```

---

## 🎬 3. `videos` 컬렉션

```typescript
interface Video {
  videoId: string;                // Golpo video_id
  jobId: string;                  // Golpo job_id
  userId: string;                 // 소유자 UID
  
  // 입력
  inputType: 'prompt' | 'script' | 'document';
  prompt?: string;                // 프롬프트 모드
  newScript?: string;             // 원고 모드
  uploadedFileName?: string;      // 업로드 모드 (PDF 이름)
  
  // 결과
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;              // Golpo 호스팅 mp4 URL
  thumbnailUrl?: string;          // Firebase Storage 또는 Golpo
  duration: number;               // 초 단위
  
  // 생성 파라미터
  params: {
    timing: number;               // 0.25, 0.5, 1, 2, 4, 8, 10
    videoType: 'long' | 'short';
    style: string;                // solo-female-3 등
    language: string;
    displayLanguage?: string;
    bgMusic?: string;
    engine: 'sketch' | 'canvas';  // 둘 중 하나
    sketchStyle?: 'false' | 'true' | 'advanced';
    canvasStyle?: string;         // image_style 값
    penStyle?: string;
    voiceInstructions?: string;
    videoInstructions?: string;
    includeWatermark: boolean;
  };
  
  // 비용
  creditsUsed: number;
  
  // 공개 설정
  isPublic: boolean;
  
  // 에러 (실패 시)
  errorMessage?: string;
  
  // 메타
  createdAt: Timestamp;
  completedAt?: Timestamp;
  updatedAt: Timestamp;
}
```

### 인덱스
- `userId` + `createdAt DESC` (마이페이지 정렬)
- `status` + `createdAt` (실패 작업 청소용)
- `isPublic` + `createdAt` (공개 갤러리, 추후)

### ⚠️ 저장 정책 (사용자 요구사항)
> "영상의 프롬프트와 썸네일만 저장"

- **mp4 파일**: Golpo가 호스팅하는 URL을 그대로 사용 (자체 저장 X)
- **썸네일**: Firebase Storage에 작은 webp로 저장 (또는 Golpo URL 사용)
- **프롬프트/원고**: Firestore에 저장
- **장점**: 스토리지 비용 거의 0, 빠른 조회

---

## 💳 4. `subscriptions` 컬렉션

```typescript
interface Subscription {
  userId: string;
  plan: 'light' | 'standard' | 'pro';
  
  status: 'active' | 'cancelled' | 'expired' | 'pastDue';
  
  // 가격
  monthlyPriceKrw: number;        // 28500, 82650, 268000
  tokensPerMonth: number;         // 10, 30, 100
  
  // 결제
  paymentMethod: {
    provider: 'toss';
    billingKey: string;           // Toss billingKey (정기결제)
    cardCompany?: string;
    cardLast4?: string;
  };
  
  // 사이클
  startedAt: Timestamp;
  currentPeriodStart: Timestamp;
  currentPeriodEnd: Timestamp;
  nextBillingAt: Timestamp;
  
  // 취소
  cancelAtPeriodEnd: boolean;
  cancelledAt?: Timestamp;
  
  // 메타
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## 📜 5. `transactions` 컬렉션

> 모든 토큰 변동 이력. 분쟁 해결 + 분석용.

```typescript
interface Transaction {
  id: string;                     // auto
  userId: string;
  
  type: 
    | 'signup_bonus'              // 가입 보너스
    | 'purchase'                  // 단건 구매
    | 'subscription_renewal'      // 구독 갱신
    | 'usage'                     // 영상 생성 (음수)
    | 'refund'                    // 환불
    | 'admin_grant';              // 관리자 지급
  
  amount: number;                 // 토큰 변동량 (음수 가능)
  balanceAfter: number;           // 거래 후 잔액
  
  // 연결된 리소스
  videoId?: string;               // type='usage'
  paymentId?: string;             // type='purchase' or 'subscription_renewal'
  
  description: string;            // "1분 영상 생성" 등
  
  createdAt: Timestamp;
}
```

### 인덱스
- `userId` + `createdAt DESC`

---

## 💰 6. `payments` 컬렉션

```typescript
interface Payment {
  orderId: string;                // Toss orderId (= 문서 ID)
  userId: string;
  
  // 상품
  productType: 'tokens' | 'subscription';
  productId: string;              // 'starter-5tokens', 'sub-light' 등
  
  // 금액
  amountKrw: number;
  
  // Toss 정보
  toss: {
    paymentKey: string;
    method: string;               // '카드', '간편결제' 등
    cardCompany?: string;
    cardLast4?: string;
    receiptUrl: string;
  };
  
  status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded';
  
  // 결과
  tokensGranted?: number;         // type='tokens'
  subscriptionId?: string;        // type='subscription'
  
  // 시점
  requestedAt: Timestamp;
  paidAt?: Timestamp;
  cancelledAt?: Timestamp;
  
  // 환불
  refund?: {
    amountKrw: number;
    reason: string;
    refundedAt: Timestamp;
  };
}
```

---

## 🔐 7. Firestore 보안 규칙 (`firestore.rules`)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // 헬퍼 함수
    function isAuthed() {
      return request.auth != null;
    }
    function isOwner(userId) {
      return isAuthed() && request.auth.uid == userId;
    }
    function isAdmin() {
      return isAuthed() && request.auth.token.admin == true;
    }
    
    // users — 본인만 읽기/일부 쓰기
    match /users/{userId} {
      allow read: if isOwner(userId);
      allow create: if isOwner(userId);
      // 토큰 잔액은 서버(Admin SDK)만 수정 가능
      allow update: if isOwner(userId)
        && !('tokenBalance' in request.resource.data.diff(resource.data).affectedKeys())
        && !('totalSpentKrw' in request.resource.data.diff(resource.data).affectedKeys())
        && !('activeSubscription' in request.resource.data.diff(resource.data).affectedKeys());
      allow delete: if false; // 회원탈퇴는 Functions로
    }
    
    // videos — 본인 영상만 읽기/수정
    match /videos/{videoId} {
      allow read: if isOwner(resource.data.userId) 
                  || resource.data.isPublic == true;
      allow create: if false;  // 서버에서만 생성
      allow update: if isOwner(resource.data.userId)
        // title, isPublic만 사용자가 수정 가능
        && request.resource.data.diff(resource.data).affectedKeys()
           .hasOnly(['title', 'isPublic', 'updatedAt']);
      allow delete: if isOwner(resource.data.userId);
    }
    
    // subscriptions — 본인 것만 읽기, 수정은 서버만
    match /subscriptions/{userId} {
      allow read: if isOwner(userId);
      allow write: if false;
    }
    
    // transactions — 본인 것만 읽기, 쓰기 X
    match /transactions/{txId} {
      allow read: if isOwner(resource.data.userId);
      allow write: if false;
    }
    
    // payments — 본인 것만 읽기, 쓰기 X
    match /payments/{paymentId} {
      allow read: if isOwner(resource.data.userId);
      allow write: if false;
    }
  }
}
```

---

## 📦 8. Storage 보안 규칙 (`storage.rules`)

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // 사용자 업로드 (PDF 등) — 본인만 가능, 15MB 제한
    match /uploads/{userId}/{fileName} {
      allow read: if request.auth.uid == userId;
      allow create: if request.auth.uid == userId
        && request.resource.size < 15 * 1024 * 1024
        && request.resource.contentType.matches('application/pdf|application/.*officedocument.*|text/plain|image/.*|audio/.*|video/.*');
      allow delete: if request.auth.uid == userId;
    }
    
    // 썸네일 (서버에서만 생성)
    match /thumbnails/{userId}/{videoId}.webp {
      allow read: if request.auth.uid == userId;
      allow write: if false;
    }
  }
}
```

---

## 🔍 9. 자주 쓰는 쿼리

### 사용자의 영상 목록 (마이페이지)
```typescript
const videos = await db
  .collection('videos')
  .where('userId', '==', uid)
  .orderBy('createdAt', 'desc')
  .limit(20)
  .get();
```

### 토큰 잔액 조회
```typescript
const userDoc = await db.collection('users').doc(uid).get();
const balance = userDoc.data()?.tokenBalance ?? 0;
```

### 결제 내역
```typescript
const payments = await db
  .collection('payments')
  .where('userId', '==', uid)
  .where('status', '==', 'paid')
  .orderBy('paidAt', 'desc')
  .get();
```

### 미완료 영상 작업 (실패 청소용)
```typescript
const stale = await db
  .collection('videos')
  .where('status', 'in', ['pending', 'processing'])
  .where('createdAt', '<', oneDayAgo)
  .get();
```

---

## 🧹 10. 데이터 정리 정책

| 데이터 | 보관 기간 | 정리 방법 |
|---|---|---|
| 영상 메타데이터 | 영구 | 사용자 직접 삭제만 |
| 실패 영상 작업 | 7일 | Firebase Functions cron |
| 트랜잭션 로그 | 영구 | (회계/분쟁용) |
| 결제 기록 | 영구 | 법적 의무 (5년+) |
| 미인증 가입자 | 30일 | Functions로 정리 |

---

## 🛠️ 11. 마이그레이션 가이드 (스키마 변경 시)

### 새 필드 추가
```typescript
// Functions에서 일괄 처리
exports.migrateAddField = onCall(async () => {
  const users = await db.collection('users').get();
  const batch = db.batch();
  
  users.forEach(doc => {
    if (!doc.data().newField) {
      batch.update(doc.ref, { newField: defaultValue });
    }
  });
  
  await batch.commit();
});
```

### 컬렉션 이름 변경
- 새 컬렉션 생성 → 데이터 복사 → 코드 업데이트 → 옛 컬렉션 삭제

---

## 📊 12. 비용 예측

### Firestore 무료 한도 (Spark 플랜)
- 읽기: 50,000 / 일
- 쓰기: 20,000 / 일
- 저장: 1 GiB

### Blaze 플랜 (종량제)
- 읽기: $0.06 / 100K
- 쓰기: $0.18 / 100K
- 저장: $0.18 / GiB / 월

### 1,000명 활성 사용자 가정
- 사용자당 월 50회 영상 생성 시:
  - 쓰기 ≈ 200,000회 = $0.36/월
  - 읽기 ≈ 500,000회 = $0.30/월
- **Firestore 비용 ≈ 월 1,000원 미만** ✅

---

## 📚 13. 참고

- Firestore 문서: https://firebase.google.com/docs/firestore
- 보안 규칙: https://firebase.google.com/docs/firestore/security/get-started
- 인덱스 자동 제안: 콘솔에서 쿼리 실행 시 에러 메시지에 직접 링크 제공
