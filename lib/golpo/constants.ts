import type { BgMusic, CanvasStyle, VoiceStyle } from './types';

export const DURATIONS: { label: string; value: number; description: string }[] = [
  { label: '15초', value: 0.25, description: '샘플/짧은 소개' },
  { label: '30초', value: 0.5, description: '짧은 SNS' },
  { label: '1분', value: 1, description: '기본 설명' },
  { label: '2분', value: 2, description: '상세 설명' },
  { label: '4분', value: 4, description: '심화 강의' },
  { label: '8분', value: 8, description: '긴 강의 (Beta)' },
  { label: '10분', value: 10, description: '완전 강의 (Beta)' },
];

export const SKETCH_STYLES: { id: string; label: string; value: string; description: string }[] = [
  { id: 'sketch-classic', label: 'Classic', value: 'false', description: '클래식 손그림 스타일' },
  { id: 'sketch-improved', label: 'Improved', value: 'true', description: '개선된 화이트보드' },
  { id: 'sketch-formal', label: 'Formal', value: 'advanced', description: '정교한 라인아트' },
];

export const CANVAS_STYLES: { id: CanvasStyle; label: string; emoji: string; description: string }[] = [
  { id: 'chalkboard_white', label: 'Chalkboard', emoji: '🖤', description: '칠판 흑백 스타일' },
  { id: 'neon', label: 'Neon', emoji: '💜', description: '형광 네온 효과' },
  { id: 'whiteboard', label: 'Whiteboard', emoji: '⬜', description: '일반 화이트보드' },
  { id: 'modern_minimal', label: 'Modern', emoji: '✨', description: '모던 미니멀' },
  { id: 'playful', label: 'Playful', emoji: '🎨', description: '발랄한 스타일' },
  { id: 'technical', label: 'Technical', emoji: '⚙️', description: '기술 도식' },
  { id: 'editorial', label: 'Editorial', emoji: '📰', description: '에디토리얼' },
  { id: 'marker', label: 'Sharpie', emoji: '✏️', description: '마커 스타일' },
];

export const VOICES: { id: VoiceStyle; label: string; gender: 'female' | 'male'; number: number }[] = [
  { id: 'solo-female-3', label: '여성 1', gender: 'female', number: 1 },
  { id: 'solo-female-4', label: '여성 2', gender: 'female', number: 2 },
  { id: 'solo-male-3', label: '남성 1', gender: 'male', number: 1 },
  { id: 'solo-male-4', label: '남성 2', gender: 'male', number: 2 },
];

export const MUSIC_TRACKS: { id: BgMusic; label: string; emoji: string; description: string }[] = [
  { id: 'jazz', label: 'Jazz', emoji: '🎷', description: '세련된 재즈' },
  { id: 'lofi', label: 'Lo-fi', emoji: '🎧', description: '편안한 로파이' },
  { id: 'whimsical', label: 'Whimsical', emoji: '🌈', description: '몽환적인 분위기' },
  { id: 'dramatic', label: 'Dramatic', emoji: '🎭', description: '극적인 음악' },
  { id: 'engaging', label: 'Engaging', emoji: '⚡', description: '집중력 있는 비트' },
  { id: 'hyper', label: 'Hyper', emoji: '🔥', description: '에너제틱한 템포' },
  { id: 'inspirational', label: 'Inspirational', emoji: '💫', description: '영감을 주는 음악' },
  { id: 'documentary', label: 'Documentary', emoji: '🎬', description: '다큐멘터리 스타일' },
];

export const LANGUAGES: { code: string; label: string; nativeLabel: string }[] = [
  { code: 'ko', label: 'Korean', nativeLabel: '한국어' },
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'ja', label: 'Japanese', nativeLabel: '日本語' },
  { code: 'zh', label: 'Chinese', nativeLabel: '中文' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español' },
  { code: 'fr', label: 'French', nativeLabel: 'Français' },
  { code: 'de', label: 'German', nativeLabel: 'Deutsch' },
  { code: 'pt', label: 'Portuguese', nativeLabel: 'Português' },
  { code: 'it', label: 'Italian', nativeLabel: 'Italiano' },
  { code: 'ru', label: 'Russian', nativeLabel: 'Русский' },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
  { code: 'id', label: 'Indonesian', nativeLabel: 'Bahasa Indonesia' },
  { code: 'ms', label: 'Malay', nativeLabel: 'Bahasa Melayu' },
  { code: 'th', label: 'Thai', nativeLabel: 'ภาษาไทย' },
  { code: 'vi', label: 'Vietnamese', nativeLabel: 'Tiếng Việt' },
  { code: 'tr', label: 'Turkish', nativeLabel: 'Türkçe' },
  { code: 'pl', label: 'Polish', nativeLabel: 'Polski' },
  { code: 'nl', label: 'Dutch', nativeLabel: 'Nederlands' },
  { code: 'sv', label: 'Swedish', nativeLabel: 'Svenska' },
];
