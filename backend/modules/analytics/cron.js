import cron from 'node-cron';
import { User } from '../auth/auth.model.js';
import { fetchAndSaveYouTubeAnalytics } from './youtube.analytics.js';
// import { fetchAndSaveMetaAnalytics } from './meta.analytics.js';
// import { fetchAndSaveLinkedInAnalytics } from './linkedin.analytics.js';

//we will run every night at 2:00 AM.........................................................................
cron.schedule('0 2 * * *', async () => {
  console.log('⏳ Starting nightly analytics fetch...');
  
  try {
    const users = await User.find({}); // Get all registered centers
    
    for (const user of users) {
      // Check which platforms they have connected
      const hasYoutube = user.socialAccounts.some(acc => acc.platform === 'youtube' && acc.isActive);
      
      if (hasYoutube) {
        await fetchAndSaveYouTubeAnalytics(user._id);
      }
      // Add if (hasMeta) ... etc.
    }
    
    console.log('✅ Nightly fetch complete.');
  } catch (err) {
    console.error('❌ Nightly fetch failed:', err);
  }
});