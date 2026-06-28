import { Activity, BarChart3, Bookmark, Calendar, ChevronDown, Eye, FileText, Hash, Heart, HelpCircle, History, Image as ImageIcon, MessageCircle, PlaySquare, Settings, Target, ThumbsUp, TrendingDown, TrendingUp, Users, Video } from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockInstagramData } from "@/utils/metaMockData";

const IG_PINK = "#E1306C";
const PIE_COLORS = ["#E1306C", "#8b5cf6", "#10b981", "#64748b"];
import { EmptyState, KpiCard, DarkTooltip, FacebookDataTable, InstagramDataTable, ProgressBar } from './MetaSharedComponents';


export function InstagramHelp() {
    return (
      <div className="space-y-6">
        <Card className="bg-[#161B22] border-white/5 text-white">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-slate-200">Help & Support</CardTitle>
            <p className="text-sm text-slate-400">Get help with your Instagram dashboard integration.</p>
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
                    <p className="text-xs text-slate-400">Instagram API limits historical follower growth prior to the date you connected your account to this platform.</p>
                  </div>
                  <div className="p-3 border border-white/10 rounded-lg">
                    <p className="text-sm font-medium text-slate-200 mb-1">How is Engagement Rate calculated?</p>
                    <p className="text-xs text-slate-400">Engagement Rate = ((Likes + Comments + Saves) / Total Followers) * 100.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-slate-300">Contact Support</h4>
                <div className="p-4 border border-white/10 rounded-lg bg-white/[0.02] space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-400">Subject</label>
                    <input type="text" placeholder="e.g. Data Sync Issue" className="w-full bg-[#0B1121] border border-white/10 rounded-md px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-[#E1306C]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-400">Message</label>
                    <textarea rows={4} placeholder="Describe your issue..." className="w-full bg-[#0B1121] border border-white/10 rounded-md px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-[#E1306C]"></textarea>
                  </div>
                  <button className="w-full py-2 bg-[#E1306C] hover:bg-pink-600 text-white text-sm font-medium rounded-md transition-colors">
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