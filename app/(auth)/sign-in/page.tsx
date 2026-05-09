'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { auth, googleProvider } from '@/lib/firebase/client';
import { ensureUserDocument } from '@/lib/firebase/auth';

const AUTH_ERRORS: Record<string, string> = {
  'auth/user-not-found': '가입되지 않은 계정이에요.',
  'auth/wrong-password': '비밀번호를 확인해주세요.',
  'auth/invalid-credential': '이메일 또는 비밀번호가 잘못되었어요.',
  'auth/too-many-requests': '잠시 후 다시 시도해주세요.',
  'auth/popup-closed-by-user': '',
};

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await ensureUserDocument(result.user);
      router.push(next);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      const msg = AUTH_ERRORS[code];
      if (msg) toast.error(msg);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      if (!result.user.emailVerified) {
        toast.warning('이메일 인증이 필요해요. 메일함을 확인해주세요.');
        return;
      }
      router.push(next);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      toast.error(AUTH_ERRORS[code] ?? '로그인에 실패했어요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-3xl p-8 shadow-soft border border-[var(--color-banjak-border)]">
        <h1 className="text-2xl font-bold text-[var(--color-banjak-text-dark)] mb-1">로그인</h1>
        <p className="text-sm text-[var(--color-banjak-text-mid)] mb-6">
          계속하려면 로그인해주세요.
        </p>

        <Button
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          variant="outline"
          className="w-full rounded-2xl py-5 border-[var(--color-banjak-border)] hover:bg-[var(--color-banjak-bg-gray)] mb-4"
        >
          {googleLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          )}
          Google로 계속하기
        </Button>

        <div className="flex items-center gap-3 my-4">
          <Separator className="flex-1" />
          <span className="text-xs text-[var(--color-banjak-text-light)]">또는</span>
          <Separator className="flex-1" />
        </div>

        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-sm text-[var(--color-banjak-text-dark)]">이메일</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hello@example.com"
              required
              className="mt-1 rounded-2xl bg-[var(--color-banjak-bg-gray)] border-0 focus-visible:ring-[var(--color-banjak-primary)]"
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-sm text-[var(--color-banjak-text-dark)]">비밀번호</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="mt-1 rounded-2xl bg-[var(--color-banjak-bg-gray)] border-0 focus-visible:ring-[var(--color-banjak-primary)]"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-full py-5 bg-[var(--color-banjak-primary)] hover:bg-[var(--color-banjak-primary-soft)] text-[var(--color-banjak-text-dark)] font-medium"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            로그인
          </Button>
        </form>

        <p className="text-center text-sm text-[var(--color-banjak-text-mid)] mt-6">
          계정이 없으신가요?{' '}
          <Link href="/sign-up" className="font-medium text-[var(--color-banjak-text-dark)] underline underline-offset-2">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
