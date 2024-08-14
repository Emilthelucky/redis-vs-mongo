import redis from "redis";
import mongoose from "mongoose";
import { config } from "dotenv";

config();

const REDDIS_URI = process.env.REDDIS_URI;
const redisClient = redis.createClient({
  url: REDDIS_URI,
});

const userSchema = new mongoose.Schema({
  name: String,
  language: String,
  id: { type: String, unique: true },
  bio: String,
  version: Number,
});

const User = mongoose.model("User", userSchema);

const retrieveUserDataFromRedis = async () => {
  try {
    await redisClient.connect();
    console.log("Connected to Redis");

    const start = Date.now();

    const keys = await redisClient.keys("user:*");

    const userDataPromises = keys.map(async (key) => {
      const data = await redisClient.hGetAll(key);
      return { key, ...data };
    });

    const userData = await Promise.all(userDataPromises);

    const end = Date.now();
    console.log("REDIS Data Retrieval Time:", end - start, "ms");

    await redisClient.quit();
    return userData;
  } catch (error) {
    console.error("Error connecting to Redis", error);
    await redisClient.quit();
  }
};

const retrieveUserDataFromMongoDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI, {
      dbName: "redis-mongo-vs",
    });
    console.log("Connected to MongoDB");

    const start = Date.now();
    const data = await User.find({});
    const end = Date.now();

    console.log("MONGO Data Retrieval Time:", end - start, "ms");

    mongoose.disconnect();
    return data;
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
    mongoose.disconnect();
  }
};

const main = async () => {
  console.log("Starting data retrieval operations...");

  await retrieveUserDataFromRedis();
  await retrieveUserDataFromMongoDB();
};

main();
