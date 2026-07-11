import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Bot, ChevronDown, Loader2, Send, Sparkles, X } from "lucide-react";
import { getMlChatbotStatus, sendMlChatbotMessage } from "@/services/mlChatbotApi";

const platformByPath = [
  { test: "/dashboard/youtube", platform: "youtube", label: "YouTube" },
  { test: "/dashboard/linkedin", platform: "linkedin", label: "LinkedIn" },
  { test: "/dashboard/meta/facebook", platform: "facebook", label: "Facebook" },
  { test: "/dashboard/meta/instagram", platform: "instagram", label: "Instagram" },
  { test: "/dashboard/meta", platform: "meta", label: "Meta" },
];

function getRoutePlatform(pathname) {
  const match = platformByPath.find((item) => pathname.startsWith(item.test));
  return match || null;
}

function normalizePlatform(routePlatform, connectedPlatforms) {
  if (!routePlatform) return connectedPlatforms[0] || null;
  if (routePlatform.platform === "meta") {
    if (connectedPlatforms.includes("facebook")) return "facebook";
    if (connectedPlatforms.includes("instagram")) return "instagram";
  }
  return routePlatform.platform;
}

const starterPrompts = [
  "How can I increase performance?",
  "When should I post?",
  "Suggest the best posting setup",
];

export default function FloatingSuggestionChatbot() {
  const location = useLocation();
  const [status, setStatus] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Ask me how to improve performance, when to post, or what setup to use. I will answer from your connected analytics.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesRef = useRef(null);

  const routePlatform = useMemo(() => getRoutePlatform(location.pathname), [location.pathname]);
  const connectedPlatforms = status?.connectedPlatforms || [];
  const activePlatform = normalizePlatform(routePlatform, connectedPlatforms);
  const shouldShow = Boolean(status?.visible && activePlatform && connectedPlatforms.includes(activePlatform));

  useEffect(() => {
    let cancelled = false;
    getMlChatbotStatus()
      .then((data) => {
        if (!cancelled) setStatus(data);
      })
      .catch(() => {
        if (!cancelled) setStatus({ visible: false, connectedPlatforms: [] });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  if (!shouldShow) return null;

  const platformLabel = activePlatform ? activePlatform[0].toUpperCase() + activePlatform.slice(1) : "Social";

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setMessages((current) => [...current, { role: "user", text: trimmed }]);
    setInput("");
    setLoading(true);

    try {
      const result = await sendMlChatbotMessage({
        message: trimmed,
        platform: activePlatform,
        context: { platform: activePlatform },
      });

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: result.dataWarning ? `${result.reply}\n\n${result.dataWarning}` : result.reply,
          suggestion: result.suggestion,
          state: result.state,
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: "I could not reach the suggestion service right now. Please try again after the backend is running.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <section className="mb-4 flex h-[620px] w-[390px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20 dark:border-white/10 dark:bg-[#0B1121]">
          <header className="relative overflow-hidden bg-slate-950 px-5 py-5 text-white dark:bg-[#07101f]">
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-emerald-500/20 to-transparent" />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-400/30">
                  <Sparkles className="h-3.5 w-3.5" />
                  {platformLabel} analytics connected
                </div>
                <h2 className="text-xl font-bold leading-tight">APSM Suggestion Assistant</h2>
                <p className="mt-1 text-sm text-slate-300">Analysis, prediction, and suggestions from your data.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
                aria-label="Close suggestion chatbot"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>

          <div ref={messagesRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4 dark:bg-[#0B1121]">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[86%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                  message.role === "user"
                    ? "ml-auto bg-emerald-600 text-white"
                    : "mr-auto border border-slate-200 bg-white text-slate-800 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
                }`}
              >
                <p className="whitespace-pre-line">{message.text}</p>
                {message.suggestion?.predicted_metrics && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Metric label="Score" value={message.suggestion.score} />
                    <Metric label="Performance" value={message.suggestion.predicted_metrics.performance_score} />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="mr-auto inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking analytics and model...
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-[#0B1121]">
            <div className="mb-3 flex gap-2 overflow-x-auto">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  className="shrink-0 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700 dark:border-white/10 dark:text-slate-300 dark:hover:text-emerald-300"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <form
              className="flex items-center gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage(input);
              }}
            >
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={`Ask about ${platformLabel} performance...`}
                className="h-11 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-emerald-400/10"
              />
              <button
                type="submit"
                disabled={loading}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-700 text-white shadow-2xl shadow-emerald-900/30 ring-1 ring-emerald-400/30 transition hover:-translate-y-0.5 hover:bg-emerald-600"
        aria-label={isOpen ? "Minimize suggestion chatbot" : "Open suggestion chatbot"}
      >
        {isOpen ? <ChevronDown className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </button>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-white/10 dark:bg-slate-950/50">
      <span className="block text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</span>
      <strong className="text-sm text-slate-900 dark:text-white">{value ?? "N/A"}</strong>
    </div>
  );
}
