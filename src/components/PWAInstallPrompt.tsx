import { useState, useEffect } from "react";
import { Download } from "lucide-react";

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 bg-surface-container-high p-4 rounded-2xl flex items-center justify-between shadow-xl z-[1000] border border-outline-variant/20">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <Download className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-bold">Install ViralScene</p>
          <p className="text-[10px] text-on-surface-variant">Get the app on your home screen</p>
        </div>
      </div>
      <button 
        onClick={handleInstall}
        className="px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-bold uppercase tracking-widest"
      >
        Install
      </button>
    </div>
  );
}
