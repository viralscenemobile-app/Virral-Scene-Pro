import { Home, Compass, PlusCircle, Trophy, User } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/src/lib/utils";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import React, { useContext, useEffect } from "react";
import { UserContext } from "../App";

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId } = useContext(UserContext);
  const subscription = useQuery(api.subscriptions.getActive, userId ? { userId } : "skip" as any);

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Compass, label: "Discover", path: "/discover" },
    { icon: PlusCircle, label: "Studio", path: "/studio", isLarge: true },
    { icon: Trophy, label: "Challenges", path: "/challenges" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 w-full z-50 flex justify-around items-center h-16 pb-safe px-4 bg-[#262528]/70 backdrop-blur-3xl rounded-t-[24px] shadow-[0_-8px_32px_rgba(182,160,255,0.08)]">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;

        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center transition-all active:scale-90 duration-200 p-2",
              isActive ? "text-secondary" : "text-on-surface/50 hover:bg-white/5 rounded-full",
              item.isLarge && "text-primary scale-125"
            )}
          >
            <Icon className={cn(item.isLarge ? "w-8 h-8" : "w-6 h-6", isActive && "fill-current")} />
            {isActive && !item.isLarge && (
              <div className="w-1 h-1 bg-secondary rounded-full mt-1" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
