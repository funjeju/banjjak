'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { JobStatus } from '@/lib/golpo/types';

interface JobStatusState {
  status: JobStatus | null;
  videoUrl: string | null;
  error: string | null;
}

export function useJobStatus(jobId: string | null) {
  const [state, setState] = useState<JobStatusState>({
    status: null,
    videoUrl: null,
    error: null,
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attemptsRef = useRef(0);

  const poll = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/status/${id}`);
      const data = await res.json();

      if (!res.ok) {
        setState((s) => ({ ...s, error: data.error ?? 'Status check failed' }));
        return;
      }

      setState({ status: data.status, videoUrl: data.video_url ?? null, error: null });

      if (data.status === 'completed' || data.status === 'failed') return;

      attemptsRef.current += 1;
      const delay = Math.min(5000 * Math.pow(1.2, attemptsRef.current), 30000);
      timerRef.current = setTimeout(() => poll(id), delay);
    } catch {
      setState((s) => ({ ...s, error: 'Network error' }));
    }
  }, []);

  useEffect(() => {
    if (!jobId) return;

    attemptsRef.current = 0;
    setState({ status: 'pending', videoUrl: null, error: null });
    poll(jobId);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [jobId, poll]);

  return state;
}
