import { AnalyticsSnapshot } from '../analytics/analytics.model.js';
import * as reportsService from './reports.service.js';

const exportAnalytics = async (req, res, next) => {
  try {
    const {
      platform,
      format,
      startDate,
      endDate
    } = req.query;

    const userId = req.user._id;

    // ---------------------------------------------------------
    // Validate required parameters
    // ---------------------------------------------------------

    if (!platform || !format) {
      return res.status(400).json({
        error: 'platform and format are required'
      });
    }

    const normalizedPlatform = platform.toLowerCase();

    const supportedPlatforms = [
      'instagram',
      'facebook',
      'youtube'
    ];

    if (!supportedPlatforms.includes(normalizedPlatform)) {
      return res.status(400).json({
        error:
          "Unsupported platform. Use 'instagram', 'facebook', or 'youtube'."
      });
    }

    if (!['csv', 'pdf'].includes(format.toLowerCase())) {
      return res.status(400).json({
        error: "Invalid format. Use 'csv' or 'pdf'."
      });
    }

    // ---------------------------------------------------------
    // Build analytics snapshot query
    // ---------------------------------------------------------

    const query = {
      incubationCenterId: userId,
      platform: normalizedPlatform,
      'rawPlatformData.mock': { $ne: true }
    };

    if (startDate || endDate) {
      query.snapshotDate = {};

      if (startDate) {
        const start = new Date(startDate);

        if (Number.isNaN(start.getTime())) {
          return res.status(400).json({
            error: 'Invalid startDate.'
          });
        }

        start.setHours(0, 0, 0, 0);
        query.snapshotDate.$gte = start;
      }

      if (endDate) {
        const end = new Date(endDate);

        if (Number.isNaN(end.getTime())) {
          return res.status(400).json({
            error: 'Invalid endDate.'
          });
        }

        // Include the complete end date.
        end.setHours(23, 59, 59, 999);
        query.snapshotDate.$lte = end;
      }
    }

    // ---------------------------------------------------------
    // Fetch historical analytics snapshots
    // ---------------------------------------------------------

    const snapshots = await AnalyticsSnapshot
      .find(query)
      .sort({ snapshotDate: 1 })
      .lean();

    if (snapshots.length === 0) {
      return res.status(404).json({
        error:
          'No analytics data found for the selected period.'
      });
    }

    // ---------------------------------------------------------
    // Build canonical report data
    // ---------------------------------------------------------

    const reportData = reportsService.buildReportData(
      snapshots,
      normalizedPlatform,
      req.user,
      startDate,
      endDate
    );

    // ---------------------------------------------------------
    // Generate CSV
    // ---------------------------------------------------------

    if (format.toLowerCase() === 'csv') {
      const csvData =
        await reportsService.generateCSV(
          reportData
        );

      res.setHeader(
        'Content-Type',
        'text/csv; charset=utf-8'
      );

      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${normalizedPlatform}_report_${Date.now()}.csv"`
      );

      return res.status(200).send(csvData);
    }

    // ---------------------------------------------------------
    // Generate PDF
    // ---------------------------------------------------------

    if (format.toLowerCase() === 'pdf') {
      const pdfData =
        await reportsService.generatePDF(
          reportData
        );

      // Puppeteer may return a Uint8Array.
      // Convert it explicitly to a Node.js Buffer
      // before sending it through Express.
      const pdfBuffer = Buffer.from(pdfData);

      res.setHeader(
        'Content-Type',
        'application/pdf'
      );

      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${normalizedPlatform}_report_${Date.now()}.pdf"`
      );

      res.setHeader(
        'Content-Length',
        pdfBuffer.length
      );

      return res.status(200).end(pdfBuffer);
    }

  } catch (error) {
    console.error(
      '[reports.controller] exportAnalytics error:',
      error
    );

    next(error);
  }
};

export default {
  exportAnalytics
};