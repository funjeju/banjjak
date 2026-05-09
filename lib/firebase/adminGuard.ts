import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminAuth } from './admin';

export async function requireAdmin() {
  const adminUids = (process.env.ADMIN_UIDS ?? '').split(',').map((s) => s.trim()).filter(Boolean);

  if (!adminUids.length || !adminAuth) redirect('/');

  const cookieStore = await cookies();
  const session = cookieStore.get('__session')?.value;
  if (!session) redirect('/sign-in?next=/admin');

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    if (!adminUids.includes(decoded.uid)) redirect('/');
    return decoded;
  } catch {
    redirect('/sign-in?next=/admin');
  }
}
