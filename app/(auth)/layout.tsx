import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-banjak-bg-cream)] flex flex-col items-center justify-center p-4">
      <Link href="/" className="flex items-center gap-2 font-bold text-2xl text-[var(--color-banjak-text-dark)] mb-8">
        <Sparkles className="w-6 h-6 text-[var(--color-banjak-primary)]" />
        Banjak
      </Link>
      {children}
    </div>
  );
}
