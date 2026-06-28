import { Activity, BarChart3, Bookmark, Calendar, ChevronDown, Eye, FileText, Hash, Heart, HelpCircle, History, Image as ImageIcon, MessageCircle, PlaySquare, Settings, Target, ThumbsUp, TrendingDown, TrendingUp, Users, Video } from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const IG_PINK = "#E1306C";
const PIE_COLORS = ["#E1306C", "#8b5cf6", "#10b981", "#64748b"];
import { EmptyState, KpiCard, DarkTooltip, FacebookDataTable, InstagramDataTable, ProgressBar } from './MetaSharedComponents';


export function InstagramAudience({ data }) {
  if (!data) return <EmptyState title="Audience Insights Unavailable" description="Your account needs more followers before we can generate detailed demographic data." icon={Users} />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-[#161B22] border-white/5 text-white">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-200">Age & Gender Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.ageAndGender} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                <XAxis dataKey="group" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip content={<DarkTooltip />} cursor={{ fill: "#ffffff05" }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }} />
                <Bar dataKey="female" name="Women" fill={IG_PINK} radius={[2, 2, 0, 0]} barSize={12} />
                <Bar dataKey="male" name="Men" fill="#8b5cf6" radius={[2, 2, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#161B22] border-white/5 text-white">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-200">Top Locations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="h-[140px] w-[140px] flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.topLocations} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={2} dataKey="value" stroke="none">
                    {data.topLocations.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<DarkTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-3">
              {data.topLocations.map((loc, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-slate-300 truncate max-w-[120px]">{loc.location}</span>
                  </div>
                  <span className="text-slate-200 font-medium">{loc.value}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-white/5 pt-4 space-y-3">
            <p className="text-xs text-slate-400 mb-2 font-medium">Distribution Map</p>
            {data.topLocations.map((loc, i) => (
              <ProgressBar key={i} label={loc.location} value={loc.value} max={100} color={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}