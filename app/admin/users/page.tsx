import { adminDb } from '@/lib/firebase/admin';
import { requireAdmin } from '@/lib/firebase/adminGuard';
import { Zap } from 'lucide-react';
import AdjustTokenForm from './AdjustTokenForm';

export const dynamic = 'force-dynamic';

async function getUsers(searchEmail?: string) {
  if (!adminDb) return [];

  let query = adminDb.collection('users').orderBy('createdAt', 'desc').limit(50);
  const snap = await query.get();

  const users = snap.docs.map((doc) => ({
    uid: doc.id,
    email: doc.data().email ?? '',
    displayName: doc.data().displayName ?? '-',
    tokenBalance: doc.data().tokenBalance ?? 0,
    totalVideosCreated: doc.data().totalVideosCreated ?? 0,
    totalSpentKrw: doc.data().totalSpentKrw ?? 0,
    createdAt: doc.data().createdAt?.toDate?.()?.toLocaleDateString('ko-KR') ?? '-',
  }));

  if (searchEmail) {
    return users.filter((u) => u.email.toLowerCase().includes(searchEmail.toLowerCase()));
  }
  return users;
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAdmin();
  const { q } = await searchParams;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let users: any[] = [];
  try { users = await getUsers(q); } catch { /* ignore */ }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-banjak-text-dark)]">유저 관리</h1>
        <form method="GET" className="flex gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="이메일 검색"
            className="px-4 py-2 rounded-xl border border-[var(--color-banjak-border)] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-banjak-primary)] w-64"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[var(--color-banjak-primary)] text-sm font-medium text-[var(--color-banjak-text-dark)]"
          >
            검색
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-[var(--color-banjak-border)] shadow-soft overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-banjak-bg-gray)] border-b border-[var(--color-banjak-border)]">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-medium text-[var(--color-banjak-text-mid)]">유저</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-[var(--color-banjak-text-mid)]">토큰 잔액</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-[var(--color-banjak-text-mid)]">영상 수</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-[var(--color-banjak-text-mid)]">총 결제</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-[var(--color-banjak-text-mid)]">가입일</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-[var(--color-banjak-text-mid)]">토큰 조정</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-banjak-border)]">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-[var(--color-banjak-text-light)]">유저 없음</td>
              </tr>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              users.map((user: any) => (
                <tr key={user.uid} className="hover:bg-[var(--color-banjak-bg-gray)]/50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-medium text-[var(--color-banjak-text-dark)]">{user.displayName}</p>
                    <p className="text-xs text-[var(--color-banjak-text-light)] mt-0.5">{user.email}</p>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className="inline-flex items-center gap-1 font-semibold text-[var(--color-banjak-text-dark)]">
                      <Zap className="w-3.5 h-3.5 text-[var(--color-banjak-primary)]" />
                      {user.tokenBalance}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-[var(--color-banjak-text-mid)]">{user.totalVideosCreated}</td>
                  <td className="px-5 py-3 text-right text-[var(--color-banjak-text-mid)]">
                    {user.totalSpentKrw > 0 ? `${user.totalSpentKrw.toLocaleString()}원` : '-'}
                  </td>
                  <td className="px-5 py-3 text-right text-[var(--color-banjak-text-light)]">{user.createdAt}</td>
                  <td className="px-5 py-3 text-right">
                    <AdjustTokenForm uid={user.uid} currentBalance={user.tokenBalance} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
