import { InstagramPost, DashboardMetrics, FormatMetrics, PeriodFilter, PerformanceSignals, HookAnalysisData } from './types';

// Extract hook score from hook_analysis (supports both old string format and new JSON format)
export function extractHookScore(hookAnalysis: string | HookAnalysisData): number | null {
  // If it's already an object (new format)
  if (typeof hookAnalysis === 'object' && hookAnalysis !== null) {
    return hookAnalysis.score_total ?? null;
  }

  // If it's a string, try to parse as JSON first (new format as string)
  if (typeof hookAnalysis === 'string') {
    try {
      const parsed = JSON.parse(hookAnalysis);
      if (parsed && typeof parsed.score_total === 'number') {
        return parsed.score_total;
      }
    } catch {
      // Not valid JSON, try old regex format
    }

    // Old format: "SCORE TOTAL: 8.6/10"
    const match = hookAnalysis.match(/SCORE TOTAL:\s*(\d+\.?\d*)\/10/);
    if (match) {
      return parseFloat(match[1]);
    }
  }

  return null;
}

// Parse hook_analysis to object (handles both formats)
export function parseHookAnalysis(hookAnalysis: string | HookAnalysisData): HookAnalysisData | null {
  if (typeof hookAnalysis === 'object' && hookAnalysis !== null) {
    return hookAnalysis;
  }

  if (typeof hookAnalysis === 'string') {
    try {
      const parsed = JSON.parse(hookAnalysis);
      if (parsed && typeof parsed.score_total === 'number') {
        return parsed;
      }
    } catch {
      // Not valid JSON
    }
  }

  return null;
}

// Filter posts by period (days)
export function filterByPeriod(posts: InstagramPost[], days: PeriodFilter): InstagramPost[] {
  const now = new Date();
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  return posts.filter(post => {
    const postDate = new Date(post.published_at);
    return postDate >= cutoff;
  });
}

// Calculate metrics for a set of posts
export function calculateMetrics(posts: InstagramPost[]): DashboardMetrics {
  const totalPosts = posts.length;

  if (totalPosts === 0) {
    return {
      totalPosts: 0,
      avgViews: 0,
      avgLikes: 0,
      avgComments: 0,
      byFormat: {
        reel: { count: 0, avgViews: 0, avgLikes: 0, avgComments: 0 },
        carousel: { count: 0, avgViews: 0, avgLikes: 0, avgComments: 0 },
      },
      topPosts: [],
      themes: [],
      hookStats: { successRate: 0, avgScore: 0 },
      performanceSignals: null,
    };
  }

  // Overall metrics
  const totalViews = posts.reduce((sum, p) => sum + (p.video_view_count || 0), 0);
  const totalLikes = posts.reduce((sum, p) => sum + p.likes, 0);
  const totalComments = posts.reduce((sum, p) => sum + p.comments, 0);

  // By format
  const reelPosts = posts.filter(p => p.format === 'reel');
  const carouselPosts = posts.filter(p => p.format === 'carousel');

  const byFormat = {
    reel: calculateFormatMetrics(reelPosts),
    carousel: calculateFormatMetrics(carouselPosts),
  };

  // Top 3 posts by views
  const topPosts = [...posts]
    .sort((a, b) => (b.video_view_count || 0) - (a.video_view_count || 0))
    .slice(0, 3);

  // Theme analysis
  const themeMap = new Map<string, number>();
  posts.forEach(post => {
    const theme = post.theme || 'Sem tema';
    themeMap.set(theme, (themeMap.get(theme) || 0) + 1);
  });
  const themes = Array.from(themeMap.entries())
    .map(([theme, count]) => ({ theme, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Hook stats
  const hookScores = posts
    .map(p => extractHookScore(p.hook_analysis))
    .filter((score): score is number => score !== null);

  const hookStats = {
    successRate: hookScores.length > 0
      ? (hookScores.filter(s => s >= 7).length / hookScores.length) * 100
      : 0,
    avgScore: hookScores.length > 0
      ? hookScores.reduce((a, b) => a + b, 0) / hookScores.length
      : 0,
  };

  // Performance signals
  const performanceSignals = calculatePerformanceSignals(posts, hookScores, byFormat);

  return {
    totalPosts,
    avgViews: Math.round(totalViews / totalPosts),
    avgLikes: Math.round(totalLikes / totalPosts),
    avgComments: Math.round(totalComments / totalPosts),
    byFormat,
    topPosts,
    themes,
    hookStats,
    performanceSignals,
  };
}

function calculateFormatMetrics(posts: InstagramPost[]): FormatMetrics {
  const count = posts.length;
  if (count === 0) {
    return { count: 0, avgViews: 0, avgLikes: 0, avgComments: 0 };
  }

  const totalViews = posts.reduce((sum, p) => sum + (p.video_view_count || 0), 0);
  const totalLikes = posts.reduce((sum, p) => sum + p.likes, 0);
  const totalComments = posts.reduce((sum, p) => sum + p.comments, 0);

  return {
    count,
    avgViews: Math.round(totalViews / count),
    avgLikes: Math.round(totalLikes / count),
    avgComments: Math.round(totalComments / count),
  };
}

// Format number for display (e.g., 14119 -> 14.1K)
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

// Format date for display
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// Calculate performance signals
function calculatePerformanceSignals(
  posts: InstagramPost[],
  hookScores: (number | null)[],
  byFormat: { reel: FormatMetrics; carousel: FormatMetrics }
): PerformanceSignals {
  // 1. Hook Impact: posts with hook >= 8 vs hook < 7 (todos os formatos — engajamento é válido para todos)
  const postsWithHookScore = posts.map((p, i) => ({ post: p, hookScore: hookScores[i] }));

  const highHookPosts = postsWithHookScore.filter(p => p.hookScore !== null && p.hookScore >= 8);
  const lowHookPosts = postsWithHookScore.filter(p => p.hookScore !== null && p.hookScore < 7);

  let hookImpact: PerformanceSignals['hookImpact'] = null;
  if (highHookPosts.length > 0 && lowHookPosts.length > 0) {
    const highHookAvgEngagement = Math.round(
      highHookPosts.reduce((sum, p) => sum + p.post.likes + p.post.comments, 0) / highHookPosts.length
    );
    const lowHookAvgEngagement = Math.round(
      lowHookPosts.reduce((sum, p) => sum + p.post.likes + p.post.comments, 0) / lowHookPosts.length
    );
    const percentageDifference = lowHookAvgEngagement > 0
      ? Math.round(((highHookAvgEngagement - lowHookAvgEngagement) / lowHookAvgEngagement) * 100)
      : 0;

    hookImpact = { highHookAvgEngagement, lowHookAvgEngagement, percentageDifference };
  }

  // 2. Best Day of the Week (apenas Reels, usando engajamento)
  const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const reelPosts = posts.filter(p => p.format === 'reel');
  const postsByDay = new Map<number, { totalEngagement: number; count: number }>();

  reelPosts.forEach(post => {
    const date = new Date(post.published_at);
    const dayOfWeek = date.getDay();
    const current = postsByDay.get(dayOfWeek) || { totalEngagement: 0, count: 0 };
    postsByDay.set(dayOfWeek, {
      totalEngagement: current.totalEngagement + post.likes + post.comments,
      count: current.count + 1,
    });
  });

  let bestDay: PerformanceSignals['bestDay'] = null;
  const overallAvgEngagement = reelPosts.length > 0
    ? reelPosts.reduce((sum, p) => sum + p.likes + p.comments, 0) / reelPosts.length
    : 0;

  let bestDayData = { day: -1, avgEngagement: 0 };
  postsByDay.forEach((data, day) => {
    const avg = data.totalEngagement / data.count;
    if (avg > bestDayData.avgEngagement) {
      bestDayData = { day, avgEngagement: avg };
    }
  });

  if (bestDayData.day >= 0) {
    const percentageAboveAvg = overallAvgEngagement > 0
      ? Math.round(((bestDayData.avgEngagement - overallAvgEngagement) / overallAvgEngagement) * 100)
      : 0;
    bestDay = {
      day: dayNames[bestDayData.day],
      avgEngagement: Math.round(bestDayData.avgEngagement),
      percentageAboveAvg,
    };
  }

  // 3. Format Winner (comparação por engajamento médio: likes + comentários)
  let formatWinner: PerformanceSignals['formatWinner'] = null;
  if (byFormat.reel.count > 0 && byFormat.carousel.count > 0) {
    const reelEngagement = byFormat.reel.avgLikes + byFormat.reel.avgComments;
    const carouselEngagement = byFormat.carousel.avgLikes + byFormat.carousel.avgComments;
    const winner = reelEngagement >= carouselEngagement ? 'reel' : 'carousel';
    const loser = winner === 'reel' ? 'carousel' : 'reel';
    const winnerAvgEngagement = winner === 'reel' ? reelEngagement : carouselEngagement;
    const loserAvgEngagement = loser === 'reel' ? reelEngagement : carouselEngagement;
    const percentageDifference = loserAvgEngagement > 0
      ? Math.round(((winnerAvgEngagement - loserAvgEngagement) / loserAvgEngagement) * 100)
      : 0;

    formatWinner = { winner, winnerAvgEngagement, loserAvgEngagement, percentageDifference };
  }

  return { hookImpact, bestDay, formatWinner };
}