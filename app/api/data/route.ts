import { NextResponse } from 'next/server';
import { getCache, setCache, isExpired } from '@/lib/cache';
import { InstagramPost } from '@/lib/types';

const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://temp-n8n-n8n-start.ecfojw.easypanel.host/webhook/instagram/data';

async function fetchFromWebhook(): Promise<InstagramPost[]> {
  const response = await fetch(WEBHOOK_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.status}`);
  }
  return response.json();
}

export async function GET() {
  try {
    const cache = getCache();

    // If cache exists and is not expired, return cached data
    if (cache && !isExpired(cache)) {
      return NextResponse.json({
        posts: cache.posts,
        cachedAt: cache.cachedAt,
        fromCache: true,
      });
    }

    // Fetch fresh data from webhook
    const posts = await fetchFromWebhook();

    // Save to cache
    setCache(posts);

    return NextResponse.json({
      posts,
      cachedAt: new Date().toISOString(),
      fromCache: false,
    });
  } catch (error) {
    console.error('Error in /api/data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}