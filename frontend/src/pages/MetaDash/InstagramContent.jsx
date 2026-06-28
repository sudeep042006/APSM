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


export function InstagramContent({ data }) {
  const kpis = [
    { label: "Total Posts", value: "248" },
    { label: "Avg. Reach/Post", value: "12.4K" },
    { label: "Total Engagement", value: "32.1K" },
    { label: "Top Post Rate", value: "10.6%" },
  ];
  return <InstagramDataTable data={data} title="Posts" icon={FileText} kpis={kpis} />;
}