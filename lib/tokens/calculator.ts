export const USD_TO_KRW = 1400;
export const TOKEN_PRICE_KRW = 3000; // 1 token = 30초 쇼츠 영상 1편
export const GOLPO_COST_PER_TOKEN = 1400; // $1 at 1,400원/달러

// timing 단위: 분(min) → 필요 토큰 (1 token = 30초 = 0.5분)
export const TIMING_TO_TOKENS: Record<string, number> = {
  '0.25': 0.5,  // 15초
  '0.5': 1,     // 30초 (기준: 쇼츠 1편)
  '1': 2,       // 1분
  '2': 4,       // 2분
  '3': 6,       // 3분
  '5': 10,      // 5분
  '10': 20,     // 10분
};

export function calculateCost(timing: number): { tokens: number; krw: number; usd: number } {
  const tokens = TIMING_TO_TOKENS[String(timing)] ?? timing * 2;
  return {
    tokens,
    krw: tokens * TOKEN_PRICE_KRW,
    usd: (tokens * TOKEN_PRICE_KRW) / USD_TO_KRW,
  };
}

export function formatKrw(amount: number): string {
  return `${Math.round(amount).toLocaleString('ko-KR')}원`;
}

export function formatTokens(tokens: number): string {
  if (tokens < 1) return `${tokens * 2 * 30}초`;
  return `${tokens} 토큰`;
}

// 단건 구매 패키지
export const TOKEN_PACKAGES = [
  { id: 'single', label: 'Single', tokens: 1, priceKrw: 3000, shorts: 1 },
  { id: 'standard', label: 'Standard', tokens: 5, priceKrw: 15000, shorts: 5 },
  { id: 'pro', label: 'Pro', tokens: 20, priceKrw: 60000, shorts: 20 },
  { id: 'bulk', label: 'Bulk', tokens: 60, priceKrw: 180000, shorts: 60 },
];

// 구독 플랜 (할인 적용)
export const SUBSCRIPTION_PLANS = [
  {
    id: 'standard',
    label: 'Standard',
    tokensPerMonth: 5,
    shorts: 5,
    discountRate: 0.03,
    monthlyPriceKrw: 14000,
  },
  {
    id: 'pro',
    label: 'Pro',
    tokensPerMonth: 20,
    shorts: 20,
    discountRate: 0.05,
    monthlyPriceKrw: 55000,
  },
  {
    id: 'business',
    label: 'Business',
    tokensPerMonth: 60,
    shorts: 60,
    discountRate: 0.07,
    monthlyPriceKrw: 150000,
  },
] as const;
