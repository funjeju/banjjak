import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { golpoGenerate } from '@/lib/golpo/client';
import { calculateCost } from '@/lib/tokens/calculator';
import type { GeneratePayload } from '@/lib/golpo/types';
import { FieldValue } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    if (!adminAuth || !adminDb) return NextResponse.json({ error: 'Server misconfigured' }, { status: 503 });
    const cookieStore = await cookies();
    const session = cookieStore.get('__session')?.value;
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await adminAuth.verifySessionCookie(session, true);
    const uid = decoded.uid;

    const body = await req.json();
    const {
      prompt,
      new_script,
      upload_urls,
      timing,
      video_type,
      language = 'ko',
      display_language,
      style = 'solo-female-3',
      bg_music = 'engaging',
      voice_instructions,
      video_instructions,
      include_watermark = false,
      use_lineart_2_style,
      use_2_0_style,
      image_style,
      pen_style,
    } = body;

    if (!prompt && !new_script) {
      return NextResponse.json(
        { error: 'prompt 또는 new_script가 필요합니다.' },
        { status: 400 }
      );
    }

    if (!timing || !video_type) {
      return NextResponse.json(
        { error: 'timing과 video_type이 필요합니다.' },
        { status: 400 }
      );
    }

    const { tokens: requiredTokens } = calculateCost(timing);

    const userDoc = await adminDb!.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }
    const balance: number = userDoc.data()?.tokenBalance ?? 0;

    if (balance < requiredTokens) {
      return NextResponse.json(
        { error: 'INSUFFICIENT_TOKENS', message: '토큰이 부족합니다.' },
        { status: 402 }
      );
    }

    const payload: GeneratePayload = {
      prompt: prompt || undefined,
      new_script: new_script || undefined,
      upload_urls: upload_urls || undefined,
      timing,
      video_type,
      language,
      display_language: display_language || undefined,
      style,
      bg_music,
      voice_instructions: voice_instructions || undefined,
      video_instructions: video_instructions || undefined,
      include_watermark,
    };

    if (use_lineart_2_style !== undefined) {
      payload.use_lineart_2_style = use_lineart_2_style;
    } else if (use_2_0_style) {
      payload.use_2_0_style = true;
      payload.image_style = image_style;
      if (pen_style) payload.pen_style = pen_style;
    }

    const { job_id, video_id } = await golpoGenerate(payload);

    await adminDb!.runTransaction(async (tx) => {
      const userRef = adminDb!.collection('users').doc(uid);
      tx.update(userRef, {
        tokenBalance: balance - requiredTokens,
        totalVideosCreated: FieldValue.increment(1),
        totalTokensUsed: FieldValue.increment(requiredTokens),
      });

      tx.set(adminDb!.collection('videos').doc(video_id), {
        videoId: video_id,
        jobId: job_id,
        userId: uid,
        inputType: prompt ? 'prompt' : new_script ? 'script' : 'document',
        prompt: prompt ?? null,
        newScript: new_script ?? null,
        status: 'pending',
        creditsUsed: requiredTokens,
        isPublic: false,
        params: {
          timing,
          videoType: video_type,
          style,
          language,
          displayLanguage: display_language ?? null,
          bgMusic: bg_music,
          engine: use_lineart_2_style !== undefined ? 'sketch' : 'canvas',
          sketchStyle: use_lineart_2_style ?? null,
          canvasStyle: image_style ?? null,
          penStyle: pen_style ?? null,
          includeWatermark: include_watermark,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      tx.set(adminDb!.collection('transactions').doc(), {
        userId: uid,
        type: 'usage',
        amount: -requiredTokens,
        balanceAfter: balance - requiredTokens,
        videoId: video_id,
        description: `${timing < 1 ? timing * 60 + '초' : timing + '분'} 영상 생성`,
        createdAt: new Date(),
      });
    });

    return NextResponse.json({ jobId: job_id, videoId: video_id });
  } catch (err: unknown) {
    console.error('[generate] error', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
