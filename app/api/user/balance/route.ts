import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!adminAuth || !adminDb) return NextResponse.json({ error: 'Server misconfigured' }, { status: 503 });
    const cookieStore = await cookies();
    const session = cookieStore.get('__session')?.value;
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await adminAuth.verifySessionCookie(session, true);
    const userDoc = await adminDb.collection('users').doc(decoded.uid).get();
    const balance = userDoc.data()?.tokenBalance ?? 0;

    return NextResponse.json({ balance });
  } catch {
    return NextResponse.json({ error: 'Failed to get balance' }, { status: 500 });
  }
}
