// utils/tokenManager.js
//
// Use getValidToken(userId, platform) before every social media API call.
// It checks if the stored token is expired and refreshes it automatically.

import { User } from '../modules/auth/auth.model.js';
import { platforms } from '../config/platforms/index.js';

async function getValidToken(userId, platform) {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const account = user.getSocialAccount(platform);
  if (!account) throw new Error(`${platform} is not connected for this user.`);

  // Token still valid — return it
  if (!account.isExpired()) {
    return account.accessToken; // virtual decrypts
  }

  // Token expired — attempt refresh
  console.log(`[tokenManager] ${platform} token expired for user ${userId} — refreshing...`);

  const config       = platforms[platform];
  const refreshToken = account.refreshToken; // virtual decrypts

  try {
    const refreshed = await config.refreshAccessToken(refreshToken);

    account.accessToken = refreshed.accessToken; // virtual encrypts
    account.expiresAt   = refreshed.expiresAt;
    account.logRefresh('success');
    await user.save();

    console.log(`[tokenManager] ${platform} token refreshed successfully.`);
    return refreshed.accessToken;

  } catch (err) {
    account.logRefresh('failed', err.message);
    await user.save();
    throw new Error(`${platform} token refresh failed: ${err.message}`);
  }
}

export { getValidToken };
