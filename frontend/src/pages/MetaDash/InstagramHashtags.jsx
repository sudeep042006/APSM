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


export function InstagramHashtags({ data }) {
  if (!data) return <EmptyState title="Hashtag Analytics" description="Use hashtags in your posts to analyze which tags drive the most organic reach." icon={Hash} />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#161B22] border-white/5 text-white">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-200">Top Hashtags by Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" horizontal={false} />
                  <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis dataKey="tag" type="category" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} width={80} />
                  <Tooltip content={<DarkTooltip />} cursor={{ fill: "#ffffff05" }} />
                  <Bar dataKey="uses" name="Times Used" fill="#E1306C" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#161B22] border-white/5 text-white">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-200">Hashtag Performance Ranking</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 bg-white/5 uppercase border-y border-white/5">
                  <tr>
                    <th className="px-6 py-4 font-medium">Hashtag</th>
                    <th className="px-6 py-4 font-medium text-right">Reach Generated</th>
                    <th className="px-6 py-4 font-medium text-right">Contribution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.map((item, i) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-200">{item.tag}</td>
                      <td className="px-6 py-4 text-slate-200 text-right">{item.reach}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-emerald-400 font-medium">{item.percentage}%</span>
                          <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${item.percentage}%` }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }