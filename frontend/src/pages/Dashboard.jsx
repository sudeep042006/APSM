import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Shield, Link2, ShieldCheck, CheckCircle2, XCircle, RefreshCw, Calendar, Eye } from 'lucide-react';
import { Youtube, Facebook, Instagram } from '../components/BrandIcons';

const Dashboard = () => {
  const { user, refreshUser } = useAuth();
  const [platformStatuses, setPlatformStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch connection statuses from the backend
  const fetchStatuses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/status');
      setPlatformStatuses(response.data.status);
    } catch (error) {
      console.error('Failed to load platform statuses:', error);
      setErrorMessage('Failed to load platform connections. Please check if backend is online.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
    // Refresh user details just in case
    refreshUser();
  }, []);

  // Initiate OAuth flow by navigating the browser to the backend endpoint with the token
  const handleConnect = (platform) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setErrorMessage('Auth token not found. Please log in again.');
      return;
    }
    // Redirect standard browser location to backend route
    window.location.href = `http://localhost:5000/auth/${platform}?token=${token}`;
  };

  // Disconnect a platform
  const handleDisconnect = async (platform) => {
    setDisconnecting(platform);
    setErrorMessage('');
    try {
      await api.delete(`/auth/${platform}`);
      // Refresh user and platform statuses
      await refreshUser();
      await fetchStatuses();
    } catch (error) {
      console.error(`Failed to disconnect ${platform}:`, error);
      setErrorMessage(error.response?.data?.error || `Failed to disconnect ${platform}.`);
    } finally {
      setDisconnecting(null);
    }
  };

  // Return the platform-specific visual assets (color, icon)
  const getPlatformMeta = (platform) => {
    switch (platform.toLowerCase()) {
      case 'youtube':
        return {
          name: 'YouTube',
          icon: <Youtube className="text-red-500 fill-red-500/10" size={32} />,
          badgeColor: 'bg-red-500/10 text-red-400 border-red-500/20',
          gradient: 'from-red-500/20 to-orange-500/20 border-red-500/30',
          btnColor: 'bg-red-600 hover:bg-red-500 shadow-red-600/20',
        };
      case 'facebook':
        return {
          name: 'Facebook',
          icon: <Facebook className="text-blue-500 fill-blue-500/10" size={32} />,
          badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          gradient: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
          btnColor: 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20',
        };
      case 'instagram':
        return {
          name: 'Instagram',
          icon: <Instagram className="text-pink-500" size={32} />,
          badgeColor: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
          gradient: 'from-pink-500/20 to-rose-500/20 border-pink-500/30',
          btnColor: 'bg-pink-600 hover:bg-pink-500 shadow-pink-600/20',
        };
      default:
        return {
          name: platform,
          icon: <Link2 className="text-purple-500" size={32} />,
          badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
          gradient: 'from-purple-500/20 to-indigo-500/20 border-purple-500/30',
          btnColor: 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/20',
        };
    }
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">SocialOS Analytics Dashboard</h2>
          <p className="text-slate-400 mt-1">Manage platform connections and view sync statuses</p>
        </div>
        <button
          onClick={fetchStatuses}
          disabled={loading}
          className="flex items-center gap-2 self-start bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 px-4 py-2 rounded-xl text-sm transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span>Reload Connection Status</span>
        </button>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-8 bg-red-950/30 border border-red-900/50 text-red-400 rounded-xl p-4 flex items-start gap-3 text-sm">
          <XCircle className="shrink-0 mt-0.5" size={18} />
          <div className="flex-1">
            <p className="font-semibold">Error Occurred</p>
            <p className="text-slate-300 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - User info Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
            {/* Subtle glow */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-purple-600/20 rounded-full blur-2xl"></div>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-purple-600/10 flex items-center justify-center text-purple-400">
                <Shield size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white leading-tight">User Account</h3>
                <span className="text-[10px] bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full px-2.5 py-0.5 font-bold uppercase tracking-wider mt-1 inline-block">
                  Verified Session
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Account Name</p>
                <p className="text-slate-200 font-medium text-base mt-0.5">{user?.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Email Address</p>
                <p className="text-slate-200 font-medium text-base mt-0.5">{user?.email}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">User ID</p>
                <code className="text-slate-400 text-xs mt-1 block w-full truncate bg-slate-950/40 px-2 py-1 rounded border border-slate-800/40">
                  {user?.id}
                </code>
              </div>
            </div>
          </div>

          {/* Quick Stats Summary Card */}
          <div className="glass-panel rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Sync Statistics</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-900">
                <span className="text-slate-400 text-sm">Active Connections</span>
                <span className="font-bold text-purple-400 text-lg">
                  {platformStatuses.filter((p) => p.connected).length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-900">
                <span className="text-slate-400 text-sm">Available Channels</span>
                <span className="font-bold text-slate-200 text-lg">
                  {platformStatuses.length || 3}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Platform Statuses */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Channel Integration Status</h3>
            
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="w-full h-36 rounded-xl bg-slate-900/40 border border-slate-800/40 shimmer"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {platformStatuses.map((status) => {
                  const meta = getPlatformMeta(status.platform);
                  return (
                    <div
                      key={status.platform}
                      className={`relative overflow-hidden rounded-xl border p-5 transition-all duration-300 ${
                        status.connected
                          ? `bg-gradient-to-br ${meta.gradient} shadow-lg shadow-black/20`
                          : 'bg-slate-900/30 border-slate-900 hover:border-slate-800'
                      }`}
                    >
                      {/* Connection status badge */}
                      <span
                        className={`absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                          status.connected
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-slate-950/60 text-slate-400 border-slate-800/80'
                        }`}
                      >
                        {status.connected ? (
                          <>
                            <ShieldCheck size={14} />
                            Connected
                          </>
                        ) : (
                          <>
                            <XCircle size={14} />
                            Not Connected
                          </>
                        )}
                      </span>

                      <div className="flex items-start gap-4">
                        {/* Platform Icon */}
                        <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800">
                          {meta.icon}
                        </div>

                        {/* Connection details */}
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-white leading-tight">{meta.name} Integration</h4>
                          
                          {status.connected ? (
                            <div className="mt-3 space-y-2 text-sm text-slate-300">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="text-emerald-400 shrink-0" size={16} />
                                <span>
                                  Connected Channel: <strong className="text-white">{status.username}</strong>
                                </span>
                              </div>
                              {status.connectedAt && (
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                  <Calendar size={14} />
                                  <span>
                                    Connected: {new Date(status.connectedAt).toLocaleDateString()} at{' '}
                                    {new Date(status.connectedAt).toLocaleTimeString()}
                                  </span>
                                </div>
                              )}
                              {status.expiresAt && (
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                  <Calendar size={14} />
                                  <span>
                                    Token Expiry: {new Date(status.expiresAt).toLocaleDateString()} at{' '}
                                    {new Date(status.expiresAt).toLocaleTimeString()}
                                    {status.isExpired && (
                                      <span className="ml-2 bg-red-500/20 text-red-400 px-2 py-0.5 rounded border border-red-500/30 text-[10px] font-bold">
                                        Expired
                                      </span>
                                    )}
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-slate-500 mt-2">
                              Sync and analyze metric insights from your {meta.name} channel.
                            </p>
                          )}

                          {/* Action Button */}
                          <div className="mt-5 flex gap-3">
                            {status.connected ? (
                              <button
                                onClick={() => handleDisconnect(status.platform)}
                                disabled={disconnecting === status.platform}
                                className="bg-slate-950/80 hover:bg-red-950/20 border border-slate-800 hover:border-red-900/50 hover:text-red-400 text-slate-300 font-semibold px-4 py-2 rounded-xl text-xs transition-all active:scale-[0.98] disabled:opacity-50"
                              >
                                {disconnecting === status.platform ? (
                                  <span className="flex items-center gap-1.5">
                                    <div className="w-3.5 h-3.5 border border-red-400/20 border-t-red-400 rounded-full animate-spin"></div>
                                    Disconnecting...
                                  </span>
                                ) : (
                                  'Disconnect Channel'
                                )}
                              </button>
                            ) : (
                              <button
                                id={`connect-${status.platform}`}
                                onClick={() => handleConnect(status.platform)}
                                className={`text-white font-semibold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all duration-300 active:scale-[0.98] shadow-md ${meta.btnColor}`}
                              >
                                <span>Connect {meta.name}</span>
                                <Link2 size={14} />
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
      </div>
    </div>
  );
};

export default Dashboard;
