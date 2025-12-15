export interface Soliloquy {
  id: number;
  content: string;
  image_uri?: string;
  created_at: number; // Unix timestamp
}

export interface Story {
  id: number;
  title: string;
  content: string;
  period_start: number;
  period_end: number;
  created_at: number;
}
