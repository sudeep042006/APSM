import { useState } from 'react';
import { AlertCircle, CheckCircle2, Sparkles, ThumbsDown, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/services/api';

export default function AiReachPredictor() {
  const [draft, setDraft] = useState({ title: '', caption: '', platform: 'linkedin', industry: 'general', contentType: 'post', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC' });
  const [recommendations, setRecommendations] = useState(null);
  const [runId, setRunId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function optimise() {
    if (!draft.title.trim() && !draft.caption.trim()) return setError('Write a title or caption before requesting optimisation.');
    setError(''); setRecommendations(null); setLoading(true);
    try {
      const { data } = await api.post('/api/recommendations/optimise', draft);
      setRecommendations(data.recommendations); setRunId(data.runId);
    } catch (requestError) {
      const status = requestError.response?.status;
      setError(status === 401 ? 'Your login session has expired. Please sign in again.' : requestError.response?.data?.error || 'The predictor could not reach the server. Confirm the backend is running on port 5000, then retry.');
    } finally { setLoading(false); }
  }
  function applyHook(phrase) { setDraft(current => ({ ...current, caption: `${phrase}${current.caption ? `\n\n${current.caption}` : ''}` })); }
  function applyTags(tags) {
    const currentTags = new Set((draft.caption.match(/#[\p{L}0-9_]+/gu) || []).map(tag => tag.toLowerCase()));
    const additions = tags.filter(tag => !currentTags.has(tag.toLowerCase()));
    if (additions.length) setDraft(current => ({ ...current, caption: `${current.caption.trim()}${current.caption.trim() ? '\n\n' : ''}${additions.join(' ')}` }));
  }
  async function feedback(helpful) {
    if (!runId) return;
    try { await api.post(`/api/recommendations/runs/${runId}/feedback`, { helpful }); }
    catch { setError('Feedback could not be saved. You can continue editing your draft.'); }
  }
  return <Card className="mx-4 border-violet-500/25 bg-violet-500/[0.03]">
    <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Sparkles className="h-4 w-4 text-violet-400" /> AI Reach Predictor</CardTitle><p className="text-sm text-muted-foreground">Historical recommendations when evidence exists; platform-specific content guidance when it does not.</p></CardHeader>
    <CardContent className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2"><input value={draft.title} onChange={event => setDraft({ ...draft, title: event.target.value })} placeholder="Post title or hook" className="h-10 rounded-md border bg-background px-3 text-sm" /><select value={draft.platform} onChange={event => setDraft({ ...draft, platform: event.target.value })} className="h-10 rounded-md border bg-background px-3 text-sm"><option value="linkedin">LinkedIn</option><option value="instagram">Instagram</option><option value="facebook">Facebook</option><option value="youtube">YouTube</option></select></div>
      <textarea value={draft.caption} onChange={event => setDraft({ ...draft, caption: event.target.value })} placeholder="Draft your caption here…" rows={3} className="w-full rounded-md border bg-background p-3 text-sm" />
      <div className="flex flex-wrap gap-3"><input value={draft.industry} onChange={event => setDraft({ ...draft, industry: event.target.value })} placeholder="Industry" className="h-9 rounded-md border bg-background px-3 text-sm" /><input value={draft.timezone} onChange={event => setDraft({ ...draft, timezone: event.target.value })} placeholder="Timezone" className="h-9 rounded-md border bg-background px-3 text-sm" /><Button onClick={optimise} disabled={loading} className="gap-2 bg-violet-600 hover:bg-violet-700"><Sparkles className="h-4 w-4" />{loading ? 'Analysing…' : 'Get AI Optimisation'}</Button></div>
      {error && <p className="flex gap-2 text-sm text-destructive"><AlertCircle className="h-4 w-4" />{error}</p>}
      {recommendations && <div className="space-y-4 rounded-lg border bg-background/60 p-4"><div className="flex flex-wrap justify-between gap-2"><p className="font-medium">{recommendations.status === 'ready' ? 'Performance recommendations ready' : 'Draft optimisation ready'}</p><span className="rounded-full bg-violet-500/10 px-2 py-1 text-xs text-violet-400">{recommendations.confidence}% confidence</span></div><p className="text-xs text-muted-foreground">{recommendations.dataQuality?.comparablePosts || 0} comparable posts from {recommendations.dataQuality?.sampleSize || 0} analysed</p>
        {recommendations.contentQuality && <section className="rounded-md border border-emerald-500/20 bg-emerald-500/5 p-3"><p className="flex gap-2 text-sm font-medium"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Draft quality: {recommendations.contentQuality.score}/100</p>{recommendations.contentQuality.checks.filter(check => check.level === 'improve').map(check => <p className="mt-1 text-xs text-muted-foreground" key={check.code}>• {check.message}</p>)}</section>}
        {recommendations.hashtags?.length > 0 && <section><div className="mb-2 flex gap-2"><p className="text-sm font-medium">Suggested hashtags</p><Button onClick={() => applyTags(recommendations.hashtags.map(item => item.tag))} size="sm" variant="outline">Apply tags</Button></div><div className="flex flex-wrap gap-2">{recommendations.hashtags.map(item => <span key={item.tag} title={item.rationale} className="rounded-full bg-violet-500/10 px-2 py-1 text-xs text-violet-300">{item.tag} {item.score ? `+${item.score}%` : ''}</span>)}</div></section>}
        {recommendations.postingWindows?.length > 0 && <section><p className="text-sm font-medium">Best posting windows</p>{recommendations.postingWindows.map(item => <p key={item.window} className="text-sm text-muted-foreground">{item.window} · +{item.score}% · {item.sampleSize} similar posts</p>)}</section>}
        {recommendations.hookPhrases?.length > 0 && <section><p className="text-sm font-medium">Alternative hooks</p>{recommendations.hookPhrases.map(item => <div key={item.phrase} className="flex justify-between gap-3 py-1 text-sm text-muted-foreground"><span>“{item.phrase}”</span><Button onClick={() => applyHook(item.phrase)} size="sm" variant="outline">Use hook</Button></div>)}</section>}
        <p className="border-t pt-3 text-xs text-muted-foreground">{recommendations.guardrail}</p>{runId && <div className="flex items-center gap-2 border-t pt-3 text-xs text-muted-foreground"><span>Useful?</span><Button onClick={() => feedback(true)} size="sm" variant="ghost"><ThumbsUp className="h-3.5 w-3.5" /></Button><Button onClick={() => feedback(false)} size="sm" variant="ghost"><ThumbsDown className="h-3.5 w-3.5" /></Button></div>}
      </div>}
    </CardContent>
  </Card>;
}
