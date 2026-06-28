import { Activity, BarChart3, Bookmark, Calendar, ChevronDown, Eye, FileText, Heart, HelpCircle, History, MessageCircle, MoreVertical, Settings, Share2, Target, ThumbsUp, TrendingDown, TrendingUp, Users, Video } from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockFacebookData } from "@/utils/metaMockData";

const FB_BLUE = "#1877F2";
const PIE_COLORS = ["#1877F2", "#10b981", "#8b5cf6", "#64748b"];
import { EmptyState, KpiCard, DarkTooltip, FacebookDataTable, InstagramDataTable, ProgressBar } from './MetaSharedComponents';


export function FacebookVideos({ data }) {
  const kpis = [
    { label: "Total Videos", value: "45" },
    { label: "Avg. Watch Time", value: "02:15" },
    { label: "Total Plays", value: "1.2M" },
    { label: "Top Retention", value: "42%" },
  ];
  return <FacebookDataTable data={data} title="Videos" icon={Video} kpis={kpis} />;
}