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


export function InstagramSettings() {
    return (
      <div className="space-y-6">
        <Card className="bg-[#161B22] border-white/5 text-white">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-slate-200">Account Settings</CardTitle>
            <p className="text-sm text-slate-400">Manage your connected Instagram profile preferences.</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-slate-300 border-b border-white/10 pb-2">Profile Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-400">Account Name</label>
                  <input type="text" defaultValue="Ritika Sharma" disabled className="w-full bg-[#0B1121]/50 border border-white/5 rounded-md px-3 py-2 text-sm text-slate-500 cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-400">Instagram Handle</label>
                  <input type="text" defaultValue="@ritika.sharma" disabled className="w-full bg-[#0B1121]/50 border border-white/5 rounded-md px-3 py-2 text-sm text-slate-500 cursor-not-allowed" />
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
                  <div className="w-10 h-6 bg-[#E1306C] rounded-full flex items-center p-1 cursor-pointer">
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
               <button className="px-4 py-2 bg-[#E1306C] hover:bg-pink-600 text-white text-sm font-medium rounded-md transition-colors">
                  Save Preferences
               </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }