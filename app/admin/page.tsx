import { Users, Video, Zap, AlertTriangle } from 'lucide-react';
import { adminDb } from '@/lib/firebase/admin';
import { requireAdmin } from '@/lib/firebase/adminGuard';

export const dynamic = 'force-dynamic';

async function getStats() {
  if (!adminDb) return { users: 0, videos: 0, pendingJobs: 0, failedJobs: 0, totalTokensIssued: 0, recentTransactions: [] };

  const [usersSnap, videosSnap, pendingSnap, failedSnap, txSnap] = await Promise.all([
    adminDb.collection('users').count().get(),
    adminDb.collection('videos').count().get(),
    adminDb.collection('videos').where('status', 'in', ['pending', 'processing']).count().get(),
    adminDb.collection('videos').where('status', '==', 'failed').limit(999).count().get(),
    adminDb.collection('transactions').orderBy('createdAt', 'desc').limit(10).get(),
  ]);

  const recentTransactions = txSnap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.()?.toLocaleString('ko-KR') ?? '-',
  }));

  return {
    users: usersSnap.data().count,
    videos: videosSnap.data().count,
    pendingJobs: pendingSnap.data().count,
    failedJobs: failedSnap.data().count,
    recentTransactions,
  };
}

export default async function AdminPage() {
  await requireAdmin();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let stats: any = { users: 0, videos: 0, pendingJobs: 0, failedJobs: 0, recentTransactions: [] };
  try { stats = await getStats(); } catch { /* ignore */ }

  const STAT_CARDS = [
    { label: '전체 유저', value: stats.users.toLocaleString(), icon: Users, color: 'text-blue-500' },
    { label: '전체 영상', value: stats.videos.toLocaleString(), icon: Video, color: 'text-[var(--color-banjak-primary)]' },
    { label: '처리 중 잡', value: stats.pendingJobs.toLocaleString(), icon: Zap, color: 'text-yellow-500' },
    { label: '실패 잡', value: stats.failedJobs.toLocaleString(), icon: AlertTriangle, color: 'text-red-500' },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-[var(--color-banjak-text-dark)] mb-6">개요</h1>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {STAT_CARDS.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-[var(--color-banjak-border)] shadow-soft">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-[var(--color-banjak-text-mid)]">{label}</p>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-[var(--color-banjak-text-dark)]">{value}</p>
          </div>
        ))}
      </div>

      {/* 최근 트랜잭션 */}
      <div className="bg-white rounded-2xl border border-[var(--color-banjak-border)] shadow-soft overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--color-banjak-border)]">
          <h2 className="font-semibold text-[var(--color-banjak-text-dark)]">최근 트랜잭션</h2>
        </div>
        <div className="divide-y divide-[var(--color-banjak-border)]">
          {stats.recentTransactions.length === 0 ? (
            <p className="text-center text-sm text-[var(--color-banjak-text-light)] py-8">트랜잭션 없음</p>
          ) : (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            stats.recentTransactions.map((tx: any) => (
              <div key={tx.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <div>
                  <p className="text-[var(--color-banjak-text-dark)] font-medium">{tx.description ?? tx.type}</p>
                  <p className="text-xs text-[var(--color-banjak-text-light)] mt-0.5">{tx.userId?.slice(0, 12)}…</p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}T
                  </p>
                  <p className="text-xs text-[var(--color-banjak-text-light)]">{tx.createdAt}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
