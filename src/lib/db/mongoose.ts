import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env"
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function dbConnect(retries = MAX_RETRIES): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10, // Ensure connection reuse via pooling
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null; // reset promise to allow retry
    if (retries > 0) {
      console.warn(`Database connection failed. Retrying... (${retries} attempts left)`);
      await wait(RETRY_DELAY_MS);
      return dbConnect(retries - 1);
    } else {
      console.error("Failed to connect to the database after multiple attempts.", e);
      throw e;
    }
  }
}

export default dbConnect;
