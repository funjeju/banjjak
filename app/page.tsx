import Link from 'next/link';
import { ArrowRight, Sparkles, Zap, Clock, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { CANVAS_STYLES, DURATIONS, MUSIC_TRACKS } from '@/lib/golpo/constants';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center overflow-hidden bg-[var(--color-banjak-bg-cream)]">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-banjak-primary-soft)]/40 via-[var(--color-banjak-bg-cream)] to-[var(--color-banjak-secondary-soft)]/40" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-[var(--color-banjak-primary-soft)] rounded-full blur-3xl opacity-30" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[var(--color-banjak-secondary-soft)] rounded-full blur-3xl opacity-20" />

          <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
            <Badge
              variant="outline"
              className="mb-6 border-[var(--color-banjak-border)] bg-white/80 text-[var(--color-banjak-text-mid)] px-4 py-1.5 rounded-full text-sm"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-[var(--color-banjak-primary)]" />
              AI 화이트보드 영상 생성 플랫폼
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold text-[var(--color-banjak-text-dark)] leading-tight mb-6">
              프롬프트 한 줄로
              <br />
              <span className="bg-gradient-to-r from-[var(--color-banjak-primary)] to-[var(--color-banjak-secondary)] bg-clip-text text-transparent">
                영상이 완성됩니다
              </span>
            </h1>

            <p className="text-lg md:text-xl text-[var(--color-banjak-text-mid)] mb-10 max-w-2xl mx-auto leading-relaxed">
              교육, 마케팅, SNS 콘텐츠를 1분 만에.
              <br className="hidden md:block" />
              가입하면 <strong className="text-[var(--color-banjak-text-dark)]">15초 샘플 영상</strong>을 무료로 만들 수 있어요.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
              <Button
                size="lg"
                className="bg-[var(--color-banjak-primary)] hover:bg-[var(--color-banjak-primary-soft)] text-[var(--color-banjak-text-dark)] rounded-full px-8 py-6 text-base font-medium shadow-glow-primary hover:scale-105 transition-all duration-200"
                asChild
              >
                <Link href="/sign-up">
                  나도 제작해보기
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-8 py-6 text-base border-[var(--color-banjak-border)] hover:bg-[var(--color-banjak-bg-gray)]"
                asChild
              >
                <Link href="/pricing">요금제 보기</Link>
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-8 text-sm text-[var(--color-banjak-text-mid)]">
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[var(--color-banjak-primary)]" />
                <span>1분 안에 완성</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[var(--color-banjak-secondary)]" />
                <span>최대 10분 영상</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-[var(--color-banjak-accent)]" />
                <span>44개 언어 지원</span>
              </div>
            </div>
          </div>
        </section>

        {/* 스타일 갤러리 */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-banjak-text-dark)] mb-3">다양한 스타일</h2>
              <p className="text-[var(--color-banjak-text-mid)]">11가지 스타일로 원하는 분위기의 영상을 만들어보세요.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {CANVAS_STYLES.map((style) => (
                <div
                  key={style.id}
                  className="group bg-[var(--color-banjak-bg-gray)] rounded-2xl p-6 text-center hover:bg-[var(--color-banjak-primary-soft)]/20 border border-[var(--color-banjak-border)] hover:border-[var(--color-banjak-primary)] transition-all duration-200"
                >
                  <div className="text-3xl mb-2">{style.emoji}</div>
                  <p className="font-semibold text-[var(--color-banjak-text-dark)] text-sm">{style.label}</p>
                  <p className="text-xs text-[var(--color-banjak-text-mid)] mt-1">{style.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 배경음악 */}
        <section className="py-20 px-4 bg-[var(--color-banjak-bg-cream)]">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-banjak-text-dark)] mb-3">8가지 배경음악</h2>
              <p className="text-[var(--color-banjak-text-mid)]">영상 분위기에 맞는 배경음악을 선택하세요.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {MUSIC_TRACKS.map((track) => (
                <div key={track.id} className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-[var(--color-banjak-border)] shadow-soft">
                  <span className="text-2xl">{track.emoji}</span>
                  <div>
                    <p className="font-medium text-[var(--color-banjak-text-dark)] text-sm">{track.label}</p>
                    <p className="text-xs text-[var(--color-banjak-text-mid)]">{track.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 영상 길이 */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-banjak-text-dark)] mb-3">15초부터 10분까지</h2>
            <p className="text-[var(--color-banjak-text-mid)] mb-10">용도에 맞게 영상 길이를 자유롭게 선택하세요.</p>
            <div className="flex flex-wrap justify-center gap-3">
              {DURATIONS.map((d) => (
                <div key={d.value} className="px-5 py-3 bg-[var(--color-banjak-bg-gray)] rounded-2xl border border-[var(--color-banjak-border)] text-center">
                  <p className="font-semibold text-[var(--color-banjak-text-dark)]">{d.label}</p>
                  <p className="text-xs text-[var(--color-banjak-text-mid)] mt-0.5">{d.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4 bg-gradient-to-br from-[var(--color-banjak-primary-soft)]/50 to-[var(--color-banjak-secondary-soft)]/50">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-banjak-text-dark)] mb-4">지금 바로 시작해보세요</h2>
            <p className="text-[var(--color-banjak-text-mid)] mb-8">가입하면 15초 샘플 영상 1회 무료. 신용카드 필요 없어요.</p>
            <Button
              size="lg"
              className="bg-[var(--color-banjak-primary)] hover:bg-[var(--color-banjak-primary-soft)] text-[var(--color-banjak-text-dark)] rounded-full px-10 py-6 text-base font-medium shadow-glow-primary hover:scale-105 transition-all duration-200"
              asChild
            >
              <Link href="/sign-up">
                <Sparkles className="w-4 h-4 mr-2" />
                무료로 시작하기
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
