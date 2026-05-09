'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Sparkles, Loader2, Zap, Play, Square, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  DURATIONS,
  SKETCH_STYLES,
  CANVAS_STYLES,
  VOICES,
  MUSIC_TRACKS,
  LANGUAGES,
} from '@/lib/golpo/constants';
import { calculateCost, formatKrw, formatTokens } from '@/lib/tokens/calculator';
import { useTokenBalance } from '@/lib/hooks/useTokenBalance';
import { useJobStatus } from '@/lib/hooks/useJobStatus';
import type { VideoType } from '@/lib/golpo/types';

type EngineType = 'sketch' | 'canvas';
type InputMode = 'prompt' | 'script';

export default function CreatePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { balance } = useTokenBalance();

  const [inputMode, setInputMode] = useState<InputMode>('prompt');
  const [prompt, setPrompt] = useState('');
  const [script, setScript] = useState('');
  const [timing, setTiming] = useState(1);
  const [videoType, setVideoType] = useState<VideoType>('long');
  const [engine, setEngine] = useState<EngineType>('canvas');
  const [sketchStyle, setSketchStyle] = useState('false');
  const [canvasStyle, setCanvasStyle] = useState('modern_minimal');
  const [voiceStyle, setVoiceStyle] = useState('solo-female-3');
  const [language, setLanguage] = useState('ko');
  const [bgMusic, setBgMusic] = useState('engaging');
  const [playingMusic, setPlayingMusic] = useState<string | null>(null);

  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const voiceVideoRef = useRef<HTMLVideoElement | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);

  const { status, videoUrl, error: statusError } = useJobStatus(jobId);

  // 모든 hook 호출 후 auth 가드
  useEffect(() => {
    if (!authLoading && !user) router.replace('/sign-in?next=/create');
  }, [user, authLoading, router]);

  const cost = calculateCost(timing);
  const hasBalance = balance >= cost.tokens;

  const handleSubmit = async () => {
    const content = inputMode === 'prompt' ? prompt.trim() : script.trim();
    if (!content) {
      toast.error('내용을 입력해주세요.');
      return;
    }
    if (!hasBalance) {
      toast.error('토큰이 부족해요. 충전해주세요.', {
        action: { label: '충전하기', onClick: () => router.push('/billing') },
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        timing,
        video_type: videoType,
        language,
        bg_music: bgMusic,
        style: voiceStyle,
      };

      if (inputMode === 'prompt') payload.prompt = content;
      else payload.new_script = content;

      if (engine === 'sketch') {
        payload.use_lineart_2_style = sketchStyle;
      } else {
        payload.use_2_0_style = true;
        payload.image_style = canvasStyle;
      }

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.error === 'INSUFFICIENT_TOKENS') {
          toast.error('토큰이 부족해요.', {
            action: { label: '충전하기', onClick: () => router.push('/billing') },
          });
        } else {
          toast.error(data.error ?? '생성에 실패했어요.');
        }
        return;
      }

      setJobId(data.jobId);
      toast('영상 생성을 시작했어요! ⏱️', { description: '완료까지 1~3분 정도 걸려요.' });
    } catch {
      toast.error('네트워크 오류가 발생했어요.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--color-banjak-primary)]" />
      </div>
    );
  }

  if (jobId && status) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-banjak-bg-cream)]">
        <div className="w-full max-w-lg">
          {status === 'completed' && videoUrl ? (
            <div className="bg-white rounded-3xl p-8 shadow-soft border border-[var(--color-banjak-border)] text-center">
              <CheckCircle2 className="w-12 h-12 text-[var(--color-banjak-accent)] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[var(--color-banjak-text-dark)] mb-2">영상 완성! 🎉</h2>
              <p className="text-[var(--color-banjak-text-mid)] mb-6">영상이 성공적으로 생성되었어요.</p>
              <video
                src={videoUrl}
                controls
                className="w-full rounded-2xl mb-6"
                poster=""
              />
              <div className="flex gap-3 justify-center">
                <Button
                  className="rounded-full bg-[var(--color-banjak-primary)] hover:bg-[var(--color-banjak-primary-soft)] text-[var(--color-banjak-text-dark)]"
                  onClick={() => router.push('/dashboard')}
                >
                  마이페이지에서 보기
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => {
                    setJobId(null);
                    setPrompt('');
                    setScript('');
                  }}
                >
                  새 영상 만들기
                </Button>
              </div>
            </div>
          ) : status === 'failed' ? (
            <div className="bg-white rounded-3xl p-8 shadow-soft border border-[var(--color-banjak-border)] text-center">
              <XCircle className="w-12 h-12 text-[var(--color-banjak-error)] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[var(--color-banjak-text-dark)] mb-2">생성 실패</h2>
              <p className="text-[var(--color-banjak-text-mid)] mb-6">{statusError ?? '영상 생성에 실패했어요.'}</p>
              <Button
                className="rounded-full bg-[var(--color-banjak-primary)] hover:bg-[var(--color-banjak-primary-soft)] text-[var(--color-banjak-text-dark)]"
                onClick={() => setJobId(null)}
              >
                다시 시도
              </Button>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-[var(--color-banjak-primary-soft)] via-[var(--color-banjak-secondary-soft)] to-[var(--color-banjak-accent-soft)] animate-shimmer rounded-3xl p-8 text-center border border-[var(--color-banjak-border)]">
              <Loader2 className="w-10 h-10 text-[var(--color-banjak-text-dark)] mx-auto mb-4 animate-spin" />
              <h2 className="text-xl font-bold text-[var(--color-banjak-text-dark)] mb-2">영상 생성 중...</h2>
              <p className="text-sm text-[var(--color-banjak-text-mid)] mb-4">
                {status === 'pending' && '대기열에서 기다리는 중이에요'}
                {status === 'processing' && '화면을 그리고 있어요 ✏️'}
              </p>
              <Progress value={status === 'processing' ? 60 : 20} className="max-w-xs mx-auto" />
              <p className="text-xs text-[var(--color-banjak-text-light)] mt-4">
                완료되면 자동으로 표시됩니다 (1~3분 소요)
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-banjak-text-dark)]">영상 만들기</h1>
        <p className="text-[var(--color-banjak-text-mid)] mt-1 text-sm">아래 옵션을 설정하고 영상을 생성하세요.</p>
      </div>

      <div className="space-y-6">
        {/* Step 1: 입력 */}
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-[var(--color-banjak-border)]">
          <h2 className="font-semibold text-[var(--color-banjak-text-dark)] mb-4">1. 무엇을 만들까요?</h2>
          <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as InputMode)}>
            <TabsList className="bg-[var(--color-banjak-bg-gray)] rounded-full p-1 mb-4">
              <TabsTrigger value="prompt" className="rounded-full px-5 data-[state=active]:bg-white">
                프롬프트
              </TabsTrigger>
              <TabsTrigger value="script" className="rounded-full px-5 data-[state=active]:bg-white">
                직접 원고
              </TabsTrigger>
            </TabsList>
            <TabsContent value="prompt">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="예: 양자역학의 기초를 쉽게 설명해줘. 초등학생도 이해할 수 있도록."
                className="min-h-32 rounded-2xl bg-[var(--color-banjak-bg-gray)] border-0 focus-visible:ring-[var(--color-banjak-primary)] resize-none"
              />
              <p className="text-xs text-[var(--color-banjak-text-light)] mt-2">
                주제, 대상, 톤을 함께 적으면 더 좋아요.
              </p>
            </TabsContent>
            <TabsContent value="script">
              <Textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder="직접 작성한 대본을 입력하세요. 1분당 최대 1,050자 (한글 기준)."
                className="min-h-40 rounded-2xl bg-[var(--color-banjak-bg-gray)] border-0 focus-visible:ring-[var(--color-banjak-primary)] resize-none"
              />
              <p className="text-xs text-[var(--color-banjak-text-light)] mt-2">
                현재 {script.length}자 / {timing * 1050}자 가능
              </p>
            </TabsContent>
          </Tabs>
        </div>

        {/* Step 2: 영상 설정 */}
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-[var(--color-banjak-border)]">
          <h2 className="font-semibold text-[var(--color-banjak-text-dark)] mb-4">2. 영상 설정</h2>

          <div className="mb-4">
            <p className="text-sm text-[var(--color-banjak-text-mid)] mb-2">영상 길이</p>
            <div className="flex flex-wrap gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setTiming(d.value)}
                  className={cn(
                    'px-4 py-2 rounded-2xl border-2 text-sm transition-all duration-150',
                    timing === d.value
                      ? 'border-[var(--color-banjak-primary)] bg-[var(--color-banjak-primary-soft)]/30 text-[var(--color-banjak-text-dark)] font-medium'
                      : 'border-[var(--color-banjak-border)] hover:bg-[var(--color-banjak-bg-gray)] text-[var(--color-banjak-text-mid)]'
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-[var(--color-banjak-text-mid)] mb-2">영상 비율</p>
            <div className="flex gap-2">
              {([['long', '가로 16:9', 'YouTube'], ['short', '세로 9:16', 'Shorts/Reels']] as const).map(
                ([val, label, desc]) => (
                  <button
                    key={val}
                    onClick={() => setVideoType(val)}
                    className={cn(
                      'flex-1 py-3 rounded-2xl border-2 text-sm transition-all duration-150',
                      videoType === val
                        ? 'border-[var(--color-banjak-primary)] bg-[var(--color-banjak-primary-soft)]/30 text-[var(--color-banjak-text-dark)] font-medium'
                        : 'border-[var(--color-banjak-border)] hover:bg-[var(--color-banjak-bg-gray)] text-[var(--color-banjak-text-mid)]'
                    )}
                  >
                    <div>{label}</div>
                    <div className="text-xs opacity-70">{desc}</div>
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Step 3: 스타일 */}
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-[var(--color-banjak-border)]">
          <h2 className="font-semibold text-[var(--color-banjak-text-dark)] mb-4">3. 스타일</h2>
          <Tabs value={engine} onValueChange={(v) => setEngine(v as EngineType)}>
            <TabsList className="bg-[var(--color-banjak-bg-gray)] rounded-full p-1 mb-4">
              <TabsTrigger value="canvas" className="rounded-full px-5 data-[state=active]:bg-white">
                🎨 Canvas
              </TabsTrigger>
              <TabsTrigger value="sketch" className="rounded-full px-5 data-[state=active]:bg-white">
                🖋️ Sketch
              </TabsTrigger>
            </TabsList>

            <TabsContent value="canvas">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {CANVAS_STYLES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setCanvasStyle(s.id)}
                    className={cn(
                      'p-3 rounded-2xl border-2 text-center transition-all duration-150',
                      canvasStyle === s.id
                        ? 'border-[var(--color-banjak-primary)] bg-[var(--color-banjak-primary-soft)]/20'
                        : 'border-[var(--color-banjak-border)] hover:bg-[var(--color-banjak-bg-gray)]'
                    )}
                  >
                    <div className="text-2xl">{s.emoji}</div>
                    <div className="text-xs font-medium text-[var(--color-banjak-text-dark)] mt-1">{s.label}</div>
                  </button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="sketch">
              <div className="grid grid-cols-3 gap-2">
                {SKETCH_STYLES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSketchStyle(s.value)}
                    className={cn(
                      'p-4 rounded-2xl border-2 text-center transition-all duration-150',
                      sketchStyle === s.value
                        ? 'border-[var(--color-banjak-primary)] bg-[var(--color-banjak-primary-soft)]/20'
                        : 'border-[var(--color-banjak-border)] hover:bg-[var(--color-banjak-bg-gray)]'
                    )}
                  >
                    <div className="font-medium text-[var(--color-banjak-text-dark)] text-sm">{s.label}</div>
                    <div className="text-xs text-[var(--color-banjak-text-mid)] mt-0.5">{s.description}</div>
                  </button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Step 4: 음성 & 음악 */}
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-[var(--color-banjak-border)]">
          <h2 className="font-semibold text-[var(--color-banjak-text-dark)] mb-4">4. 음성 & 음악</h2>

          <div className="mb-4">
            <p className="text-sm text-[var(--color-banjak-text-mid)] mb-2">음성</p>
            <div className="grid grid-cols-2 gap-2">
              {VOICES.map((v) => (
                <div
                  key={v.id}
                  className={cn(
                    'rounded-2xl border-2 overflow-hidden transition-all duration-150',
                    voiceStyle === v.id
                      ? 'border-[var(--color-banjak-primary)] bg-[var(--color-banjak-primary-soft)]/20'
                      : 'border-[var(--color-banjak-border)] bg-white'
                  )}
                >
                  <button
                    onClick={() => setVoiceStyle(v.id)}
                    className="w-full p-3 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={cn(
                          'text-sm font-medium',
                          voiceStyle === v.id ? 'text-[var(--color-banjak-text-dark)]' : 'text-[var(--color-banjak-text-mid)]'
                        )}>
                          {v.gender === 'female' ? '👩' : '👨'} {v.label}
                        </p>
                        <p className="text-xs text-[var(--color-banjak-text-light)] mt-0.5">{v.description}</p>
                      </div>
                      {v.sampleVideoUrl ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPlayingVoice(playingVoice === v.id ? null : v.id);
                          }}
                          className="w-7 h-7 rounded-full bg-[var(--color-banjak-primary-soft)] flex items-center justify-center flex-shrink-0"
                        >
                          {playingVoice === v.id
                            ? <Square className="w-3 h-3 text-[var(--color-banjak-text-dark)]" />
                            : <Play className="w-3 h-3 text-[var(--color-banjak-text-dark)]" />
                          }
                        </button>
                      ) : (
                        <span className="text-[10px] text-[var(--color-banjak-text-light)] bg-[var(--color-banjak-bg-gray)] rounded-full px-2 py-0.5 flex-shrink-0">
                          준비 중
                        </span>
                      )}
                    </div>
                  </button>

                  {/* 샘플 비디오 플레이어 */}
                  {v.sampleVideoUrl && playingVoice === v.id && (
                    <div className="px-3 pb-3">
                      <video
                        ref={voiceVideoRef}
                        src={v.sampleVideoUrl}
                        autoPlay
                        controls
                        className="w-full rounded-xl"
                        onEnded={() => setPlayingVoice(null)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm text-[var(--color-banjak-text-mid)] mb-2">언어</p>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-2xl bg-[var(--color-banjak-bg-gray)] border-0 px-4 py-2.5 text-sm text-[var(--color-banjak-text-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--color-banjak-primary)]"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.nativeLabel} ({l.label})
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-sm text-[var(--color-banjak-text-mid)] mb-2">배경음악</p>
            <div className="space-y-2">
              {MUSIC_TRACKS.map((track) => (
                <button
                  key={track.id}
                  onClick={() => setBgMusic(track.id)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all duration-150',
                    bgMusic === track.id
                      ? 'border-[var(--color-banjak-primary)] bg-[var(--color-banjak-primary-soft)]/20'
                      : 'border-[var(--color-banjak-border)] hover:bg-[var(--color-banjak-bg-gray)]'
                  )}
                >
                  <span className="text-xl">{track.emoji}</span>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-[var(--color-banjak-text-dark)]">{track.label}</p>
                    <p className="text-xs text-[var(--color-banjak-text-mid)]">{track.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPlayingMusic(playingMusic === track.id ? null : track.id);
                    }}
                    className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm"
                  >
                    <Play className="w-3 h-3 text-[var(--color-banjak-text-mid)]" />
                  </button>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 하단 바 */}
      <div className="sticky bottom-0 bg-background/80 backdrop-blur-md border-t border-[var(--color-banjak-border)] py-4 mt-6 -mx-4 px-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-xs text-[var(--color-banjak-text-mid)]">예상 사용량</p>
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[var(--color-banjak-primary)]" />
                <span className="font-semibold text-[var(--color-banjak-text-dark)]">
                  {formatTokens(cost.tokens)} ({formatKrw(cost.krw)})
                </span>
              </div>
            </div>
            {!hasBalance && (
              <Badge
                variant="outline"
                className="text-xs border-[var(--color-banjak-error)] text-[var(--color-banjak-error)]"
              >
                토큰 부족
              </Badge>
            )}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={submitting || !hasBalance}
            className="rounded-full px-8 bg-[var(--color-banjak-primary)] hover:bg-[var(--color-banjak-primary-soft)] text-[var(--color-banjak-text-dark)] font-medium disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                생성 중...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                영상 생성 시작
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
