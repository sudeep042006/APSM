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


export function InstagramInsights({ data }) {
    if (!data) return <EmptyState title="Historical Insights" description="Filter through historical data ranges to uncover long-term trends for your Instagram account." icon={BarChart3} />;
  
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card className="bg-pink-500/10 border-pink-500/20 text-white hover:bg-pink-500/20 transition-colors cursor-default">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-pink-500/20 rounded-md">
                  <Calendar className="h-5 w-5 text-pink-400" />
                </div>
                <CardTitle className="text-sm font-medium text-pink-400">Best Time to Post</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold text-slate-100">{data.bestTimeToPost}</p>
              <p className="text-xs text-pink-400/80 mt-1">Based on peak audience activity</p>
            </CardContent>
          </Card>
  
          <Card className="bg-purple-500/10 border-purple-500/20 text-white hover:bg-purple-500/20 transition-colors cursor-default">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-purple-500/20 rounded-md">
                  <Video className="h-5 w-5 text-purple-400" />
                </div>
                <CardTitle className="text-sm font-medium text-purple-400">Top Format</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold text-slate-100">{data.topPerformingFormat}</p>
              <p className="text-xs text-purple-400/80 mt-1">Drives 45% more engagement</p>
            </CardContent>
          </Card>
  
          <Card className="bg-emerald-500/10 border-emerald-500/20 text-white hover:bg-emerald-500/20 transition-colors cursor-default">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-emerald-500/20 rounded-md">
                  <Users className="h-5 w-5 text-emerald-400" />
                </div>
                <CardTitle className="text-sm font-medium text-emerald-400">Top Audience</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold text-slate-100">{data.topAudienceSegment}</p>
              <p className="text-xs text-emerald-400/80 mt-1">Most active demographic</p>
            </CardContent>
          </Card>
  
          <Card className="bg-amber-500/10 border-amber-500/20 text-white hover:bg-amber-500/20 transition-colors cursor-default">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-amber-500/20 rounded-md">
                  <Target className="h-5 w-5 text-amber-400" />
                </div>
                <CardTitle className="text-sm font-medium text-amber-400">Recommendation</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold text-slate-100">{data.recommendedContentType}</p>
              <p className="text-xs text-amber-400/80 mt-1">Suggested for next campaign</p>
            </CardContent>
          </Card>
        </div>
  
        <Card className="bg-[#161B22] border-white/5 text-white">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-slate-200">Historical Insights</CardTitle>
            <p className="text-sm text-slate-400">Deep dive into long-term account trends.</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 p-12 justify-center flex-col border border-dashed border-white/10 rounded-lg">
              <BarChart3 className="h-12 w-12 text-slate-500 mb-2" />
              <p className="text-slate-300 font-medium">Insights Engine Syncing</p>
              <p className="text-sm text-slate-500 text-center max-w-md">We are currently building your historical data index. Check back soon for deep historical analytics and year-over-year comparisons.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }