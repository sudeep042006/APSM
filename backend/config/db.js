// config/db.js

// ── Imports ──────────────────────────────────────────────────────────
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcrypt';

// ── Seeding Helper ───────────────────────────────────────────────────
const seedTestUser = async () => {
  try {
    const { User } = await import('../modules/auth/auth.model.js');
    const exists = await User.findOne({ email: 'test@example.com' });
    if (!exists) {
      console.log('🌱 Seeding default test user: test@example.com / password123');
      const passwordHash = await bcrypt.hash('password123', 12);
      await User.create({
        name: 'Demo User',
        email: 'test@example.com',
        passwordHash
      });
    }
  } catch (err) {
    console.error('⚠️ Database seeding failed:', err.message);
  }
};

// ── Connection Logic ─────────────────────────────────────────────────
const connectDB = async () => {
  try {
    // If MONGODB_URI is not set, or USE_MEMORY_DB is true, use in-memory server
    if (!process.env.MONGODB_URI || process.env.USE_MEMORY_DB === 'true') {
      console.log('⚡ Starting MongoMemoryServer for development/testing...');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      const conn = await mongoose.connect(mongoUri);
      console.log(`🟢 In-Memory MongoDB connected: ${conn.connection.host}`);
      await seedTestUser();
      return;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`🟢 MongoDB connected: ${conn.connection.host}`);
    await seedTestUser();
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    console.log('⚡ Falling back to MongoMemoryServer...');
    try {
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      const conn = await mongoose.connect(mongoUri);
      console.log(`🟢 Fallback In-Memory MongoDB connected: ${conn.connection.host}`);
      await seedTestUser();
    } catch (fallbackErr) {
      console.error('Fallback MongoMemoryServer failed:', fallbackErr.message);
      process.exit(1);
    }
  }
};

export default connectDB;
