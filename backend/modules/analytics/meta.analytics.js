import axios from 'axios';
import { getValidToken } from '../../utils/tokenManager.js';
import { AnalyticsSnapshot } from './analytics.model.js';

export const fetchAndSaveMetaAnalytics = async (userId) => {
  let facebookData = null;
  let instagramData = null;
  let hasRealData = false;

  // ─── 1. Attempt to fetch Facebook Page Analytics ───────────────────────────
  try {
    console.log(`[meta.analytics] Checking Facebook connection for user ${userId}...`);
    const fbToken = await getValidToken(userId, 'facebook');

    if (fbToken) {
      console.log(`[meta.analytics] Fetching Facebook Pages for user ${userId}...`);
      const pagesRes = await axios.get('https://graph.facebook.com/v18.0/me/accounts', {
        params: { access_token: fbToken }
      });

      const page = pagesRes.data.data?.[0]; // Get the first managed page
      if (page) {
        const pageId = page.id;
        const pageToken = page.access_token; // Page-specific access token
        console.log(`[meta.analytics] Fetching FB Page stats for page ${page.name} (${pageId})...`);

        // Fetch basic info
        const detailRes = await axios.get(`https://graph.facebook.com/v18.0/${pageId}`, {
          params: { fields: 'fan_count,name', access_token: pageToken }
        });

        // Fetch daily page insights for the last 30 days
        const insightsRes = await axios.get(`https://graph.facebook.com/v18.0/${pageId}/insights`, {
          params: {
            metric: 'page_impressions,page_post_engagements,page_views_total,page_daily_follows',
            period: 'day',
            access_token: pageToken
          }
        });

        facebookData = {
          pageName: detailRes.data.name,
          pageId,
          fanCount: detailRes.data.fan_count || 0,
          insights: insightsRes.data.data || []
        };
        hasRealData = true;
      }
    }
  } catch (err) {
    console.warn(`⚠️ [meta.analytics] Facebook API fetch skipped/failed for user ${userId}:`, err.message);
  }

  // ─── 2. Attempt to fetch Instagram Insights ─────────────────────────────────
  try {
    console.log(`[meta.analytics] Checking Instagram connection for user ${userId}...`);
    const igToken = await getValidToken(userId, 'instagram');

    if (igToken) {
      console.log(`[meta.analytics] Fetching FB Page linked to Instagram for user ${userId}...`);
      const pagesRes = await axios.get('https://graph.facebook.com/v18.0/me/accounts', {
        params: { access_token: igToken }
      });

      const page = pagesRes.data.data?.[0];
      if (page) {
        console.log(`[meta.analytics] Fetching IG Business Account linked to FB Page ${page.id}...`);
        const igAccountRes = await axios.get(`https://graph.facebook.com/v18.0/${page.id}`, {
          params: { fields: 'instagram_business_account', access_token: igToken }
        });

        const igAccountId = igAccountRes.data.instagram_business_account?.id;
        if (igAccountId) {
          console.log(`[meta.analytics] Fetching IG insights for Business Account ${igAccountId}...`);

          // Fetch profile count
          const profileRes = await axios.get(`https://graph.facebook.com/v18.0/${igAccountId}`, {
            params: { fields: 'followers_count,media_count,username', access_token: igToken }
          });

          // Fetch insights (last 30 days daily impressions/reach/profile views)
          const insightsRes = await axios.get(`https://graph.facebook.com/v18.0/${igAccountId}/insights`, {
            params: {
              metric: 'impressions,reach,profile_views',
              period: 'day',
              access_token: igToken
            }
          });

          // Fetch demographics
          const demoRes = await axios.get(`https://graph.facebook.com/v18.0/${igAccountId}/insights`, {
            params: {
              metric: 'audience_country,audience_gender_age',
              period: 'lifetime',
              access_token: igToken
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
        }
      }
    }
  } catch (err) {
    console.warn(`⚠️ [meta.analytics] Instagram API fetch skipped/failed for user ${userId}:`, err.message);
  }

  // ─── 3. Process data or generate fallback mock data ─────────────────────────
  if (hasRealData) {
    let followers = 0;
    let impressions = 0;
    let reach = 0;
    let profileViews = 0;
    let totalEngagement = 0;
    let topCountries = [];
    let ageAndGender = [];

    // Parse Facebook numbers
    if (facebookData) {
      followers += facebookData.fanCount;
      const getVal = (metricName) => {
        const met = facebookData.insights.find(m => m.name === metricName);
        return met?.values?.reduce((acc, v) => acc + (v.value || 0), 0) || 0;
      };
      impressions += getVal('page_impressions');
      totalEngagement += getVal('page_post_engagements');
      profileViews += getVal('page_views_total');
      // Estimate reach roughly from impressions
      reach += Math.round(getVal('page_impressions') * 0.75);
    }

    // Parse Instagram numbers
    if (instagramData) {
      followers += instagramData.followers;
      const getVal = (metricName) => {
        const met = instagramData.insights.find(m => m.name === metricName);
        return met?.values?.reduce((acc, v) => acc + (v.value || 0), 0) || 0;
      };
      impressions += getVal('impressions');
      reach += getVal('reach');
      profileViews += getVal('profile_views');

      // Parse Instagram demographics
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
    }

    const snapshot = await AnalyticsSnapshot.create({
      incubationCenterId: userId,
      platform: 'meta',
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
      rawPlatformData: {
        facebook: facebookData,
        instagram: instagramData
      }
    });

    console.log(`✅ [meta.analytics] Successfully saved Meta analytics for user ${userId}`);
    return snapshot;
  } else {
    // FALLBACK: If no accounts connected or API calls fail completely, generate mock Meta analytics
    console.warn(`[meta.analytics] No valid Meta connections found. Generating mock Meta snapshot for user ${userId}...`);
    
    const snapshot = await AnalyticsSnapshot.create({
      incubationCenterId: userId,
      platform: 'meta',
      metrics: {
        followers: 0,
        impressions: 0,
        reach: 0,
        profileViews: 0,
        totalEngagement: 0
      },
      demographics: {
        topCountries: [],
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
        mock: false,
        facebook: null,
        instagram: null
      }
    });

    console.log(`✅ [meta.analytics] Empty Meta data saved successfully for user ${userId} (No real connection/data found)`);
    return snapshot;
  }
};
