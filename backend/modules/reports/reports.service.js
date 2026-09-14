import { Parser } from 'json2csv';
import puppeteer from 'puppeteer';
import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const formatDate = (date) => {
  if (!date) return '';

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) return '';

  return d.toISOString().split('T')[0];
};

const safeNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const getDateRange = (snapshots) => {
  if (!snapshots.length) {
    return {
      startDate: null,
      endDate: null
    };
  }

  return {
    startDate: formatDate(snapshots[0].snapshotDate),
    endDate: formatDate(snapshots[snapshots.length - 1].snapshotDate)
  };
};

/*
|--------------------------------------------------------------------------
| Instagram
|--------------------------------------------------------------------------
*/

const buildInstagramReportData = (snapshots) => {
  const latest = snapshots[snapshots.length - 1];

  const latestMetrics = latest?.metrics || {};
  const latestDemographics = latest?.demographics || {};
  const instagramData =
    latest?.rawPlatformData?.instagram || {};

  const media = instagramData.media || [];

  return {
    account: {
      username: instagramData.username || '',
      followers: safeNumber(
        instagramData.followers || latestMetrics.followers
      ),
      mediaCount: safeNumber(
        instagramData.mediaCount
      ),
      profilePicture: instagramData.profilePicture || ''
    },

    summary: {
      followers: safeNumber(latestMetrics.followers),
      reach: safeNumber(latestMetrics.reach),

      /*
       * NOTE:
       * Current analytics code stores profile_views
       * in the impressions field for Instagram.
       * We therefore do not expose it as a genuine
       * impressions metric here.
       */
      profileViews: safeNumber(latestMetrics.profileViews),
      totalEngagement: safeNumber(latestMetrics.totalEngagement)
    },

    performance: {
      daily: snapshots.map((snapshot) => ({
        date: formatDate(snapshot.snapshotDate),
        followers: safeNumber(snapshot.metrics?.followers),
        reach: safeNumber(snapshot.metrics?.reach),
        profileViews: safeNumber(
          snapshot.metrics?.profileViews
        ),
        engagement: safeNumber(
          snapshot.metrics?.totalEngagement
        )
      }))
    },

    content: media
      .filter((item) => {
        const publishedAt = item.timestamp;

        if (!publishedAt) {
          return false;
        }

        const publishedDate = new Date(publishedAt);

        const startDate = new Date(
          snapshots[0]?.snapshotDate
        );

        const endDate = new Date(
          snapshots[snapshots.length - 1]?.snapshotDate
        );

        endDate.setHours(23, 59, 59, 999);

        return (
          publishedDate >= startDate &&
          publishedDate <= endDate
        );
      })
      .map((item) => ({
        id: item.id,
        type: item.media_type,
        caption: item.caption,
        publishedAt: item.timestamp,
        permalink: item.permalink,
        mediaUrl: item.media_url,
        thumbnailUrl: item.thumbnail_url,
        likes: item.like_count,
        comments: item.comments_count,
        engagement:
          (Number(item.like_count) || 0) +
          (Number(item.comments_count) || 0)
      })),

    audience: {
      countries: latestDemographics.topCountries || [],
      cities: latestDemographics.topCities || [],
      ageAndGender: latestDemographics.ageAndGender || [],
      devices: []
    },

    advertising: null
  };
};

/*
|--------------------------------------------------------------------------
| Facebook
|--------------------------------------------------------------------------
*/

const buildFacebookReportData = (snapshots) => {
  const latest = snapshots[snapshots.length - 1];

  const latestMetrics = latest?.metrics || {};
  const latestDemographics = latest?.demographics || {};
  const facebookData =
    latest?.rawPlatformData?.facebook || {};

  const posts = facebookData.posts || [];

  return {
    account: {
      pageName: facebookData.pageName || '',
      pageId: facebookData.pageId || '',
      followers: safeNumber(
        facebookData.fanCount || latestMetrics.followers
      )
    },

    summary: {
      followers: safeNumber(latestMetrics.followers),
      impressions: safeNumber(latestMetrics.impressions),
      reach: safeNumber(latestMetrics.reach),
      profileViews: safeNumber(latestMetrics.profileViews),
      totalEngagement: safeNumber(
        latestMetrics.totalEngagement
      )
    },

    performance: {
      daily: snapshots.map((snapshot) => ({
        date: formatDate(snapshot.snapshotDate),
        followers: safeNumber(snapshot.metrics?.followers),
        impressions: safeNumber(
          snapshot.metrics?.impressions
        ),
        reach: safeNumber(snapshot.metrics?.reach),
        engagement: safeNumber(
          snapshot.metrics?.totalEngagement
        )
      }))
    },

    content: posts.map((post) => ({
      id: post.id || '',
      message: post.message || '',
      story: post.story || '',
      publishedAt: post.created_time || '',

      image:
        post.full_picture ||
        post.picture ||
        '',

      shares: safeNumber(
        post.shares?.count
      ),

      comments: safeNumber(
        post.comments?.summary?.total_count
      ),

      reactions: safeNumber(
        post.reactions?.summary?.total_count
      ),

      engagement:
        safeNumber(
          post.shares?.count
        ) +
        safeNumber(
          post.comments?.summary?.total_count
        ) +
        safeNumber(
          post.reactions?.summary?.total_count
        )
    })),

    audience: {
      countries: latestDemographics.topCountries || [],
      cities: latestDemographics.topCities || [],
      ageAndGender: latestDemographics.ageAndGender || [],
      devices: []
    },

    advertising: null
  };
};

/*
|--------------------------------------------------------------------------
| YouTube
|--------------------------------------------------------------------------
*/

const buildYouTubeReportData = (snapshots) => {
  const latest = snapshots[snapshots.length - 1];

  const latestMetrics = latest?.metrics || {};
  const latestDemographics = latest?.demographics || {};
  const youtubeData =
    latest?.rawPlatformData || {};

  const channel = youtubeData.channelDetails || {};
  const recentVideos = youtubeData.recentVideos || [];
  const playlists = youtubeData.playlists || [];

  /*
   * YouTube Analytics daily report
   */
  const dailyReport =
    youtubeData.analyticsReports?.daily;

  let daily = [];

  if (
    dailyReport?.rows &&
    dailyReport?.columnHeaders
  ) {
    const headers = dailyReport.columnHeaders.map(
      (header) => header.name
    );

    const indexOf = (name) =>
      headers.indexOf(name);

    daily = dailyReport.rows.map((row) => ({
      date: row[indexOf('day')] || '',

      views: safeNumber(
        row[indexOf('views')]
      ),

      comments: safeNumber(
        row[indexOf('comments')]
      ),

      likes: safeNumber(
        row[indexOf('likes')]
      ),

      dislikes: safeNumber(
        row[indexOf('dislikes')]
      ),

      shares: safeNumber(
        row[indexOf('shares')]
      ),

      estimatedMinutesWatched:
        safeNumber(
          row[indexOf('estimatedMinutesWatched')]
        ),

      averageViewDuration:
        safeNumber(
          row[indexOf('averageViewDuration')]
        ),

      subscribersGained:
        safeNumber(
          row[indexOf('subscribersGained')]
        ),

      subscribersLost:
        safeNumber(
          row[indexOf('subscribersLost')]
        )
    }));
  }

  return {
    account: {
      channelId: channel.id || '',
      title: channel.snippet?.title || '',
      description:
        channel.snippet?.description || '',
      customUrl:
        channel.snippet?.customUrl || '',
      publishedAt:
        channel.snippet?.publishedAt || '',
      thumbnail:
        channel.snippet?.thumbnails?.default?.url ||
        '',
      subscribers: safeNumber(
        channel.statistics?.subscriberCount ||
        latestMetrics.followers
      ),
      totalViews: safeNumber(
        channel.statistics?.viewCount
      ),
      totalVideos: safeNumber(
        channel.statistics?.videoCount
      )
    },

    summary: {
      subscribers: safeNumber(
        latestMetrics.followers
      ),
      views: safeNumber(
        latestMetrics.reach
      ),
      engagement: safeNumber(
        latestMetrics.totalEngagement
      )
    },

    performance: {
      daily
    },

    content: recentVideos.map((video) => ({
      id: video.id || '',

      title:
        video.snippet?.title || '',

      description:
        video.snippet?.description || '',

      publishedAt:
        video.snippet?.publishedAt || '',

      channelTitle:
        video.snippet?.channelTitle || '',

      thumbnail:
        video.snippet?.thumbnails?.high?.url ||
        video.snippet?.thumbnails?.default?.url ||
        '',

      duration:
        video.contentDetails?.duration || '',

      views: safeNumber(
        video.statistics?.viewCount
      ),

      likes: safeNumber(
        video.statistics?.likeCount
      ),

      comments: safeNumber(
        video.statistics?.commentCount
      ),

      engagement:
        safeNumber(
          video.statistics?.likeCount
        ) +
        safeNumber(
          video.statistics?.commentCount
        )
    })),

    playlists: playlists.map((playlist) => ({
      id: playlist.id || '',
      title:
        playlist.snippet?.title || '',
      description:
        playlist.snippet?.description || '',
      publishedAt:
        playlist.snippet?.publishedAt || '',
      itemCount: safeNumber(
        playlist.contentDetails?.itemCount
      )
    })),

    audience: {
      countries:
        latestDemographics.topCountries || [],

      cities:
        latestDemographics.topCities || [],

      ageAndGender:
        latestDemographics.ageAndGender || [],

      devices: []
    },

    advertising: null
  };
};

/*
|--------------------------------------------------------------------------
| Build Canonical Report Data
|--------------------------------------------------------------------------
*/

const buildReportData = (
  snapshots,
  platform,
  user,
  startDate,
  endDate
) => {
  if (!snapshots || snapshots.length === 0) {
    throw new Error(
      'No analytics snapshots available.'
    );
  }

  const normalizedPlatform =
    platform.toLowerCase();



  let platformData;

  switch (normalizedPlatform) {
    case 'instagram':
      platformData =
        buildInstagramReportData(snapshots);
      break;

    case 'facebook':
      platformData =
        buildFacebookReportData(snapshots);
      break;

    case 'youtube':
      platformData =
        buildYouTubeReportData(snapshots);
      break;

    default:
      throw new Error(
        `Reports are not supported for platform: ${platform}`
      );
  }

  return {
    platform: normalizedPlatform,

    reportInfo: {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      generatedAt: new Date()
    },

    generatedFor: {
      userId: user?._id?.toString() || '',
      name: user?.name || 'User'
    },

    ...platformData
  };
};

/*
|--------------------------------------------------------------------------
| CSV Generation
|--------------------------------------------------------------------------
*/

const generateCSV = async (reportData) => {
  const rows = [];

  /*
   * REPORT INFORMATION
   */
  rows.push({
    Section: 'REPORT INFORMATION',
    Field: 'Platform',
    Value: reportData.platform
  });

  rows.push({
    Section: 'REPORT INFORMATION',
    Field: 'Start Date',
    Value: reportData.reportInfo.startDate || ''
  });

  rows.push({
    Section: 'REPORT INFORMATION',
    Field: 'End Date',
    Value: reportData.reportInfo.endDate || ''
  });

  rows.push({
    Section: 'REPORT INFORMATION',
    Field: 'Generated At',
    Value: reportData.reportInfo.generatedAt
  });

  /*
   * ACCOUNT
   */
  Object.entries(reportData.account || {}).forEach(
    ([key, value]) => {
      if (
        value !== null &&
        typeof value !== 'object'
      ) {
        rows.push({
          Section: 'ACCOUNT',
          Field: key,
          Value: value
        });
      }
    }
  );

  /*
   * SUMMARY
   */
  Object.entries(reportData.summary || {}).forEach(
    ([key, value]) => {
      rows.push({
        Section: 'SUMMARY',
        Field: key,
        Value: value
      });
    }
  );

  /*
   * DAILY PERFORMANCE
   */
  (reportData.performance?.daily || []).forEach(
    (day) => {
      rows.push({
        Section: 'DAILY PERFORMANCE',
        Field: JSON.stringify(day),
        Value: ''
      });
    }
  );

  /*
   * CONTENT
   */
  (reportData.content || []).forEach(
    (item) => {
      rows.push({
        Section: 'CONTENT',
        Field: JSON.stringify(item),
        Value: ''
      });
    }
  );

  /*
   * PLAYLISTS — YouTube only
   */
  (reportData.playlists || []).forEach(
    (playlist) => {
      rows.push({
        Section: 'PLAYLISTS',
        Field: JSON.stringify(playlist),
        Value: ''
      });
    }
  );

  /*
   * AUDIENCE
   */
  Object.entries(
    reportData.audience || {}
  ).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        rows.push({
          Section: `AUDIENCE - ${key.toUpperCase()}`,
          Field: JSON.stringify(item),
          Value: ''
        });
      });
    }
  });

  /*
   * ADVERTISING
   */
  if (reportData.advertising) {
    Object.entries(
      reportData.advertising
    ).forEach(([key, value]) => {
      rows.push({
        Section: 'ADVERTISING',
        Field: key,
        Value: value
      });
    });
  }

  const parser = new Parser({
    fields: [
      'Section',
      'Field',
      'Value'
    ]
  });

  return parser.parse(rows);
};

const escapeXml = (value) => {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

const buildLineChartSvg = (daily = []) => {
  if (!daily || daily.length === 0) {
    return `
      <div class="empty">
        No performance trend data available.
      </div>
    `;
  }

  const width = 760;
  const height = 260;

  const padding = {
    top: 30,
    right: 30,
    bottom: 45,
    left: 55
  };

  const chartWidth =
    width - padding.left - padding.right;

  const chartHeight =
    height - padding.top - padding.bottom;

  /*
   * Determine which metrics are available.
   */

  const hasReach = daily.some(
    item =>
      item.reach !== undefined &&
      item.reach !== null
  );

  const hasViews = daily.some(
    item =>
      item.views !== undefined &&
      item.views !== null
  );

  const hasEngagement = daily.some(
    item =>
      item.engagement !== undefined &&
      item.engagement !== null
  );

  /*
   * Select the available metrics.
   */

  const datasets = [];

  if (hasReach) {
    datasets.push({
      label: 'Reach',
      key: 'reach'
    });
  }

  if (hasViews) {
    datasets.push({
      label: 'Views',
      key: 'views'
    });
  }

  if (hasEngagement) {
    datasets.push({
      label: 'Engagement',
      key: 'engagement'
    });
  }

  if (datasets.length === 0) {
    return `
      <div class="empty">
        No numeric performance trend data available.
      </div>
    `;
  }

  /*
   * Find maximum value across all datasets.
   */

  let maxValue = 0;

  datasets.forEach(dataset => {
    daily.forEach(item => {
      const value =
        Number(item[dataset.key]) || 0;

      if (value > maxValue) {
        maxValue = value;
      }
    });
  });

  /*
   * Prevent a zero-height scale.
   */

  if (maxValue === 0) {
    maxValue = 1;
  }

  /*
   * Calculate chart points.
   */

  const getX = (index) => {
    if (daily.length === 1) {
      return padding.left + chartWidth / 2;
    }

    return (
      padding.left +
      (index / (daily.length - 1)) *
      chartWidth
    );
  };

  const getY = (value) => {
    return (
      padding.top +
      chartHeight -
      (value / maxValue) *
      chartHeight
    );
  };

  /*
   * Build grid lines.
   */

  const gridLines = [];

  for (let i = 0; i <= 4; i++) {

    const value =
      (maxValue / 4) * i;

    const y =
      getY(value);

    gridLines.push(`
      <line
        x1="${padding.left}"
        y1="${y}"
        x2="${width - padding.right}"
        y2="${y}"
        stroke="#e5e7eb"
        stroke-width="1"
      />

      <text
        x="${padding.left - 10}"
        y="${y + 4}"
        text-anchor="end"
        font-size="10"
        fill="#6b7280"
      >
        ${Math.round(value)}
      </text>
    `);
  }

  /*
   * Build X-axis labels.
   *
   * Don't print every date if there are many records.
   */

  const labelStep =
    Math.max(
      1,
      Math.ceil(daily.length / 8)
    );

  const xLabels = [];

  daily.forEach((item, index) => {

    if (
      index % labelStep !== 0 &&
      index !== daily.length - 1
    ) {
      return;
    }

    const x = getX(index);

    xLabels.push(`
      <text
        x="${x}"
        y="${height - 15}"
        text-anchor="middle"
        font-size="9"
        fill="#6b7280"
      >
        ${escapeXml(item.date || '')}
      </text>
    `);
  });

  /*
   * Build datasets.
   */

  const datasetSvg = [];

  datasets.forEach(dataset => {

    const points = daily.map(
      (item, index) => {

        const value =
          Number(item[dataset.key]) || 0;

        return {
          x: getX(index),
          y: getY(value),
          value
        };
      }
    );

    const pathData =
      points
        .map((point, index) =>
          `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
        )
        .join(' ');

    datasetSvg.push(`
      <path
        d="${pathData}"
        fill="none"
        stroke="#111827"
        stroke-width="2"
      />
    `);

    /*
     * Small data points.
     */

    points.forEach(point => {

      datasetSvg.push(`
        <circle
          cx="${point.x}"
          cy="${point.y}"
          r="2.5"
          fill="#111827"
        />
      `);

    });
  });

  /*
   * Legend.
   */

  const legend = datasets
    .map(dataset => `
      <span class="chart-legend-item">
        <span class="chart-legend-line"></span>
        ${escapeXml(dataset.label)}
      </span>
    `)
    .join('');

  return `
    <div class="chart-wrapper">

      <div class="chart-legend">
        ${legend}
      </div>

      <svg
        width="100%"
        viewBox="0 0 ${width} ${height}"
        xmlns="http://www.w3.org/2000/svg"
      >

        ${gridLines.join('')}

        <!-- Axis -->

        <line
          x1="${padding.left}"
          y1="${padding.top}"
          x2="${padding.left}"
          y2="${height - padding.bottom}"
          stroke="#9ca3af"
          stroke-width="1"
        />

        <line
          x1="${padding.left}"
          y1="${height - padding.bottom}"
          x2="${width - padding.right}"
          y2="${height - padding.bottom}"
          stroke="#9ca3af"
          stroke-width="1"
        />

        <!-- Data -->

        ${datasetSvg.join('')}

        <!-- Dates -->

        ${xLabels.join('')}

      </svg>

    </div>
  `;
};

/*
|--------------------------------------------------------------------------
| PDF Generation
|--------------------------------------------------------------------------
*/

const generatePDF = async (reportData) => {
  // Generate the performance chart as SVG.
  // This avoids depending on Chart.js/CDN inside Puppeteer.
  const chartSvg = buildLineChartSvg(
    reportData.performance?.daily || []
  );

  // Data passed to the EJS template.
  const templateData = {
    report: reportData,
    chartSvg
  };

  // Path to the EJS template.
  const templatePath = path.join(
    __dirname,
    'templates',
    'report.ejs'
  );

  // Render EJS → HTML.
  const html = await ejs.renderFile(
    templatePath,
    templateData
  );

  // Launch Puppeteer.
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });

  try {
    // Create a new browser page.
    const page = await browser.newPage();

    // Set a desktop-sized viewport so the report
    // renders consistently.
    await page.setViewport({
      width: 1200,
      height: 900
    });

    // Load the generated HTML.
    await page.setContent(html, {
      waitUntil: 'load',
      timeout: 60000
    });

    // Give the browser a small amount of time
    // to finish layout/rendering.
    await new Promise((resolve) =>
      setTimeout(resolve, 300)
    );

    // Generate the PDF.
    const pdfData = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,

      margin: {
        top: '18mm',
        right: '15mm',
        bottom: '18mm',
        left: '15mm'
      }
    });

    // Explicitly convert Puppeteer's Uint8Array
    // into a Node.js Buffer.
    return Buffer.from(pdfData);

  } finally {
    // Always close the browser, even if PDF generation fails.
    await browser.close();
  }
};

export {
  buildReportData,
  generateCSV,
  generatePDF
};