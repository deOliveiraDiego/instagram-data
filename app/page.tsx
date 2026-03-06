'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import OverviewCards from '@/components/OverviewCards';
import FormatComparison from '@/components/FormatComparison';
import TopPosts from '@/components/TopPosts';
import ContentAnalysis from '@/components/ContentAnalysis';
import PostsTable from '@/components/PostsTable';
import { InstagramPost, PeriodFilter, DashboardMetrics } from '@/lib/types';
import { filterByPeriod, calculateMetrics } from '@/lib/metrics';

// Calculate time since cache (client-side)
function formatTimeSinceCache(cachedAt: string): string {
  const cachedTime = new Date(cachedAt).getTime();
  const now = Date.now();
  const diffMs = now - cachedTime;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffHours > 0) {
    return `Atualizado há ${diffHours}h`;
  }
  return `Atualizado há ${diffMins}min`;
}

export default function Dashboard() {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [period, setPeriod] = useState<PeriodFilter>(30);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  // Fetch data from API
  const fetchData = useCallback(async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      setError(null);

      const url = forceRefresh ? '/api/refresh' : '/api/data';
      const method = forceRefresh ? 'POST' : 'GET';

      const response = await fetch(url, { method });
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const data = await response.json();
      setPosts(data.posts);
      setLastUpdated(formatTimeSinceCache(data.cachedAt));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate metrics when posts or period change
  useEffect(() => {
    if (posts.length > 0) {
      const filtered = filterByPeriod(posts, period);
      const calculatedMetrics = calculateMetrics(filtered);
      setMetrics(calculatedMetrics);
    }
  }, [posts, period]);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData(true);
    setIsRefreshing(false);
  };

  // Loading state
  if (isLoading && posts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && posts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => fetchData()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header
        period={period}
        onPeriodChange={setPeriod}
        onRefresh={handleRefresh}
        isLoading={isRefreshing}
        lastUpdated={lastUpdated}
      />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Overview Cards */}
          {metrics && <OverviewCards metrics={metrics} />}

          {/* Two columns: Format + Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {metrics && <FormatComparison metrics={metrics} />}
            {metrics && <ContentAnalysis metrics={metrics} />}
          </div>

          {/* Top Posts */}
          {metrics && <TopPosts posts={metrics.topPosts} />}

          {/* All Posts Table */}
          <PostsTable posts={filterByPeriod(posts, period)} />
        </div>
      </main>
    </div>
  );
}