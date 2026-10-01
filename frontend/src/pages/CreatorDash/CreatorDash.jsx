import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { LogOut } from 'lucide-react';
import { Send, Clock, CheckCircle2, XCircle, Plus, LayoutGrid } from 'lucide-react';
import { Youtube, Instagram, Linkedin, Facebook } from '@/components/icons/BrandIcons';

const PlatformIcon = ({ platform }) => {
  switch (platform) {
    case 'youtube': return <Youtube size={16} className="text-red-500" />;
    case 'instagram': return <Instagram size={16} className="text-pink-500" />;
    case 'linkedin': return <Linkedin size={16} className="text-blue-500" />;
    case 'facebook': return <Facebook size={16} className="text-blue-600" />;
    default: return null;
  }
};

const StatusBadge = ({ status }) => {
  switch (status) {
    case 'APPROVED':
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><CheckCircle2 size={14} /> Approved</span>;
    case 'REJECTED':
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20"><XCircle size={14} /> Rejected</span>;
    default:
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20"><Clock size={14} /> Pending</span>;
  }
};

export default function CreatorDash() {
  // Creators land here and have no admin sidebar, so the account name and a
  // sign-out control have to live in this header.
  const { user, logout } = useAuth();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDrafting, setIsDrafting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    body: '',
    hashtags: '',
    platforms: []
  });

  const PLATFORMS = ['youtube', 'facebook', 'instagram', 'linkedin'];

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/creator-posts/my-posts');
      setPosts(res.data.posts || []);
    } catch (error) {
      console.error('Error fetching creator posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlatformToggle = (platform) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.body || formData.platforms.length === 0) {
      alert('Body and at least one platform are required.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const payload = new FormData();
      if (formData.title) payload.append("title", formData.title);
      payload.append("body", formData.body);
      if (formData.hashtags) payload.append("hashtags", formData.hashtags);
      payload.append("platforms", JSON.stringify(formData.platforms));
      if (mediaFile) payload.append("mediaFile", mediaFile);

      await api.post("/creator-posts/submit", payload, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setFormData({ title: "", body: "", hashtags: "", platforms: [] });
      setMediaFile(null);
      setMediaPreview(null);
      setIsDrafting(false);
      fetchPosts();
    } catch (error) {
      console.error('Submission failed:', error);
      alert(error.response?.data?.error || 'Failed to submit post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Creator Studio</h1>
            <p className="text-slate-400 mt-1">Draft posts and submit them to your admin for approval.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-slate-400">Creator</p>
            </div>
            <button
              onClick={logout}
              title="Sign out"
              aria-label="Sign out"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/60 text-slate-300 transition-colors hover:border-slate-700 hover:text-white"
            >
              <LogOut size={17} />
            </button>
            <button 
              onClick={() => setIsDrafting(!isDrafting)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-all shadow-lg shadow-indigo-500/20"
            >
              {isDrafting ? 'Cancel Draft' : <><Plus size={18} /> New Draft</>}
            </button>
          </div>
        </div>

        {/* Draft Form */}
        {isDrafting && (
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <LayoutGrid size={20} className="text-indigo-400" />
              Compose New Post
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Target Platforms</label>
                <div className="flex flex-wrap gap-3">
                  {PLATFORMS.map(platform => (
                    <button
                      type="button"
                      key={platform}
                      onClick={() => handlePlatformToggle(platform)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        formData.platforms.includes(platform)
                          ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                          : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <PlatformIcon platform={platform} />
                      <span className="capitalize">{platform}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Title (Optional)</label>
                <input
                  type="text"
                  placeholder="E.g., Exciting new product update!"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Media (Optional)</label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setMediaFile(file);
                      setMediaPreview(URL.createObjectURL(file));
                    }
                  }}
                  className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20 transition-colors"
                />
                {mediaPreview && (
                  <div className="mt-3 relative inline-block">
                    {mediaFile?.type.startsWith("video/") ? (
                      <video src={mediaPreview} className="h-32 rounded-lg border border-slate-700" controls />
                    ) : (
                      <img src={mediaPreview} alt="Preview" className="h-32 rounded-lg border border-slate-700 object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => { setMediaFile(null); setMediaPreview(null); }}
                      className="absolute -top-2 -right-2 bg-slate-800 text-slate-300 rounded-full p-1 hover:bg-slate-700 hover:text-white border border-slate-700"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Body <span className="text-rose-400">*</span></label>
                <textarea
                  required
                  rows={5}
                  placeholder="What do you want to share?"
                  value={formData.body}
                  onChange={(e) => setFormData({...formData, body: e.target.value})}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Hashtags</label>
                <input
                  type="text"
                  placeholder="#tech #updates"
                  value={formData.hashtags}
                  onChange={(e) => setFormData({...formData, hashtags: e.target.value})}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending...' : <><Send size={18} /> Submit for Review</>}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Post List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-300 border-b border-slate-800 pb-3">Your Submissions</h3>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-12 text-center">
              <div className="bg-slate-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <LayoutGrid className="text-slate-500" size={24} />
              </div>
              <h4 className="text-slate-300 font-medium mb-1">No posts yet</h4>
              <p className="text-slate-500 text-sm">Create a new draft to get started.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {posts.map((post) => (
                <div key={post._id} className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 hover:bg-slate-900/60 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-2">
                      {post.platforms.map(p => (
                        <div key={p} className="p-1.5 bg-slate-950 rounded-md border border-slate-800">
                          <PlatformIcon platform={p} />
                        </div>
                      ))}
                    </div>
                    <StatusBadge status={post.status} />
                  </div>
                  
                  {post.title && <h4 className="font-medium text-white mb-2">{post.title}</h4>}
                  <p className="text-slate-400 text-sm whitespace-pre-wrap line-clamp-3 mb-3">
                    {post.body}
                  </p>
                  
                  {post.hashtags && (
                    <p className="text-indigo-400 text-xs font-medium mb-4">{post.hashtags}</p>
                  )}
                  {post.mediaUrl && (
                    <div className="mb-4">
                      {post.mediaUrl.match(/\.(mp4|mov|wmv|flv|avi|webm|mkv)$/i) ? (
                        <video src={post.mediaUrl} className="h-40 rounded-lg border border-slate-800" controls />
                      ) : (
                        <img src={post.mediaUrl} alt="Attachment" className="h-40 rounded-lg border border-slate-800 object-cover" />
                      )}
                    </div>
                  )}

                  {post.status === 'REJECTED' && post.adminFeedback && (
                    <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                      <p className="text-xs text-rose-300/70 font-medium mb-1">Admin Feedback:</p>
                      <p className="text-sm text-rose-200">{post.adminFeedback}</p>
                    </div>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500">
                    <span>Submitted {new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}



