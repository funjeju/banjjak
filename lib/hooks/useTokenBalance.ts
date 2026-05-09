'use client';

import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useTokenBalance() {
  const { user } = useAuth();
  // loaded: 첫 스냅샷 수신 여부 — loading은 상태 대신 파생값으로 처리
  const [data, setData] = useState<{ balance: number; loaded: boolean }>({
    balance: 0,
    loaded: false,
  });

  useEffect(() => {
    if (!user) return;

    const unsub = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      setData({ balance: snap.data()?.tokenBalance ?? 0, loaded: true });
    });

    return unsub;
  }, [user]);

  return {
    balance: data.balance,
    loading: !!user && !data.loaded,
  };
}
