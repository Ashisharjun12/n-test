import MongooseSingleton from "./providers/mongoose.singleton.js";
import RedisSingleton from "./providers/redis.singleton.js";
import { _config } from "../../config/config.js";
import { REDIS_USAGE } from "./providers/redis.singleton.js";

class DbFactory {

  //mongodb
  static getMongoose() {
    return MongooseSingleton.getConnection();
  }

  //redis for rate limiting and session management
  static getRedis() {
    return RedisSingleton.getConnection(REDIS_USAGE.RATE_LIMIT, _config.REDIS_URI as string);
  }

  //queue redis
  static getQueueRedis() {
    return RedisSingleton.getConnection(REDIS_USAGE.QUEUE, _config.REDIS_QUEUE_URI as string);
  }

}

export default DbFactory;