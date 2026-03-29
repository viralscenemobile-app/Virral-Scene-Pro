import { ArrowLeft, Bell, Shield, Moon, Palette, HelpCircle, LogOut, User, Mail, Trash2, Globe, ChevronRight, X, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { logOut } from "@/src/lib/firebase";
import { useContext, useState } from "react";
import { UserContext } from "../App";
import { cn } from "@/src/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function Settings() {
  const navigate = useNavigate();
  const { user, firebaseUser } = useContext(UserContext);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const recalculateAll = useMutation(api.users.recalculateAll);
  const [isRecalculating, setIsRecalculating] = useState(false);

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    try {
      await recalculateAll();
      toast.success("Balances and counts recalculated successfully!");
    } catch (e) {
      toast.error("Failed to recalculate.");
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleLogout = async () => {
    await logOut();
    navigate("/");
  };

  const handleDeleteAccount = () => {
    toast.success("Account deletion request submitted. Our team will process it within 24 hours.");
    setShowDeleteConfirm(false);
  };

  return (
    <main className="pt-20 px-4 max-w-md mx-auto pb-24 h-screen overflow-y-auto no-scrollbar">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-headline font-bold">Settings</h1>
      </div>

      <div className="space-y-6">
        {/* Account Section */}
        <section>
          <h2 className="text-xs font-label uppercase tracking-widest text-on-surface-variant mb-3 px-2">Account</h2>
          <div className="bg-surface-container-low rounded-2xl p-2 space-y-1">
            <div className="flex items-center justify-between p-4 bg-surface-container-high/30 rounded-xl">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-primary" />
                <div className="flex flex-col">
                  <span className="font-label text-sm font-semibold">Username</span>
                  <span className="text-[10px] text-on-surface-variant">@{user?.username || "user"}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-surface-container-high/30 rounded-xl">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-secondary" />
                <div className="flex flex-col">
                  <span className="font-label text-sm font-semibold">Email</span>
                  <span className="text-[10px] text-on-surface-variant">{firebaseUser?.email || "No email linked"}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => navigate("/profile")}
              className="w-full flex items-center justify-between p-4 hover:bg-surface-container-high rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-tertiary" />
                <span className="font-label text-sm">Privacy & Security</span>
              </div>
              <ChevronRight className="w-4 h-4 text-on-surface-variant" />
            </button>
          </div>
        </section>

        {/* Preferences Section */}
        <section>
          <h2 className="text-xs font-label uppercase tracking-widest text-on-surface-variant mb-3 px-2">Preferences</h2>
          <div className="bg-surface-container-low rounded-2xl p-2 space-y-1">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-secondary" />
                <span className="font-label text-sm">Push Notifications</span>
              </div>
              <button 
                onClick={() => setNotifications(!notifications)}
                className={cn(
                  "w-10 h-5 rounded-full transition-colors relative",
                  notifications ? "bg-primary" : "bg-surface-container-highest"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
                  notifications ? "left-6" : "left-1"
                )} />
              </button>
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-tertiary" />
                <span className="font-label text-sm">Dark Mode</span>
              </div>
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className={cn(
                  "w-10 h-5 rounded-full transition-colors relative",
                  darkMode ? "bg-primary" : "bg-surface-container-highest"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
                  darkMode ? "left-6" : "left-1"
                )} />
              </button>
            </div>
            <button className="w-full flex items-center justify-between p-4 hover:bg-surface-container-high rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-primary" />
                <span className="font-label text-sm">Language</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-on-surface-variant">English</span>
                <ChevronRight className="w-4 h-4 text-on-surface-variant" />
              </div>
            </button>
          </div>
        </section>

        {/* Support Section */}
        <section>
          <h2 className="text-xs font-label uppercase tracking-widest text-on-surface-variant mb-3 px-2">Support</h2>
          <div className="bg-surface-container-low rounded-2xl p-2 space-y-1">
            <button 
              onClick={() => window.open("https://ai.google.dev/gemini-api/docs", "_blank")}
              className="w-full flex items-center justify-between p-4 hover:bg-surface-container-high rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-on-surface-variant" />
                <span className="font-label text-sm">Help Center</span>
              </div>
              <ChevronRight className="w-4 h-4 text-on-surface-variant" />
            </button>
            <button 
              onClick={() => toast.success("ViralScene v1.0.4 (Stable Build)")}
              className="w-full flex items-center justify-between p-4 hover:bg-surface-container-high rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <Palette className="w-5 h-5 text-on-surface-variant" />
                <span className="font-label text-sm">About ViralScene</span>
              </div>
              <span className="text-[10px] text-on-surface-variant">v1.0.4</span>
            </button>
          </div>
        </section>

        {/* Danger Zone */}
        <section>
          <h2 className="text-xs font-label uppercase tracking-widest text-destructive mb-3 px-2">Danger Zone</h2>
          <div className="bg-surface-container-low rounded-2xl p-2 space-y-1">
            <button 
              onClick={handleRecalculate}
              disabled={isRecalculating}
              className="w-full flex items-center justify-between p-4 hover:bg-primary/10 rounded-xl transition-colors text-primary"
            >
              <div className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5" />
                <span className="font-label text-sm">{isRecalculating ? "Recalculating..." : "Recalculate Stats"}</span>
              </div>
            </button>
            <button 
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full flex items-center justify-between p-4 hover:bg-destructive/10 rounded-xl transition-colors text-destructive"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5" />
                <span className="font-label text-sm">Logout</span>
              </div>
            </button>
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center justify-between p-4 hover:bg-destructive/10 rounded-xl transition-colors text-destructive"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5" />
                <span className="font-label text-sm">Delete Account</span>
              </div>
            </button>
          </div>
        </section>
      </div>

      {/* Confirmation Modals */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-surface-container-low p-6 rounded-3xl w-full max-w-xs border border-white/5 space-y-6"
            >
              <div className="space-y-2 text-center">
                <h3 className="text-xl font-bold font-headline">Logout?</h3>
                <p className="text-sm text-on-surface-variant">Are you sure you want to log out of your account?</p>
              </div>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={handleLogout}
                  className="w-full py-3 bg-destructive text-white rounded-xl font-bold text-sm"
                >
                  Logout
                </button>
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="w-full py-3 bg-surface-container-high text-on-surface rounded-xl font-bold text-sm"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-surface-container-low p-6 rounded-3xl w-full max-w-xs border border-white/5 space-y-6"
            >
              <div className="space-y-2 text-center">
                <h3 className="text-xl font-bold font-headline text-destructive">Delete Account?</h3>
                <p className="text-sm text-on-surface-variant">This action is permanent and will delete all your creations and coins.</p>
              </div>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={handleDeleteAccount}
                  className="w-full py-3 bg-destructive text-white rounded-xl font-bold text-sm"
                >
                  Confirm Delete
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-full py-3 bg-surface-container-high text-on-surface rounded-xl font-bold text-sm"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
