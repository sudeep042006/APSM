export const mockFacebookData = {
  profile: {
    name: "Ritika Sharma",
    handle: "@ritika.sharma",
    category: "Public Figure · India",
    stats: {
      pageLikes: "25.4K",
      followers: "26.7K",
      reach: "1.2M",
      posts: "320",
    }
  },
  kpis: [
    { label: "Page Likes", value: "25.4K", change: 2.6, changeLabel: "vs previous 7 days" },
    { label: "Post Reach", value: "1.2M", change: 15.7, changeLabel: "vs previous 7 days" },
    { label: "Post Engagements", value: "78.3K", change: 12.8, changeLabel: "vs previous 7 days" },
    { label: "Reactions", value: "45.6K", change: 10.3, changeLabel: "vs previous 7 days" },
    { label: "Comments", value: "4.2K", change: 9.3, changeLabel: "vs previous 7 days" },
    { label: "Shares", value: "3.8K", change: 8.6, changeLabel: "vs previous 7 days" }
  ],
  charts: {
    reachOverTime: [
      { date: "Jun 11", value: 40000 },
      { date: "Jun 12", value: 120000 },
      { date: "Jun 13", value: 180000 },
      { date: "Jun 14", value: 130000 },
      { date: "Jun 15", value: 160000 },
      { date: "Jun 16", value: 90000 },
      { date: "Jun 17", value: 50000 },
    ],
    engagementsOverTime: [
      { date: "Jun 11", value: 8000 },
      { date: "Jun 12", value: 9500 },
      { date: "Jun 13", value: 10500 },
      { date: "Jun 14", value: 11000 },
      { date: "Jun 15", value: 12000 },
      { date: "Jun 16", value: 14000 },
      { date: "Jun 17", value: 17000 },
    ],
    engagementRate: {
      rate: "6.54%",
      change: 12.4,
      data: [
        { date: "Jun 11", rate: 5.8 },
        { date: "Jun 12", rate: 6.0 },
        { date: "Jun 13", rate: 6.5 },
        { date: "Jun 14", rate: 6.2 },
        { date: "Jun 15", rate: 6.8 },
        { date: "Jun 16", rate: 6.4 },
        { date: "Jun 17", rate: 6.54 },
      ]
    },
    reachBySource: [
      { name: "Organic", value: 68.2 },
      { name: "Paid", value: 23.6 },
      { name: "Viral", value: 5.7 },
      { name: "Other", value: 2.5 }
    ],
    audience: {
      ageGender: [
        { group: "Women", value: 64.2 },
        { group: "Men", value: 35.1 },
        { group: "Other", value: 0.7 }
      ],
      topCountries: [
        { country: "India", value: 72.4 },
        { country: "United States", value: 8.6 },
        { country: "Brazil", value: 4.3 },
        { country: "United Kingdom", value: 3.1 },
        { country: "Canada", value: 2.8 }
      ]
    }
  },
  tables: {
    topPosts: [
      { title: "Amazing sunset at the beach 🌅", date: "Jun 15, 2026 • 08:30 PM", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=100&h=100&fit=crop", reach: "128.7K", engagements: "8.2K", reactions: "5.3K", comments: "512", shares: "342" },
      { title: "Consistency is the key to success 💪", date: "Jun 13, 2026 • 06:15 PM", image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=100&h=100&fit=crop", reach: "95.4K", engagements: "6.1K", reactions: "3.8K", comments: "420", shares: "289" },
      { title: "Behind the scenes of today's shoot 📸", date: "Jun 12, 2026 • 04:45 PM", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=100&h=100&fit=crop", reach: "82.6K", engagements: "4.7K", reactions: "3.1K", comments: "310", shares: "198" }
    ],
    topVideos: [
      { title: "Travel vlog: Goa Diaries", duration: "01:24", date: "Jun 14, 2026", image: "https://images.unsplash.com/photo-1506461883276-594c410bf259?w=100&h=100&fit=crop", views: "73.5K", engagements: "5.2K", watchTime: "2.1K hrs" },
      { title: "Morning Motivation", duration: "00:58", date: "Jun 11, 2026", image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=100&h=100&fit=crop", views: "62.8K", engagements: "4.1K", watchTime: "1.6K hrs" },
      { title: "Healthy salad recipe 🥗", duration: "01:07", date: "Jun 10, 2026", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=100&h=100&fit=crop", views: "48.3K", engagements: "3.2K", watchTime: "980 hrs" }
    ]
  },
  extended: {
    audienceDetails: {
      ageAndGender: [
        { group: "13-17", male: 2.1, female: 5.3 },
        { group: "18-24", male: 15.4, female: 25.1 },
        { group: "25-34", male: 12.3, female: 18.7 },
        { group: "35-44", male: 8.5, female: 12.2 },
        { group: "45-54", male: 4.2, female: 6.8 },
        { group: "55+", male: 2.1, female: 3.4 },
      ],
      topLocations: [
        { location: "Mumbai, India", value: 35.2 },
        { location: "Delhi, India", value: 22.4 },
        { location: "Bangalore, India", value: 18.5 },
        { location: "New York, USA", value: 8.6 },
        { location: "London, UK", value: 5.3 },
      ]
    },
    engagementDetails: {
      kpis: { totalLikes: "142.5K", totalComments: "12.3K", totalShares: "8.9K" },
      engagementTrend: [
        { date: "Jun 11", total: 18000 },
        { date: "Jun 12", total: 22500 },
        { date: "Jun 13", total: 25500 },
        { date: "Jun 14", total: 21000 },
        { date: "Jun 15", total: 32000 },
        { date: "Jun 16", total: 28000 },
        { date: "Jun 17", total: 35000 },
      ],
      reactionTypes: [
        { name: "Like", value: 45000 },
        { name: "Love", value: 25000 },
        { name: "Haha", value: 12000 },
        { name: "Wow", value: 8000 },
        { name: "Sad", value: 1200 },
        { name: "Angry", value: 400 },
      ]
    },
    contentData: {
      posts: [
        { title: "Amazing sunset at the beach 🌅", date: "Jun 15, 2026", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=100&h=100&fit=crop", reach: "128.7K", impressions: "145.2K", likes: "5.3K", comments: "512", rate: "4.1%" },
        { title: "Consistency is the key to success 💪", date: "Jun 13, 2026", image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=100&h=100&fit=crop", reach: "95.4K", impressions: "110.1K", likes: "3.8K", comments: "420", rate: "3.9%" },
        { title: "Behind the scenes of today's shoot 📸", date: "Jun 12, 2026", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=100&h=100&fit=crop", reach: "82.6K", impressions: "95.3K", likes: "3.1K", comments: "310", rate: "3.7%" },
        { title: "Loving the new studio setup!", date: "Jun 11, 2026", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=100&h=100&fit=crop", reach: "75.2K", impressions: "85.4K", likes: "2.8K", comments: "280", rate: "3.7%" },
        { title: "Quick coffee break ☕", date: "Jun 10, 2026", image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=100&h=100&fit=crop", reach: "68.9K", impressions: "78.2K", likes: "2.4K", comments: "195", rate: "3.4%" },
        { title: "Weekend getaway vibes", date: "Jun 09, 2026", image: "https://images.unsplash.com/photo-1504280649479-7a09da418e24?w=100&h=100&fit=crop", reach: "110.5K", impressions: "125.6K", likes: "4.8K", comments: "450", rate: "4.3%" },
        { title: "Throwback to last summer", date: "Jun 08, 2026", image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=100&h=100&fit=crop", reach: "92.1K", impressions: "105.3K", likes: "3.5K", comments: "320", rate: "3.8%" },
        { title: "Reading a good book today 📖", date: "Jun 07, 2026", image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=100&h=100&fit=crop", reach: "55.4K", impressions: "62.1K", likes: "1.9K", comments: "150", rate: "3.4%" },
        { title: "Morning walk in the park", date: "Jun 06, 2026", image: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=100&h=100&fit=crop", reach: "78.6K", impressions: "89.4K", likes: "2.9K", comments: "260", rate: "3.6%" },
        { title: "Trying out a new recipe! 🍝", date: "Jun 05, 2026", image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=100&h=100&fit=crop", reach: "85.3K", impressions: "96.5K", likes: "3.2K", comments: "380", rate: "3.7%" }
      ],
      videos: [
        { title: "Travel vlog: Goa Diaries", date: "Jun 14, 2026", image: "https://images.unsplash.com/photo-1506461883276-594c410bf259?w=100&h=100&fit=crop", plays: "85.2K", watchTime: "01:24", likes: "4.1K", comments: "320", rate: "5.5%" },
        { title: "Morning Motivation", date: "Jun 11, 2026", image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=100&h=100&fit=crop", plays: "71.4K", watchTime: "00:58", likes: "3.5K", comments: "280", rate: "5.5%" },
        { title: "Healthy salad recipe 🥗", date: "Jun 10, 2026", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=100&h=100&fit=crop", plays: "55.1K", watchTime: "01:07", likes: "2.8K", comments: "210", rate: "5.7%" },
        { title: "My workout routine", date: "Jun 08, 2026", image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=100&h=100&fit=crop", plays: "98.5K", watchTime: "03:15", likes: "5.2K", comments: "450", rate: "6.1%" },
        { title: "Studio tour 2026", date: "Jun 06, 2026", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=100&h=100&fit=crop", plays: "112.3K", watchTime: "05:40", likes: "6.1K", comments: "520", rate: "6.3%" },
        { title: "Q&A Session", date: "Jun 04, 2026", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=100&h=100&fit=crop", plays: "62.4K", watchTime: "02:20", likes: "2.9K", comments: "380", rate: "5.2%" },
        { title: "Cooking challenge with friends", date: "Jun 02, 2026", image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=100&h=100&fit=crop", plays: "128.6K", watchTime: "08:12", likes: "7.5K", comments: "850", rate: "6.7%" },
        { title: "Unboxing new gear", date: "May 30, 2026", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop", plays: "79.2K", watchTime: "04:15", likes: "3.8K", comments: "310", rate: "5.5%" },
        { title: "Weekend hiking trip", date: "May 28, 2026", image: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=100&h=100&fit=crop", plays: "95.1K", watchTime: "06:30", likes: "4.6K", comments: "410", rate: "5.5%" },
        { title: "A day in my life", date: "May 25, 2026", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop", plays: "168.5K", watchTime: "12:45", likes: "9.2K", comments: "1.2K", rate: "6.3%" }
      ],
      stories: [
        { title: "Event Highlights", date: "Jun 16, 2026", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=100&h=100&fit=crop", reach: "20.1K", tapForwards: "1.2K", tapBacks: "450", exits: "120", replies: "45" },
        { title: "New Video Out Now", date: "Jun 15, 2026", image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=100&h=100&fit=crop", reach: "18.5K", tapForwards: "1.1K", tapBacks: "380", exits: "95", replies: "30" },
        { title: "Quick update", date: "Jun 15, 2026", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=100&h=100&fit=crop", reach: "22.4K", tapForwards: "1.5K", tapBacks: "520", exits: "150", replies: "55" },
        { title: "Lunch with the team", date: "Jun 14, 2026", image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=100&h=100&fit=crop", reach: "19.2K", tapForwards: "1.3K", tapBacks: "410", exits: "110", replies: "40" },
        { title: "Studio sneak peek", date: "Jun 13, 2026", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=100&h=100&fit=crop", reach: "25.6K", tapForwards: "1.8K", tapBacks: "610", exits: "180", replies: "85" },
        { title: "Coffee time", date: "Jun 13, 2026", image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=100&h=100&fit=crop", reach: "16.8K", tapForwards: "950", tapBacks: "320", exits: "85", replies: "20" },
        { title: "Sunset view", date: "Jun 12, 2026", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=100&h=100&fit=crop", reach: "28.5K", tapForwards: "2.1K", tapBacks: "750", exits: "210", replies: "110" },
        { title: "Good morning!", date: "Jun 11, 2026", image: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=100&h=100&fit=crop", reach: "21.4K", tapForwards: "1.4K", tapBacks: "480", exits: "135", replies: "45" },
        { title: "Working on something new", date: "Jun 10, 2026", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=100&h=100&fit=crop", reach: "30.2K", tapForwards: "2.4K", tapBacks: "820", exits: "240", replies: "140" },
        { title: "Weekend plans?", date: "Jun 09, 2026", image: "https://images.unsplash.com/photo-1504280649479-7a09da418e24?w=100&h=100&fit=crop", reach: "24.1K", tapForwards: "1.7K", tapBacks: "590", exits: "165", replies: "65" }
      ]
    },
    growth: {
      gained: "850",
      lost: "95",
      net: "+755",
      followerGrowthTimeline: [
        { date: "Jun 11", gained: 110, lost: 15 },
        { date: "Jun 12", gained: 150, lost: 12 },
        { date: "Jun 13", gained: 130, lost: 18 },
        { date: "Jun 14", gained: 190, lost: 20 },
        { date: "Jun 15", gained: 210, lost: 10 },
        { date: "Jun 16", gained: 250, lost: 25 },
        { date: "Jun 17", gained: 180, lost: 15 }
      ]
    },
    hashtags: [
      { tag: "#facebookgaming", uses: 52, reach: "145K", percentage: 40 },
      { tag: "#live", uses: 41, reach: "110K", percentage: 30 },
      { tag: "#community", uses: 35, reach: "85K", percentage: 15 },
      { tag: "#update", uses: 28, reach: "45K", percentage: 10 },
      { tag: "#news", uses: 12, reach: "25K", percentage: 5 }
    ],
    utilityData: {
      recentExports: [
        { report: "Page Analytics (Weekly)", date: "Jun 14, 2026", type: "PDF", status: "Completed" },
        { report: "Group Member Insights", date: "May 28, 2026", type: "CSV", status: "Completed" },
        { report: "Ad Spend vs ROI", date: "May 10, 2026", type: "PDF", status: "Completed" }
      ]
    },
    reachAndViews: [
      { date: "Jun 11", organicReach: 15000, paidReach: 5000, threeSecondViews: 12000, oneMinuteViews: 4500 },
      { date: "Jun 12", organicReach: 18000, paidReach: 12000, threeSecondViews: 15000, oneMinuteViews: 6000 },
      { date: "Jun 13", organicReach: 22000, paidReach: 8000, threeSecondViews: 18000, oneMinuteViews: 7200 },
      { date: "Jun 14", organicReach: 19000, paidReach: 15000, threeSecondViews: 21000, oneMinuteViews: 8500 },
      { date: "Jun 15", organicReach: 25000, paidReach: 20000, threeSecondViews: 26000, oneMinuteViews: 11000 },
      { date: "Jun 16", organicReach: 28000, paidReach: 18000, threeSecondViews: 30000, oneMinuteViews: 13500 },
      { date: "Jun 17", organicReach: 32000, paidReach: 25000, threeSecondViews: 35000, oneMinuteViews: 16000 }
    ],
    groups: [
      { date: "Jun 11", totalMembers: 12000, activeMembers: 4500, postsPublished: 120 },
      { date: "Jun 12", totalMembers: 12150, activeMembers: 4700, postsPublished: 145 },
      { date: "Jun 13", totalMembers: 12280, activeMembers: 4900, postsPublished: 130 },
      { date: "Jun 14", totalMembers: 12350, activeMembers: 4600, postsPublished: 110 },
      { date: "Jun 15", totalMembers: 12490, activeMembers: 5200, postsPublished: 160 },
      { date: "Jun 16", totalMembers: 12580, activeMembers: 5500, postsPublished: 175 },
      { date: "Jun 17", totalMembers: 12700, activeMembers: 5800, postsPublished: 190 }
    ],
    ads: {
      spend: "$450.00",
      reach: "85K",
      clicks: "3.2K",
      campaigns: [
        { campaignName: "Summer Sale 2026 - Conversion", status: "Active", spend: "$150.00", impressions: "45K", clicks: "1.2K", ctr: "2.6%", cpc: "$0.12" },
        { campaignName: "Brand Awareness - Video Views", status: "Active", spend: "$210.00", impressions: "85K", clicks: "850", ctr: "1.0%", cpc: "$0.24" },
        { campaignName: "Retargeting - Cart Abandoners", status: "Paused", spend: "$90.00", impressions: "12K", clicks: "450", ctr: "3.7%", cpc: "$0.20" },
        { campaignName: "Lead Gen - Ebook Download", status: "Active", spend: "$120.00", impressions: "32K", clicks: "920", ctr: "2.8%", cpc: "$0.13" },
        { campaignName: "App Installs - iOS Users", status: "Completed", spend: "$300.00", impressions: "110K", clicks: "2.1K", ctr: "1.9%", cpc: "$0.14" }
      ]
    },
    insights: {
      bestTimeToPost: "Wednesdays at 6 PM",
      topPerformingFormat: "Reels",
      topAudienceSegment: "Women, 18-24 (Mumbai)",
      recommendedContentType: "Behind-the-Scenes Videos"
    }
  }
};

export const mockInstagramData = {
  profile: {
    name: "Ritika Sharma",
    handle: "@ritika.sharma",
    category: "Lifestyle Creator · India",
    stats: {
      followers: "12.4K",
      following: "320",
      posts: "248",
    }
  },
  kpis: [
    { label: "Followers", value: "12.4K", change: 2.4, changeLabel: "vs previous 7 days" },
    { label: "Profile Views", value: "18.7K", change: 8.7, changeLabel: "vs previous 7 days" },
    { label: "Reach", value: "85.3K", change: 12.5, changeLabel: "vs previous 7 days" },
    { label: "Engagement", value: "5.2K", change: 15.3, changeLabel: "vs previous 7 days" },
    { label: "Impressions", value: "112K", change: 10.1, changeLabel: "vs previous 7 days" },
    { label: "Saves", value: "1.6K", change: 6.3, changeLabel: "vs previous 7 days" }
  ],
  charts: {
    reachOverTime: [
      { date: "Jun 11", value: 1000 },
      { date: "Jun 12", value: 20000 },
      { date: "Jun 13", value: 31000 },
      { date: "Jun 14", value: 19000 },
      { date: "Jun 15", value: 25000 },
      { date: "Jun 16", value: 12000 },
      { date: "Jun 17", value: 5000 },
    ],
    followerGrowth: [
      { date: "Jun 11", value: 200 },
      { date: "Jun 12", value: 250 },
      { date: "Jun 13", value: 320 },
      { date: "Jun 14", value: 340 },
      { date: "Jun 15", value: 360 },
      { date: "Jun 16", value: 450 },
      { date: "Jun 17", value: 520 },
    ],
    engagementRate: {
      rate: "4.6%",
      change: 15.3,
      data: [
        { date: "Jun 11", rate: 1.2 },
        { date: "Jun 12", rate: 3.5 },
        { date: "Jun 13", rate: 5.2 },
        { date: "Jun 14", rate: 3.8 },
        { date: "Jun 15", rate: 4.5 },
        { date: "Jun 16", rate: 4.8 },
        { date: "Jun 17", rate: 4.6 },
      ]
    },
    gender: [
      { name: "Women", value: 68.2 },
      { name: "Men", value: 31.8 }
    ],
    topCountries: [
      { country: "India", value: 68.3 },
      { country: "United States", value: 11.2 },
      { country: "Brazil", value: 4.8 },
      { country: "United Kingdom", value: 3.7 },
      { country: "Canada", value: 2.9 }
    ]
  },
  tables: {
    topPosts: [
      { title: "Sunset vibes 🌅", type: "Image", date: "Jun 14, 2026", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=100&h=100&fit=crop", reach: "24.7K", likes: "2.1K", comments: "156", saves: "342", engagement: "10.6%" },
      { title: "Morning routine ☀️", type: "Video", date: "Jun 12, 2026", image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=100&h=100&fit=crop", reach: "18.3K", likes: "1.6K", comments: "98", saves: "210", engagement: "9.8%" },
      { title: "New look ✨", type: "Image", date: "Jun 10, 2026", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=100&h=100&fit=crop", reach: "16.1K", likes: "1.2K", comments: "87", saves: "185", engagement: "8.9%" }
    ],
    topReels: [
      { title: "Travel diary ✈️", date: "Jun 15, 2026", image: "https://images.unsplash.com/photo-1506461883276-594c410bf259?w=100&h=100&fit=crop", plays: "32.5K", likes: "2.8K", comments: "210" },
      { title: "Dance trends 💃", date: "Jun 13, 2026", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=100&h=100&fit=crop", plays: "28.7K", likes: "2.3K", comments: "178" },
      { title: "Outfit check 👗", date: "Jun 11, 2026", image: "https://images.unsplash.com/photo-1515347619362-e64e97669d25?w=100&h=100&fit=crop", plays: "21.4K", likes: "1.7K", comments: "132" }
    ]
  },
  extended: {
    audienceDetails: {
      ageAndGender: [
        { group: "13-17", male: 1.5, female: 4.2 },
        { group: "18-24", male: 12.1, female: 32.5 },
        { group: "25-34", male: 10.5, female: 20.1 },
        { group: "35-44", male: 5.2, female: 8.4 },
        { group: "45-54", male: 1.8, female: 2.2 },
        { group: "55+", male: 0.7, female: 0.8 },
      ],
      topLocations: [
        { location: "Mumbai, India", value: 38.5 },
        { location: "Delhi, India", value: 24.1 },
        { location: "Bangalore, India", value: 15.2 },
        { location: "Pune, India", value: 8.4 },
        { location: "Chennai, India", value: 5.1 },
      ]
    },
    engagementDetails: {
      kpis: { totalLikes: "125.4K", totalComments: "15.2K", totalSaves: "24.1K" },
      engagementTrend: [
        { date: "Jun 11", total: 12000 },
        { date: "Jun 12", total: 15000 },
        { date: "Jun 13", total: 18500 },
        { date: "Jun 14", total: 14000 },
        { date: "Jun 15", total: 22000 },
        { date: "Jun 16", total: 19500 },
        { date: "Jun 17", total: 25000 },
      ],
      reactionTypes: [
        { name: "Likes", value: 125400 },
        { name: "Comments", value: 15200 },
        { name: "Saves", value: 24100 },
        { name: "Shares", value: 18500 },
      ]
    },
    contentData: {
      posts: [
        { title: "Sunset vibes 🌅", type: "Image", date: "Jun 14, 2026", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=100&h=100&fit=crop", reach: "24.7K", impressions: "28.5K", likes: "2.1K", comments: "156", saves: "342", rate: "10.6%" },
        { title: "New look ✨", type: "Image", date: "Jun 10, 2026", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=100&h=100&fit=crop", reach: "16.1K", impressions: "18.4K", likes: "1.2K", comments: "87", saves: "185", rate: "8.9%" },
        { title: "Weekend brunching", type: "Image", date: "Jun 08, 2026", image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=100&h=100&fit=crop", reach: "19.5K", impressions: "22.1K", likes: "1.8K", comments: "112", saves: "240", rate: "9.2%" },
        { title: "OOTD 👗", type: "Image", date: "Jun 06, 2026", image: "https://images.unsplash.com/photo-1515347619362-e64e97669d25?w=100&h=100&fit=crop", reach: "32.1K", impressions: "36.5K", likes: "3.5K", comments: "280", saves: "510", rate: "11.2%" },
        { title: "Relaxing at home", type: "Image", date: "Jun 04, 2026", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop", reach: "14.2K", impressions: "16.1K", likes: "1.1K", comments: "65", saves: "120", rate: "7.7%" },
        { title: "Coffee date ☕", type: "Image", date: "Jun 02, 2026", image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=100&h=100&fit=crop", reach: "18.4K", impressions: "20.8K", likes: "1.6K", comments: "95", saves: "180", rate: "8.6%" },
        { title: "Nature walks 🍃", type: "Image", date: "May 31, 2026", image: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=100&h=100&fit=crop", reach: "22.5K", impressions: "25.2K", likes: "2.4K", comments: "140", saves: "280", rate: "10.6%" },
        { title: "Fresh manicure 💅", type: "Image", date: "May 28, 2026", image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=100&h=100&fit=crop", reach: "15.8K", impressions: "17.9K", likes: "1.3K", comments: "85", saves: "140", rate: "8.2%" },
        { title: "City lights 🌃", type: "Image", date: "May 25, 2026", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop", reach: "26.7K", impressions: "30.1K", likes: "2.8K", comments: "190", saves: "420", rate: "10.4%" },
        { title: "Book recommendations 📚", type: "Image", date: "May 22, 2026", image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=100&h=100&fit=crop", reach: "21.2K", impressions: "24.5K", likes: "2.1K", comments: "165", saves: "380", rate: "9.9%" }
      ],
      reels: [
        { title: "Travel diary ✈️", date: "Jun 15, 2026", image: "https://images.unsplash.com/photo-1506461883276-594c410bf259?w=100&h=100&fit=crop", plays: "38.5K", watchTime: "00:45", likes: "2.8K", comments: "210", saves: "450", rate: "8.5%" },
        { title: "Dance trends 💃", date: "Jun 13, 2026", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=100&h=100&fit=crop", plays: "32.4K", watchTime: "00:30", likes: "2.3K", comments: "178", saves: "320", rate: "7.6%" },
        { title: "Outfit check 👗", date: "Jun 11, 2026", image: "https://images.unsplash.com/photo-1515347619362-e64e97669d25?w=100&h=100&fit=crop", plays: "26.8K", watchTime: "00:25", likes: "1.7K", comments: "132", saves: "210", rate: "6.9%" },
        { title: "Morning routine ☀️", date: "Jun 12, 2026", image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=100&h=100&fit=crop", plays: "20.1K", watchTime: "00:55", likes: "1.6K", comments: "98", saves: "210", rate: "9.8%" },
        { title: "Get ready with me", date: "Jun 09, 2026", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop", plays: "48.5K", watchTime: "01:12", likes: "3.5K", comments: "280", saves: "620", rate: "7.7%" },
        { title: "Skincare secrets", date: "Jun 07, 2026", image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=100&h=100&fit=crop", plays: "30.5K", watchTime: "00:48", likes: "2.1K", comments: "145", saves: "380", rate: "7.3%" },
        { title: "Behind the scenes vlog", date: "Jun 05, 2026", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=100&h=100&fit=crop", plays: "24.2K", watchTime: "02:15", likes: "1.5K", comments: "110", saves: "190", rate: "6.7%" },
        { title: "My favorite cafes", date: "Jun 03, 2026", image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=100&h=100&fit=crop", plays: "42.1K", watchTime: "01:05", likes: "3.1K", comments: "240", saves: "540", rate: "8.0%" },
        { title: "Quick workout", date: "Jun 01, 2026", image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=100&h=100&fit=crop", plays: "34.5K", watchTime: "00:40", likes: "2.6K", comments: "185", saves: "310", rate: "8.3%" },
        { title: "Packing for a trip", date: "May 29, 2026", image: "https://images.unsplash.com/photo-1506461883276-594c410bf259?w=100&h=100&fit=crop", plays: "28.1K", watchTime: "00:35", likes: "1.9K", comments: "150", saves: "280", rate: "7.3%" }
      ],
      stories: [
        { title: "Q&A Session", date: "Jun 16, 2026", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=100&h=100&fit=crop", reach: "12.5K", tapForwards: "1.4K", tapBacks: "220", exits: "180", replies: "45" },
        { title: "Behind the Scenes", date: "Jun 15, 2026", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=100&h=100&fit=crop", reach: "15.2K", tapForwards: "2.1K", tapBacks: "310", exits: "120", replies: "62" },
        { title: "Morning coffee", date: "Jun 14, 2026", image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=100&h=100&fit=crop", reach: "10.8K", tapForwards: "980", tapBacks: "140", exits: "85", replies: "20" },
        { title: "OOTD check", date: "Jun 13, 2026", image: "https://images.unsplash.com/photo-1515347619362-e64e97669d25?w=100&h=100&fit=crop", reach: "18.4K", tapForwards: "2.5K", tapBacks: "420", exits: "210", replies: "85" },
        { title: "Gym time", date: "Jun 12, 2026", image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=100&h=100&fit=crop", reach: "11.5K", tapForwards: "1.1K", tapBacks: "195", exits: "90", replies: "30" },
        { title: "Lunch date", date: "Jun 11, 2026", image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=100&h=100&fit=crop", reach: "14.2K", tapForwards: "1.8K", tapBacks: "280", exits: "115", replies: "40" },
        { title: "Shopping haul", date: "Jun 10, 2026", image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=100&h=100&fit=crop", reach: "22.1K", tapForwards: "3.2K", tapBacks: "550", exits: "280", replies: "120" },
        { title: "Sunset view", date: "Jun 09, 2026", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=100&h=100&fit=crop", reach: "19.5K", tapForwards: "2.8K", tapBacks: "480", exits: "240", replies: "90" },
        { title: "New recipe test", date: "Jun 08, 2026", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=100&h=100&fit=crop", reach: "13.8K", tapForwards: "1.6K", tapBacks: "260", exits: "130", replies: "55" },
        { title: "Goodnight!", date: "Jun 07, 2026", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop", reach: "9.5K", tapForwards: "850", tapBacks: "150", exits: "65", replies: "15" }
      ]
    },
    growth: {
      gained: "1.2K",
      lost: "150",
      net: "+1.05K",
      followerGrowthTimeline: [
        { date: "Jun 11", gained: 150, lost: 20 },
        { date: "Jun 12", gained: 200, lost: 30 },
        { date: "Jun 13", gained: 180, lost: 45 },
        { date: "Jun 14", gained: 320, lost: 25 },
        { date: "Jun 15", gained: 280, lost: 15 },
        { date: "Jun 16", gained: 410, lost: 50 },
        { date: "Jun 17", gained: 380, lost: 35 }
      ]
    },
    hashtags: [
      { tag: "#lifestyle", uses: 45, reach: "120K", percentage: 35 },
      { tag: "#vlog", uses: 32, reach: "90K", percentage: 25 },
      { tag: "#travel", uses: 28, reach: "75K", percentage: 20 },
      { tag: "#fashion", uses: 22, reach: "45K", percentage: 12 },
      { tag: "#daily", uses: 15, reach: "30K", percentage: 8 }
    ],
    utilityData: {
      recentExports: [
        { report: "Monthly Analytics Overview", date: "Jun 01, 2026", type: "PDF", status: "Completed" },
        { report: "Audience Demographics Q2", date: "May 15, 2026", type: "CSV", status: "Completed" },
        { report: "Campaign Performance (Summer)", date: "May 05, 2026", type: "PDF", status: "Completed" },
        { report: "Content Engagement Breakdown", date: "Apr 30, 2026", type: "CSV", status: "Completed" }
      ]
    },
    ads: {
      spend: "$850.00",
      reach: "120K",
      clicks: "4.5K",
      campaigns: [
        { campaignName: "IG Reels - Summer Collection", status: "Active", spend: "$350.00", impressions: "65K", clicks: "2.1K", ctr: "3.2%", cpc: "$0.16" },
        { campaignName: "Story Ads - Flash Sale", status: "Active", spend: "$150.00", impressions: "25K", clicks: "900", ctr: "3.6%", cpc: "$0.17" },
        { campaignName: "Profile Visit - Brand Awareness", status: "Paused", spend: "$100.00", impressions: "18K", clicks: "350", ctr: "1.9%", cpc: "$0.28" },
        { campaignName: "Carousel - New Arrivals", status: "Completed", spend: "$250.00", impressions: "45K", clicks: "1.5K", ctr: "3.3%", cpc: "$0.16" }
      ]
    },
    insights: {
      bestTimeToPost: "Fridays at 7 PM",
      topPerformingFormat: "Carousel Posts",
      topAudienceSegment: "Women, 18-24 (New Delhi)",
      recommendedContentType: "Lifestyle Vlogs"
    }
  }
};
