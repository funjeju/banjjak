export type VideoTiming = 0.25 | 0.5 | 1 | 2 | 4 | 8 | 10;
export type VideoType = 'long' | 'short';
export type VoiceStyle = 'solo-female-3' | 'solo-female-4' | 'solo-male-3' | 'solo-male-4';
export type BgMusic =
  | 'jazz'
  | 'lofi'
  | 'whimsical'
  | 'dramatic'
  | 'engaging'
  | 'hyper'
  | 'inspirational'
  | 'documentary';

export type SketchStyle = 'false' | 'true' | 'advanced';
export type CanvasStyle =
  | 'chalkboard_white'
  | 'neon'
  | 'whiteboard'
  | 'modern_minimal'
  | 'playful'
  | 'technical'
  | 'editorial'
  | 'marker';

export type VideoEngine = 'sketch' | 'canvas';
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface GeneratePayload {
  prompt?: string;
  new_script?: string;
  upload_urls?: string[];
  timing: VideoTiming;
  video_type: VideoType;
  language: string;
  display_language?: string;
  style?: VoiceStyle;
  bg_music?: BgMusic;
  voice_instructions?: string;
  video_instructions?: string;
  include_watermark?: boolean;
  use_lineart_2_style?: SketchStyle;
  use_2_0_style?: boolean;
  image_style?: CanvasStyle;
  pen_style?: string;
}

export interface GenerateResponse {
  job_id: string;
  video_id: string;
}

export interface StatusResponse {
  status: JobStatus;
  video_url?: string;
  thumbnail_url?: string;
  detail?: string;
}

export interface UploadResponse {
  upload_url: string;
  file_url: string;
  content_type: string;
}
