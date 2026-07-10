import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import igapi from '@/services/igapi';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
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
        backgroundColor: 'rgba(22, 27, 34, 0.85)',
        backdropFilter: 'blur(12px)',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: '1px',
        color: '#fff',
        borderRadius: '8px',
        padding: '12px'
      }}>
        {label && <p className="font-semibold text-gray-200 mb-2">{label}</p>}
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm mb-1 last:mb-0">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
            <span className="text-gray-400 capitalize">{entry.name}:</span>
            <span className="font-medium text-white">{entry.value}%</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const COLORS = ['#E1306C', '#833AB4', '#F77737', '#FCAF45', '#405DE6'];

const InstagramAudience = () => {
  const { isConnected } = useOutletContext();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const response = await igapi.getAudience();
        if (isMounted) setData(response);
      } catch (error) {
        console.error("Failed to fetch audience data:", error);
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
        <p className="text-gray-400">Please connect your Instagram account to view audience metrics.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 w-full max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Audience Demographics</h1>
          <p className="text-gray-400 mt-1">Deep dive into your followers and non-followers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gender Donut */}
        <Card className="bg-[#161B22]/90 backdrop-blur-md rounded-xl border border-white/5">
          <CardHeader>
            <CardTitle className="text-lg text-white">Gender Split</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {isLoading || !data ? (
              <Skeleton className="w-full h-full bg-gray-700/30 rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.demographics.gender}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="type"
                    stroke="none"
                  >
                    {data.demographics.gender.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Age Distribution Bar */}
        <Card className="bg-[#161B22]/90 backdrop-blur-md rounded-xl border border-white/5">
          <CardHeader>
            <CardTitle className="text-lg text-white">Age Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {isLoading || !data ? (
              <Skeleton className="w-full h-full bg-gray-700/30 rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.demographics.ageRange} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="age" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                  <Bar dataKey="value" fill="#E1306C" radius={[4, 4, 0, 0]} name="Percentage" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Cities Horizontal Bar */}
        <Card className="bg-[#161B22]/90 backdrop-blur-md rounded-xl border border-white/5 md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg text-white">Top Cities</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {isLoading || !data ? (
              <Skeleton className="w-full h-full bg-gray-700/30 rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.demographics.topCities} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} width={80} />
                  <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                  <Bar dataKey="value" fill="#833AB4" radius={[0, 4, 4, 0]} name="Percentage" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InstagramAudience;
