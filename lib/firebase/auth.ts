import { User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './client';

export async function ensureUserDocument(user: User): Promise<void> {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    await setDoc(userRef, { lastLoginAt: serverTimestamp() }, { merge: true });
    return;
  }

  await setDoc(userRef, {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || user.email?.split('@')[0],
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
    authProvider:
      user.providerData[0]?.providerId === 'google.com' ? 'google' : 'email',
    tokenBalance: 0.5,
    freeSampleUsed: false,
    totalVideosCreated: 0,
    totalTokensUsed: 0,
    totalSpentKrw: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  });

  await setDoc(doc(db, 'transactions', `${user.uid}_signup`), {
    userId: user.uid,
    type: 'signup_bonus',
    amount: 0.5,
    balanceAfter: 0.5,
    description: '신규 가입 보너스 (15초 샘플 1회)',
    createdAt: serverTimestamp(),
  });
}
