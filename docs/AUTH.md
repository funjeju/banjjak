# 🔐 AUTH.md — Firebase Auth 흐름

> Firebase Authentication을 사용. **Google OAuth + Email/Password** 두 가지 방식.

---

## 🎯 1. 인증 전략 개요

| 방식 | 사용처 | 장점 |
|---|---|---|
| **Google OAuth** | 메인 권장 | 1-click, 비밀번호 없음, 신뢰감 |
| **Email + Password** | 보조 | Google 계정 없는 사용자 대응 |

### 신규 가입 보너스
- 가입 즉시 **0.25 토큰** (15초 샘플 1회) 자동 지급
- `users.freeSampleUsed: false` 로 시작

---

## 🛠️ 2. Firebase 설정

### 2-1. Console에서 활성화

1. Firebase Console → Authentication → Sign-in method
2. **Google** 활성화
   - 프로젝트 지원 이메일 입력
   - 웹 SDK 구성에서 OAuth 클라이언트 ID 자동 생성
3. **이메일/비밀번호** 활성화
   - "이메일 링크 (비밀번호 없는 로그인)"는 선택

### 2-2. 도메인 화이트리스트 등록

Authentication → Settings → 승인된 도메인:
- `localhost` (개발)
- `banjak.vercel.app` (Vercel 기본)
- `banjak.app` (커스텀 도메인, 추후)

---

## 📦 3. 클라이언트 SDK (`lib/firebase/client.ts`)

```typescript
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

export const app = getApps().length === 0 
  ? initializeApp(firebaseConfig) 
  : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Google 로그인 시 추가 권한
googleProvider.setCustomParameters({
  prompt: 'select_account',  // 매번 계정 선택 화면
});
```

---

## 🔑 4. Server-side Admin SDK (`lib/firebase/admin.ts`)

```typescript
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export const adminAuth = getAuth();
export const adminDb = getFirestore();
```

> 🔐 `FIREBASE_PRIVATE_KEY`는 한 줄로 이스케이프된 형태로 저장. 코드에서 `\\n` → `\n` 변환.

---

## 🔓 5. 로그인 / 회원가입 페이지

### 5-1. Google 로그인

```typescript
// app/(auth)/sign-in/page.tsx
'use client';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase/client';
import { ensureUserDocument } from '@/lib/firebase/auth';

const handleGoogleSignIn = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    
    // 신규 가입자면 Firestore에 user document 생성
    await ensureUserDocument(result.user);
    
    // 메인 또는 이전 페이지로 리다이렉트
    router.push('/dashboard');
  } catch (err: any) {
    if (err.code === 'auth/popup-closed-by-user') return;
    toast.error('로그인에 실패했어요. 다시 시도해주세요.');
  }
};
```

### 5-2. Email 회원가입

```typescript
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';

const handleEmailSignUp = async (email: string, password: string, name: string) => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  
  // 표시 이름 업데이트
  await updateProfile(result.user, { displayName: name });
  
  // 인증 메일 전송
  await sendEmailVerification(result.user);
  
  // user document 생성
  await ensureUserDocument(result.user);
  
  toast.success('인증 메일을 확인해주세요.');
};
```

### 5-3. Email 로그인

```typescript
import { signInWithEmailAndPassword } from 'firebase/auth';

const handleEmailSignIn = async (email: string, password: string) => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  
  if (!result.user.emailVerified) {
    toast.warning('이메일 인증이 필요해요.');
    return;
  }
  
  router.push('/dashboard');
};
```

---

## 🆕 6. 신규 사용자 처리 (`lib/firebase/auth.ts`)

```typescript
import { User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './client';

export async function ensureUserDocument(user: User) {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  
  // 이미 존재 → 마지막 로그인 시각만 업데이트
  if (userSnap.exists()) {
    await setDoc(userRef, { lastLoginAt: serverTimestamp() }, { merge: true });
    return;
  }
  
  // 신규 사용자
  await setDoc(userRef, {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || user.email?.split('@')[0],
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
    authProvider: user.providerData[0]?.providerId === 'google.com' 
      ? 'google' 
      : 'email',
    
    // 무료 샘플 보너스
    tokenBalance: 0.25,
    freeSampleUsed: false,
    
    totalVideosCreated: 0,
    totalTokensUsed: 0,
    totalSpentKrw: 0,
    
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  });
  
  // 트랜잭션 로그 (가입 보너스)
  await setDoc(doc(db, 'transactions', `${user.uid}_signup`), {
    userId: user.uid,
    type: 'signup_bonus',
    amount: 0.25,
    balanceAfter: 0.25,
    description: '신규 가입 보너스 (15초 샘플)',
    createdAt: serverTimestamp(),
  });
}
```

---

## 🛡️ 7. 보호된 라우트 (Middleware)

### `middleware.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_PATHS = ['/create', '/dashboard', '/billing'];
const AUTH_PATHS = ['/sign-in', '/sign-up'];

export async function middleware(req: NextRequest) {
  const session = req.cookies.get('__session')?.value;
  const { pathname } = req.nextUrl;
  
  const isProtected = PROTECTED_PATHS.some(p => pathname.startsWith(p));
  const isAuthPage = AUTH_PATHS.some(p => pathname.startsWith(p));
  
  // 로그인 안됐는데 보호 경로 접근
  if (isProtected && !session) {
    const url = new URL('/sign-in', req.url);
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }
  
  // 로그인 했는데 로그인 페이지 접근
  if (isAuthPage && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

### 세션 쿠키 설정 (`/api/auth/session/route.ts`)

```typescript
import { adminAuth } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const { idToken } = await req.json();
  
  // 5일짜리 세션 쿠키 생성
  const expiresIn = 60 * 60 * 24 * 5 * 1000;
  const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
  
  cookies().set('__session', sessionCookie, {
    maxAge: expiresIn,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
  
  return Response.json({ success: true });
}
```

### 클라이언트에서 호출

```typescript
import { onAuthStateChanged } from 'firebase/auth';

useEffect(() => {
  const unsub = onAuthStateChanged(auth, async (user) => {
    if (user) {
      const idToken = await user.getIdToken();
      await fetch('/api/auth/session', {
        method: 'POST',
        body: JSON.stringify({ idToken }),
      });
    }
  });
  return unsub;
}, []);
```

---

## 🔓 8. 로그아웃

```typescript
const handleSignOut = async () => {
  await signOut(auth);
  await fetch('/api/auth/session', { method: 'DELETE' });
  router.push('/');
};
```

```typescript
// /api/auth/session/DELETE
export async function DELETE() {
  cookies().delete('__session');
  return Response.json({ success: true });
}
```

---

## 🔍 9. 서버에서 인증 상태 확인

### Server Component
```typescript
import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase/admin';

export async function getCurrentUser() {
  const session = cookies().get('__session')?.value;
  if (!session) return null;
  
  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    return decoded; // { uid, email, ... }
  } catch {
    return null;
  }
}

// 사용
export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in');
  // ...
}
```

### API Route
```typescript
export async function POST(req: Request) {
  const idToken = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!idToken) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  
  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    // 비즈니스 로직...
  } catch {
    return Response.json({ error: 'Invalid token' }, { status: 401 });
  }
}
```

---

## 🪝 10. Auth Context (React)

```typescript
// contexts/AuthContext.tsx
'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);
  
  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

---

## 🎨 11. UI 예시 (shadcn 기반)

### 로그인 페이지

```tsx
<Card className="w-full max-w-md p-8 rounded-3xl">
  <h1 className="text-3xl font-bold mb-2">Banjak에 오신 것을 환영해요</h1>
  <p className="text-text-mid mb-8">
    가입하면 15초 샘플 영상을 무료로 만들어볼 수 있어요 ✨
  </p>
  
  <Button 
    onClick={handleGoogleSignIn}
    className="w-full mb-3 bg-white hover:bg-bg-gray border border-border 
               text-text-dark rounded-2xl py-6">
    <GoogleIcon className="w-5 h-5 mr-2" />
    Google로 계속하기
  </Button>
  
  <div className="flex items-center gap-3 my-6">
    <Separator className="flex-1" />
    <span className="text-sm text-text-mid">또는</span>
    <Separator className="flex-1" />
  </div>
  
  {/* 이메일 폼 */}
  <form>...</form>
</Card>
```

---

## 🚨 12. 에러 처리

### 자주 발생하는 에러 코드

| 코드 | 의미 | 사용자 메시지 |
|---|---|---|
| `auth/popup-closed-by-user` | 팝업 닫음 | (무시) |
| `auth/email-already-in-use` | 이메일 중복 | "이미 가입된 이메일이에요" |
| `auth/invalid-email` | 이메일 형식 | "이메일 형식을 확인해주세요" |
| `auth/weak-password` | 비밀번호 약함 | "6자 이상 입력해주세요" |
| `auth/user-not-found` | 계정 없음 | "가입되지 않은 계정이에요" |
| `auth/wrong-password` | 비밀번호 틀림 | "비밀번호를 확인해주세요" |
| `auth/too-many-requests` | 시도 과다 | "잠시 후 다시 시도해주세요" |

```typescript
const errorMessages: Record<string, string> = {
  'auth/email-already-in-use': '이미 가입된 이메일이에요.',
  'auth/invalid-email': '이메일 형식을 확인해주세요.',
  'auth/weak-password': '비밀번호는 6자 이상이어야 해요.',
  // ...
};

const message = errorMessages[err.code] || '오류가 발생했어요.';
toast.error(message);
```

---

## 🔒 13. 보안 체크리스트

- [ ] Google OAuth 클라이언트 도메인 제한
- [ ] Firestore 보안 규칙 적용
- [ ] 세션 쿠키 `httpOnly` + `secure` (production)
- [ ] CSRF 토큰 (필요시)
- [ ] Email 인증 미완료 사용자 제한
- [ ] Rate limit (로그인 시도)
- [ ] Privacy Policy / Terms of Service 동의 체크
- [ ] 약관 변경 시 재동의 요청

---

## 📚 14. 참고

- Firebase Auth 문서: https://firebase.google.com/docs/auth
- Next.js + Firebase 패턴: https://github.com/vercel/next.js/tree/canary/examples/with-firebase
- 세션 쿠키 가이드: https://firebase.google.com/docs/auth/admin/manage-cookies
