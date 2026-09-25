import { Card, CardContent } from "@/components/ui/card";
import { FileSpreadsheet, FilePieChart } from "lucide-react";
import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import reportApi from "@/services/reportApi";
import DateRangePicker from "@/components/DateRangePicker";

export default function YoutubeReports() {
  const { isConnected } = useOutletContext();

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState(null);

  const handleDateChange = ({ start, end }) => {
    setStartDate(start || null);
    setEndDate(end || null);
  };

  const handleExport = async (format) => {
    try {
      setExporting(true);
      setExportFormat(format);

      await reportApi.exportAnalytics(
        "youtube",
        format,
        startDate,
        endDate
      );
    } catch (error) {
      console.error("Report export failed:", error);
      alert("Failed to generate the report. Please try again.");
    } finally {
      setExporting(false);
      setExportFormat(null);
    }
  };

  if (!isConnected) {
    return (
      <div className="p-4 md:p-8 flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-xl text-white font-semibold mb-2">
          Account Disconnected
        </h2>
        <p className="text-gray-400">
          Please connect your YouTube account to access reports.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in p-4 md:p-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl font-semibold text-white">
          YouTube Reports
        </h2>
        <p className="mt-1 text-sm text-gray-400">
          Generate a detailed report for your YouTube analytics.
        </p>
      </div>

      <Card className="border-white/5 bg-[#161B22]/90 backdrop-blur-md">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">
                Report Period
              </h3>
              <p className="mt-1 text-sm text-gray-400">
                Select a date range or leave it unchanged for the overall
                analysis.
              </p>
            </div>

            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onChange={handleDateChange}
            />
          </div>

          <div className="mt-6 rounded-lg border border-white/5 bg-[#0D1117] p-4">
            {startDate && endDate ? (
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500">
                  Selected Report Period
                </p>

                <p className="mt-1 text-sm font-medium text-white">
                  {startDate} → {endDate}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500">
                  Report Period
                </p>

                <p className="mt-1 text-sm font-medium text-white">
                  Overall Analysis
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  No date range selected. The report will contain the overall
                  available YouTube analytics.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => handleExport("pdf")}
              disabled={exporting}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FilePieChart className="h-4 w-4" />

              {exporting && exportFormat === "pdf"
                ? "Generating PDF..."
                : "Download PDF"}
            </button>

            <button
              type="button"
              onClick={() => handleExport("csv")}
              disabled={exporting}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#0D1117] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FileSpreadsheet className="h-4 w-4" />

              {exporting && exportFormat === "csv"
                ? "Generating CSV..."
                : "Download CSV"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}