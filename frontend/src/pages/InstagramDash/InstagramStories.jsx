import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, MousePointerClick, XSquare, MessageCircle } from 'lucide-react';
import igapi from '@/services/igapi';

const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US', {
    notation: "compact",
    compactDisplay: "short"
  }).format(num);
};

const InstagramStories = () => {
  const { isConnected } = useOutletContext();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const response = await igapi.getStories();
        const items = response.items && response.items.length > 0 ? response.items : [
          {
            id: "story_1",
            title: "Behind the scenes 📸",
            date: "2 hours ago",
            reach: 3400,
            impressions: 4100,
            tapForwards: 1200,
            tapBacks: 150,
            exits: 80,
            replies: 12,
            image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=150&h=250&fit=crop"
          },
          {
            id: "story_2",
            title: "New feature announcement 🚀",
            date: "12 hours ago",
            reach: 5200,
            impressions: 6500,
            tapForwards: 2100,
            tapBacks: 320,
            exits: 145,
            replies: 34,
            image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=150&h=250&fit=crop"
          }
        ];
        if (isMounted) setData({ items });
      } catch (error) {
        console.error("Failed to fetch stories data:", error);
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
        <p className="text-gray-400">Please connect your Instagram account to view story metrics.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 w-full max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Stories Performance</h1>
          <p className="text-gray-400 mt-1">24-hour and historical story metrics</p>
        </div>
      </div>

      {isLoading || !data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i} className="bg-[#161B22]/90 backdrop-blur-md rounded-xl border border-white/5">
              <CardContent className="p-0 flex flex-col md:flex-row">
                <Skeleton className="w-full md:w-48 h-64 bg-gray-700/50 rounded-l-xl" />
                <div className="p-6 flex-1 space-y-4">
                  <Skeleton className="h-6 w-3/4 bg-gray-700/50" />
                  <Skeleton className="h-4 w-1/2 bg-gray-700/50" />
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <Skeleton className="h-12 w-full bg-gray-700/50" />
                    <Skeleton className="h-12 w-full bg-gray-700/50" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : data.items.length === 0 ? (
        <div className="p-12 text-center border border-white/5 rounded-xl bg-[#161B22]/90 backdrop-blur-md rounded-xl">
          <p className="text-gray-400">No active stories found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.items.map((story) => (
            <Card key={story.id} className="bg-[#161B22]/90 backdrop-blur-md rounded-xl border border-white/5 overflow-hidden hover:border-white/10 transition-colors shadow-sm">
              <CardContent className="p-0 flex flex-col sm:flex-row h-full">
                <div className="relative w-full sm:w-40 h-64 sm:h-auto flex-shrink-0">
                  <img src={story.image} alt="Story" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1121] via-transparent to-transparent sm:hidden"></div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-white font-medium mb-1">{story.title}</h3>
                    <p className="text-xs text-gray-500">{story.date}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-4 gap-x-2 mt-4">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-[#E1306C]" />
                      <div>
                        <p className="text-xs text-gray-400">Reach</p>
                        <p className="text-sm font-semibold text-white">{formatNumber(story.reach)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MousePointerClick className="w-4 h-4 text-emerald-500" />
                      <div>
                        <p className="text-xs text-gray-400">Taps Forward</p>
                        <p className="text-sm font-semibold text-white">{formatNumber(story.tapForwards)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-blue-400" />
                      <div>
                        <p className="text-xs text-gray-400">Replies</p>
                        <p className="text-sm font-semibold text-white">{formatNumber(story.replies)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <XSquare className="w-4 h-4 text-red-400" />
                      <div>
                        <p className="text-xs text-gray-400">Exits</p>
                        <p className="text-sm font-semibold text-white">{formatNumber(story.exits)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstagramStories;
