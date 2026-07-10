// ── Instagram Dummy Data ─────────────────────────────────────────────
// This file provides realistic mock data for the Instagram Dashboard 
// so the frontend can be visualized properly before real API data flows in.

export const instagramDummyData = {
  metrics: {
    followers: 85300,
    reach: 145200,
    totalEngagement: 12500,
    profileViews: 4500,
  },
  followerGrowth: [
    { date: "2026-07-04", gained: 120, lost: 20 },
    { date: "2026-07-05", gained: 150, lost: 25 },
    { date: "2026-07-06", gained: 200, lost: 15 },
    { date: "2026-07-07", gained: 180, lost: 30 },
    { date: "2026-07-08", gained: 220, lost: 10 },
    { date: "2026-07-09", gained: 300, lost: 40 },
    { date: "2026-07-10", gained: 250, lost: 20 },
  ],
  demographics: {
    ageAndGender: [
      { group: "F.18-24", count: 3200 },
      { group: "F.25-34", count: 4500 },
      { group: "F.35-44", count: 1200 },
      { group: "M.18-24", count: 1800 },
      { group: "M.25-34", count: 2500 },
      { group: "M.35-44", count: 800 },
    ],
    topCountries: [
      { name: "United States", count: 4500 },
      { name: "India", count: 2800 },
      { name: "United Kingdom", count: 1200 },
      { name: "Canada", count: 800 },
      { name: "Australia", count: 600 },
    ],
    topCities: [
      { name: "New York", count: 1200 },
      { name: "London", count: 850 },
      { name: "Los Angeles", count: 700 },
    ],
  },
  rawPlatformData: {
    instagram: {
      username: "creative_studio",
      profilePicture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
      followingCount: 342,
      mediaCount: 156,
      insights: [
        {
          name: "reach",
          values: [
            { end_time: "2026-07-04T00:00:00", value: 12400 },
            { end_time: "2026-07-05T00:00:00", value: 15600 },
            { end_time: "2026-07-06T00:00:00", value: 18200 },
            { end_time: "2026-07-07T00:00:00", value: 14800 },
            { end_time: "2026-07-08T00:00:00", value: 21000 },
            { end_time: "2026-07-09T00:00:00", value: 24500 },
            { end_time: "2026-07-10T00:00:00", value: 19800 },
          ],
        },
        {
          name: "impressions",
          values: [
            { end_time: "2026-07-04T00:00:00", value: 15000 },
            { end_time: "2026-07-05T00:00:00", value: 18000 },
            { end_time: "2026-07-06T00:00:00", value: 22000 },
            { end_time: "2026-07-07T00:00:00", value: 17500 },
            { end_time: "2026-07-08T00:00:00", value: 26000 },
            { end_time: "2026-07-09T00:00:00", value: 31000 },
            { end_time: "2026-07-10T00:00:00", value: 24000 },
          ],
        },
      ],
      media: [
        {
          id: "m1",
          media_type: "VIDEO",
          media_url: "https://images.unsplash.com/photo-1616469829581-73993eb86b02?w=400&h=400&fit=crop",
          thumbnail_url: "https://images.unsplash.com/photo-1616469829581-73993eb86b02?w=150&h=150&fit=crop",
          caption: "Behind the scenes of our latest photoshoot! 📸✨",
          timestamp: "2026-07-09T14:30:00",
          like_count: 4520,
          comments_count: 342,
        },
        {
          id: "m2",
          media_type: "IMAGE",
          media_url: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=400&h=400&fit=crop",
          caption: "New workspace setup. Productivity level 100! 💻☕",
          timestamp: "2026-07-08T09:15:00",
          like_count: 2150,
          comments_count: 128,
        },
        {
          id: "m3",
          media_type: "CAROUSEL_ALBUM",
          media_url: "https://images.unsplash.com/photo-1493612276216-ee3925520721?w=400&h=400&fit=crop",
          caption: "5 tips for better design layouts. Swipe left! 👉",
          timestamp: "2026-07-07T11:45:00",
          like_count: 3840,
          comments_count: 215,
        },
        {
          id: "m4",
          media_type: "VIDEO",
          media_url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=400&fit=crop",
          thumbnail_url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=150&h=150&fit=crop",
          caption: "Quick unboxing of the new gear 📦🔥",
          timestamp: "2026-07-05T16:20:00",
          like_count: 5120,
          comments_count: 480,
        },
      ],
    },
  },
};
