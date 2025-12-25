import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI ?? '';

if (!MONGODB_URI) {
  // eslint-disable-next-line no-console
  console.warn('MONGODB_URI is not set. Set it in your .env file.');
}

let cached = (global as any).mongoose as {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDb() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    // Shorten server selection timeout so API fails fast instead of hanging on unreachable Mongo
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: 'location-voiture',
      serverSelectionTimeoutMS: 5000
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
