import Redis from "ioredis";

class RedisCache {
  private client: Redis;
  private defaultTTL: number;

  constructor(url: string, defaultTTL: number = -1) {
    this.client = new Redis(url);
    this.defaultTTL = defaultTTL;

    this.client.on("error", (err) => {
      console.error("Redis Error:", err);
    });
  }

  /**
   * Store a value in Redis with an optional TTL
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const data = JSON.stringify(value);
    await this.client.set(key, data, "EX", ttl || this.defaultTTL);
  }

  /**
   * Retrieve a value from Redis and parse it as JSON
   */
  async get<T>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Delete a key from Redis
   */
  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  /**
   * Check if a key exists in Redis
   */
  async exists(key: string): Promise<boolean> {
    return (await this.client.exists(key)) > 0;
  }

  /**
   * Disconnect Redis client
   */
  async disconnect(): Promise<void> {
    await this.client.quit();
  }
}

export default RedisCache;
