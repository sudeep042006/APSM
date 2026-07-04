import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import igapi from '@/services/igapi';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts';

const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US', {
    notation: "compact",
    compactDisplay: "short"
  }).format(num);
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: 'rgba(22, 27, 34, 0.75)',
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
              {entry.name.includes('Rate') ? `${entry.value}%` : formatNumber(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const InstagramEngagement = () => {
  const { isConnected } = useOutletContext();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const response = await igapi.getEngagement();
        if (isMounted) setData(response);
      } catch (error) {
        console.error("Failed to fetch engagement data:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    if (isConnected) fetchData();
    else setIsLoading(false);
    return () => { isMounted = false; };
  }, [isConnected]);

  if (!isConnected) {
    return (
      <div className="p-4 md:p-8 flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-xl text-white font-semibold mb-2">Account Disconnected</h2>
        <p className="text-gray-400">Please connect your Instagram account to view engagement metrics.</p>
      </div>
    );
  }

  const getIconForType = (name) => {
    switch (name) {
      case 'Likes': return Heart;
      case 'Comments': return MessageCircle;
      case 'Shares': return Share2;
      case 'Saves': return Bookmark;
      default: return Heart;
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 w-full max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Engagement Overview</h1>
          <p className="text-gray-400 mt-1">Aggregated interaction metrics over time</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {isLoading || !data ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-[#161B22]/80 backdrop-blur-md border border-white/5">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-16 bg-gray-700/50" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24 bg-gray-700/50" />
              </CardContent>
            </Card>
          ))
        ) : (
          data.interactions.map((interaction, i) => {
            const Icon = getIconForType(interaction.name);
            return (
              <Card key={i} className="bg-[#161B22]/80 backdrop-blur-md border border-white/5 hover:border-white/10 transition-colors shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">{interaction.name}</CardTitle>
                  <Icon className="w-4 h-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{formatNumber(interaction.value)}</div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <Card className="bg-[#161B22]/80 backdrop-blur-md border border-white/5">
        <CardHeader>
          <CardTitle className="text-lg text-white">Engagement Rate Trend</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          {isLoading || !data ? (
            <Skeleton className="w-full h-full bg-gray-700/30 rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.trend} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FCAF45" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#FCAF45" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <Area type="monotone" dataKey="rate" stroke="#FCAF45" strokeWidth={3} fillOpacity={1} fill="url(#colorRate)" name="Engagement Rate" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InstagramEngagement;
