import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/weightloss_tracker';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 2500, // Fast 2.5s timeout so app never hangs
      connectTimeoutMS: 2500
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        console.log('[MongoDB Atlas] Connected successfully');
        return mongooseInstance;
      })
      .catch((err) => {
        console.warn('[MongoDB Atlas Notice]: Connection timeout or network restriction. Using fast pre-populated store.');
        cached.promise = null;
        return null;
      });
  }

  try {
    cached.conn = await Promise.race([
      cached.promise,
      new Promise((resolve) => setTimeout(() => resolve(null), 2500))
    ]);
  } catch (e) {
    cached.promise = null;
    return null;
  }

  return cached.conn;
}

export function isDbConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}
