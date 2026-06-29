// ── Meta Mock Data Engine ────────────────────────────────────────────
// Provides rich, date-stamped mock data for Facebook & Instagram dashboards.
// Used as a fallback when live OAuth data is unavailable, and as the
// data source for date-picker filtering and CSV export demonstrations.

// ── Helper: Generate rolling date array ─────────────────────────────
// Returns the last `n` calendar dates (YYYY-MM-DD) ending today.
function rollingDates(n = 30) {
  const dates = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

// ── Helper: Random int in range ──────────────────────────────────────
const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const DATES = rollingDates(30);

// ── Shared image placeholder for table rows ──────────────────────────
const POST_IMG = 'https://picsum.photos/seed/meta/80/80';
const VIDEO_IMG = 'https://picsum.photos/seed/fbvid/80/80';
const REEL_IMG = 'https://picsum.photos/seed/igreel/80/80';

// ════════════════════════════════════════════════════════════════════
// FACEBOOK MOCK DATA
// ════════════════════════════════════════════════════════════════════
export const fbMockData = {
  // ── KPI summary cards ──────────────────────────────────────────────
  kpis: [
    { title: 'Total Followers', value: 24_813 },
    { title: 'Page Views',      value: 8_452  },
    { title: 'Impressions',     value: 61_250 },
    { title: 'Engagements',     value: 4_388  },
    { title: 'Daily Follows',   value: 87     },
    { title: 'Reach (Est.)',    value: 45_938 },
  ],

  charts: {
    // ── 30-day reach time series ───────────────────────────────────
    reachOverTime: DATES.map(date => ({
      date,
      value: rnd(1_200, 4_800)
    })),

    // ── 30-day engagement time series ─────────────────────────────
    engagementsOverTime: DATES.map(date => ({
      date,
      value: rnd(80, 480)
    })),

    // ── Engagement rate sparkline ──────────────────────────────────
    engagementRate: {
      rate: '4.2%',
      change: 1.8,
      data: DATES.slice(-14).map(date => ({ date, rate: parseFloat((rnd(30, 70) / 10).toFixed(1)) }))
    },

    // ── Reach by source (pie chart) ────────────────────────────────
    reachBySource: [
      { name: 'Organic',    value: 68 },
      { name: 'Paid',       value: 18 },
      { name: 'Viral',      value: 10 },
      { name: 'Other',      value: 4  },
    ],

    // ── Audience breakdown ─────────────────────────────────────────
    audience: {
      ageGender: [
        { group: '18-24 M', value: 18 },
        { group: '25-34 M', value: 22 },
        { group: '18-24 F', value: 16 },
        { group: '25-34 F', value: 24 },
        { group: '35-44',   value: 12 },
        { group: '45+',     value: 8  },
      ],
      topCountries: [
        { country: 'India',         value: 62 },
        { country: 'United States', value: 14 },
        { country: 'UK',            value: 8  },
        { country: 'Canada',        value: 6  },
        { country: 'Australia',     value: 4  },
      ]
    }
  },

  tables: {
    // ── Top performing posts ───────────────────────────────────────
    topPosts: DATES.slice(-7).map((date, i) => ({
      image:       POST_IMG,
      title:       `Facebook Post #${i + 1} — Sample campaign content`,
      date,
      reach:       rnd(800, 6_000),
      engagements: rnd(60, 800),
      reactions:   rnd(40, 600),
      comments:    rnd(5, 120),
      shares:      rnd(2, 80),
    })),

    // ── Top performing videos ──────────────────────────────────────
    topVideos: DATES.slice(-5).map((date, i) => ({
      image:       VIDEO_IMG,
      title:       `FB Video #${i + 1} — Product walkthrough`,
      date,
      duration:    `${rnd(1, 8)}:${String(rnd(0, 59)).padStart(2, '0')}`,
      views:       rnd(400, 12_000),
      engagements: rnd(40, 600),
      watchTime:   `${rnd(100, 3_000)} hrs`,
    })),
  }
};

// ════════════════════════════════════════════════════════════════════
// INSTAGRAM MOCK DATA
// ════════════════════════════════════════════════════════════════════
export const igMockData = {
  // ── KPI summary cards ──────────────────────────────────────────────
  kpis: [
    { title: 'Total Followers', value: 18_540 },
    { title: 'Profile Views',   value: 6_102  },
    { title: 'Reach',           value: 38_450 },
    { title: 'Impressions',     value: 54_200 },
    { title: 'Media Count',     value: 214    },
    { title: 'Engagement',      value: 3_812  },
  ],

  charts: {
    // ── 30-day reach time series ───────────────────────────────────
    reachOverTime: DATES.map(date => ({
      date,
      value: rnd(900, 3_800)
    })),

    // ── 30-day engagements time series ────────────────────────────
    engagementsOverTime: DATES.map(date => ({
      date,
      value: rnd(50, 380)
    })),

    // ── Engagement rate sparkline ──────────────────────────────────
    engagementRate: {
      rate: '5.8%',
      change: 2.4,
      data: DATES.slice(-14).map(date => ({ date, rate: parseFloat((rnd(40, 80) / 10).toFixed(1)) }))
    },

    // ── Reach by source (pie chart) ────────────────────────────────
    reachBySource: [
      { name: 'Followers',     value: 54 },
      { name: 'Non-Followers', value: 32 },
      { name: 'Explore',       value: 10 },
      { name: 'Other',         value: 4  },
    ],

    // ── Audience breakdown ─────────────────────────────────────────
    audience: {
      ageGender: [
        { group: '18-24 F', value: 28 },
        { group: '25-34 F', value: 24 },
        { group: '18-24 M', value: 16 },
        { group: '25-34 M', value: 18 },
        { group: '35-44',   value: 10 },
        { group: '45+',     value: 4  },
      ],
      topCountries: [
        { country: 'India',         value: 58 },
        { country: 'United States', value: 16 },
        { country: 'UK',            value: 10 },
        { country: 'UAE',           value: 8  },
        { country: 'Canada',        value: 5  },
      ]
    }
  },

  tables: {
    // ── Top performing posts ───────────────────────────────────────
    topPosts: DATES.slice(-7).map((date, i) => ({
      image:      POST_IMG,
      title:      `Instagram Post #${i + 1} — Story highlight`,
      date,
      type:       i % 2 === 0 ? 'Image' : 'Video',
      reach:      rnd(600, 5_000),
      likes:      rnd(100, 2_000),
      comments:   rnd(5, 200),
      saves:      rnd(20, 400),
      engagement: `${rnd(3, 12)}%`,
    })),

    // ── Top performing reels ───────────────────────────────────────
    topReels: DATES.slice(-5).map((date, i) => ({
      image:    REEL_IMG,
      title:    `Reel #${i + 1} — Tutorial / Trending`,
      date,
      plays:    rnd(1_000, 40_000),
      likes:    rnd(200, 4_000),
      comments: rnd(10, 300),
    })),
  }
};
