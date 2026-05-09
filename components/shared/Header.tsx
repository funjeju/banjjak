'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { Sparkles, LogOut, LayoutDashboard, CreditCard, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useTokenBalance } from '@/lib/hooks/useTokenBalance';
import { auth } from '@/lib/firebase/client';
import { formatTokens } from '@/lib/tokens/calculator';

export function Header() {
  const { user, loading } = useAuth();
  const { balance } = useTokenBalance();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut(auth);
    await fetch('/api/auth/session', { method: 'DELETE' });
    router.push('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-[var(--color-banjak-text-dark)]">
          <Sparkles className="w-5 h-5 text-[var(--color-banjak-primary)]" />
          Banjak
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[var(--color-banjak-text-mid)]">
          <Link href="/pricing" className="hover:text-[var(--color-banjak-text-dark)] transition-colors">
            요금제
          </Link>
          {user && (
            <Link href="/create" className="hover:text-[var(--color-banjak-text-dark)] transition-colors">
              영상 만들기
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {!loading && !user && (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/sign-in">로그인</Link>
              </Button>
              <Button
                size="sm"
                className="bg-[var(--color-banjak-primary)] hover:bg-[var(--color-banjak-primary-soft)] text-[var(--color-banjak-text-dark)] rounded-full"
                asChild
              >
                <Link href="/sign-up">시작하기</Link>
              </Button>
            </>
          )}

          {!loading && user && (
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="border-[var(--color-banjak-border)] text-[var(--color-banjak-text-mid)] text-xs"
              >
                <Zap className="w-3 h-3 mr-1 text-[var(--color-banjak-primary)]" />
                {formatTokens(balance)}
              </Badge>

              <Button
                size="sm"
                className="bg-[var(--color-banjak-primary)] hover:bg-[var(--color-banjak-primary-soft)] text-[var(--color-banjak-text-dark)] rounded-full hidden md:flex"
                asChild
              >
                <Link href="/create">
                  <Sparkles className="w-4 h-4 mr-1" />
                  영상 만들기
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-banjak-primary)] focus-visible:ring-offset-2">
                  <Avatar className="w-8 h-8 cursor-pointer ring-2 ring-[var(--color-banjak-primary-soft)]">
                    <AvatarImage src={user.photoURL ?? undefined} />
                    <AvatarFallback className="bg-[var(--color-banjak-primary-soft)] text-[var(--color-banjak-text-dark)] text-xs">
                      {user.displayName?.[0] ?? user.email?.[0] ?? 'U'}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-3 py-2 text-sm">
                    <p className="font-medium truncate">{user.displayName ?? '사용자'}</p>
                    <p className="text-xs text-[var(--color-banjak-text-mid)] truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem render={<Link href="/dashboard" />} className="cursor-pointer">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    마이페이지
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/billing" />} className="cursor-pointer">
                    <CreditCard className="w-4 h-4 mr-2" />
                    토큰 충전
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-[var(--color-banjak-error)] cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
