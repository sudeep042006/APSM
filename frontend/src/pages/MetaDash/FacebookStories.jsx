import { Activity, BarChart3, Bookmark, Calendar, ChevronDown, Eye, FileText, Heart, HelpCircle, History, MessageCircle, MoreVertical, Settings, Share2, Target, ThumbsUp, TrendingDown, TrendingUp, Users, Video } from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FB_BLUE = "#1877F2";
const PIE_COLORS = ["#1877F2", "#10b981", "#8b5cf6", "#64748b"];
import { EmptyState, KpiCard, DarkTooltip, FacebookDataTable, InstagramDataTable, ProgressBar } from './MetaSharedComponents';


export function FacebookStories({ data }) {
  const kpis = [
    { label: "Active Stories", value: "3" },
    { label: "Avg. Reach", value: "18.5K" },
    { label: "Completion Rate", value: "78%" },
    { label: "Total Replies", value: "420" },
  ];
  return <FacebookDataTable data={data} title="Stories" icon={History} kpis={kpis} />;
}