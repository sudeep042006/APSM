// ── Facebook Help Page ─────────────────────────────────────────────────────
// Static UI — no data fetching required.
// Receives layout context from FacebookLayout via useOutletContext (unused here).

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


export function FacebookHelp() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card className="bg-[#161B22] border-white/5 text-white">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-slate-200">Help & Support</CardTitle>
          <p className="text-sm text-slate-400">Get help with your Facebook Page integration.</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-slate-300">Frequently Asked Questions</h4>
              <div className="space-y-2">
                <div className="p-3 border border-white/10 rounded-lg">
                  <p className="text-sm font-medium text-slate-200 mb-1">How often does data refresh?</p>
                  <p className="text-xs text-slate-400">Data automatically refreshes every 24 hours. You can force a manual sync using the refresh button at the top of the dashboard.</p>
                </div>
                <div className="p-3 border border-white/10 rounded-lg">
                  <p className="text-sm font-medium text-slate-200 mb-1">Why is my follower growth missing?</p>
                  <p className="text-xs text-slate-400">Facebook Graph API limits historical follower growth prior to the date you connected your account to this platform.</p>
                </div>
                <div className="p-3 border border-white/10 rounded-lg">
                  <p className="text-sm font-medium text-slate-200 mb-1">How is Engagement Rate calculated?</p>
                  <p className="text-xs text-slate-400">Engagement Rate = ((Likes + Comments + Shares) / Total Page Likes) * 100.</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium text-slate-300">Contact Support</h4>
              <div className="p-4 border border-white/10 rounded-lg bg-white/[0.02] space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-400">Subject</label>
                  <input type="text" placeholder="e.g. Data Sync Issue" className="w-full bg-[#0B1121] border border-white/10 rounded-md px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-[#1877F2]" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-400">Message</label>
                  <textarea rows={4} placeholder="Describe your issue..." className="w-full bg-[#0B1121] border border-white/10 rounded-md px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-[#1877F2]"></textarea>
                </div>
                <button className="w-full py-2 bg-[#1877F2] hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-colors">
                  Submit Ticket
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Default export for use in routes/index.jsx ────────────────────────────────
export default FacebookHelp;