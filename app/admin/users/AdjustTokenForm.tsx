'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function AdjustTokenForm({ uid, currentBalance }: { uid: string; currentBalance: number }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed === 0) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/adjust-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, amount: parsed, reason }),
      });
      if (!res.ok) throw new Error();
      toast.success(`토큰 조정 완료 (${parsed > 0 ? '+' : ''}${parsed}T)`);
      setOpen(false);
      setAmount('');
      setReason('');
    } catch {
      toast.error('토큰 조정 실패');
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1.5 rounded-lg border border-[var(--color-banjak-border)] text-xs text-[var(--color-banjak-text-mid)] hover:bg-[var(--color-banjak-bg-gray)] transition-colors"
      >
        조정
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 items-end min-w-[160px]">
      <input
        type="number"
        step="0.5"
        placeholder="예: 5 또는 -1"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full px-2 py-1 rounded-lg border border-[var(--color-banjak-border)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-banjak-primary)]"
        required
        autoFocus
      />
      <input
        type="text"
        placeholder="사유 (선택)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="w-full px-2 py-1 rounded-lg border border-[var(--color-banjak-border)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-banjak-primary)]"
      />
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-2.5 py-1 rounded-lg text-xs text-[var(--color-banjak-text-light)] hover:bg-[var(--color-banjak-bg-gray)]"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--color-banjak-primary)] text-xs font-medium text-[var(--color-banjak-text-dark)]"
        >
          {loading && <Loader2 className="w-3 h-3 animate-spin" />}
          적용
        </button>
      </div>
      <p className="text-[10px] text-[var(--color-banjak-text-light)]">현재: {currentBalance}T</p>
    </form>
  );
}
