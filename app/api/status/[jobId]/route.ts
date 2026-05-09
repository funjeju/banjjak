import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { golpoGetStatus } from '@/lib/golpo/client';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    if (!adminAuth || !adminDb) return NextResponse.json({ error: 'Server misconfigured' }, { status: 503 });
    const cookieStore = await cookies();
    const session = cookieStore.get('__session')?.value;
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await adminAuth.verifySessionCookie(session, true);

    const { jobId } = await params;
    const statusData = await golpoGetStatus(jobId);

    if (statusData.status === 'completed' && statusData.video_url) {
      const videosSnap = await adminDb!
        .collection('videos')
        .where('jobId', '==', jobId)
        .limit(1)
        .get();

      if (!videosSnap.empty) {
        await videosSnap.docs[0].ref.update({
          status: 'completed',
          videoUrl: statusData.video_url,
          thumbnailUrl: statusData.thumbnail_url ?? null,
          completedAt: new Date(),
          updatedAt: new Date(),
        });
      }
    } else if (statusData.status === 'failed') {
      const videosSnap = await adminDb!
        .collection('videos')
        .where('jobId', '==', jobId)
        .limit(1)
        .get();

      if (!videosSnap.empty) {
        await videosSnap.docs[0].ref.update({
          status: 'failed',
          errorMessage: statusData.detail ?? 'Generation failed',
          updatedAt: new Date(),
        });
      }
    }

    return NextResponse.json(statusData);
  } catch (err: unknown) {
    console.error('[status] error', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
