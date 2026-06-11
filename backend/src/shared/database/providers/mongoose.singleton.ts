import mongoose from "mongoose";
import  {_config}  from "../../../config/config.js";
import { logger } from "../../../utils/logger.js";

class MongooseSingleton{
  private static instance: MongooseSingleton;
  
  private constructor() {}

  // get instace of mongoose
  static getConnection():MongooseSingleton{
    if(!MongooseSingleton.instance){
      MongooseSingleton.instance = new MongooseSingleton();
    }
    return MongooseSingleton.instance;
  }

  // connect to the database 
  async connect():Promise<void>{
    if(!_config.MONGODB_URI){
      logger.error("MONGODB_URI is not defined");
    }

    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(_config.MONGODB_URI as string);
      logger.info(`mongodb connected ${mongoose.connection.host}`); 
    }

  }

  // disconnect from the database
  async disconnect():Promise<void>{
    await mongoose.disconnect();
    logger.info("mongodb disconnected");
  }

  // get the connection
  getConnection(){
    return mongoose.connection;
    
  }

}


export default MongooseSingleton;