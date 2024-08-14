import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const userSchema = new mongoose.Schema({
  name: String,
  language: String,
  id: { type: String, unique: true },
  bio: String,
  version: Number,
});

const User = mongoose.model("User", userSchema);

const connectDB = () => {
  mongoose
    .connect(process.env.DB_URI, {
      dbName: "redis-mongo-vs",
    })
    .then(() => {
      console.log("Connected to DB");
      loadData();
    })
    .catch((err) => {
      console.log("DATABASE ERROR", err);
    });
};

const loadData = () => {
  fs.readFile("./data.json", "utf8", async (err, data) => {
    if (err) {
      console.error("Error reading data.json:", err);
      return;
    }

    try {
      const jsonData = JSON.parse(data);

      await User.insertMany(jsonData);
      console.log("Data successfully inserted into MongoDB");
    } catch (e) {
      console.error("Error parsing or inserting JSON data:", e);
    }
  });
};

connectDB();
