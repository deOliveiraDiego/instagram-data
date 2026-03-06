import { NextResponse } from 'next/server';
import { clearCache, setCache } from '@/lib/cache';
import { InstagramPost } from '@/lib/types';

const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://temp-n8n-n8n-start.ecfojw.easypanel.host/webhook/instagram/data';

async function fetchFromWebhook(): Promise<InstagramPost[]> {
  const response = await fetch(WEBHOOK_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.status}`);
  }
  return response.json();
}

export async function POST() {
  try {
    // Clear existing cache
    clearCache();

    // Fetch fresh data from webhook
    const posts = await fetchFromWebhook();

    // Save to cache
    setCache(posts);

    return NextResponse.json({
      posts,
      cachedAt: new Date().toISOString(),
      fromCache: false,
      message: 'Cache refreshed successfully',
    });
  } catch (error) {
    console.error('Error in /api/refresh:', error);
    return NextResponse.json(
      { error: 'Failed to refresh data' },
      { status: 500 }
    );
  }
}