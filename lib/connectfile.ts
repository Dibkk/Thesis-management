import mongoose from "mongoose";
import { MongoClient, GridFSBucket } from "mongodb";

let bucket: GridFSBucket | null = null;

export const connectDatabase = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI as string;

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoURI);
      console.log("Mongoose Connected!");
    }

    // เชื่อมผ่าน native driver (สำหรับ GridFS)
    const client = new MongoClient(mongoURI);
    await client.connect();

    const db = client.db(); // ใช้ default db จาก URI
    if (!bucket) {
      bucket = new GridFSBucket(db, { bucketName: "pdf_files" });
      console.log("GridFS Bucket Initialized!");
    }

    return { db, bucket };
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};
