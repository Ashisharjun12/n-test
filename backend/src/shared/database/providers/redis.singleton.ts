import { Redis } from "ioredis";
import { logger } from "../../../utils/logger.js";



export const REDIS_USAGE = {
  RATE_LIMIT: "rate-limit",
  QUEUE: "queue"
} as const


class RedisSingleton {
  private static instances: Map<string, RedisSingleton> = new Map();
  private client: Redis | null = null;
  private uri: string;
  private constructor(uri: string) {
    this.uri = uri;
  }

  // get instance of Redis 
  static getConnection(usage: string, uri: string): RedisSingleton {
    if (!this.instances.has(usage)) {
      this.instances.set(usage, new RedisSingleton(uri));
    }
    return this.instances.get(usage)!;
  }

  // connect to the database
  async connect(): Promise<void> {
    if (!this.uri) {
      logger.error("Redis URI is not defined");
      return;
    }

    if (this.client && this.client.status === "ready") {
      return; 
    }

    this.client = new Redis(this.uri, {
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
    });

    this.client.on("error", (err) => {
      logger.error(err, `Redis connection error [${this.uri}]`);
    });

   // wait for the 'ready' event so the connect method resolves
    return new Promise((resolve) => {
      this.client!.on("ready", () => {
        logger.info(`Redis connected successfully`);
        resolve();
      });
    });
  }

  // disconnect from the database
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
      logger.info("Redis disconnected");
    }
  }

  // get the raw ioredis connection
  getClient(): Redis {
    if (!this.client) {
      logger.error("Redis client not initialized. Call connect() first.");
    }
    return this.client || new Redis();
  }
}

export default RedisSingleton;
