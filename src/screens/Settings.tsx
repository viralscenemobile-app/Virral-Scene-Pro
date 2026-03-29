import { ArrowLeft, Bell, Shield, Moon, Palette, HelpCircle, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { logOut } from "@/src/lib/firebase";

export function Settings() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (confirm("Are you sure you want to log out?")) {
      await logOut();
    }
  };

  return (
    <main className="pt-20 px-4 max-w-md mx-auto pb-24 h-screen overflow-y-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-headline font-bold">Settings</h1>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="text-xs font-label uppercase tracking-widest text-on-surface-variant mb-3 px-2">Account</h2>
          <div className="bg-surface-container-low rounded-2xl p-2">
            <button className="w-full flex items-center justify-between p-4 hover:bg-surface-container-high rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-primary" />
                <span className="font-label text-sm">Privacy & Security</span>
              </div>
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-xs font-label uppercase tracking-widest text-on-surface-variant mb-3 px-2">Preferences</h2>
          <div className="bg-surface-container-low rounded-2xl p-2">
            <button className="w-full flex items-center justify-between p-4 hover:bg-surface-container-high rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-secondary" />
                <span className="font-label text-sm">Notifications</span>
              </div>
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-surface-container-high rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-tertiary" />
                <span className="font-label text-sm">Dark Mode</span>
              </div>
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-surface-container-high rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <Palette className="w-5 h-5 text-primary" />
                <span className="font-label text-sm">Theme</span>
              </div>
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-xs font-label uppercase tracking-widest text-on-surface-variant mb-3 px-2">Support</h2>
          <div className="bg-surface-container-low rounded-2xl p-2">
            <button className="w-full flex items-center justify-between p-4 hover:bg-surface-container-high rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-on-surface-variant" />
                <span className="font-label text-sm">Help & Support</span>
              </div>
            </button>
          </div>
        </section>

        <section>
          <div className="bg-surface-container-low rounded-2xl p-2">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-4 hover:bg-destructive/10 rounded-xl transition-colors text-destructive"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5" />
                <span className="font-label text-sm">Logout</span>
              </div>
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
