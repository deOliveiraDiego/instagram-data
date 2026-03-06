import fs from 'fs';
import path from 'path';
import { CacheData, InstagramPost } from './types';

const CACHE_FILE = path.join(process.cwd(), 'data', 'cache.json');
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export function getCache(): CacheData | null {
  try {
    if (!fs.existsSync(CACHE_FILE)) {
      return null;
    }
    const data = fs.readFileSync(CACHE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
}

export function setCache(posts: InstagramPost[]): void {
  try {
    const cacheData: CacheData = {
      posts,
      cachedAt: new Date().toISOString(),
      ttl: CACHE_TTL,
    };

    // Ensure data directory exists
    const dataDir = path.dirname(CACHE_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(CACHE_FILE, JSON.stringify(cacheData, null, 2));
  } catch (error) {
    console.error('Error writing cache:', error);
  }
}

export function isExpired(cache: CacheData): boolean {
  const cachedTime = new Date(cache.cachedAt).getTime();
  const now = Date.now();
  return now - cachedTime > cache.ttl;
}

export function clearCache(): void {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      fs.unlinkSync(CACHE_FILE);
    }
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

export function getTimeSinceCache(cache: CacheData): string {
  const cachedTime = new Date(cache.cachedAt).getTime();
  const now = Date.now();
  const diffMs = now - cachedTime;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffHours > 0) {
    return `Atualizado há ${diffHours}h`;
  }
  return `Atualizado há ${diffMins}min`;
}