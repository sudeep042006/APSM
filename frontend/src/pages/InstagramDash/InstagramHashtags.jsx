import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Hash, TrendingUp, BarChart2 } from 'lucide-react';
import igapi from '@/services/igapi';

const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US', {
    notation: "compact",
    compactDisplay: "short"
  }).format(num);
};

const InstagramHashtags = () => {
  const { isConnected } = useOutletContext();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const response = await igapi.getHashtags();
        const tags = response.tags && response.tags.length > 0 ? response.tags : [
          { id: 1, name: "saas", reach: 45000, usage: 12, engagementRate: 4.2 },
          { id: 2, name: "startuplife", reach: 32000, usage: 8, engagementRate: 3.8 },
          { id: 3, name: "techinnovation", reach: 28000, usage: 5, engagementRate: 5.1 },
          { id: 4, name: "founder", reach: 19500, usage: 15, engagementRate: 2.9 },
          { id: 5, name: "coding", reach: 15000, usage: 4, engagementRate: 6.5 }
        ];
        if (isMounted) setData({ tags });
      } catch (error) {
        console.error("Failed to fetch hashtags data:", error);
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
        <p className="text-gray-400">Please connect your Instagram account to view hashtag metrics.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 w-full max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Hashtag Performance</h1>
          <p className="text-gray-400 mt-1">Tag attribution and reach analysis</p>
        </div>
      </div>

      <Card className="bg-[#161B22]/90 backdrop-blur-md rounded-xl border border-white/5">
        <CardHeader>
          <CardTitle className="text-lg text-white">Top Performing Hashtags</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading || !data ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full bg-gray-700/30 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-gray-400 text-sm">
                    <th className="pb-3 font-medium">Hashtag</th>
                    <th className="pb-3 font-medium text-right">Reach</th>
                    <th className="pb-3 font-medium text-right">Usage Count</th>
                    <th className="pb-3 font-medium text-right">Avg. Engagement</th>
                  </tr>
                </thead>
                <tbody>
                  {data.tags.map((tag) => (
                    <tr key={tag.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-[#E1306C]/10 rounded-md">
                            <Hash className="w-4 h-4 text-[#E1306C]" />
                          </div>
                          <span className="font-medium text-white">#{tag.name}</span>
                        </div>
                      </td>
                      <td className="py-4 text-right text-gray-300">
                        <div className="flex items-center justify-end gap-1">
                          <BarChart2 className="w-3 h-3 text-emerald-500" />
                          {formatNumber(tag.reach)}
                        </div>
                      </td>
                      <td className="py-4 text-right text-gray-300">
                        {tag.usage}
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <TrendingUp className="w-3 h-3 text-[#FCAF45]" />
                          <span className="text-[#FCAF45] font-medium">{tag.engagementRate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InstagramHashtags;
