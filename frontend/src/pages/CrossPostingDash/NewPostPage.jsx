import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NewPostPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header with Back Button ────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/crosspost")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Create New Post</h2>
          <p className="text-sm text-muted-foreground">Draft and publish your content across platforms</p>
        </div>
      </div>

      {/* ── Editor Canvas Placeholder ───────────────────────────────────── */}
      <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        <p>Multi-platform authoring interface goes here.</p>
      </div>
    </div>
  );
}
