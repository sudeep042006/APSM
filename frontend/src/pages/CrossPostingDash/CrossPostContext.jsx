// ── Cross-Post Context Provider ─────────────────────────────────────
// Shared state for the cross-posting module, loaded once here so the sidebar,
// overview, requests inbox and history pages never disagree with each other:
//
//   connections : which social accounts this user has linked
//   history     : publishing jobs for this user (GET /automation/jobs)
//   requests    : creator submissions awaiting this admin's review
//                (GET /creator-posts/incoming, admin only)
//
// Requests are refetched rather than patched locally after approve/reject.
// The server is the only thing that knows whether a job was actually created,
// so trusting the returned document avoids the UI claiming success for a
// request the backend rejected (for example "Post is already APPROVED").

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import crosspostApi from "@/services/crosspostApi";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";

// ── Context Definition ──────────────────────────────────────────────
const CrossPostContext = createContext(null);

const FORBIDDEN = 403;

export function CrossPostProvider({ children }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [postHistory, setPostHistory] = useState([]);
  const [connectedPlatforms, setConnectedPlatforms] = useState([]);

  const [requests, setRequests] = useState([]);
  const [requestsError, setRequestsError] = useState(null); // "forbidden" | "network" | null

  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const refreshHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const history = await crosspostApi.getHistory();
      setPostHistory(Array.isArray(history) ? history : []);
    } catch (err) {
      console.error("Failed to fetch post history", err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  const refreshRequests = useCallback(async () => {
    // A non-admin cannot read this endpoint at all, so the request is skipped
    // rather than sent-and-rejected. The page still renders the "admins only"
    // explanation from `requestsError === "forbidden"`.
    if (!isAdmin) {
      setRequests([]);
      setRequestsError("forbidden");
      setIsLoadingRequests(false);
      return;
    }

    setIsLoadingRequests(true);
    try {
      const posts = await crosspostApi.getIncomingRequests();
      setRequests(Array.isArray(posts) ? posts : []);
      setRequestsError(null);
    } catch (err) {
      console.error("Failed to fetch incoming requests", err);
      setRequestsError(err.response?.status === FORBIDDEN ? "forbidden" : "network");
    } finally {
      setIsLoadingRequests(false);
    }
  }, [isAdmin]);

  // ── Load on mount ──────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    const fetchAuth = async () => {
      try {
        const statusArray = await crosspostApi.getConnectionStatus();
        const connectedIds = (Array.isArray(statusArray) ? statusArray : [])
          .filter((s) => s.connected === true)
          .map((s) => String(s.platform).toLowerCase());

        if (mounted) setConnectedPlatforms(connectedIds);
      } catch (err) {
        console.error("Failed to fetch auth status in context", err);
        toast({
          title: "Error",
          description: "Failed to load connected platforms",
          variant: "destructive",
        });
      }

      if (mounted) setIsLoadingAuth(false);
    };

    fetchAuth();
    return () => { mounted = false; };
  }, []);

  useEffect(() => { refreshHistory(); }, [refreshHistory]);
  useEffect(() => { refreshRequests(); }, [refreshRequests]);

  // ── Approve / Reject ───────────────────────────────────────────────
  // Approving creates an Automation job on the admin's own accounts and
  // enqueues it, so the history has to be re-read here. Without this the post
  // appeared as "Approved" in the inbox while the pipeline it just joined stayed
  // invisible until a manual reload.
  const approveRequest = useCallback(
    async (postId) => {
      const updated = await crosspostApi.approveRequest(postId);
      // Replace in place so card order and every derived count stay consistent.
      setRequests((prev) => prev.map((p) => (p._id === postId ? { ...p, ...updated } : p)));
      await refreshHistory();
      return updated;
    },
    [refreshHistory]
  );

  const rejectRequest = useCallback(async (postId, feedback) => {
    const updated = await crosspostApi.rejectRequest(postId, feedback);
    setRequests((prev) => prev.map((p) => (p._id === postId ? { ...p, ...updated } : p)));
    return updated;
  }, []);

  const pendingCount = requests.filter((p) => p.status === "PENDING").length;

  return (
    <CrossPostContext.Provider
      value={{
        // connections
        connectedPlatforms,
        isLoadingAuth,
        // publishing history
        postHistory,
        isLoadingHistory,
        refreshHistory,
        // creator submissions
        requests,
        pendingCount,
        isLoadingRequests,
        requestsError,
        isAdmin,
        refreshRequests,
        approveRequest,
        rejectRequest,
      }}
    >
      {children}
    </CrossPostContext.Provider>
  );
}

// ── Consumer Hook ───────────────────────────────────────────────────
export function useCrossPost() {
  const ctx = useContext(CrossPostContext);
  if (!ctx) {
    throw new Error("useCrossPost must be used within a CrossPostProvider");
  }
  return ctx;
}