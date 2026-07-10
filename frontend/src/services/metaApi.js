import api from "./api";
const metaApi = {
  // Fetch Meta (Facebook & Instagram) analytics unified snapshot
  getMetaAnalytics: async (forceRefresh = false, dateRange = null) => {
    let snapshots = [];

    const url = forceRefresh ? "/analytics/meta?forceRefresh=true" : "/analytics/meta";
    const response = await api.get(url);
    snapshots = response.data?.data || [];
    
    // Find the facebook and instagram snapshots from the array
    const fbSnapshot = snapshots.find(s => s.platform === 'facebook' || s.rawPlatformData?.facebook) || {};
    const igSnapshot = snapshots.find(s => s.platform === 'instagram' || s.rawPlatformData?.instagram) || {};
    
    const fb = fbSnapshot.rawPlatformData?.facebook || {};
    const ig = igSnapshot.rawPlatformData?.instagram || {};

    const formatChartData = (insights, metricName) => {
      if (!insights) return [];
      const metric = insights.find(m => m.name === metricName);
      if (!metric || !metric.values) return [];
      return metric.values.map(v => ({
        date: v.end_time?.split('T')[0] || new Date().toISOString().split('T')[0],
        value: v.value || 0
      }));
    };

    // ── Facebook Analytics Object Formatting ──────────────────────────
    const facebook = {
      kpis: [
        { title: "Total Followers", value: fb.fanCount || fbSnapshot.metrics?.followers || 0 },
        { title: "Page Views", value: fb.insights?.find(m=>m.name==='page_views_total')?.values?.reduce((a,b)=>a+(b.value||0), 0) || fbSnapshot.metrics?.profileViews || 0 },
        { title: "Impressions", value: fb.insights?.find(m=>m.name==='page_impressions')?.values?.reduce((a,b)=>a+(b.value||0), 0) || fbSnapshot.metrics?.impressions || 0 },
        { title: "Engagements", value: fb.insights?.find(m=>m.name==='page_post_engagements')?.values?.reduce((a,b)=>a+(b.value||0), 0) || fbSnapshot.metrics?.totalEngagement || 0 },
        { title: "Daily Follows", value: fb.insights?.find(m=>m.name==='page_daily_follows')?.values?.reduce((a,b)=>a+(b.value||0), 0) || 0 },
        { title: "Reach (Est.)", value: fbSnapshot.metrics?.reach || Math.round((fb.insights?.find(m=>m.name==='page_impressions')?.values?.reduce((a,b)=>a+(b.value||0), 0) || 0) * 0.75) }
      ],
      charts: {
        reachOverTime: formatChartData(fb.insights, 'page_impressions'),
        engagementsOverTime: formatChartData(fb.insights, 'page_post_engagements'),
        engagementRate: { rate: "N/A", change: 0, data: [] },
        reachBySource: [{ name: "Organic", value: 100 }, { name: "Paid", value: 0 }],
        audience: {
          ageGender: (fbSnapshot.demographics?.ageAndGender || []).map(a => ({ group: a.group, value: a.count })),
          topCountries: (fbSnapshot.demographics?.topCountries || []).map(c => ({ country: c.name, value: c.count }))
        }
      },
      tables: {
        topPosts: fbSnapshot.extended?.contentData?.posts || [],
        topVideos: fbSnapshot.extended?.contentData?.videos || []
      },
      extended: fbSnapshot.extended || {}
    };

    // ── Instagram Analytics Object Formatting ─────────────────────────
    const instagram = {
      kpis: [
        // Fallback to igSnapshot.metrics when rawPlatformData.instagram has no insights (e.g. mock data)
        { title: "Total Followers", value: ig.followers || igSnapshot.metrics?.followers || 0 },
        { title: "Profile Views",  value: ig.insights?.find(m=>m.name==='profile_views')?.values?.reduce((a,b)=>a+(b.value||0), 0) || igSnapshot.metrics?.profileViews || 0 },
        { title: "Reach",          value: ig.insights?.find(m=>m.name==='reach')?.values?.reduce((a,b)=>a+(b.value||0), 0)         || igSnapshot.metrics?.reach || 0 },
        { title: "Impressions",    value: ig.insights?.find(m=>m.name==='impressions')?.values?.reduce((a,b)=>a+(b.value||0), 0)  || igSnapshot.metrics?.impressions || 0 },
        { title: "Media Count",    value: ig.mediaCount || 0 },
        { title: "Engagement",     value: igSnapshot.metrics?.totalEngagement || 0 }
      ],
      charts: {
        reachOverTime: formatChartData(ig.insights, 'reach'),
        engagementsOverTime: formatChartData(ig.insights, 'engagement'),
        engagementRate: { rate: "N/A", change: 0, data: [] },
        reachBySource: [{ name: "Followers", value: 50 }, { name: "Non-Followers", value: 50 }],
        audience: {
          // Map ageGender group/count pairs from the snapshot demographics
          ageGender: (igSnapshot.demographics?.ageAndGender || []).map(a => ({ group: a.group, value: a.count })),
          topCountries: (igSnapshot.demographics?.topCountries || []).map(c => ({ country: c.name, value: c.count }))
        }
      },
      tables: {
        topPosts: igSnapshot.extended?.contentData?.posts || [],
        topReels: igSnapshot.extended?.contentData?.reels || []
      },
      extended: igSnapshot.extended || {}
    };

    return { facebook, instagram };
  },

  // Get the connection status for all platforms
  getAuthStatus: async () => {
    const response = await api.get("/auth/status");
    return response.data;
  },

  // Revoke Facebook access
  revokeFacebook: async () => {
    const response = await api.delete("/auth/facebook/revoke");
    return response.data;
  },

  // Revoke Instagram access
  revokeInstagram: async () => {
    const response = await api.delete("/auth/instagram/revoke");
    return response.data;
  },
};

export default metaApi;
