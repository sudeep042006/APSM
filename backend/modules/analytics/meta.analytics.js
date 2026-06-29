import axios from 'axios';
import { getValidToken } from '../../utils/tokenManager.js';
import { AnalyticsSnapshot } from './analytics.model.js';

export const fetchAndSaveFacebookAnalytics = async (userId) => {
  let facebookData = null;
  let hasRealData = false;
  let followers = 0;
  let impressions = 0;
  let reach = 0;
  let profileViews = 0;
  let totalEngagement = 0;

  try {
    console.log(`[meta.analytics] Checking Facebook connection for user ${userId}...`);
    const fbToken = await getValidToken(userId, 'facebook');

    console.log(`[DEBUG-FB] Token received: ${fbToken ? 'YES (length: ' + fbToken.length + ')' : 'NO/NULL'}`);

    if (fbToken) {
      // DEBUG: Check what permissions the token actually has
      try {
        const permRes = await axios.get('https://graph.facebook.com/v18.0/me/permissions', {
          params: { access_token: fbToken }
        });
        console.log(`[DEBUG-FB] Token permissions:`, JSON.stringify(permRes.data, null, 2));
      } catch (permErr) {
        console.error(`[DEBUG-FB] Failed to check permissions:`, permErr.response?.data || permErr.message);
      }

      // DEBUG: Check who this token belongs to
      try {
        const meRes = await axios.get('https://graph.facebook.com/v18.0/me', {
          params: { fields: 'id,name', access_token: fbToken }
        });
        console.log(`[DEBUG-FB] Token belongs to:`, JSON.stringify(meRes.data, null, 2));
      } catch (meErr) {
        console.error(`[DEBUG-FB] Failed /me call:`, meErr.response?.data || meErr.message);
      }

      console.log(`[meta.analytics] Fetching Facebook Pages for user ${userId}...`);
      const pagesRes = await axios.get('https://graph.facebook.com/v18.0/me/accounts', {
        params: { access_token: fbToken }
      });

      console.log(`[DEBUG-FB] /me/accounts response:`, JSON.stringify(pagesRes.data, null, 2));

      const page = pagesRes.data.data?.[0];
      if (page) {
        const pageId = page.id;
        const pageToken = page.access_token;
        console.log(`[meta.analytics] Fetching FB Page stats for page ${page.name} (${pageId})...`);
        console.log(`[DEBUG-FB] Page token received: ${pageToken ? 'YES' : 'NO'}`);

        const detailRes = await axios.get(`https://graph.facebook.com/v18.0/${pageId}`, {
          params: { fields: 'fan_count,name', access_token: pageToken }
        });

        console.log(`[DEBUG-FB] Page details:`, JSON.stringify(detailRes.data, null, 2));

        const insightsRes = await axios.get(`https://graph.facebook.com/v18.0/${pageId}/insights`, {
          params: {
            metric: 'page_impressions,page_post_engagements,page_views_total,page_daily_follows',
            period: 'day',
            access_token: pageToken
          }
        });

        console.log(`[DEBUG-FB] Insights response received: ${insightsRes.data.data?.length || 0} metrics`);

        facebookData = {
          pageName: detailRes.data.name,
          pageId,
          fanCount: detailRes.data.fan_count || 0,
          insights: insightsRes.data.data || []
        };
        hasRealData = true;

        followers += facebookData.fanCount;
        const getVal = (metricName) => {
          const met = facebookData.insights.find(m => m.name === metricName);
          return met?.values?.reduce((acc, v) => acc + (v.value || 0), 0) || 0;
        };
        impressions += getVal('page_impressions');
        totalEngagement += getVal('page_post_engagements');
        profileViews += getVal('page_views_total');
        reach += Math.round(getVal('page_impressions') * 0.75);
      } else {
        console.warn(`[DEBUG-FB] ❌ No pages returned! Full response data:`, JSON.stringify(pagesRes.data, null, 2));
      }
    } else {
      console.warn(`[DEBUG-FB] ❌ No token returned from getValidToken!`);
    }
  } catch (err) {
    console.error(`⚠️ [meta.analytics] Facebook API fetch FAILED for user ${userId}:`);
    console.error(`[DEBUG-FB] Error message:`, err.message);
    console.error(`[DEBUG-FB] Error response data:`, JSON.stringify(err.response?.data, null, 2));
    console.error(`[DEBUG-FB] Error response status:`, err.response?.status);
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  if (hasRealData) {
    const snapshot = await AnalyticsSnapshot.findOneAndUpdate(
      {
        incubationCenterId: userId,
        platform: 'facebook',
        snapshotDate: { $gte: startOfDay, $lte: endOfDay }
      },
      {
        incubationCenterId: userId,
        platform: 'facebook',
        snapshotDate: new Date(),
        metrics: {
          followers,
          impressions,
          reach,
          profileViews,
          totalEngagement
        },
        demographics: {
          topCountries: [],
          topCities: [],
          ageAndGender: []
        },
        rawPlatformData: { facebook: facebookData }
      },
      { upsert: true, new: true }
    );
    console.log(`✅ [meta.analytics] Successfully saved Facebook analytics for user ${userId}`);
    return snapshot;
  } else {
    console.warn(`[meta.analytics] No valid Facebook connections found. Generating mock Facebook snapshot for user ${userId}...`);
    const snapshot = await AnalyticsSnapshot.findOneAndUpdate(
      {
        incubationCenterId: userId,
        platform: 'facebook',
        snapshotDate: { $gte: startOfDay, $lte: endOfDay }
      },
      {
        incubationCenterId: userId,
        platform: 'facebook',
        snapshotDate: new Date(),
        metrics: {
          followers: Math.floor(Math.random() * 2000) + 1000,
          impressions: Math.floor(Math.random() * 15000) + 4000,
          reach: Math.floor(Math.random() * 10000) + 2000,
          profileViews: Math.floor(Math.random() * 500) + 100,
          totalEngagement: Math.floor(Math.random() * 1000) + 150
        },
        demographics: {
          topCountries: [
            { name: 'IN', count: Math.floor(Math.random() * 1000) + 500 }
          ],
          topCities: [],
          ageAndGender: []
        },
        ads: {
          activeCampaigns: 0,
          totalSpend: 0,
          currency: 'INR',
          adImpressions: 0,
          costPerClick: 0
        },
        rawPlatformData: {
          mock: true,
          facebook: { pageName: 'Mock Center FB Page', likes: 1500 }
        }
      },
      { upsert: true, new: true }
    );
    return snapshot;
  }
};

export const fetchAndSaveInstagramAnalytics = async (userId) => {
  let instagramData = null;
  let hasRealData = false;
  let followers = 0;
  let impressions = 0;
  let reach = 0;
  let profileViews = 0;
  let totalEngagement = 0;
  let topCountries = [];
  let ageAndGender = [];

  try {
    console.log(`[meta.analytics] Checking Instagram connection for user ${userId}...`);

    // Bug fix: Instagram Business accounts are accessed via the linked Facebook Page.
    // The /me/accounts endpoint requires a Facebook User token, NOT an Instagram token.
    // So we always use the facebook token here, then look up the linked IG business account.
    const fbToken = await getValidToken(userId, 'facebook');

    if (fbToken) {
      console.log(`[meta.analytics] Fetching FB Page linked to Instagram for user ${userId}...`);
      const pagesRes = await axios.get('https://graph.facebook.com/v18.0/me/accounts', {
        params: { access_token: fbToken }
      });

      const page = pagesRes.data.data?.[0];
      if (page) {
        // Use the page-level access token (not the user token) for IG business account
        const pageToken = page.access_token;
        console.log(`[meta.analytics] Fetching IG Business Account linked to FB Page ${page.id}...`);
        const igAccountRes = await axios.get(`https://graph.facebook.com/v18.0/${page.id}`, {
          params: { fields: 'instagram_business_account', access_token: pageToken }
        });

        const igAccountId = igAccountRes.data.instagram_business_account?.id;
        if (igAccountId) {
          console.log(`[meta.analytics] Fetching IG insights for Business Account ${igAccountId}...`);

          const profileRes = await axios.get(`https://graph.facebook.com/v18.0/${igAccountId}`, {
            params: { fields: 'followers_count,media_count,username', access_token: pageToken }
          });

          const insightsRes = await axios.get(`https://graph.facebook.com/v18.0/${igAccountId}/insights`, {
            params: {
              metric: 'impressions,reach,profile_views',
              period: 'day',
              access_token: pageToken
            }
          });

          const demoRes = await axios.get(`https://graph.facebook.com/v18.0/${igAccountId}/insights`, {
            params: {
              metric: 'audience_country,audience_gender_age',
              period: 'lifetime',
              access_token: pageToken
            }
          });

          instagramData = {
            username: profileRes.data.username,
            followers: profileRes.data.followers_count || 0,
            mediaCount: profileRes.data.media_count || 0,
            insights: insightsRes.data.data || [],
            demographics: demoRes.data.data || []
          };
          hasRealData = true;

          followers += instagramData.followers;
          const getVal = (metricName) => {
            const met = instagramData.insights.find(m => m.name === metricName);
            return met?.values?.reduce((acc, v) => acc + (v.value || 0), 0) || 0;
          };
          impressions += getVal('impressions');
          reach += getVal('reach');
          profileViews += getVal('profile_views');

          const countryMetric = instagramData.demographics.find(m => m.name === 'audience_country');
          if (countryMetric?.values?.[0]?.value) {
            const valObj = countryMetric.values[0].value;
            topCountries = Object.entries(valObj).map(([name, count]) => ({
              name,
              count: parseInt(count) || 0
            })).sort((a, b) => b.count - a.count).slice(0, 5);
          }

          const ageGenderMetric = instagramData.demographics.find(m => m.name === 'audience_gender_age');
          if (ageGenderMetric?.values?.[0]?.value) {
            const valObj = ageGenderMetric.values[0].value;
            ageAndGender = Object.entries(valObj).map(([group, count]) => ({
              group,
              count: parseFloat(count) || 0
            }));
          }
        } else {
          console.warn(`[meta.analytics] No Instagram Business Account linked to FB Page ${page.id}`);
        }
      } else {
        console.warn(`[meta.analytics] No Facebook Pages found for user ${userId} — cannot look up linked IG account`);
      }
    } else {
      console.warn(`[meta.analytics] No Facebook token found for user ${userId} — skipping Instagram lookup`);
    }
  } catch (err) {
    console.warn(`⚠️ [meta.analytics] Instagram API fetch skipped/failed for user ${userId}:`, err.message);
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  if (hasRealData) {
    const snapshot = await AnalyticsSnapshot.findOneAndUpdate(
      {
        incubationCenterId: userId,
        platform: 'instagram',
        snapshotDate: { $gte: startOfDay, $lte: endOfDay }
      },
      {
        incubationCenterId: userId,
        platform: 'instagram',
        snapshotDate: new Date(),
        metrics: {
          followers,
          impressions,
          reach,
          profileViews,
          totalEngagement
        },
        demographics: {
          topCountries,
          topCities: [],
          ageAndGender
        },
        rawPlatformData: { instagram: instagramData }
      },
      { upsert: true, new: true }
    );
    console.log(`✅ [meta.analytics] Successfully saved Instagram analytics for user ${userId}`);
    return snapshot;
  } else {
    console.warn(`[meta.analytics] No valid Instagram connections found. Generating mock Instagram snapshot for user ${userId}...`);
    const snapshot = await AnalyticsSnapshot.findOneAndUpdate(
      {
        incubationCenterId: userId,
        platform: 'instagram',
        snapshotDate: { $gte: startOfDay, $lte: endOfDay }
      },
      {
        incubationCenterId: userId,
        platform: 'instagram',
        snapshotDate: new Date(),
        metrics: {
          followers: Math.floor(Math.random() * 2000) + 500,
          impressions: Math.floor(Math.random() * 15000) + 4000,
          reach: Math.floor(Math.random() * 10000) + 3000,
          profileViews: Math.floor(Math.random() * 500) + 100,
          totalEngagement: Math.floor(Math.random() * 1000) + 150
        },
        demographics: {
          topCountries: [
            { name: 'IN', count: Math.floor(Math.random() * 1500) + 700 }
          ],
          topCities: [],
          ageAndGender: []
        },
        ads: {
          activeCampaigns: 1,
          totalSpend: 4000,
          currency: 'INR',
          adImpressions: 11000,
          costPerClick: 2.5
        },
        rawPlatformData: {
          mock: true,
          instagram: { username: 'mock_center_instagram', followers: 1650 }
        }
      },
      { upsert: true, new: true }
    );
    return snapshot;
  }
};
