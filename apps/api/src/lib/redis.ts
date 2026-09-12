import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;
let isConnecting = false;

export const getRedisClient = async (): Promise<RedisClientType | null> => {
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  if (isConnecting) {
    // Wait briefly if connection is in progress
    await new Promise((resolve) => setTimeout(resolve, 200));
    if (redisClient && redisClient.isOpen) return redisClient;
  }

  try {
    isConnecting = true;
    const url = process.env.REDIS_URL || 'redis://localhost:6379';
    const client: RedisClientType = createClient({
      url,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 5) {
            console.warn('⚠️ Redis reconnection limit reached. Falling back to direct database writes.');
            return false;
          }
          return Math.min(retries * 500, 3000);
        },
      },
    });

    client.on('error', (err) => {
      console.warn('⚠️ Redis error:', err?.message || err);
    });

    client.on('connect', () => {
      console.log('✅ Connected to Redis successfully');
    });

    await client.connect();
    redisClient = client;
    return redisClient;
  } catch (err: any) {
    console.warn('⚠️ Failed to connect to Redis, operating in fallback mode:', err?.message || err);
    redisClient = null;
    return null;
  } finally {
    isConnecting = false;
  }
};

export default getRedisClient;
