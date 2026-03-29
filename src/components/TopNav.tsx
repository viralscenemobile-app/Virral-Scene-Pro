import { Wallet, CreditCard, Settings, Bell, Coins, Plus } from "lucide-react";
import { useLocation, Link, useNavigate, useSearchParams } from "react-router-dom";
import { cn } from "@/src/lib/utils";
import React, { useContext } from "react";
import { UserContext } from "../App";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function TopNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "foryou";
  const path = location.pathname;
  const { userId, user, firebaseUser } = useContext(UserContext);
  const unreadCount = useQuery(api.interactions.getUnreadNotificationsCount, userId ? { userId } : "skip" as any);

  if (path === "/notifications") return null;

  const CoinBalance = () => (
    <div 
      onClick={() => navigate("/studio")}
      className="flex items-center gap-1.5 pl-1.5 pr-2 py-1 cursor-pointer transition-all group shrink-0"
    >
      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
        <Coins className="text-primary w-3 h-3" />
      </div>
      <span className="text-on-surface font-mono text-[10px] font-bold tracking-tight">
        {(user?.coins || 0).toLocaleString()}
      </span>
    </div>
  );

  const NavWrapper = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <header className={cn(
      "fixed top-0 w-full h-14 z-50 px-4 sm:px-6 flex items-center justify-center",
      path === "/" ? "bg-gradient-to-b from-black/80 to-transparent" : "bg-surface-container-lowest/80 backdrop-blur-xl border-b border-white/5",
      className
    )}>
      <div className="w-full max-w-7xl flex items-center justify-between gap-4">
        {children}
      </div>
    </header>
  );

  if (path === "/") {
    return (
      <NavWrapper>
        <div className="flex-1 flex items-center">
          <CoinBalance />
        </div>
        
        <nav className="flex items-center gap-6 sm:gap-8">
          <button 
            onClick={() => setSearchParams({ tab: "foryou" })}
            className={cn(
              "font-headline font-bold text-base sm:text-lg tracking-tight transition-all relative py-1",
              activeTab === "foryou" ? "text-on-surface" : "text-on-surface/40 hover:text-on-surface/80"
            )}
          >
            For You
            {activeTab === "foryou" && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-secondary rounded-full" />
            )}
          </button>
          <button 
            onClick={() => setSearchParams({ tab: "following" })}
            className={cn(
              "font-headline font-bold text-base sm:text-lg tracking-tight transition-all relative py-1",
              activeTab === "following" ? "text-on-surface" : "text-on-surface/40 hover:text-on-surface/80"
            )}
          >
            Following
            {activeTab === "following" && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-secondary rounded-full" />
            )}
          </button>
        </nav>

        <div className="flex-1 flex justify-end items-center">
          <button onClick={() => navigate("/notifications")} className="relative p-2 hover:bg-white/5 rounded-full transition-colors">
            <Bell className="text-on-surface w-6 h-6" />
            {unreadCount ? (
              <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary text-background text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-black">
                {unreadCount > 9 ? "9+" : unreadCount}
              </div>
            ) : null}
          </button>
        </div>
      </NavWrapper>
    );
  }

  if (path === "/studio") {
    return (
      <NavWrapper>
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <div className="w-4 h-4 rounded-sm bg-primary" />
          </div>
          <span className="hidden sm:block text-on-surface font-headline font-bold text-lg tracking-tight">Viral Scene</span>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4 ml-auto">
          <CoinBalance />
          <div className="h-6 w-px bg-white/10 mx-1 sm:mx-2" />
          <button onClick={() => navigate("/notifications")} className="relative p-2 hover:bg-white/5 rounded-full transition-colors">
            <Bell className="text-on-surface w-5 h-5" />
            {unreadCount ? (
              <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-primary text-background text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-surface-container-lowest">
                {unreadCount > 9 ? "9+" : unreadCount}
              </div>
            ) : null}
          </button>
          <button 
            onClick={() => navigate("/settings")}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <Settings className="text-on-surface w-5 h-5" />
          </button>
        </div>
      </NavWrapper>
    );
  }

  if (path === "/discover") {
    return (
      <NavWrapper>
        <div className="flex-1">
          <CoinBalance />
        </div>
        <h1 className="font-headline font-bold text-lg tracking-tight text-on-surface">Discover</h1>
        <div className="flex-1 flex justify-end items-center">
          <button onClick={() => navigate("/notifications")} className="relative p-2 hover:bg-white/5 rounded-full transition-colors">
            <Bell className="text-on-surface w-6 h-6" />
            {unreadCount ? (
              <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary text-background text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-surface-container-lowest">
                {unreadCount > 9 ? "9+" : unreadCount}
              </div>
            ) : null}
          </button>
        </div>
      </NavWrapper>
    );
  }

  if (path === "/challenges" || path === "/profile") {
    return (
      <NavWrapper>
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-full bg-surface-container-high overflow-hidden border border-primary/20">
            <img 
              src={user?.avatarUrl || firebaseUser?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser?.uid}` || undefined} 
              alt="Avatar" 
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-lg font-bold text-on-surface font-headline tracking-tight truncate max-w-[120px] sm:max-w-none">
            {path === "/challenges" ? "Challenges" : path === "/profile" ? "Profile" : user?.username || "Profile"}
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          <CoinBalance />
          <div className="h-6 w-px bg-white/10 mx-1" />
          <button onClick={() => navigate("/notifications")} className="relative p-2 hover:bg-white/5 rounded-full transition-colors">
            <Bell className="text-on-surface w-5 h-5" />
            {unreadCount ? (
              <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-primary text-background text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-surface-container-lowest">
                {unreadCount > 9 ? "9+" : unreadCount}
              </div>
            ) : null}
          </button>
          <button 
            onClick={() => navigate("/settings")}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <Settings className="text-on-surface w-5 h-5" />
          </button>
        </div>
      </NavWrapper>
    );
  }

  return null;
}
