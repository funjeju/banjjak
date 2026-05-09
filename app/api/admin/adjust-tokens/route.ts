import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

async function isAdmin(session: string): Promise<string | null> {
  if (!adminAuth) return null;
  const adminUids = (process.env.ADMIN_UIDS ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    return adminUids.includes(decoded.uid) ? decoded.uid : null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  if (!adminDb) return NextResponse.json({ error: 'Server misconfigured' }, { status: 503 });

  const cookieStore = await cookies();
  const session = cookieStore.get('__session')?.value;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const adminUid = await isAdmin(session);
  if (!adminUid) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { uid, amount, reason } = await req.json();
  if (!uid || typeof amount !== 'number' || amount === 0) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const userRef = adminDb.collection('users').doc(uid);
  const userSnap = await userRef.get();
  if (!userSnap.exists) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const balanceBefore = userSnap.data()?.tokenBalance ?? 0;
  const balanceAfter = Math.max(0, balanceBefore + amount);

  await userRef.update({
    tokenBalance: balanceAfter,
    updatedAt: FieldValue.serverTimestamp(),
  });

  await adminDb.collection('transactions').add({
    userId: uid,
    type: 'admin_adjustment',
    amount,
    balanceBefore,
    balanceAfter,
    description: reason ? `어드민 조정: ${reason}` : '어드민 수동 조정',
    adminUid,
    createdAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ success: true, balanceAfter });
}
