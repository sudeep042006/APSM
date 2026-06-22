import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Shield, Link2, ShieldCheck, CheckCircle2, XCircle, RefreshCw, Calendar, 
  Eye, TrendingUp, Users, Clock, Percent, LayoutDashboard, Share2, 
  Video, Terminal, User, Bell, ChevronRight, Activity, ArrowUpRight
} from 'lucide-react';
import { Youtube, Facebook, Instagram } from '../components/BrandIcons';

const Dashboard = () => {
  const { user, refreshUser, logout } = useAuth();
  const [platformStatuses, setPlatformStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // overview, integrations, videos, logs

  // Analytics Chart State
  const [chartDataType, setChartDataType] = useState('views'); // views, subscribers
  const [hoveredDataPoint, setHoveredDataPoint] = useState(null);

  // Simulated System Logs
  const [systemLogs, setSystemLogs] = useState([
    { id: 1, time: '16:31:02', type: 'system', text: 'Initializing SocialOS Client Core...' },
    { id: 2, time: '16:31:05', type: 'auth', text: 'Verifying active JWT session...' },
    { id: 3, time: '16:31:06', type: 'api', text: 'GET /auth/me - status 200 (Success)' },
  ]);

  // Fetch connection statuses from the backend
  const fetchStatuses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/status');
      setPlatformStatuses(response.data.status);
      
      // Append logs
      addLog('api', 'GET /auth/status - Connection statuses synced');
      
      // If youtube is connected, append success log
      const yt = response.data.status.find(p => p.platform === 'youtube');
      if (yt && yt.connected) {
        addLog('system', `YouTube channel connected: @${yt.username}`);
      }
    } catch (error) {
      console.error('Failed to load platform statuses:', error);
      setErrorMessage('Failed to load platform connections. Please check if backend is online.');
      addLog('error', 'GET /auth/status - Connection refused');
    } finally {
      setLoading(false);
    }
  };

  const addLog = (type, text) => {
    const timeString = new Date().toTimeString().split(' ')[0];
    setSystemLogs(prev => [
      ...prev,
      { id: Date.now() + Math.random(), time: timeString, type, text }
    ].slice(-50)); // Keep last 50 logs
  };

  useEffect(() => {
    fetchStatuses();
    refreshUser();
  }, []);

  // Initiate OAuth flow by navigating the browser to the backend endpoint with the token
  const handleConnect = (platform) => {
    const token = localStorage.getItem('incubein_token');
    if (!token) {
      setErrorMessage('Auth token not found. Please log in again.');
      addLog('error', 'OAuth aborted: Missing JWT session token');
      return;
    }
    addLog('auth', `Redirecting browser to OAuth gateway: /auth/${platform}`);
    window.location.href = `${import.meta.env.VITE_BASE_URL}/auth/${platform}?token=${token}`;
  };

  // Disconnect a platform
  const handleDisconnect = async (platform) => {
    setDisconnecting(platform);
    setErrorMessage('');
    addLog('api', `DELETE /auth/${platform} - Initiating disconnect`);
    try {
      await api.delete(`/auth/${platform}`);
      addLog('system', `Successfully disconnected ${platform} integration.`);
      await refreshUser();
      await fetchStatuses();
    } catch (error) {
      console.error(`Failed to disconnect ${platform}:`, error);
      setErrorMessage(error.response?.data?.error || `Failed to disconnect ${platform}.`);
      addLog('error', `DELETE /auth/${platform} failed: ${error.message}`);
    } finally {
      setDisconnecting(null);
    }
  };

  const getPlatformMeta = (platform) => {
    switch (platform.toLowerCase()) {
      case 'youtube':
        return {
          name: 'YouTube',
          icon: <Youtube className="text-red-500 fill-red-500/10" size={24} />,
          badgeColor: 'bg-red-500/10 text-red-400 border-red-500/20',
          gradient: 'from-red-500/10 to-orange-500/5 border-red-500/20',
          btnColor: 'bg-red-600 hover:bg-red-500 shadow-red-600/20',
        };
      case 'facebook':
        return {
          name: 'Facebook',
          icon: <Facebook className="text-blue-500 fill-blue-500/10" size={24} />,
          badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          gradient: 'from-blue-500/10 to-cyan-500/5 border-blue-500/20',
          btnColor: 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20',
        };
      case 'instagram':
        return {
          name: 'Instagram',
          icon: <Instagram className="text-pink-500" size={24} />,
          badgeColor: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
          gradient: 'from-pink-500/10 to-rose-500/5 border-pink-500/20',
          btnColor: 'bg-pink-600 hover:bg-pink-500 shadow-pink-600/20',
        };
      default:
        return {
          name: platform,
          icon: <Link2 className="text-purple-500" size={24} />,
          badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
          gradient: 'from-purple-500/10 to-indigo-500/5 border-purple-500/20',
          btnColor: 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/20',
        };
    }
  };

  // Mock data for analytics
  const analyticsMetrics = [
    { title: 'Total Subscribers', value: '14,820', change: '+12.4%', label: 'vs last week', icon: <Users size={20} className="text-purple-400" /> },
    { title: 'Estimated Views', value: '342,912', change: '+8.2%', label: 'vs last week', icon: <Eye size={20} className="text-blue-400" /> },
    { title: 'Watch Time (Hours)', value: '18,450', change: '+14.1%', label: 'vs last week', icon: <Clock size={20} className="text-emerald-400" /> },
    { title: 'Engagement Rate', value: '6.45%', change: '+0.8%', label: 'vs last week', icon: <Percent size={20} className="text-pink-400" /> },
  ];

  const chartData = {
    views: [
      { day: 'Jun 05', val: 12000, label: '12,000 views' },
      { day: 'Jun 06', val: 18000, label: '18,000 views' },
      { day: 'Jun 07', val: 15000, label: '15,000 views' },
      { day: 'Jun 08', val: 24000, label: '24,000 views' },
      { day: 'Jun 09', val: 32000, label: '32,000 views' },
      { day: 'Jun 10', val: 28000, label: '28,000 views' },
      { day: 'Jun 11', val: 36000, label: '36,000 views' },
    ],
    subscribers: [
      { day: 'Jun 05', val: 450, label: '+450 subs' },
      { day: 'Jun 06', val: 620, label: '+620 subs' },
      { day: 'Jun 07', val: 510, label: '+510 subs' },
      { day: 'Jun 08', val: 840, label: '+840 subs' },
      { day: 'Jun 09', val: 1100, label: '+1,100 subs' },
      { day: 'Jun 10', val: 980, label: '+980 subs' },
      { day: 'Jun 11', val: 1240, label: '+1,240 subs' },
    ]
  };

  const currentChartPoints = chartData[chartDataType];
  // Chart dimensions config
  const chartHeight = 160;
  const chartWidth = 500;
  const maxVal = Math.max(...currentChartPoints.map(p => p.val));
  const pointsString = currentChartPoints.map((p, index) => {
    const x = (index / (currentChartPoints.length - 1)) * chartWidth;
    const y = chartHeight - (p.val / maxVal) * (chartHeight - 20) - 10;
    return `${x},${y}`;
  }).join(' ');

  const areaString = `${pointsString} ${chartWidth},${chartHeight} 0,${chartHeight}`;

  // Mock synced video stream data
  const syncedVideos = [
    { id: 'v1', title: 'Ultimate Guide to Next.js API Routes & Middleware', platform: 'youtube', thumbnail: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&w=120&q=80', views: '24.1k', likes: '1.8k', date: 'Jun 08, 2026', status: 'Synced' },
    { id: 'v2', title: 'Why I Switched from Tailwind CSS to Vanilla CSS', platform: 'youtube', thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=120&q=80', views: '18.2k', likes: '1.2k', date: 'Jun 04, 2026', status: 'Synced' },
    { id: 'v3', title: 'Behind the Scenes: My Coding Workflow Secrets', platform: 'youtube', thumbnail: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=120&q=80', views: '12.5k', likes: '890', date: 'May 28, 2026', status: 'Synced' },
  ];

  return (
    <div className="flex min-h-screen bg-[#070a13]">
      
      {/* 1. Sidebar Panel */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-950 border-r border-slate-900 shrink-0">
        {/* Brand header */}
        <div className="p-6 border-b border-slate-900 flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
            <span className="font-extrabold text-white text-base">S</span>
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white tracking-tight leading-none">SocialOS</h2>
            <span className="text-[10px] text-purple-400 font-bold tracking-widest uppercase">Admin Hub</span>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === 'overview'
                ? 'bg-purple-600/10 text-purple-400 border-l-4 border-purple-500 pl-3'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </button>
          
          <button
            onClick={() => setActiveTab('integrations')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === 'integrations'
                ? 'bg-purple-600/10 text-purple-400 border-l-4 border-purple-500 pl-3'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <Share2 size={18} />
            <span>Integrations</span>
            {platformStatuses.some(p => p.connected) && (
              <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('videos')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === 'videos'
                ? 'bg-purple-600/10 text-purple-400 border-l-4 border-purple-500 pl-3'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <Video size={18} />
            <span>Video Stream</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === 'logs'
                ? 'bg-purple-600/10 text-purple-400 border-l-4 border-purple-500 pl-3'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <Terminal size={18} />
            <span>System Log</span>
          </button>
        </nav>

        {/* User Card inside Sidebar */}
        <div className="p-4 border-t border-slate-900">
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm uppercase">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-200 truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-500 truncate mt-0.5">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col min-w-0">
        
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 bg-[#070a13]/80 backdrop-blur-md border-b border-slate-900/60 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-semibold text-slate-400 capitalize md:block hidden">
              Current Portal / {activeTab}
            </h2>
            {/* Mobile hamburger navigation mock */}
            <div className="flex md:hidden gap-1.5 overflow-x-auto">
              {['overview', 'integrations', 'videos', 'logs'].map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`text-[10px] px-3 py-1.5 rounded-lg border font-bold uppercase tracking-wider transition-all ${
                    activeTab === t
                      ? 'bg-purple-600/10 border-purple-500/30 text-purple-400'
                      : 'bg-slate-900/40 border-slate-800/80 text-slate-500'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Health Endpoint Check */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950/60 border border-slate-900 rounded-lg text-[10px] font-bold text-slate-400 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>API Gateway Status: OK</span>
            </div>
            
            <button
              onClick={fetchStatuses}
              disabled={loading}
              className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl transition-all"
              title="Refresh Data"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </header>

        {/* Dashboard Inner Body */}
        <div className="p-6 md:p-8 space-y-8 flex-1 overflow-y-auto">
          
          {errorMessage && (
            <div className="bg-red-950/30 border border-red-900/50 text-red-400 rounded-2xl p-4 flex items-start gap-3 text-sm animate-fade-in">
              <XCircle className="shrink-0 mt-0.5" size={18} />
              <div>
                <p className="font-bold">Database / Connection Error</p>
                <p className="text-slate-300 mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in">
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {analyticsMetrics.map((item, idx) => (
                  <div key={idx} className="glass-panel glass-card rounded-2xl p-5 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{item.title}</span>
                      <div className="w-8 h-8 rounded-lg bg-slate-950/40 border border-slate-800/40 flex items-center justify-center">
                        {item.icon}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
                        {item.value}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/10 flex items-center gap-0.5">
                          <TrendingUp size={10} />
                          {item.change}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">{item.label}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chart & Recent Activity Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* SVG Chart Panel */}
                <div className="lg:col-span-2 glass-panel rounded-2xl p-6 relative">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-extrabold text-white tracking-tight">Channel Progress Insights</h3>
                      <p className="text-xs text-slate-400">Activity monitor for views and subscribers</p>
                    </div>
                    {/* Switch buttons */}
                    <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-1 flex gap-1">
                      <button
                        onClick={() => setChartDataType('views')}
                        className={`text-[10px] px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-all ${
                          chartDataType === 'views'
                            ? 'bg-purple-600 text-white'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        Views
                      </button>
                      <button
                        onClick={() => setChartDataType('subscribers')}
                        className={`text-[10px] px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-all ${
                          chartDataType === 'subscribers'
                            ? 'bg-purple-600 text-white'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        Subs
                      </button>
                    </div>
                  </div>

                  {/* SVG Chart rendering */}
                  <div className="relative pt-4 w-full h-[180px] bg-slate-950/20 border border-slate-900/60 rounded-xl p-4">
                    {/* Tooltip Overlay */}
                    {hoveredDataPoint !== null && (
                      <div
                        className="absolute bg-slate-900/90 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl text-xs shadow-2xl z-10 -translate-x-1/2 -translate-y-full flex flex-col gap-0.5 pointer-events-none"
                        style={{
                          left: `${(hoveredDataPoint / (currentChartPoints.length - 1)) * 90 + 5}%`,
                          top: `${chartHeight - (currentChartPoints[hoveredDataPoint].val / maxVal) * (chartHeight - 40) - 20}px`
                        }}
                      >
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          {currentChartPoints[hoveredDataPoint].day}
                        </span>
                        <span className="font-extrabold text-white">
                          {currentChartPoints[hoveredDataPoint].label}
                        </span>
                      </div>
                    )}

                    <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
                      <defs>
                        <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25"/>
                          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0"/>
                        </linearGradient>
                      </defs>

                      {/* X & Y grids */}
                      <line x1="0" y1="40" x2={chartWidth} y2="40" stroke="#1e293b" strokeDasharray="3" strokeWidth="0.5"/>
                      <line x1="0" y1="80" x2={chartWidth} y2="80" stroke="#1e293b" strokeDasharray="3" strokeWidth="0.5"/>
                      <line x1="0" y1="120" x2={chartWidth} y2="120" stroke="#1e293b" strokeDasharray="3" strokeWidth="0.5"/>

                      {/* Area Fill */}
                      <polygon points={areaString} fill="url(#chart-area-grad)" />

                      {/* Smooth Line Path */}
                      <polyline
                        fill="none"
                        stroke="#a78bfa"
                        strokeWidth="2.5"
                        points={pointsString}
                      />

                      {/* Data Point Dots & Hover Hotspots */}
                      {currentChartPoints.map((p, index) => {
                        const x = (index / (currentChartPoints.length - 1)) * chartWidth;
                        const y = chartHeight - (p.val / maxVal) * (chartHeight - 20) - 10;
                        return (
                          <g key={index}>
                            <circle
                              cx={x}
                              cy={y}
                              r="4"
                              fill="#ffffff"
                              stroke="#8b5cf6"
                              strokeWidth="2"
                              className="transition-all duration-150 cursor-pointer"
                            />
                            {/* Larger transparent hitboxes for easy hovering */}
                            <circle
                              cx={x}
                              cy={y}
                              r="16"
                              fill="transparent"
                              className="cursor-pointer"
                              onMouseEnter={() => setHoveredDataPoint(index)}
                              onMouseLeave={() => setHoveredDataPoint(null)}
                            />
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  {/* X axis labels */}
                  <div className="flex justify-between mt-3 px-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    {currentChartPoints.map((p, idx) => (
                      <span key={idx}>{p.day}</span>
                    ))}
                  </div>
                </div>

                {/* Right Column: Platform quick checklist */}
                <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-extrabold text-white tracking-tight">Active Integrations</h3>
                    <p className="text-xs text-slate-400 mb-6">Unified account synchronization</p>

                    <div className="space-y-4">
                      {loading ? (
                        [1, 2].map(n => <div key={n} className="h-16 w-full rounded-xl bg-slate-900 shimmer"></div>)
                      ) : (
                        platformStatuses.map((status) => {
                          const meta = getPlatformMeta(status.platform);
                          return (
                            <div key={status.platform} className="flex items-center justify-between p-4 bg-slate-950/40 border border-slate-900 rounded-xl hover:border-slate-800 transition-all">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg">
                                  {meta.icon}
                                </div>
                                <div className="text-left">
                                  <span className="text-sm font-bold text-slate-200 block">{meta.name}</span>
                                  {status.connected ? (
                                    <span className="text-[10px] text-emerald-400 font-medium">@{status.username}</span>
                                  ) : (
                                    <span className="text-[10px] text-slate-500 font-medium">Disconnected</span>
                                  )}
                                </div>
                              </div>

                              <div>
                                {status.connected ? (
                                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/10 px-2 py-0.5 rounded-full font-bold">
                                    <CheckCircle2 size={12} />
                                    <span>Sync</span>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setActiveTab('integrations')}
                                    className="flex items-center gap-1 text-[10px] text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-lg font-bold hover:bg-purple-500/20 transition-all"
                                  >
                                    <span>Connect</span>
                                    <ChevronRight size={12} />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div className="border-t border-slate-900 pt-4 mt-6">
                    <button
                      onClick={() => setActiveTab('integrations')}
                      className="w-full flex items-center justify-center gap-2 text-xs font-bold text-slate-400 bg-slate-950 hover:bg-slate-900 border border-slate-900 rounded-xl py-3 transition-all"
                    >
                      <span>Manage All Integrations</span>
                      <ArrowUpRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INTEGRATIONS */}
          {activeTab === 'integrations' && (
            <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
              <div className="glass-panel rounded-2xl p-6">
                <h3 className="text-xl font-extrabold text-white mb-2">Connect Platform APIs</h3>
                <p className="text-slate-400 text-xs mb-6">
                  Authorize SocialOS to track analytics, view recent posts, and upload content directly to your accounts.
                </p>

                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="w-full h-32 rounded-2xl bg-slate-900 shimmer"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-5">
                    {platformStatuses.map((status) => {
                      const meta = getPlatformMeta(status.platform);
                      return (
                        <div
                          key={status.platform}
                          className={`relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 ${
                            status.connected
                              ? `bg-gradient-to-br ${meta.gradient} shadow-lg shadow-black/20`
                              : 'bg-slate-900/10 border-slate-900 hover:border-slate-800'
                          }`}
                        >
                          {/* Connection badge */}
                          <span
                            className={`absolute top-5 right-5 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                              status.connected
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                                : 'bg-slate-950/80 text-slate-500 border-slate-800/80'
                            }`}
                          >
                            {status.connected ? (
                              <>
                                <ShieldCheck size={14} />
                                Active
                              </>
                            ) : (
                              <>
                                <XCircle size={14} />
                                Disconnected
                              </>
                            )}
                          </span>

                          <div className="flex items-start gap-4">
                            <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800 shadow-md">
                              {meta.icon}
                            </div>

                            <div className="flex-1 text-left">
                              <h4 className="text-lg font-bold text-white leading-tight capitalize">
                                {status.platform} API Channel Sync
                              </h4>
                              
                              {status.connected ? (
                                <div className="mt-3 space-y-2 text-xs text-slate-300 max-w-lg">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle2 className="text-emerald-400 shrink-0" size={15} />
                                    <span>
                                      Synced Account: <strong className="text-white">@{status.username}</strong>
                                    </span>
                                  </div>
                                  {status.connectedAt && (
                                    <div className="flex items-center gap-2 text-slate-400">
                                      <Calendar size={13} />
                                      <span>
                                        Linked on: {new Date(status.connectedAt).toLocaleString()}
                                      </span>
                                    </div>
                                  )}
                                  {status.expiresAt && (
                                    <div className="flex items-center gap-2 text-slate-400">
                                      <Calendar size={13} />
                                      <span>
                                        Token valid until: {new Date(status.expiresAt).toLocaleString()}
                                        {status.isExpired && (
                                          <span className="ml-2 bg-red-500/20 text-red-400 border border-red-500/30 text-[9px] font-bold px-1.5 rounded">
                                            Expired
                                          </span>
                                        )}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <p className="text-xs text-slate-500 mt-2 max-w-md">
                                  Synchronize your channel views, engagement reports, and audience growth charts dynamically.
                                </p>
                              )}

                              {/* Connect/Disconnect Triggers */}
                              <div className="mt-6 flex gap-3">
                                {status.connected ? (
                                  <button
                                    onClick={() => handleDisconnect(status.platform)}
                                    disabled={disconnecting === status.platform}
                                    className="bg-slate-950/60 hover:bg-red-950/20 border border-slate-800/80 hover:border-red-900/50 hover:text-red-400 text-slate-300 font-semibold px-4 py-2.5 rounded-xl text-xs transition-all active:scale-[0.98] disabled:opacity-50"
                                  >
                                    {disconnecting === status.platform ? (
                                      <span className="flex items-center gap-1.5">
                                        <div className="w-3.5 h-3.5 border border-red-400/20 border-t-red-400 rounded-full animate-spin"></div>
                                        Revoking Access...
                                      </span>
                                    ) : (
                                      'Revoke Integration'
                                    )}
                                  </button>
                                ) : (
                                  <button
                                    id={`connect-${status.platform}`}
                                    onClick={() => handleConnect(status.platform)}
                                    className={`text-white font-semibold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all duration-300 active:scale-[0.98] shadow-lg ${meta.btnColor}`}
                                  >
                                    <span>Initiate OAuth Connection</span>
                                    <Link2 size={13} />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: VIDEOS STREAM */}
          {activeTab === 'videos' && (
            <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
              <div className="glass-panel rounded-2xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-extrabold text-white">Video Stream Optimizer</h3>
                  <span className="text-[10px] bg-purple-500/10 border border-purple-500/25 text-purple-400 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                    Synced Content Feed
                  </span>
                </div>
                <p className="text-slate-400 text-xs mb-6">
                  Verify performance analytics of uploaded content. Click Sync to trigger API fetches.
                </p>

                <div className="space-y-4">
                  {syncedVideos.map((video) => (
                    <div key={video.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-slate-900/30 border border-slate-900 rounded-2xl hover:border-slate-800/80 transition-all">
                      <div className="flex items-center gap-4">
                        <img
                          src={video.thumbnail}
                          alt="Thumbnail"
                          className="w-20 h-12 rounded-lg object-cover border border-slate-800 shrink-0"
                        />
                        <div className="text-left">
                          <h4 className="text-sm font-bold text-slate-100 line-clamp-1 leading-snug">{video.title}</h4>
                          <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                            <span className="flex items-center gap-1">
                              <Eye size={12} />
                              {video.views} Views
                            </span>
                            <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                            <span>{video.date}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto justify-between border-t border-slate-900/60 pt-3 sm:border-t-0 sm:pt-0">
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/10 px-2.5 py-1 rounded-lg font-bold">
                          <CheckCircle2 size={13} />
                          <span>{video.status}</span>
                        </div>
                        
                        <button
                          onClick={() => addLog('system', `Forcing analytics refresh for video ${video.id}...`)}
                          className="text-xs font-bold text-slate-300 bg-slate-950 border border-slate-800 hover:bg-slate-900 rounded-xl px-3.5 py-2 transition-all active:scale-[0.97]"
                        >
                          Refresh Data
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SYSTEM LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
              <div className="glass-panel rounded-2xl p-6 flex flex-col min-h-[400px]">
                <div className="flex items-center justify-between border-b border-slate-900 pb-4 mb-4">
                  <div>
                    <h3 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                      <Terminal className="text-purple-400 animate-pulse" size={20} />
                      <span>SocialOS API Console Logs</span>
                    </h3>
                    <p className="text-xs text-slate-400">Verifying transaction queries and state responses</p>
                  </div>
                  <button
                    onClick={() => setSystemLogs([])}
                    className="text-xs font-bold text-slate-400 hover:text-slate-200 transition-all bg-slate-950 border border-slate-900 rounded-lg px-3 py-1.5"
                  >
                    Clear Logs
                  </button>
                </div>

                {/* Console view */}
                <div className="flex-1 bg-slate-950 border border-slate-900 rounded-xl p-4 font-mono text-xs overflow-y-auto space-y-2 text-left h-[300px]">
                  {systemLogs.length === 0 ? (
                    <p className="text-slate-600 italic">No logs generated. Perform API calls to watch terminal processes.</p>
                  ) : (
                    systemLogs.map((log) => {
                      let typeColor = 'text-purple-400';
                      if (log.type === 'auth') typeColor = 'text-amber-400';
                      if (log.type === 'api') typeColor = 'text-blue-400';
                      if (log.type === 'error') typeColor = 'text-red-400';

                      return (
                        <div key={log.id} className="leading-relaxed border-b border-slate-900/30 pb-1">
                          <span className="text-slate-500">[{log.time}]</span>{' '}
                          <span className={`${typeColor} font-bold`}>[{log.type.toUpperCase()}]</span>{' '}
                          <span className="text-slate-300">{log.text}</span>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="mt-4 flex gap-2 justify-end">
                  <button
                    onClick={() => addLog('api', 'PING /health - Heartbeat response status 200')}
                    className="text-[10px] text-slate-400 bg-slate-950 hover:bg-slate-900 border border-slate-900 rounded-lg px-3 py-1.5 font-bold uppercase tracking-wider transition-all"
                  >
                    Test Health Connection
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

    </div>
  );
};

export default Dashboard;
