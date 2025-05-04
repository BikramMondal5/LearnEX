import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

const RATE_LIMIT_WINDOW = 60; // 1 minute
const MAX_REQUESTS = 30; // 30 requests per minute

export async function rateLimit(ip: string): Promise<{ success: boolean }> {
  const key = `rate-limit:${ip}`;
  
  try {
    const [response] = await redis
      .multi()
      .incr(key)
      .expire(key, RATE_LIMIT_WINDOW)
      .exec();
    
    const currentCount = response as number;
    
    if (currentCount > MAX_REQUESTS) {
      return { success: false };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Rate limiting error:', error);
    // In case of Redis error, allow the request
    return { success: true };
  }
} 