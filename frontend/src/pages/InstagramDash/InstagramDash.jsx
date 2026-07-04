import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import igapi from '@/services/igapi';
import { Users, Eye, Target, MousePointer2 } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

// ── Utilities ────────────────────────────────────────────────────────
const calculateTrend = (current, previous) => {
  if (!previous) return 0;
  return (((current - previous) / previous) * 100).toFixed(1);
};

const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US', {
    notation: "compact",
    compactDisplay: "short"
  }).format(num);
};

// ── Components ───────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: 'rgba(22, 27, 34, 0.85)',
        backdropFilter: 'blur(12px)',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: '1px',
        color: '#fff',
        borderRadius: '8px',
        padding: '12px'
      }}>
        <p className="font-semibold text-gray-200 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm mb-1 last:mb-0">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
            <span className="text-gray-400 capitalize">{entry.name}:</span>
            <span className="font-medium text-white">
              {entry.name.includes('%') ? `${entry.value}%` : formatNumber(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ── Main Dashboard ───────────────────────────────────────────────────
const InstagramDash = () => {
  const { profile, isConnected, isLayoutLoading } = useOutletContext();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const fetchOverviewData = async () => {
      try {
        // Fetch only the overview data slice for this specific page
        const overviewData = await igapi.getOverviewMetrics();
        if (isMounted) {
          setData(overviewData);
        }
      } catch (error) {
        console.error("Failed to fetch overview metrics:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchOverviewData();

    return () => {
      isMounted = false;
    };
  }, []);

  const kpis = [
    { 
      id: 'accounts-reached', 
      title: 'Accounts Reached', 
      icon: Target, 
      current: data?.kpis?.accountsReached?.current, 
      previous: data?.kpis?.accountsReached?.previous 
    },
    { 
      id: 'accounts-engaged', 
      title: 'Accounts Engaged', 
      icon: Eye, 
      current: data?.kpis?.accountsEngaged?.current, 
      previous: data?.kpis?.accountsEngaged?.previous 
    },
    { 
      id: 'total-followers', 
      title: 'Total Followers', 
      icon: Users, 
      current: data?.kpis?.totalFollowers?.current, 
      previous: data?.kpis?.totalFollowers?.previous 
    },
    { 
      id: 'content-interactions', 
      title: 'Content Interactions', 
      icon: MousePointer2, 
      current: data?.kpis?.contentInteractions?.current, 
      previous: data?.kpis?.contentInteractions?.previous 
    }
  ];

  return (
    <div className="p-4 md:p-8 space-y-8 w-full max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            Instagram Overview
          </h1>
          <p className="text-gray-400 mt-1">Key metrics and profile performance</p>
        </div>
        
        {/* Profile Card Summary */}
        {isLayoutLoading ? (
          <Skeleton className="h-16 w-64 bg-[#161B22]/50 rounded-xl" />
        ) : profile ? (
          <div className="flex items-center gap-3 bg-[#161B22]/90 backdrop-blur-md p-3 rounded-xl border border-white/5 shadow-sm">
            <img 
              src={profile.profilePicture} 
              alt="Profile" 
              className="w-10 h-10 rounded-full border border-gray-700 object-cover"
            />
            <div>
              <p className="text-sm font-medium text-white">{profile.handle}</p>
              <p className="text-xs text-gray-400">{formatNumber(profile.totalFollowers)} followers</p>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-400 bg-[#161B22]/90 backdrop-blur-md p-3 rounded-xl border border-white/5">
            Not Connected
          </div>
        )}
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => {
          if (isLoading) {
            return (
              <Card key={idx} className="bg-[#161B22]/80 backdrop-blur-md border border-white/5 shadow-sm">
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24 bg-gray-700/50" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-32 bg-gray-700/50 mb-2" />
                  <Skeleton className="h-4 w-16 bg-gray-700/50" />
                </CardContent>
              </Card>
            );
          }

          const trend = calculateTrend(kpi.current, kpi.previous);
          const isPositive = trend >= 0;

          return (
            <Card 
              key={kpi.id} 
              className="bg-[#161B22]/90 backdrop-blur-md rounded-xl border border-white/5 hover:border-white/10 transition-all cursor-pointer group shadow-sm"
              onClick={() => navigate(`/dashboard/instagram/metrics/${kpi.id}`)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                    {kpi.title}
                  </div>
                  <div className="bg-[#E1306C]/10 text-[#E1306C] p-3 rounded-full group-hover:bg-[#E1306C]/20 transition-colors">
                    <kpi.icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mt-2">
                  {formatNumber(kpi.current)}
                </div>
                <div className={`text-sm flex items-center gap-1 mt-2 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isPositive ? '+' : ''}{trend}% <span className="text-gray-500 font-normal">vs last period</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#161B22]/90 backdrop-blur-md rounded-xl border border-white/5 shadow-sm col-span-1 lg:col-span-1 min-h-[350px]">
          <CardHeader>
            <CardTitle className="text-lg text-white font-semibold">Reach & Impressions Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {isLoading || !data ? (
              <Skeleton className="w-full h-full bg-gray-700/30 rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.reachTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E1306C" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#E1306C" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#833AB4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#833AB4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => formatNumber(value)} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area type="monotone" dataKey="reach" stroke="#E1306C" strokeWidth={2} fillOpacity={1} fill="url(#colorReach)" name="Reach" />
                  <Area type="monotone" dataKey="impressions" stroke="#833AB4" strokeWidth={2} fillOpacity={1} fill="url(#colorImpressions)" name="Impressions" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-[#161B22]/80 backdrop-blur-md border border-white/5 shadow-sm col-span-1 lg:col-span-1 min-h-[350px]">
          <CardHeader>
            <CardTitle className="text-lg text-white font-semibold">Audience Age Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
             {isLoading || !data ? (
              <Skeleton className="w-full h-full bg-gray-700/30 rounded-lg" />
             ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.audience.ageRange} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis dataKey="age" type="category" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                  <Bar dataKey="value" fill="#E1306C" radius={[0, 4, 4, 0]} name="Percentage (%)" />
                </BarChart>
              </ResponsiveContainer>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InstagramDash;
