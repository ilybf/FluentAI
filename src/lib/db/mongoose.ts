import mongoose from "mongoose";
import dns from "node:dns";

// Force Google Public DNS for SRV lookups — local/ISP DNS often blocks or drops SRV queries
dns.setServers(["8.8.8.8", "8.8.4.4"]);

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
const RETRY_DELAY_MS = 1000;

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function dbConnect(retries = MAX_RETRIES): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 5,              // Reduced from 10 — sufficient for typical workload, halves idle connection memory
      minPoolSize: 1,              // Keep at least 1 connection warm to avoid cold-start latency
      serverSelectionTimeoutMS: 20000,  // 20s — Atlas free tier cold-starts can be slow
      connectTimeoutMS: 20000,         // 20s connect timeout
      socketTimeoutMS: 45000,
      maxIdleTimeMS: 60000,        // Keep connections alive longer to reduce reconnection delays
      autoIndex: process.env.NODE_ENV !== 'production', // Skip auto-indexing in prod (indexes should be created via migration)
      family: 4,                   // Force IPv4 — fixes SRV ECONNREFUSED on Windows where IPv6 DNS fails
    };

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Clearing cache promise to allow reconnection.');
      cached.promise = null;
      cached.conn = null;
    });

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
    
    // Explicit ping to verify DB is actually responsive
    if (cached.conn.connection.readyState !== 1) {
      throw new Error("DB connection readyState is not 1 (connected)");
    }
    
    return cached.conn;
  } catch (e) {
    cached.promise = null; // reset promise to allow retry
    if (retries > 0) {
      console.warn(`Database connection failed. Retrying... (${retries} attempts left)`);
      await wait(RETRY_DELAY_MS);
      return dbConnect(retries - 1);
    } else {
      console.error("Failed to connect to the database after multiple attempts.", e);
      throw new Error("Database Service Unavailable");
    }
  }
}

export default dbConnect;
