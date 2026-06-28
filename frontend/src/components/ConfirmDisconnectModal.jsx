import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ConfirmDisconnectModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0B1121] border border-white/10 text-slate-100 rounded-xl p-6 shadow-2xl max-w-sm w-full mx-4 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          <h3 className="text-xl font-bold mb-2">Disconnect Account</h3>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            Are you sure you want to disconnect this account? You will lose access to real-time analytics.
          </p>
          <div className="flex gap-3 w-full">
            <Button 
              variant="ghost" 
              onClick={onClose} 
              className="flex-1 text-slate-300 hover:text-white hover:bg-white/10 border border-white/10"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={onConfirm} 
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              Yes, Disconnect
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
