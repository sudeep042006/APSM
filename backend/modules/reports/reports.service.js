import { Parser } from 'json2csv';
import puppeteer from 'puppeteer';
import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generateCSV = async (snapshots, platform) => {
  // Flatten data for CSV
  const data = snapshots.map(snap => {
    const flat = {
      Date: snap.snapshotDate ? new Date(snap.snapshotDate).toISOString().split('T')[0] : '',
      Platform: snap.platform,
      Followers: snap.metrics?.followers || 0,
      Impressions: snap.metrics?.impressions || 0,
      Reach: snap.metrics?.reach || 0,
      ProfileViews: snap.metrics?.profileViews || 0,
      TotalEngagement: snap.metrics?.totalEngagement || 0,
    };
    
    // Ads data if any
    if (snap.ads && snap.ads.totalSpend) {
      flat.AdSpend = snap.ads.totalSpend;
      flat.AdImpressions = snap.ads.adImpressions;
      flat.CostPerClick = snap.ads.costPerClick;
    }
    
    return flat;
  });

  const parser = new Parser();
  return parser.parse(data);
};

const generatePDF = async (snapshots, platform, user) => {
  // Prepare data for the template
  const templateData = {
    platform: platform.charAt(0).toUpperCase() + platform.slice(1),
    user: user.name || 'User',
    dateRange: '',
    snapshots: snapshots.map(s => ({
      date: new Date(s.snapshotDate).toLocaleDateString(),
      followers: s.metrics?.followers || 0,
      impressions: s.metrics?.impressions || 0,
      reach: s.metrics?.reach || 0,
      engagement: s.metrics?.totalEngagement || 0
    })),
    latestMetrics: snapshots[snapshots.length - 1]?.metrics || {},
    chartLabels: JSON.stringify(snapshots.map(s => new Date(s.snapshotDate).toLocaleDateString())),
    chartDataFollowers: JSON.stringify(snapshots.map(s => s.metrics?.followers || 0)),
    chartDataEngagement: JSON.stringify(snapshots.map(s => s.metrics?.totalEngagement || 0))
  };

  if (snapshots.length > 0) {
    const start = new Date(snapshots[0].snapshotDate).toLocaleDateString();
    const end = new Date(snapshots[snapshots.length - 1].snapshotDate).toLocaleDateString();
    templateData.dateRange = `${start} - ${end}`;
  }

  // Render HTML via EJS
  const templatePath = path.join(__dirname, 'templates', 'report.ejs');
  const html = await ejs.renderFile(templatePath, templateData);

  // Launch Puppeteer to create PDF
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Set content and wait for network (so Chart.js CDN loads and renders)
  await page.setContent(html, { waitUntil: 'networkidle0' });
  
  // A small delay to ensure chart animation finishes if any (though we disable animation in template)
  await new Promise(resolve => setTimeout(resolve, 500));

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
  });

  await browser.close();
  return pdfBuffer;
};

export default { generateCSV, generatePDF };
