import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LayoutDashboard, Users, Video, LogOut } from 'lucide-react';
import { requireAdmin } from '@/lib/firebase/adminGuard';

export const dynamic = 'force-dynamic';

const NAV = [
  { href: '/admin', label: '개요', icon: LayoutDashboard },
  { href: '/admin/users', label: '유저 관리', icon: Users },
  { href: '/admin/jobs', label: '영상 잡', icon: Video },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen flex bg-[var(--color-banjak-bg-gray)]">
      {/* 사이드바 */}
      <aside className="w-56 shrink-0 bg-white border-r border-[var(--color-banjak-border)] flex flex-col">
        <div className="px-5 py-5 border-b border-[var(--color-banjak-border)]">
          <p className="text-xs text-[var(--color-banjak-text-light)] mb-0.5">ADMIN</p>
          <p className="font-bold text-[var(--color-banjak-text-dark)]">Banjak Console</p>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-[var(--color-banjak-text-mid)] hover:bg-[var(--color-banjak-bg-gray)] hover:text-[var(--color-banjak-text-dark)] transition-colors"
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-[var(--color-banjak-border)]">
          <form action={async () => {
            'use server';
            const { cookies } = await import('next/headers');
            const cookieStore = await cookies();
            cookieStore.delete('__session');
            redirect('/');
          }}>
            <button
              type="submit"
              className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm text-[var(--color-banjak-text-mid)] hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              로그아웃
            </button>
          </form>
        </div>
      </aside>

      {/* 콘텐츠 */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
