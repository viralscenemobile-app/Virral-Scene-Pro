import { Wallet, Star, CreditCard, Settings, Bell } from "lucide-react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { cn } from "@/src/lib/utils";
import { useContext } from "react";
import { UserContext } from "../App";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function TopNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const { userId, user, firebaseUser } = useContext(UserContext);
  const unreadCount = useQuery(api.interactions.getUnreadCount, userId ? { userId } : "skip" as any);

  if (path === "/notifications") return null;

  if (path === "/") {
    return (
      <header className="fixed top-0 w-full flex justify-between items-center px-6 h-16 bg-transparent z-50">
        <div className="flex items-center gap-2">
          <Wallet className="text-primary w-5 h-5 fill-current" />
          <span className="text-on-surface font-label text-sm font-semibold tracking-wide">{(user?.coins || 0).toLocaleString()}</span>
        </div>
        <nav className="flex items-center gap-8">
          <button className="font-headline font-bold text-lg tracking-tight text-on-surface border-b-2 border-secondary pb-1">For You</button>
          <button className="font-headline font-bold text-lg tracking-tight text-on-surface/60 hover:text-secondary transition-colors">Following</button>
        </nav>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/notifications")} className="relative">
            <Bell className="text-on-surface w-6 h-6" />
            {unreadCount ? (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-background text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-background">
                {unreadCount > 9 ? "9+" : unreadCount}
              </div>
            ) : null}
          </button>
          <Star className="text-primary w-5 h-5 fill-current" />
        </div>
      </header>
    );
  }

  if (path === "/studio") {
    return (
      <header className="fixed top-0 w-full flex justify-between items-center px-6 h-16 bg-transparent z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <div className="w-4 h-4 rounded-sm bg-primary" />
          </div>
          <span className="text-on-surface font-headline font-bold text-lg tracking-tight">Viral Scene</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/" className="text-on-surface/60 hover:text-secondary transition-colors font-label text-sm font-medium">Feed</Link>
          <button className="text-on-surface border-b-2 border-secondary pb-1 font-label text-sm font-medium">Studio</button>
          <button onClick={() => navigate("/notifications")} className="relative">
            <Bell className="text-on-surface w-6 h-6" />
            {unreadCount ? (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-background text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-background">
                {unreadCount > 9 ? "9+" : unreadCount}
              </div>
            ) : null}
          </button>
          <Star className="text-primary w-5 h-5 fill-current" />
        </div>
      </header>
    );
  }

  if (path === "/discover") {
    return (
      <header className="fixed top-0 w-full flex justify-between items-center px-6 h-16 bg-transparent z-50">
        <div className="flex items-center gap-2">
          <Wallet className="text-primary w-5 h-5" />
        </div>
        <h1 className="font-headline font-bold text-lg tracking-tight text-primary">For You</h1>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/notifications")} className="relative">
            <Bell className="text-on-surface w-6 h-6" />
            {unreadCount ? (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-background text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-background">
                {unreadCount > 9 ? "9+" : unreadCount}
              </div>
            ) : null}
          </button>
          <Star className="text-primary w-5 h-5" />
        </div>
      </header>
    );
  }

  if (path === "/challenges" || path === "/profile") {
    return (
      <header className="fixed top-0 w-full z-50 bg-neutral-950/60 backdrop-blur-xl flex items-center justify-between px-6 h-16 w-full shadow-[0_8px_32px_rgba(182,160,255,0.08)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-surface-container-high overflow-hidden border border-primary/20">
            <img 
              src={user?.avatarUrl || firebaseUser?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser?.uid}`} 
              alt="Avatar" 
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-2xl font-black bg-gradient-to-br from-[#b6a0ff] to-[#7e51ff] bg-clip-text text-transparent font-headline tracking-tight">
            {path === "/challenges" ? "Challenges" : "Viral Scene"}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/notifications")} className="relative">
            <Bell className="text-on-surface w-6 h-6" />
            {unreadCount ? (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-background text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-background">
                {unreadCount > 9 ? "9+" : unreadCount}
              </div>
            ) : null}
          </button>
          <button className="text-primary hover:opacity-80 transition-opacity active:scale-95 duration-200">
            <CreditCard className="w-6 h-6" />
          </button>
          <button 
            onClick={() => navigate("/settings")}
            className="text-on-surface hover:opacity-80 transition-opacity active:scale-95 duration-200"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </header>
    );
  }

  return null;
}
