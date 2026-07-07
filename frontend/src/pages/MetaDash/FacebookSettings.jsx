// ── Facebook Settings Page ───────────────────────────────────────────────────
// Static UI — no data fetching required.
// Receives layout context from FacebookLayout via useOutletContext (unused here).

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


export function FacebookSettings() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card className="bg-[#161B22] border-white/5 text-white">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-slate-200">Account Settings</CardTitle>
          <p className="text-sm text-slate-400">Manage your connected Facebook Page preferences.</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-slate-300 border-b border-white/10 pb-2">Profile Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-400">Page Name</label>
                <input type="text" defaultValue="Incubein Studios" disabled className="w-full bg-[#0B1121]/50 border border-white/5 rounded-md px-3 py-2 text-sm text-slate-500 cursor-not-allowed" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-400">Page URL</label>
                <input type="text" defaultValue="facebook.com/incubeinstudios" disabled className="w-full bg-[#0B1121]/50 border border-white/5 rounded-md px-3 py-2 text-sm text-slate-500 cursor-not-allowed" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-slate-300 border-b border-white/10 pb-2">Notifications</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-white/10 rounded-lg bg-white/[0.02]">
                <div>
                  <p className="text-sm font-medium text-slate-200">Email Notifications</p>
                  <p className="text-xs text-slate-400">Receive weekly performance summaries via email.</p>
                </div>
                <div className="w-10 h-6 bg-[#1877F2] rounded-full flex items-center p-1 cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full shadow-md transform translate-x-4"></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border border-white/10 rounded-lg bg-white/[0.02]">
                <div>
                  <p className="text-sm font-medium text-slate-200">Alerts on Drops</p>
                  <p className="text-xs text-slate-400">Get notified if engagement drops by more than 20%.</p>
                </div>
                <div className="w-10 h-6 bg-slate-600 rounded-full flex items-center p-1 cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full shadow-md"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-4 flex justify-end">
             <button className="px-4 py-2 bg-[#1877F2] hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-colors">
                Save Preferences
             </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Default export for use in routes/index.jsx ────────────────────────────────
export default FacebookSettings;