import Link from 'next/link';
import { adminDb } from '@/lib/firebase/admin';
import { requireAdmin } from '@/lib/firebase/adminGuard';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

const STATUS_LABEL: Record<string, string> = {
  pending: '대기',
  processing: '처리 중',
  completed: '완료',
  failed: '실패',
};

const STATUS_CLASS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
};

async function getJobs(status?: string) {
  if (!adminDb) return [];

  let query = adminDb.collection('videos').orderBy('createdAt', 'desc').limit(50);

  if (status && status !== 'all') {
    query = adminDb
      .collection('videos')
      .where('status', '==', status)
      .orderBy('createdAt', 'desc')
      .limit(50);
  }

  const snap = await query.get();
  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.()?.toLocaleString('ko-KR') ?? '-',
  }));
}

export default async function AdminJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const { status } = await searchParams;
  const activeStatus = status ?? 'all';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let jobs: any[] = [];
  try { jobs = await getJobs(activeStatus); } catch { /* ignore */ }

  const TABS = ['all', 'pending', 'processing', 'completed', 'failed'];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-[var(--color-banjak-text-dark)] mb-6">영상 잡</h1>

      {/* 탭 */}
      <div className="flex gap-2 mb-5">
        {TABS.map((s) => (
          <Link
            key={s}
            href={`/admin/jobs${s !== 'all' ? `?status=${s}` : ''}`}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeStatus === s
                ? 'bg-[var(--color-banjak-text-dark)] text-white'
                : 'bg-white border border-[var(--color-banjak-border)] text-[var(--color-banjak-text-mid)] hover:bg-[var(--color-banjak-bg-gray)]'
            }`}
          >
            {s === 'all' ? '전체' : STATUS_LABEL[s]}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[var(--color-banjak-border)] shadow-soft overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-banjak-bg-gray)] border-b border-[var(--color-banjak-border)]">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-medium text-[var(--color-banjak-text-mid)]">잡 ID</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-[var(--color-banjak-text-mid)]">유저 ID</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-[var(--color-banjak-text-mid)]">상태</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-[var(--color-banjak-text-mid)]">길이</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-[var(--color-banjak-text-mid)]">생성일</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-[var(--color-banjak-text-mid)]">영상</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-banjak-border)]">
            {jobs.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-[var(--color-banjak-text-light)]">잡 없음</td>
              </tr>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              jobs.map((job: any) => (
                <tr
                  key={job.id}
                  className={`hover:bg-[var(--color-banjak-bg-gray)]/50 transition-colors ${
                    job.status === 'failed' ? 'bg-red-50/50' : ''
                  }`}
                >
                  <td className="px-5 py-3">
                    <p className="font-mono text-xs text-[var(--color-banjak-text-dark)]">{job.id.slice(0, 16)}…</p>
                    <p className="text-xs text-[var(--color-banjak-text-light)] mt-0.5 truncate max-w-[200px]">
                      {job.prompt ?? job.newScript ?? '(원고 모드)'}
                    </p>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-[var(--color-banjak-text-light)]">
                    {job.userId?.slice(0, 12)}…
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CLASS[job.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_LABEL[job.status] ?? job.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-[var(--color-banjak-text-mid)]">
                    {job.params?.timing < 1
                      ? `${job.params.timing * 60}초`
                      : `${job.params?.timing}분`}
                  </td>
                  <td className="px-5 py-3 text-right text-xs text-[var(--color-banjak-text-light)]">{job.createdAt}</td>
                  <td className="px-5 py-3 text-right">
                    {job.videoUrl ? (
                      <a
                        href={job.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[var(--color-banjak-primary)] hover:underline"
                      >
                        보기 →
                      </a>
                    ) : (
                      <span className="text-xs text-[var(--color-banjak-text-light)]">-</span>
                    )}
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
