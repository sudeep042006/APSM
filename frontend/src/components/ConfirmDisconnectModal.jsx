import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ConfirmDisconnectModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="glass mx-4 w-full max-w-sm rounded-2xl p-7 text-center animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/10 shadow-[0_10px_30px_-10px_hsl(var(--destructive)/0.6)]">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <h3 className="mb-2 font-display text-xl font-bold tracking-tight text-foreground">
            Disconnect Account
          </h3>
          <p className="mb-7 text-sm leading-relaxed text-muted-foreground">
            Are you sure you want to disconnect this account? You will lose access to real-time analytics.
          </p>
          <div className="flex w-full gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              className="flex-1"
            >
              Yes, Disconnect
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
