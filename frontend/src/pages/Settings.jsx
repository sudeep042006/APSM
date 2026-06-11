import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, AlertOctagon, ArrowLeft, Loader, ShieldCheck } from 'lucide-react';
import { Youtube, Facebook, Instagram } from '../components/BrandIcons';

const Settings = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [connectedPlatform, setConnectedPlatform] = useState(null);
  const [username, setUsername] = useState('');
  const [errorType, setErrorType] = useState(null);
  const [errorDetail, setErrorDetail] = useState('');
  
  const [redirectCountdown, setRedirectCountdown] = useState(5);

  useEffect(() => {
    // Parse query string parameters
    const connected = searchParams.get('connected');
    const userPlatformName = searchParams.get('username');
    const error = searchParams.get('error');
    const detail = searchParams.get('detail');

    if (connected) {
      setConnectedPlatform(connected);
      setUsername(userPlatformName || '');
      // Refresh the context user information so connected details are updated
      refreshUser();
    } else if (error) {
      setErrorType(error);
      setErrorDetail(detail || 'The OAuth link request was interrupted or rejected.');
    }

    // Auto-redirect timer to dashboard
    const timer = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/', { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [searchParams, navigate, refreshUser]);

  const getPlatformIcon = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'youtube':
        return <Youtube className="text-red-500 fill-red-500/10" size={48} />;
      case 'facebook':
        return <Facebook className="text-blue-500 fill-blue-500/10" size={48} />;
      case 'instagram':
        return <Instagram className="text-pink-500" size={48} />;
      default:
        return <ShieldCheck className="text-purple-400" size={48} />;
    }
  };

  return (
    <div className="min-h-[80vh] bg-[#0b0f19] flex items-center justify-center px-4 animate-fade-in">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-lg glass-panel rounded-3xl p-8 z-10 text-center relative overflow-hidden">
        {connectedPlatform ? (
          /* Success Flow */
          <div className="space-y-6">
            <div className="inline-flex relative">
              <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-lg shadow-emerald-500/5">
                {getPlatformIcon(connectedPlatform)}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-slate-950 rounded-full p-0.5">
                <CheckCircle2 className="text-emerald-400 fill-emerald-950" size={24} />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-white">Connection Successful!</h2>
              <p className="text-slate-400 text-sm max-w-sm mx-auto">
                Your <span className="text-white font-bold capitalize">{connectedPlatform}</span> integration is fully synced.
              </p>
            </div>

            {username && (
              <div className="bg-slate-950/50 border border-slate-900 rounded-2xl p-4 max-w-xs mx-auto">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Connected Account</p>
                <p className="text-emerald-400 font-bold text-base mt-0.5 truncate">{username}</p>
              </div>
            )}
          </div>
        ) : errorType ? (
          /* Failure Flow */
          <div className="space-y-6">
            <div className="inline-flex relative">
              <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <AlertOctagon className="text-red-500" size={40} />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-white">Connection Failed</h2>
              <p className="text-red-400 text-sm max-w-sm mx-auto font-medium">
                {errorType.replace(/_/g, ' ').toUpperCase()}
              </p>
              <p className="text-slate-400 text-xs max-w-xs mx-auto mt-2 leading-relaxed">
                {errorDetail}
              </p>
            </div>
          </div>
        ) : (
          /* Default Fallback */
          <div className="space-y-6 py-6">
            <Loader className="text-purple-500 animate-spin mx-auto" size={48} />
            <h2 className="text-xl font-bold text-white">Verifying Connections...</h2>
          </div>
        )}

        {/* Action Link & Redirect countdown */}
        <div className="mt-8 pt-6 border-t border-slate-900/60 space-y-4">
          <p className="text-xs text-slate-500 font-medium">
            Redirecting to your dashboard in{' '}
            <span className="text-purple-400 font-bold">{redirectCountdown}</span> seconds...
          </p>

          <button
            onClick={() => navigate('/', { replace: true })}
            className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 text-sm active:scale-[0.98] transition-all"
          >
            <ArrowLeft size={16} />
            <span>Return to Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
