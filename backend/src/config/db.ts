import DbFactory from "../shared/database/db.factory.js";
import { logger } from "../utils/logger.js";

export const db = async () => {
  try {
    //mongodb
    const mongoProvider = DbFactory.getMongoose();
    await mongoProvider.connect();
    
    //redis for rate limiting and session management
    // const redisProvider = DbFactory.getRedis();
    // await redisProvider.connect();

    // //bullmq queue redis
    // const queueRedisProvider = DbFactory.getQueueRedis();
    // await queueRedisProvider.connect();

    logger.info("Database connections (Mongo, Redis Cache, Redis Queue) established through factory.");
  } catch (error) {
    logger.error(error, "Failed to connect to the database");
    process.exit(1);
  }
};