# 💰 PRICING.md — 가격 모델 & 토큰 시스템

> 환율 기준 (내부 계산용): **$1 = 1,400 KRW**
> 사용자 노출 통화: **KRW 단일** (한국 타겟 우선)
> 변동 시 재계산: `lib/tokens/calculator.ts`에서 일괄 관리

---

## 💱 노출 정책 (중요)

| 영역 | 통화 | 표시 형식 |
|---|---|---|
| **사용자 UI** (가격 페이지, 결제 화면) | **KRW만** | "6,000원" |
| **내부 계산/로그/관리자** | KRW + USD 병기 | 6,000원 ($4.29) |
| **Golpo 비용 추적** | USD | $2.00 |

> 💡 Tailwind 컴포넌트로 `<Price>` 만들어서 위치별로 노출 통화 자동 처리.

---

## 📊 1. 원가 구조

### Golpo API 단가
- **1 분 영상 = 2 크레딧 = $2 = 약 2,800원**
- 마진율: **2배** (5,600원/분)
- $200 (약 28만원) 선결제 = 200 크레딧 = 100분 분량

### 길이별 원가 (내부 참고용)
| 영상 길이 | 크레딧 | 원가 (USD, 내부) | 원가 (KRW, 표기) |
|---|---|---|---|
| 15초 | 0.5 | $0.50 | **700원** |
| 30초 | 1 | $1.00 | 1,400원 |
| 1분 | 2 | $2.00 | 2,800원 |
| 2분 | 4 | $4.00 | 5,600원 |
| 4분 | 8 | $8.00 | 11,200원 |
| 8분 | 16 | $16.00 | 22,400원 |
| 10분 | 20 | $20.00 | 28,000원 |

---

## 🪙 2. Banjak 토큰 시스템

### 정의
- **1 토큰 = 1분 영상 생성권**
- 1 토큰 = **6,000원** (단건 구매 기준, 마진 약 2.14배)

### 길이별 소모 토큰
| 영상 길이 | 소모 토큰 | 단건 환산 |
|---|---|---|
| 15초 | 0.25 | 1,500원 |
| 30초 | 0.5 | 3,000원 |
| 1분 | 1 | 6,000원 |
| 2분 | 2 | 12,000원 |
| 4분 | 4 | 24,000원 |
| 8분 | 8 | 48,000원 |
| 10분 | 10 | 60,000원 |

> 💡 **소수점 토큰 처리**: Firestore에 `decimal(precision: 2)` 형태로 저장. 사용자 UI에는 "0.5 토큰" 또는 "30초 분량"으로 표시.

---

## 💸 3. 단건 토큰 구매 (Pay-as-you-go)

| 패키지 | 토큰 | 가격 | 1토큰당 |
|---|---|---|---|
| Starter | 5 | 30,000원 | 6,000원 |
| Standard | 15 | 87,000원 | 5,800원 (3% 할인) |
| Pro | 50 | 282,000원 | 5,640원 (6% 할인) |
| Bulk | 200 | 1,080,000원 | 5,400원 (10% 할인) |

> 💡 대량 구매 할인은 자연 마진 축소가 아닌 **재구매 유도용** — 4단계는 선택, 출시 후 데이터 보고 결정.

---

## 🔄 4. 월간 구독 (Subscription)

### 핵심 혜택
1. **같은 가격에 토큰 2배** (단건 대비)
2. **추가 5% 할인** 적용
3. 미사용 토큰 **다음 달 이월 (최대 3개월)**
4. 우선순위 큐 (영상 생성 빠름)
5. 워터마크 제거 옵션

### 플랜

| 플랜 | 월 구독료 | 토큰 | 단건 환산 가치 | 실질 할인율 |
|---|---|---|---|---|
| **Light** | 28,500원 | **10 토큰** | 60,000원 (단건 대비 5토큰) | **52% 할인** |
| **Standard** | 82,650원 | **30 토큰** | 180,000원 (단건 대비 15토큰) | **54% 할인** |
| **Pro** | 268,000원 | **100 토큰** | 600,000원 (단건 대비 50토큰) | **55% 할인** |

### 계산 방식 (참고)
```
구독 가격 = (단건 가격 × 5% 할인)
구독 토큰 = 단건 토큰 × 2배

예) Light:
- 단건 5 토큰 = 30,000원
- 5% 할인 적용 → 28,500원
- 토큰 2배 → 10 토큰 지급
```

> 🎯 **마케팅 카피**: "월 구독은 단건 대비 **반값**!" "5% 추가 할인"

---

## 🎁 5. 무료 혜택

### 신규 가입 보너스
- **15초 샘플 영상 1회 무료** (0.25 토큰 상당)
- 가입 직후 자동 지급
- 일회성, 환불/이월 불가

### 추천인 프로그램 (선택, v1.5+)
- 추천한 친구 가입 시 → 양쪽 모두 1 토큰 지급

---

## 📐 6. 가격 계산 로직 (`lib/tokens/calculator.ts`)

```typescript
// 환율 (변동 시 한 곳만 수정)
const USD_TO_KRW = 1400;
const TOKEN_PRICE_KRW = 6000;
const SUBSCRIPTION_DISCOUNT = 0.05; // 5%
const SUBSCRIPTION_TOKEN_MULTIPLIER = 2;

// 영상 길이 → 소모 토큰
export const TIMING_TO_TOKENS: Record<string, number> = {
  '0.25': 0.25,  // 15초
  '0.5': 0.5,    // 30초
  '1': 1,        // 1분
  '2': 2,
  '4': 4,
  '8': 8,
  '10': 10,
};

export function calculateCost(timing: number) {
  const tokens = TIMING_TO_TOKENS[String(timing)];
  return {
    tokens,
    krw: tokens * TOKEN_PRICE_KRW,
    usd: (tokens * TOKEN_PRICE_KRW) / USD_TO_KRW,
  };
}

// 구독 플랜 가격
export function calculateSubscriptionPrice(baseTokens: number) {
  const baseKrw = baseTokens * TOKEN_PRICE_KRW;
  const discounted = baseKrw * (1 - SUBSCRIPTION_DISCOUNT);
  const bonusTokens = baseTokens * SUBSCRIPTION_TOKEN_MULTIPLIER;
  return {
    monthlyPrice: Math.round(discounted),
    tokensPerMonth: bonusTokens,
  };
}

// 사용 예
const light = calculateSubscriptionPrice(5);
// → { monthlyPrice: 28500, tokensPerMonth: 10 }
```

---

## 🛒 7. 결제 시스템 — 🔶 추후 결정

> Phase 4 (결제 + 마이페이지) 진입 전 확정. 그 전까지는 **추상화 인터페이스**로 개발 진행.

### 결정해야 할 옵션

| 옵션 | 장점 | 단점 |
|---|---|---|
| **TossPayments** | 카카오페이/네이버페이 통합, 한국 UI 친숙, 정기결제 잘 됨 | 글로벌 확장 시 별도 연동 필요 |
| **Stripe** | 글로벌 표준, 정기결제 강력, 다중 통화 자동 | 한국 사용자에게 낯섦, 카카오페이 등 미지원 |
| **포트원 (PortOne)** | 여러 PG 통합 (토스+이니시스+카카오 등) | 수수료 약간 높음 |

### 추상화 인터페이스 (지금 작성 가능)

```typescript
// lib/payments/interface.ts
export interface PaymentProvider {
  createOrder(params: OrderParams): Promise<{ orderId: string; redirectUrl: string }>;
  verifyPayment(paymentKey: string): Promise<PaymentResult>;
  cancelSubscription(billingKey: string): Promise<void>;
  // ...
}

// 어떤 PG를 선택해도 같은 인터페이스로 호출 가능
// lib/payments/toss.ts → TossProvider implements PaymentProvider
// lib/payments/stripe.ts → StripeProvider implements PaymentProvider
```

### 결정 시점
- **Phase 1~3**: 결제 없이 무료 샘플(가입 보너스)로만 동작
- **Phase 4 진입 전**: PG사 결정 + 구현 시작

### 한국 시장 추천
> 한국 단독 출시라면 **TossPayments**가 가장 빠름. 글로벌 동시 출시면 Stripe.

---

## 🔄 8. 토큰 트랜잭션 흐름

### 차감 (영상 생성 시)
```typescript
await db.runTransaction(async (tx) => {
  const userRef = db.collection('users').doc(uid);
  const user = await tx.get(userRef);
  const balance = user.data()?.tokenBalance ?? 0;
  
  if (balance < requiredTokens) {
    throw new Error('Insufficient tokens');
  }
  
  tx.update(userRef, {
    tokenBalance: balance - requiredTokens,
  });
  
  tx.set(db.collection('transactions').doc(), {
    userId: uid,
    type: 'usage',
    amount: -requiredTokens,
    videoId,
    createdAt: new Date(),
  });
});
```

### 충전 (결제 완료 webhook)
```typescript
await db.runTransaction(async (tx) => {
  const userRef = db.collection('users').doc(uid);
  const user = await tx.get(userRef);
  const balance = user.data()?.tokenBalance ?? 0;
  
  tx.update(userRef, {
    tokenBalance: balance + purchasedTokens,
  });
  
  tx.set(db.collection('transactions').doc(), {
    userId: uid,
    type: 'purchase',
    amount: purchasedTokens,
    paymentId,
    createdAt: new Date(),
  });
});
```

### 구독 갱신 (월 1회 cron)
```typescript
// Firebase Functions: schedules/renewSubscriptions.ts
exports.renewSubscriptions = onSchedule('0 0 1 * *', async () => {
  const subs = await db.collection('subscriptions')
    .where('status', '==', 'active')
    .get();
  
  for (const sub of subs.docs) {
    const { userId, plan, tokensPerMonth } = sub.data();
    // 결제 시도 + 토큰 지급
    // ...
  }
});
```

---

## 📈 9. 매출 시뮬레이션

### 가정
- MAU 1,000명
- 월 평균 영상 생성: 사용자당 5분 분량
- 50%는 단건, 50%는 구독

### 단건 (500명 × 5 토큰 × 6,000원)
- 매출: 15,000,000원
- 원가: 500 × 5 × 2,800 = 7,000,000원
- 마진: **8,000,000원**

### 구독 Light (500명 × 28,500원)
- 매출: 14,250,000원
- 원가: 500 × 10 × 2,800 = 14,000,000원
- 마진: **250,000원** ⚠️ (Light는 마진 거의 없음 — 의도적 미끼)

### 결론
- **Standard / Pro 구독자 유도가 핵심**
- Light는 입문용으로 가입 → Standard로 업셀
- 단건 구매가 마진 더 높음 → 라이트한 사용자에게 유도

---

## 🎯 10. UI 카피 가이드

### 메인 페이지 가격 섹션
```
"15초 영상 1,500원부터"
"단건 구매 OR 구독 — 자유롭게 선택"
"월 구독은 토큰 2배 + 5% 추가 할인"
```

### 토큰 잔액 부족 모달
```
헤더: "토큰이 부족해요 🪙"
본문: "이 영상은 {N} 토큰이 필요해요. 현재 잔액: {M} 토큰"
CTA: "토큰 구매" / "구독 시작하기"
```

### 구독 페이지 강조 카피
```
[BEST VALUE 배지]
Light 플랜: 월 28,500원
"단건 대비 매월 31,500원 절약"
"10 토큰 = 10분 영상 분량"
"미사용 토큰 3개월 이월"
```

---

## 🔧 11. 출시 후 조정 변수

| 항목 | 초기값 | 조정 트리거 |
|---|---|---|
| 토큰 가격 | 6,000원 | 환율 변동 ±5% 시 |
| 구독 할인율 | 5% | 전환율 < 3% 시 인상 |
| 토큰 배수 | 2배 | 마진 < 30% 시 1.8배로 |
| 무료 샘플 | 15초 1회 | 가입 전환율 측정 후 30초로 확장 검토 |
| 이월 기간 | 3개월 | 환불 요청 빈도 모니터링 |

---

## 📚 12. 참고 링크

- TossPayments 개발자 문서: https://docs.tosspayments.com/
- Stripe 한국 결제 (대안): https://stripe.com/kr
- Firebase Subscriptions 패턴: https://firebase.google.com/docs/extensions/official/firestore-stripe-payments
