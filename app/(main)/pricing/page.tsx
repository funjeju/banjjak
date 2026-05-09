import Link from 'next/link';
import { Check, Zap, Star, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TOKEN_PACKAGES, SUBSCRIPTION_PLANS, formatKrw } from '@/lib/tokens/calculator';

export default function PricingPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <Badge
          variant="outline"
          className="mb-4 border-[var(--color-banjak-border)] text-[var(--color-banjak-text-mid)] px-4 py-1.5 rounded-full"
        >
          <Zap className="w-3.5 h-3.5 mr-1.5 text-[var(--color-banjak-primary)]" />
          간단한 요금제
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-banjak-text-dark)] mb-4">
          자유롭게 선택하세요
        </h1>
        <p className="text-lg text-[var(--color-banjak-text-mid)] max-w-xl mx-auto">
          단건 구매 또는 구독 — 내 사용 패턴에 맞게.
        </p>

        {/* 토큰 기준 안내 */}
        <div className="inline-flex items-center gap-2 mt-5 bg-[var(--color-banjak-primary-soft)]/30 border border-[var(--color-banjak-primary)]/30 rounded-full px-5 py-2">
          <Video className="w-4 h-4 text-[var(--color-banjak-primary)]" />
          <span className="text-sm font-medium text-[var(--color-banjak-text-dark)]">
            1 토큰 = <strong>30초 쇼츠 영상 1편</strong> 제작
          </span>
        </div>
      </div>

      {/* 구독 플랜 */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-[var(--color-banjak-text-dark)] text-center mb-2">
          월간 구독
        </h2>
        <p className="text-center text-sm text-[var(--color-banjak-text-mid)] mb-8">
          구독하면 단건 대비 3~7% 할인
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SUBSCRIPTION_PLANS.map((plan, i) => {
            const isPopular = plan.id === 'pro';
            const originalPrice = plan.tokensPerMonth * 3000;
            const savings = originalPrice - plan.monthlyPriceKrw;

            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-3xl p-6 border-2 shadow-soft transition-all duration-200 hover:shadow-soft-md ${
                  isPopular
                    ? 'border-[var(--color-banjak-primary)] scale-105'
                    : 'border-[var(--color-banjak-border)]'
                }`}
              >
                {isPopular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--color-banjak-primary)] text-[var(--color-banjak-text-dark)] px-4 py-0.5 rounded-full text-xs">
                    <Star className="w-3 h-3 mr-1" />
                    BEST VALUE
                  </Badge>
                )}

                <h3 className="text-xl font-bold text-[var(--color-banjak-text-dark)] mb-1">{plan.label}</h3>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-3xl font-bold text-[var(--color-banjak-text-dark)]">
                    {formatKrw(plan.monthlyPriceKrw)}
                  </span>
                  <span className="text-[var(--color-banjak-text-mid)] mb-1">/월</span>
                </div>
                <p className="text-xs text-[var(--color-banjak-text-light)] mb-4 line-through">
                  정가 {formatKrw(originalPrice)}
                </p>

                <div className="bg-[var(--color-banjak-bg-gray)] rounded-2xl p-3 mb-4">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Video className="w-4 h-4 text-[var(--color-banjak-primary)]" />
                    <p className="font-semibold text-[var(--color-banjak-text-dark)]">
                      30초 쇼츠 {plan.shorts}편 /월
                    </p>
                  </div>
                  <p className="text-xs text-[var(--color-banjak-text-mid)]">
                    {plan.tokensPerMonth} 토큰 · 단건 대비 <strong>{formatKrw(savings)} 절약</strong>
                  </p>
                </div>

                <ul className="space-y-2 mb-6 text-sm text-[var(--color-banjak-text-dark)]">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[var(--color-banjak-accent)] flex-shrink-0" />
                    30초 쇼츠 {plan.shorts}편 매월 제작
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[var(--color-banjak-accent)] flex-shrink-0" />
                    단건 대비 {Math.round(plan.discountRate * 100)}% 할인
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[var(--color-banjak-accent)] flex-shrink-0" />
                    미사용 토큰 3개월 이월
                  </li>
                  {i >= 1 && (
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[var(--color-banjak-accent)] flex-shrink-0" />
                      우선순위 생성 큐
                    </li>
                  )}
                  {i >= 2 && (
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[var(--color-banjak-accent)] flex-shrink-0" />
                      전담 지원
                    </li>
                  )}
                </ul>

                <Button
                  className={`w-full rounded-full ${
                    isPopular
                      ? 'bg-[var(--color-banjak-primary)] hover:bg-[var(--color-banjak-primary-soft)] text-[var(--color-banjak-text-dark)]'
                      : 'bg-[var(--color-banjak-bg-gray)] hover:bg-[var(--color-banjak-border)] text-[var(--color-banjak-text-dark)]'
                  }`}
                  asChild
                >
                  <Link href="/sign-up">구독 시작하기</Link>
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 단건 구매 */}
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-banjak-text-dark)] text-center mb-2">
          토큰 단건 구매
        </h2>
        <p className="text-center text-sm text-[var(--color-banjak-text-mid)] mb-8">
          필요할 때만, 원하는 만큼
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {TOKEN_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white rounded-3xl p-5 border border-[var(--color-banjak-border)] shadow-soft hover:shadow-soft-md transition-all duration-200"
            >
              <h3 className="font-bold text-[var(--color-banjak-text-dark)] mb-3">{pkg.label}</h3>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-2xl font-bold text-[var(--color-banjak-text-dark)]">
                  {formatKrw(pkg.priceKrw)}
                </span>
              </div>
              <div className="flex items-center gap-1 mb-4">
                <Video className="w-3.5 h-3.5 text-[var(--color-banjak-primary)]" />
                <p className="text-xs text-[var(--color-banjak-text-mid)]">
                  30초 쇼츠 <strong>{pkg.shorts}편</strong>
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full rounded-full border-[var(--color-banjak-primary)] text-[var(--color-banjak-primary)] hover:bg-[var(--color-banjak-primary-soft)]/20"
                asChild
              >
                <Link href="/billing">구매하기</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* 안내 */}
      <div className="mt-16 text-center bg-[var(--color-banjak-bg-gray)] rounded-3xl p-6 border border-[var(--color-banjak-border)]">
        <p className="text-sm text-[var(--color-banjak-text-mid)]">
          <strong className="text-[var(--color-banjak-text-dark)]">1 토큰 = 30초 쇼츠 1편</strong>
          &nbsp;·&nbsp; 15초 영상은 0.5 토큰&nbsp;·&nbsp; 1분 영상은 2 토큰
          <br />
          가입 시 <strong className="text-[var(--color-banjak-text-dark)]">0.5 토큰(15초 샘플) 무료 제공</strong>
        </p>
        <p className="mt-2 text-xs text-[var(--color-banjak-text-light)]">
          결제 시스템 오픈 예정 — 현재는 가입 보너스로 이용 가능합니다.
        </p>
      </div>
    </div>
  );
}
