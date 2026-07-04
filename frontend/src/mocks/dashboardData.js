// ── Centralized Mock Data Engine ──────────────────────────────────────
// Generates realistic analytics snapshots for all integrated platforms.
// To prevent data from becoming stale, all date-based metrics are generated
// dynamically relative to the current local date.

// Helper to generate a sequence of dates from N days ago to today
const generateDates = (daysCount) => {
  const dates = [];
  const now = new Date();
  for (let i = daysCount; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
};

// Generate relative dates for our datasets
const datesList = generateDates(45);

// Helper to create a sinusoidal trend with random noise
const generateTrendValue = (base, amplitude, index, noiseScale = 0.1) => {
  const sinVal = Math.sin(index * 0.3) * amplitude;
  const noise = (Math.random() - 0.5) * base * noiseScale;
  return Math.round(Math.max(0, base + sinVal + noise));
};

// ── Facebook Mock Database ──────────────────────────────────────────
const makeFacebookMock = () => {
  // Generate daily metrics
  const impressionsValues = datesList.map((date, idx) => ({
    end_time: `${date}T07:00:00+0000`,
    value: generateTrendValue(15000, 4000, idx),
  }));

  const engagementsValues = datesList.map((date, idx) => ({
    end_time: `${date}T07:00:00+0000`,
    value: generateTrendValue(1200, 300, idx),
  }));

  const viewsValues = datesList.map((date, idx) => ({
    end_time: `${date}T07:00:00+0000`,
    value: generateTrendValue(450, 100, idx),
  }));

  const followsValues = datesList.map((date, idx) => ({
    end_time: `${date}T07:00:00+0000`,
    value: generateTrendValue(35, 10, idx),
  }));

  return {
    platform: "facebook",
    snapshotDate: new Date().toISOString(),
    metrics: {
      followers: 18450,
      impressions: impressionsValues.reduce((acc, v) => acc + v.value, 0),
      reach: Math.round(impressionsValues.reduce((acc, v) => acc + v.value, 0) * 0.75),
      profileViews: viewsValues.reduce((acc, v) => acc + v.value, 0),
      totalEngagement: engagementsValues.reduce((acc, v) => acc + v.value, 0),
    },
    demographics: {
      topCountries: [
        { name: "India", count: 8500 },
        { name: "United States", count: 3200 },
        { name: "United Kingdom", count: 1800 },
        { name: "Canada", count: 1200 },
        { name: "Australia", count: 950 },
      ],
      topCities: [
        { name: "Mumbai", count: 2400 },
        { name: "Bangalore", count: 1900 },
        { name: "New York", count: 1500 },
        { name: "London", count: 1100 },
        { name: "Delhi", count: 900 },
      ],
      ageAndGender: [
        { group: "18-24_male", count: 1200 },
        { group: "18-24_female", count: 1500 },
        { group: "25-34_male", count: 2800 },
        { group: "25-34_female", count: 3100 },
      ],
    },
    ads: {
      activeCampaigns: 2,
      totalSpend: 14500,
      currency: "INR",
      adImpressions: 48000,
      costPerClick: 12.5,
    },
    rawPlatformData: {
      facebook: {
        pageName: "Incubien Enterprise FB Page",
        pageId: "fb_page_12345",
        fanCount: 18450,
        insights: [
          { name: "page_impressions", values: impressionsValues },
          { name: "page_post_engagements", values: engagementsValues },
          { name: "page_views_total", values: viewsValues },
          { name: "page_daily_follows", values: followsValues },
        ],
      },
    },
    // Extended properties for sub-pages
    extended: {
      contentData: {
        posts: [
          {
            id: "post_1",
            title: "Announcing our new APSM Unified Dashboard! 🚀 Manage all channels from one place.",
            date: datesList[datesList.length - 2],
            reach: 12800,
            impressions: 15000,
            likes: 1200,
            comments: 150,
            rate: "9.0%",
            image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=150&auto=format&fit=crop&q=60",
          },
          {
            id: "post_2",
            title: "5 Tips to optimize your social media workflow using analytics insights.",
            date: datesList[datesList.length - 5],
            reach: 9800,
            impressions: 11000,
            likes: 980,
            comments: 85,
            rate: "9.7%",
            image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=150&auto=format&fit=crop&q=60",
          },
          {
            id: "post_3",
            title: "Welcome to our fresh brand identity! Clean lines, vibrant colors, premium design.",
            date: datesList[datesList.length - 10],
            reach: 15400,
            impressions: 18000,
            likes: 2100,
            comments: 340,
            rate: "13.5%",
            image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=150&auto=format&fit=crop&q=60",
          },
        ],
        videos: [
          {
            id: "video_1",
            title: "SocialOS Platform Walkthrough & Feature Demo",
            date: datesList[datesList.length - 3],
            plays: 4500,
            watchTime: "12,400 mins",
            likes: 450,
            comments: 32,
            rate: "10.7%",
            image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=150&auto=format&fit=crop&q=60",
          },
          {
            id: "video_2",
            title: "Client Testimonial: How Incubien helped grow our reach by 200%",
            date: datesList[datesList.length - 8],
            plays: 2800,
            watchTime: "8,900 mins",
            likes: 310,
            comments: 18,
            rate: "11.7%",
            image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=150&auto=format&fit=crop&q=60",
          },
        ],
        stories: [
          {
            id: "story_1",
            title: "Behind the scenes at the Incubien HQ Office",
            date: datesList[datesList.length - 1],
            reach: 1500,
            tapForwards: 1200,
            tapBacks: 150,
            exits: 80,
            replies: 12,
            image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=150&auto=format&fit=crop&q=60",
          },
        ],
      },
      audienceDetails: {
        totalGrowth: "+8.5% followers this month",
        ageAndGender: [
          { group: "18-24", female: 20, male: 15 },
          { group: "25-34", female: 35, male: 30 },
          { group: "35-44", female: 15, male: 20 },
          { group: "45-54", female: 10, male: 12 },
          { group: "55+", female: 5, male: 8 },
        ],
        topLocations: [
          { location: "Mumbai, India", value: 40 },
          { location: "Bengaluru, India", value: 25 },
          { location: "New York, USA", value: 15 },
          { location: "London, UK", value: 12 },
          { location: "Delhi, India", value: 8 },
        ],
        topInterests: [
          { name: "Social Media Marketing", value: 45 },
          { name: "Entrepreneurship", value: 30 },
          { name: "Productivity", value: 15 },
          { name: "Software Development", value: 10 },
        ],
      },
      engagementDetails: {
        kpis: {
          totalLikes: 25400,
          totalComments: 7830,
          totalShares: 3400,
        },
        engagementTrend: datesList.map((date, idx) => ({
          date,
          total: generateTrendValue(1200, 300, idx),
        })),
        reactionTypes: [
          { name: "Like", value: 18000 },
          { name: "Love", value: 5200 },
          { name: "Wow", value: 1200 },
          { name: "Haha", value: 1000 },
        ],
      },
      growth: {
        gained: 1520,
        lost: 410,
        net: 1110,
        followerGrowthTimeline: datesList.map((date, idx) => ({
          date,
          gained: generateTrendValue(50, 15, idx),
          lost: generateTrendValue(10, 5, idx),
        })),
      },
      reachAndViews: datesList.map((date, idx) => ({
        date,
        organicReach: generateTrendValue(8000, 2000, idx),
        paidReach: generateTrendValue(1500, 500, idx),
        threeSecondViews: generateTrendValue(5000, 1000, idx),
        oneMinuteViews: generateTrendValue(2500, 600, idx),
      })),
      groups: {
        activeGroups: 1,
        totalMembers: 420,
        postsCount: 15,
      },
      ads: [
        { name: "APSM Signup Campaign", status: "ACTIVE", spend: 8500, clicks: 680, impressions: 22000 },
        { name: "Retargeting Ad v1", status: "ACTIVE", spend: 6000, clicks: 480, impressions: 26000 },
      ],
      utilityData: {
        recentExports: [
          { id: 1, name: "Facebook_Analytics_Q2.pdf", date: datesList[datesList.length - 4], size: "2.4 MB" },
          { id: 2, name: "Facebook_KPI_Snapshot.xlsx", date: datesList[datesList.length - 12], size: "1.2 MB" },
        ],
      },
      insights: [
        { type: "reach", recommendation: "Post frequency: Publishing 3 times a week yields 15% higher reach than daily posting." },
        { type: "engagement", recommendation: "Visual styles: Post containing high contrast blue gradients are driving 22% more engagements." },
      ],
    },
  };
};

// ── Instagram Mock Database ─────────────────────────────────────────
const makeInstagramMock = () => {
  // Generate daily metrics
  const reachValues = datesList.map((date, idx) => ({
    end_time: `${date}T07:00:00+0000`,
    value: generateTrendValue(24000, 6000, idx),
  }));

  const impressionsValues = datesList.map((date, idx) => ({
    end_time: `${date}T07:00:00+0000`,
    value: generateTrendValue(45000, 10000, idx),
  }));

  const profileViewsValues = datesList.map((date, idx) => ({
    end_time: `${date}T07:00:00+0000`,
    value: generateTrendValue(850, 200, idx),
  }));

  return {
    platform: "instagram",
    snapshotDate: new Date().toISOString(),
    metrics: {
      followers: 32400,
      impressions: impressionsValues.reduce((acc, v) => acc + v.value, 0),
      reach: reachValues.reduce((acc, v) => acc + v.value, 0),
      profileViews: profileViewsValues.reduce((acc, v) => acc + v.value, 0),
      totalEngagement: Math.round(impressionsValues.reduce((acc, v) => acc + v.value, 0) * 0.08),
    },
    demographics: {
      topCountries: [
        { name: "India", count: 12400 },
        { name: "United States", count: 5600 },
        { name: "Brazil", count: 2400 },
        { name: "Indonesia", count: 1800 },
        { name: "Germany", count: 1100 },
      ],
      topCities: [
        { name: "Mumbai", count: 3200 },
        { name: "New Delhi", count: 2100 },
        { name: "Bangalore", count: 1800 },
        { name: "Sao Paulo", count: 1200 },
        { name: "Jakarta", count: 950 },
      ],
      ageAndGender: [
        { group: "18-24_male", count: 2100 },
        { group: "18-24_female", count: 2800 },
        { group: "25-34_male", count: 4200 },
        { group: "25-34_female", count: 4900 },
      ],
    },
    ads: {
      activeCampaigns: 1,
      totalSpend: 8200,
      currency: "INR",
      adImpressions: 32000,
      costPerClick: 14.2,
    },
    rawPlatformData: {
      instagram: {
        username: "incubien_official",
        followers: 32400,
        mediaCount: 142,
        insights: [
          { name: "reach", values: reachValues },
          { name: "impressions", values: impressionsValues },
          { name: "profile_views", values: profileViewsValues },
        ],
      },
    },
    // Extended properties for sub-pages
    extended: {
      contentData: {
        posts: [
          {
            id: "ig_post_1",
            title: "Sleek, beautiful, dark UI mockups of our upcoming social analytics suite.",
            date: datesList[datesList.length - 1],
            reach: 8400,
            impressions: 12000,
            likes: 850,
            comments: 42,
            rate: "7.4%",
            image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=150&auto=format&fit=crop&q=60",
          },
          {
            id: "ig_post_2",
            title: "Join us in welcoming our new incubation batch for the Summer 2026 Cohort!",
            date: datesList[datesList.length - 4],
            reach: 7100,
            impressions: 9500,
            likes: 620,
            comments: 31,
            rate: "6.9%",
            image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=150&auto=format&fit=crop&q=60",
          },
        ],
        stories: [
          {
            id: "ig_story_1",
            title: "Behind the scenes at the shoot 📸",
            date: datesList[datesList.length - 1],
            reach: 2200,
            tapForwards: 1700,
            tapBacks: 320,
            exits: 110,
            replies: 15,
            image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=150&auto=format&fit=crop&q=60",
          },
        ],
        reels: [
          {
            id: "ig_reel_1",
            title: "Quick Tutorial: How to set up OAuth redirection in 2 minutes!",
            date: datesList[datesList.length - 3],
            plays: 12500,
            watchTime: "3,800 mins",
            likes: 1240,
            comments: 53,
            rate: "10.3%",
            image: "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=150&auto=format&fit=crop&q=60",
          },
        ],
      },
      audienceDetails: {
        totalGrowth: "+12.1% growth month-over-month",
        ageAndGender: [
          { group: "18-24", female: 25, male: 20 },
          { group: "25-34", female: 40, male: 35 },
          { group: "35-44", female: 12, male: 18 },
          { group: "45-54", female: 8, male: 10 },
          { group: "55+", female: 4, male: 6 },
        ],
        topLocations: [
          { location: "Mumbai, India", value: 45 },
          { location: "New Delhi, India", value: 20 },
          { location: "Bengaluru, India", value: 15 },
          { location: "Sao Paulo, Brazil", value: 12 },
          { location: "Jakarta, Indonesia", value: 8 },
        ],
        topInterests: [
          { name: "Visual Design", value: 50 },
          { name: "Saas Products", value: 25 },
          { name: "Incubation Programs", value: 15 },
          { name: "Video Production", value: 10 },
        ],
      },
      engagementDetails: {
        kpis: {
          totalLikes: 12400,
          totalComments: 680,
          totalSaves: 1450,
        },
        engagementTrend: datesList.map((date, idx) => ({
          date,
          total: generateTrendValue(900, 200, idx),
        })),
        reactionTypes: [
          { name: "Likes", value: 12400 },
          { name: "Comments", value: 680 },
          { name: "Saves", value: 1450 },
        ],
      },
      growth: {
        gained: 1890,
        lost: 320,
        net: 1570,
        followerGrowthTimeline: datesList.map((date, idx) => ({
          date,
          gained: generateTrendValue(60, 20, idx),
          lost: generateTrendValue(12, 4, idx),
        })),
      },
      hashtags: [
        { tag: "#SaasDevelopment", uses: 24, reach: 18000, percentage: 45 },
        { tag: "#UnifiedDashboard", uses: 18, reach: 14000, percentage: 35 },
        { tag: "#ReactFramework", uses: 12, reach: 11500, percentage: 20 },
      ],
      ads: [
        { name: "Instagram Reel Promotion", status: "ACTIVE", spend: 8200, clicks: 580, impressions: 32000 },
      ],
      insights: [
        { type: "content", recommendation: "Reels performance: Reels drive 4x the impressions of static feed images." },
        { type: "timing", recommendation: "Time optimization: Posting at 6 PM local time results in a 30% boost in initial engagement." },
      ],
      utilityData: {
        recentExports: [
          { id: 1, name: "Instagram_Engagement_June2026.pdf", date: datesList[datesList.length - 2], size: "1.8 MB" },
        ],
      },
    },
  };
};

// ── YouTube Mock Database ───────────────────────────────────────────
const makeYouTubeMock = () => {
  // Generate daily analytics rows
  const dailyRows = datesList.map((date) => {
    const views = generateTrendValue(3500, 1000, datesList.indexOf(date));
    const likes = Math.round(views * 0.08 + Math.random() * 20);
    const comments = Math.round(views * 0.02 + Math.random() * 5);
    const shares = Math.round(views * 0.015 + Math.random() * 3);
    const estimatedMinutesWatched = Math.round(views * 4.2); // avg 4.2 minutes watched
    const averageViewDuration = 252; // 4 mins 12 secs
    const averageViewPercentage = 42.5;
    const subscribersGained = Math.round(views * 0.005 + Math.random() * 2);
    const subscribersLost = Math.round(Math.random() * 2);

    return [
      date,
      views,
      likes,
      comments,
      shares,
      estimatedMinutesWatched,
      averageViewDuration,
      averageViewPercentage,
      subscribersGained,
      subscribersLost,
    ];
  });

  const dailyHeaders = [
    { name: "day" },
    { name: "views" },
    { name: "likes" },
    { name: "comments" },
    { name: "shares" },
    { name: "estimatedMinutesWatched" },
    { name: "averageViewDuration" },
    { name: "averageViewPercentage" },
    { name: "subscribersGained" },
    { name: "subscribersLost" },
  ];

  return {
    platform: "youtube",
    snapshotDate: new Date().toISOString(),
    metrics: {
      followers: 84500,
      impressions: dailyRows.reduce((acc, r) => acc + r[1], 0) * 12, // views * 12 impressions
      reach: dailyRows.reduce((acc, r) => acc + r[1], 0) * 8,
      totalEngagement: dailyRows.reduce((acc, r) => acc + r[2] + r[3] + r[4], 0),
    },
    demographics: {
      topCountries: [
        { name: "IN", count: 420000 },
        { name: "US", count: 180000 },
        { name: "GB", count: 75000 },
        { name: "DE", count: 48000 },
        { name: "CA", count: 32000 },
      ],
      ageAndGender: [
        { group: "13-17_male", count: 24000 },
        { group: "13-17_female", count: 18000 },
        { group: "18-24_male", count: 145000 },
        { group: "18-24_female", count: 110000 },
        { group: "25-34_male", count: 280000 },
        { group: "25-34_female", count: 215000 },
        { group: "35-44_male", count: 95000 },
        { group: "35-44_female", count: 72000 },
      ],
    },
    rawPlatformData: {
      channelDetails: {
        snippet: {
          title: "Incubien Tech Academy",
          description: "Learn web engineering, SaaS building, and dashboard architecture from industry experts.",
          thumbnails: {
            medium: { url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60" },
            default: { url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60" },
          },
          customUrl: "@incubientech",
          publishedAt: "2023-04-15T10:00:00Z",
          country: "IN",
        },
        statistics: {
          subscriberCount: "84500",
          viewCount: "3485000",
          videoCount: "128",
          hiddenSubscriberCount: false,
        },
      },
      analyticsReports: {
        daily: {
          columnHeaders: dailyHeaders,
          rows: dailyRows,
        },
        country: {
          columnHeaders: [{ name: "country" }, { name: "views" }],
          rows: [
            ["IN", 420000],
            ["US", 180000],
            ["GB", 75000],
            ["DE", 48000],
            ["CA", 32000],
          ],
        },
        device: {
          columnHeaders: [{ name: "deviceType" }, { name: "views" }, { name: "estimatedMinutesWatched" }],
          rows: [
            ["MOBILE", 240000, 1008000],
            ["DESKTOP", 90000, 378000],
            ["TABLET", 12000, 50400],
            ["TV", 6500, 27300],
          ],
        },
      },
      recentVideos: [
        {
          id: "yt_video_1",
          snippet: {
            title: "How to Build a Dark Mode Glassmorphism Dashboard in React & TailwindCSS",
            description: "Step-by-step masterclass on creating stunning glass layouts with modern styling guidelines.",
            thumbnails: {
              medium: { url: "https://images.unsplash.com/photo-1541462608141-2ff01dd7e408?w=320&auto=format&fit=crop&q=60" },
            },
            publishedAt: datesList[datesList.length - 2],
          },
          contentDetails: { duration: "PT18M45S" },
          statistics: { viewCount: "14500", likeCount: "1240", commentCount: "82" },
          status: { privacyStatus: "public" },
        },
        {
          id: "yt_video_2",
          snippet: {
            title: "Advanced API Interceptors & Mock Adapters Explained",
            description: "Learn how to build a mock server file to intercept requests and toggle easily for staging.",
            thumbnails: {
              medium: { url: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=320&auto=format&fit=crop&q=60" },
            },
            publishedAt: datesList[datesList.length - 7],
          },
          contentDetails: { duration: "PT12M30S" },
          statistics: { viewCount: "9800", likeCount: "850", commentCount: "41" },
          status: { privacyStatus: "public" },
        },
        {
          id: "yt_video_3",
          snippet: {
            title: "Complete OAuth2 Consent Loop Tutorial (Google, Meta, LinkedIn)",
            description: "A secure, robust guide on managing state validation, callback queries, and AES decryption.",
            thumbnails: {
              medium: { url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=320&auto=format&fit=crop&q=60" },
            },
            publishedAt: datesList[datesList.length - 14],
          },
          contentDetails: { duration: "PT25M10S" },
          statistics: { viewCount: "22000", likeCount: "2100", commentCount: "163" },
          status: { privacyStatus: "public" },
        },
      ],
    },
  };
};

// ── LinkedIn Mock Database ──────────────────────────────────────────
const makeLinkedInMock = () => {
  return {
    platform: "linkedin",
    snapshotDate: new Date().toISOString(),
    metrics: {
      followers: 12450,
      searchAppearances: 2450,
      profileViews: 3840,
      clicks: 840,
      impressionsTrend: datesList.map((date, idx) => ({
        day: date,
        value: generateTrendValue(3000, 800, idx),
      })),
      engagementTrend: datesList.map((date, idx) => ({
        day: date,
        value: Number((generateTrendValue(4.5, 1.2, idx, 0.05) / 100).toFixed(4)),
      })),
      growthTrend: datesList.map((date, idx) => ({
        day: date,
        value: 11000 + idx * 40 + Math.round(Math.random() * 10),
      })),
    },
    demographics: {
      jobTitles: [
        { name: "Software Engineer", value: 38 },
        { name: "Founder / CEO", value: 22 },
        { name: "Product Manager", value: 18 },
        { name: "Marketing Specialist", value: 12 },
        { name: "Data Analyst", value: 10 },
      ],
      industries: [
        { name: "Technology & Software", value: 45 },
        { name: "Business Consulting", value: 25 },
        { name: "Financial Services", value: 15 },
        { name: "Education", value: 10 },
        { name: "Other", value: 5 },
      ],
      companySizes: [
        { name: "1-10", value: 15 },
        { name: "11-50", value: 30 },
        { name: "51-200", value: 25 },
        { name: "201-500", value: 12 },
        { name: "501-1000", value: 8 },
        { name: "1000+", value: 10 },
      ],
    },
    rawPlatformData: {
      followers: 12450,
      searchAppearances: 2450,
      profileViews: 3840,
      clicks: 840,
    },
    content: {
      posts: [
        {
          title: "Stunning analytics mock adapters are a game changer. Say goodbye to static hardcoded metrics!",
          impressions: 4800,
          clicks: 340,
          ctr: 7.08,
          reactions: 240,
          comments: 32,
          date: datesList[datesList.length - 1],
        },
        {
          title: "We are officially launching the new social dashboard beta. Check the link in the profile to join the waitlist.",
          impressions: 9200,
          clicks: 870,
          ctr: 9.45,
          reactions: 580,
          comments: 63,
          date: datesList[datesList.length - 3],
        },
        {
          title: "Why security is crucial when dealing with platform APIs. A look at OAuth2 security and state validation.",
          impressions: 3100,
          clicks: 190,
          ctr: 6.13,
          reactions: 145,
          comments: 14,
          date: datesList[datesList.length - 6],
        },
      ],
      articles: [
        {
          title: "The Ultimate Guide to Unified Social Analytics Architecture",
          impressions: 1240,
          clicks: 148,
          ctr: 11.9,
          reactions: 95,
          comments: 18,
          date: datesList[datesList.length - 10],
        },
      ],
      documents: [
        {
          title: "Incubien APSM Product Specification Sheet.pdf",
          impressions: 650,
          clicks: 120,
          ctr: 18.4,
          reactions: 42,
          comments: 5,
          date: datesList[datesList.length - 8],
        },
      ],
    },
  };
};

// ── Export Mock Database Generator ──────────────────────────────────
// Functions generate fresh objects to prevent cross-test/reference mutation
export const mockDatabase = {
  get meta() {
    return [makeFacebookMock(), makeInstagramMock()];
  },
  get youtube() {
    return makeYouTubeMock();
  },
  get linkedin() {
    return makeLinkedInMock();
  },
};

export const instagramMockData = {
  profile: { 
    name: "Ritika Sharma", 
    handle: "@ritika.sharma", 
    category: "Lifestyle Creator • India",
    totalFollowers: 12400, 
    totalFollowing: 320,
    profilePicture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
    bio: "Building a mindful life 🌿\nFounder @wellness.co\nBased in Mumbai 🇮🇳"
  },
  // ── Additional KPI data points ──────────────────────────────────────
  profileViews: { current: 8420, previous: 7100 },
  saves: { current: 4200, previous: 3800 },
  totalPosts: 248,
  kpis: {
    accountsReached: { current: 45200, previous: 38000 },
    accountsEngaged: { current: 18400, previous: 15200 },
    totalFollowers: { current: 12400, previous: 11900 },
    contentInteractions: { current: 24500, previous: 21000 }
  },
  audience: {
    topCities: [
      { name: "Mumbai", value: 35 },
      { name: "Delhi", value: 20 },
      { name: "Bangalore", value: 15 },
      { name: "Pune", value: 10 },
      { name: "Dubai", value: 8 }
    ],
    topCountries: [
      { name: "India", value: 68.3 },
      { name: "United States", value: 11.2 },
      { name: "UAE", value: 8.5 },
      { name: "United Kingdom", value: 4.1 },
      { name: "Canada", value: 3.7 }
    ],
    ageRange: [
      { age: "13-17", value: 5 },
      { age: "18-24", value: 35 },
      { age: "25-34", value: 45 },
      { age: "35-44", value: 10 },
      { age: "45-54", value: 5 }
    ],
    gender: [
      { type: "Women", value: 68 },
      { type: "Men", value: 32 }
    ]
  },
  reachTrend: [
    { date: "Oct 1", reach: 2400, impressions: 3100 },
    { date: "Oct 2", reach: 2800, impressions: 3800 },
    { date: "Oct 3", reach: 2600, impressions: 3500 },
    { date: "Oct 4", reach: 4200, impressions: 5800 },
    { date: "Oct 5", reach: 3800, impressions: 4900 },
    { date: "Oct 6", reach: 4500, impressions: 6200 },
    { date: "Oct 7", reach: 5100, impressions: 7100 }
  ],
  // ── Follower Growth (7-day daily breakdown) ─────────────────────────
  followerGrowth: [
    { date: "Oct 1", gained: 45, lost: 8 },
    { date: "Oct 2", gained: 38, lost: 12 },
    { date: "Oct 3", gained: 52, lost: 5 },
    { date: "Oct 4", gained: 71, lost: 9 },
    { date: "Oct 5", gained: 63, lost: 14 },
    { date: "Oct 6", gained: 48, lost: 7 },
    { date: "Oct 7", gained: 82, lost: 11 }
  ],
  // ── Engagement Rate Trend (7-day) ───────────────────────────────────
  engagementTrend: [
    { date: "Oct 1", rate: 3.2 },
    { date: "Oct 2", rate: 2.8 },
    { date: "Oct 3", rate: 3.5 },
    { date: "Oct 4", rate: 4.1 },
    { date: "Oct 5", rate: 3.8 },
    { date: "Oct 6", rate: 4.5 },
    { date: "Oct 7", rate: 4.2 }
  ],
  contentPerformance: [
    {
      id: "post_1",
      type: "Reel",
      caption: "Morning routine for productivity ✨",
      thumbnail: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=100&h=100&fit=crop",
      reach: 15400,
      likes: 2100,
      comments: 184,
      shares: 342,
      saves: 156
    },
    {
      id: "post_2",
      type: "Carousel",
      caption: "10 mindful habits to start today",
      thumbnail: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      reach: 12800,
      likes: 1800,
      comments: 145,
      shares: 120,
      saves: 450
    },
    {
      id: "post_3",
      type: "Image",
      caption: "Golden hour in Mumbai 🌅",
      thumbnail: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop",
      reach: 9500,
      likes: 1200,
      comments: 98,
      shares: 45,
      saves: 89
    }
  ],
  // ── Top Reels (for Row 4 table) ─────────────────────────────────────
  topReels: [
    {
      id: "reel_1",
      title: "Quick Tutorial: OAuth setup!",
      thumbnail: "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=80&h=80&fit=crop",
      plays: 12500,
      likes: 1240,
      comments: 53
    },
    {
      id: "reel_2",
      title: "5 Tips for SaaS Dashboards",
      thumbnail: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=80&h=80&fit=crop",
      plays: 8400,
      likes: 850,
      comments: 42
    },
    {
      id: "reel_3",
      title: "Wellness morning routine 🧘",
      thumbnail: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=80&h=80&fit=crop",
      plays: 6200,
      likes: 620,
      comments: 28
    }
  ],
  interactionsByType: [
    { name: "Likes", value: 18400 },
    { name: "Comments", value: 3400 },
    { name: "Shares", value: 2100 },
    { name: "Saves", value: 1800 }
  ],
  recentActivity: [
    { id: 1, action: "New Follower", details: "@sarah.design started following you", time: "2h ago" },
    { id: 2, action: "Comment", details: "@tech.bro left a comment on your reel", time: "3h ago" },
    { id: 3, action: "Mention", details: "@wellness.co mentioned you in a story", time: "5h ago" },
    { id: 4, action: "Milestone", details: "You reached 12,000 followers!", time: "1d ago" }
  ]
};

