import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { User, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from "@/components/ui/button";

// A simple custom switch since Shadcn <Switch /> was requested but not installed
const CustomSwitch = ({ checked, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`
      relative inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75
      ${checked ? 'bg-blue-600' : 'bg-slate-700'}
    `}
  >
    <span className="sr-only">Toggle Email Reports</span>
    <span
      aria-hidden="true"
      className={`
        pointer-events-none inline-block h-[20px] w-[20px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out
        ${checked ? 'translate-x-[20px]' : 'translate-x-0'}
      `}
    />
  </button>
);

import fbapi from '@/services/fbapi';

export default function FacebookSettings() {
  const [emailReports, setEmailReports] = useState(true);
  const { isConnected, profile } = useOutletContext();

  const handleDisconnect = async () => {
    try {
      await fbapi.revokeAccess();
      // Optionally trigger UI refresh or context update here
      window.location.reload();
    } catch (error) {
      console.error("Failed to disconnect:", error);
    }
  };

  return (
    <div className="h-full overflow-y-auto w-full p-4 md:p-6">
      <div className="max-w-4xl mx-auto flex flex-col gap-6 pb-12">
        {/* Section A: Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">
            Manage your Facebook Page connections and dashboard preferences.
          </p>
        </div>

        {/* Section B: Account Connection */}
        <div className="bg-[#161B22]/90 backdrop-blur-sm border border-white/5 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Account Connection</h2>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 overflow-hidden">
                <User className="h-6 w-6 text-slate-400" />
              </div>
              <div>
                <h3 className="text-white font-medium">Connected Facebook Page</h3>
                <p className="text-sm text-gray-400">authenticated.user@facebook.com</p>
              </div>
            </div>
            <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Sync
            </Button>
          </div>
        </div>

        {/* Section C: Dashboard Preferences */}
        <div className="bg-[#161B22]/90 backdrop-blur-sm border border-white/5 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Dashboard Preferences</h2>

          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between pb-6 border-b border-white/5">
              <div>
                <h3 className="text-white font-medium">Default Date Range</h3>
                <p className="text-sm text-gray-400">Select the default time period for your analytics.</p>
              </div>
              <select className="bg-slate-900 border border-white/10 text-white text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none">
                <option value="7">Last 7 Days</option>
                <option value="28">Last 28 Days</option>
                <option value="lifetime">Lifetime</option>
              </select>
            </div>

            <div className="flex items-center justify-between pb-6 border-b border-white/5">
              <div>
                <h3 className="text-white font-medium">Currency</h3>
                <p className="text-sm text-gray-400">Choose the currency for the Ad Reports tab.</p>
              </div>
              <select className="bg-slate-900 border border-white/10 text-white text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none">
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Weekly Analytics Summary</h3>
                <p className="text-sm text-gray-400">Receive email reports with your page's performance.</p>
              </div>
              <CustomSwitch checked={emailReports} onChange={setEmailReports} />
            </div>
          </div>
        </div>

        {/* Section D: Danger Zone */}
        {isConnected && (
          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Danger Zone
                </h2>
                <p className="text-sm text-red-400/80 max-w-xl">
                  Disconnecting your Facebook Page will pause all data syncing. Historical data will be retained for 30 days.
                </p>
              </div>
              <Button variant="destructive" onClick={handleDisconnect} className="bg-red-600 hover:bg-red-700 text-white">
                Disconnect Page
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}