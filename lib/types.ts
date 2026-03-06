// New structured hook analysis format
export interface HookAnalysisData {
  hook: { score: number; analysis: string };
  desenvolvimento: { score: number; analysis: string };
  cta: { score: number; analysis: string };
  score_total: number;
  diagnostico: string;
  theme: string;
}

export interface InstagramPost {
  row_number: number;
  shortcode: string;
  published_at: string; // ISO date
  format: 'reel' | 'carousel';
  caption: string;
  likes: number;
  comments: number;
  video_view_count: number;
  video_play_count: number;
  hook_analysis: string | HookAnalysisData; // pode ser string (antigo) ou objeto (novo)
  theme: string;
  audio_url: string;
  transcription: string;
  scraped_at: string;
}

export interface CacheData {
  posts: InstagramPost[];
  cachedAt: string; // ISO timestamp
  ttl: number; // milliseconds
}

export interface DashboardMetrics {
  totalPosts: number;
  avgViews: number;
  avgLikes: number;
  avgComments: number;
  byFormat: {
    reel: FormatMetrics;
    carousel: FormatMetrics;
  };
  topPosts: InstagramPost[];
  themes: { theme: string; count: number }[];
  hookStats: {
    successRate: number;
    avgScore: number;
  };
  performanceSignals: PerformanceSignals | null;
}

export interface PerformanceSignals {
  hookImpact: {
    highHookAvgEngagement: number; // média de engajamento (likes+comentários) dos posts com hook >= 8
    lowHookAvgEngagement: number;  // média de engajamento dos posts com hook < 7
    percentageDifference: number;  // % de diferença
  } | null;
  bestDay: {
    day: string;                   // nome do dia da semana
    avgEngagement: number;         // engajamento médio do melhor dia (Reels)
    percentageAboveAvg: number;    // % acima da média geral
  } | null;
  formatWinner: {
    winner: 'reel' | 'carousel';
    winnerAvgEngagement: number;   // likes + comentários médios do vencedor
    loserAvgEngagement: number;    // likes + comentários médios do perdedor
    percentageDifference: number;
  } | null;
}

export interface FormatMetrics {
  count: number;
  avgViews: number;
  avgLikes: number;
  avgComments: number;
}

export type PeriodFilter = 7 | 14 | 30;