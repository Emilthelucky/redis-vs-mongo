import redis from "redis";
import { config } from "dotenv";
import fs from "fs";

config();

const REDDIS_URI = process.env.REDDIS_URI;

const client = redis.createClient({
  url: REDDIS_URI,
});

client.connect();

fs.readFile("./data.json", "utf8", (err, data) => {
  if (err) {
    console.error("Error reading data.json:", err);
    return;
  }

  try {
    const jsonData = JSON.parse(data);

    jsonData.forEach((item) => {
      const key = `user:${item.id}`;

      client.hSet(key, item, (err, reply) => {
        if (err) {
          console.error(`Error storing data for ${item.id} in Redis:`, err);
          return;
        }
        console.log(`Data for ${item.id} stored in Redis:`, reply);
      });
    });
  } catch (e) {
    console.error("Error parsing JSON data:", e);
  }
});

client.on("error", (err) => {
  console.error("Redis Client Error", err);
});
