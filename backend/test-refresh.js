// test-refresh.js
// A test script to verify YouTube OAuth 2.0 token refresh logic.
// Run this file in your terminal: node test-refresh.js

import dotenv from 'dotenv';
dotenv.config();

import connectDB from './config/db.js';
import mongoose from 'mongoose';
import { User } from './modules/auth/auth.model.js';
import { getValidToken } from './utils/tokenManager.js';

async function testRefresh() {
  console.log('Connecting to database...');
  await connectDB();

  try {
    // 1. Find a user with a connected YouTube account
    const user = await User.findOne({
      'socialAccounts.platform': 'youtube',
      'socialAccounts.isActive': true
    });

    if (!user) {
      console.log('\n❌ No user with a connected YouTube account was found in the database.');
      console.log('Please connect a YouTube account in the UI first before running this test.');
      await mongoose.disconnect();
      return;
    }

    const account = user.getSocialAccount('youtube');
    console.log('\n----------------------------------------');
    console.log(`👤 Found user: ${user.name} (${user.email})`);
    console.log(`📺 YouTube Channel: ${account.platformUsername || 'Unknown'}`);
    console.log(`📅 Connected At: ${account.connectedAt}`);
    console.log(`📅 Expires At: ${account.expiresAt}`);
    console.log(`⏱️ Is Expired? ${account.isExpired() ? '⚠️ YES' : '✅ NO'}`);
    console.log('----------------------------------------');

    console.log('\nCalling getValidToken(userId, "youtube")...');
    const validToken = await getValidToken(user._id, 'youtube');

    // 2. Fetch the updated user state to verify
    const updatedUser = await User.findById(user._id);
    const updatedAccount = updatedUser.getSocialAccount('youtube');

    console.log('\n----------------------------------------');
    console.log('✨ Results after getValidToken call:');
    console.log(`📅 New Expires At: ${updatedAccount.expiresAt}`);
    console.log(`⏱️ Is Expired now? ${updatedAccount.isExpired() ? '⚠️ YES' : '✅ NO'}`);
    console.log('🔑 Valid Access Token:', validToken.substring(0, 15) + '...');
    console.log('----------------------------------------');

  } catch (error) {
    console.error('\n❌ Error during test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from database.');
  }
}

testRefresh();
