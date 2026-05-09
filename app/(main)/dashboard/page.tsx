import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Sparkles, Plus, Zap, Video } from 'lucide-react';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatTokens, formatKrw } from '@/lib/tokens/calculator';

export const dynamic = 'force-dynamic';

async function getCurrentUser() {
  if (!adminAuth) return null;
  const cookieStore = await cookies();
  const session = cookieStore.get('__session')?.value;
  if (!session) return null;

  try {
    return await adminAuth.verifySessionCookie(session, true);
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  if (!adminDb) redirect('/sign-in?next=/dashboard');

  const user = await getCurrentUser();
  if (!user) redirect('/sign-in?next=/dashboard');

  const userDoc = await adminDb.collection('users').doc(user.uid).get();
  const userData = userDoc.data();
  const balance: number = userData?.tokenBalance ?? 0;

  const videosSnap = await adminDb!
    .collection('videos')
    .where('userId', '==', user.uid)
    .orderBy('createdAt', 'desc')
    .limit(20)
    .get();

  const videos = videosSnap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.()?.toLocaleDateString('ko-KR') ?? '-',
  }));

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* 프로필 헤더 */}
      <div className="bg-gradient-to-r from-[var(--color-banjak-primary-soft)]/40 to-[var(--color-banjak-secondary-soft)]/30 rounded-3xl p-6 mb-8 border border-[var(--color-banjak-border)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[var(--color-banjak-text-dark)]">
              안녕하세요, {userData?.displayName ?? user.email?.split('@')[0]}님 👋
            </h1>
            <p className="text-sm text-[var(--color-banjak-text-mid)] mt-0.5">{user.email}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white rounded-2xl px-5 py-3 border border-[var(--color-banjak-border)] shadow-soft">
              <p className="text-xs text-[var(--color-banjak-text-mid)]">토큰 잔액</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Zap className="w-4 h-4 text-[var(--color-banjak-primary)]" />
                <span className="font-bold text-[var(--color-banjak-text-dark)]">
                  {formatTokens(balance)}
                </span>
                <span className="text-xs text-[var(--color-banjak-text-light)]">
                  ({formatKrw(balance * 6000)} 상당)
                </span>
              </div>
            </div>

            <Button
              size="sm"
              className="rounded-full bg-[var(--color-banjak-primary)] hover:bg-[var(--color-banjak-primary-soft)] text-[var(--color-banjak-text-dark)]"
              asChild
            >
              <Link href="/billing">충전하기</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* 영상 목록 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-[var(--color-banjak-text-dark)]">
          내 영상 ({userData?.totalVideosCreated ?? 0}개)
        </h2>
        <Button
          size="sm"
          className="rounded-full bg-[var(--color-banjak-primary)] hover:bg-[var(--color-banjak-primary-soft)] text-[var(--color-banjak-text-dark)]"
          asChild
        >
          <Link href="/create">
            <Plus className="w-4 h-4 mr-1" />
            새 영상 만들기
          </Link>
        </Button>
      </div>

      {videos.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-[var(--color-banjak-border)] shadow-soft">
          <Video className="w-12 h-12 text-[var(--color-banjak-text-light)] mx-auto mb-4" />
          <p className="font-medium text-[var(--color-banjak-text-dark)]">아직 만든 영상이 없어요</p>
          <p className="text-sm text-[var(--color-banjak-text-mid)] mt-1 mb-6">첫 번째 AI 영상을 만들어보세요!</p>
          <Button
            className="rounded-full bg-[var(--color-banjak-primary)] hover:bg-[var(--color-banjak-primary-soft)] text-[var(--color-banjak-text-dark)]"
            asChild
          >
            <Link href="/create">
              <Sparkles className="w-4 h-4 mr-2" />
              영상 만들기
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {videos.map((video: any) => (
            <div
              key={video.id}
              className="bg-white rounded-3xl p-4 shadow-soft border border-[var(--color-banjak-border)] hover:shadow-soft-md transition-all duration-200"
            >
              <div className="relative aspect-video rounded-2xl overflow-hidden mb-3 bg-[var(--color-banjak-bg-gray)]">
                {video.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="w-8 h-8 text-[var(--color-banjak-text-light)]" />
                  </div>
                )}
                <Badge
                  className={`absolute top-2 right-2 text-xs ${
                    video.status === 'completed'
                      ? 'bg-[var(--color-banjak-accent)] text-[var(--color-banjak-text-dark)]'
                      : video.status === 'failed'
                      ? 'bg-[var(--color-banjak-error)] text-white'
                      : 'bg-white text-[var(--color-banjak-text-mid)]'
                  }`}
                >
                  {video.status === 'completed' ? '완료' : video.status === 'failed' ? '실패' : '처리 중'}
                </Badge>
              </div>

              <p className="text-sm text-[var(--color-banjak-text-dark)] line-clamp-2 mb-2">
                {video.prompt ?? video.newScript ?? '(원고 모드)'}
              </p>

              <div className="flex items-center justify-between text-xs text-[var(--color-banjak-text-light)]">
                <span>{video.createdAt}</span>
                <span>{video.params?.timing < 1 ? video.params.timing * 60 + '초' : video.params?.timing + '분'}</span>
              </div>

              {video.status === 'completed' && video.videoUrl && (
                <a
                  href={video.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-3 text-center text-xs font-medium text-[var(--color-banjak-primary)] hover:underline"
                >
                  영상 보기 →
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
