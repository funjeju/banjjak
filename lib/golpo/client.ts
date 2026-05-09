import type { GeneratePayload, GenerateResponse, StatusResponse, UploadResponse } from './types';

const BASE_URL = process.env.GOLPO_BASE_URL!;
const API_KEY = process.env.GOLPO_API_KEY!;

function golpoHeaders() {
  return {
    'x-api-key': API_KEY,
    'Content-Type': 'application/json',
  };
}

export async function golpoGenerate(payload: GeneratePayload): Promise<GenerateResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/videos/generate`, {
    method: 'POST',
    headers: golpoHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(err.detail ?? `Golpo error ${res.status}`);
  }

  return res.json();
}

export async function golpoGetStatus(jobId: string): Promise<StatusResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/videos/status/${jobId}`, {
    headers: { 'x-api-key': API_KEY },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(err.detail ?? `Golpo status error ${res.status}`);
  }

  return res.json();
}

export async function golpoUploadFile(formData: FormData): Promise<UploadResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/videos/upload-file`, {
    method: 'POST',
    headers: { 'x-api-key': API_KEY },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(err.detail ?? `Upload error ${res.status}`);
  }

  return res.json();
}
