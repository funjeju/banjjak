import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[var(--color-banjak-bg-gray)] border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg text-[var(--color-banjak-text-dark)] mb-3">
              <Sparkles className="w-5 h-5 text-[var(--color-banjak-primary)]" />
              Banjak
            </Link>
            <p className="text-sm text-[var(--color-banjak-text-mid)] max-w-xs leading-relaxed">
              프롬프트 한 줄로 만드는 AI 영상 플랫폼. 반짝, 영상 완성.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-[var(--color-banjak-text-dark)] mb-3 text-sm">서비스</h4>
            <ul className="space-y-2 text-sm text-[var(--color-banjak-text-mid)]">
              <li><Link href="/create" className="hover:text-[var(--color-banjak-text-dark)] transition-colors">영상 만들기</Link></li>
              <li><Link href="/pricing" className="hover:text-[var(--color-banjak-text-dark)] transition-colors">요금제</Link></li>
              <li><Link href="/dashboard" className="hover:text-[var(--color-banjak-text-dark)] transition-colors">마이페이지</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[var(--color-banjak-text-dark)] mb-3 text-sm">법적 고지</h4>
            <ul className="space-y-2 text-sm text-[var(--color-banjak-text-mid)]">
              <li><Link href="/terms" className="hover:text-[var(--color-banjak-text-dark)] transition-colors">이용약관</Link></li>
              <li><Link href="/privacy" className="hover:text-[var(--color-banjak-text-dark)] transition-colors">개인정보처리방침</Link></li>
              <li><Link href="/refund" className="hover:text-[var(--color-banjak-text-dark)] transition-colors">환불정책</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-xs text-[var(--color-banjak-text-light)]">
            © 2025 Banjak. All rights reserved.
          </p>
          <p className="text-xs text-[var(--color-banjak-text-light)]">
            Powered by Golpo AI
          </p>
        </div>
      </div>
    </footer>
  );
}
