'use client';

import { useEffect, useRef, useState } from 'react';
import type { JobStatus } from '@/lib/golpo/types';

interface JobStatusState {
  status: JobStatus | null;
  videoUrl: string | null;
  error: string | null;
}

export function useJobStatus(jobId: string | null) {
  // forJobId: 현재 상태가 어떤 jobId에 대한 것인지 추적
  // jobId가 바뀌면 렌더 중에 파생값으로 'pending' 반환 → effect 안 setState 불필요
  const [internal, setInternal] = useState<{ forJobId: string | null } & JobStatusState>({
    forJobId: null,
    status: null,
    videoUrl: null,
    error: null,
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attemptsRef = useRef(0);
  const pollRef = useRef<((id: string) => Promise<void>) | undefined>(undefined);

  useEffect(() => {
    pollRef.current = async (id: string) => {
      try {
        const res = await fetch(`/api/status/${id}`);
        const data = await res.json();

        if (!res.ok) {
          setInternal((s) => ({ ...s, error: data.error ?? 'Status check failed' }));
          return;
        }

        setInternal({ forJobId: id, status: data.status, videoUrl: data.video_url ?? null, error: null });

        if (data.status === 'completed' || data.status === 'failed') return;

        attemptsRef.current += 1;
        const delay = Math.min(5000 * Math.pow(1.2, attemptsRef.current), 30000);
        timerRef.current = setTimeout(() => pollRef.current?.(id), delay);
      } catch {
        setInternal((s) => ({ ...s, error: 'Network error' }));
      }
    };
  });

  useEffect(() => {
    if (!jobId) return;

    attemptsRef.current = 0;
    pollRef.current?.(jobId);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [jobId]);

  // jobId가 바뀌었지만 아직 첫 응답 전이면 pending을 렌더 중 파생값으로 반환
  const state: JobStatusState = internal.forJobId === jobId
    ? internal
    : { status: jobId ? 'pending' : null, videoUrl: null, error: null };

  return state;
}
