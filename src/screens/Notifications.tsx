import { Bell, Heart, MessageCircle, UserPlus, CircleDollarSign, ChevronLeft, Check } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useContext, useEffect } from "react";
import { UserContext } from "../App";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";
import { formatDistanceToNow } from "date-fns";

export function Notifications() {
  const { userId } = useContext(UserContext);
  const notifications = useQuery(api.interactions.listUserNotifications, userId ? { userId } : "skip" as any);
  const markAsRead = useMutation(api.interactions.markAllAsRead);
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      markAsRead({ userId });
    }
  }, [userId, markAsRead]);

  const getIcon = (type: string) => {
    switch (type) {
      case "like": return <Heart className="w-4 h-4 text-primary fill-current" />;
      case "comment": return <MessageCircle className="w-4 h-4 text-secondary fill-current" />;
      case "follow": return <UserPlus className="w-4 h-4 text-primary" />;
      case "reward": return <CircleDollarSign className="w-4 h-4 text-secondary" />;
      default: return <Bell className="w-4 h-4 text-on-surface" />;
    }
  };

  const getMessage = (notification: any) => {
    const username = notification.sender?.username || "Someone";
    switch (notification.type) {
      case "like": return <span><b>@{username}</b> liked your creation</span>;
      case "comment": return <span><b>@{username}</b> commented: "{notification.text}"</span>;
      case "follow": return <span><b>@{username}</b> started following you</span>;
      case "reward": return <span><b>@{username}</b> sent you a reward of <b>{notification.text}</b></span>;
      default: return <span>New notification from <b>@{username}</b></span>;
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-24 px-4 flex flex-col">
      <header className="fixed top-0 left-0 w-full h-16 bg-neutral-950/60 backdrop-blur-xl flex items-center px-6 z-50 border-b border-outline-variant/10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-white/5 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="ml-4 font-headline font-bold text-xl tracking-tight">Notifications</h1>
      </header>

      <div className="flex-1 space-y-2">
        {notifications === undefined ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center opacity-50 space-y-4">
            <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center">
              <Bell className="w-8 h-8" />
            </div>
            <p className="font-medium">No notifications yet.<br/>Your interactions will appear here.</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={notification._id}
              onClick={() => {
                if (notification.creationId) {
                  // In a real app, we'd navigate to a specific post view
                  // For now, we'll just go to the feed (or profile)
                  navigate("/");
                } else if (notification.type === "follow") {
                  navigate(`/profile?username=${notification.sender?.username}`);
                }
              }}
              className={cn(
                "flex items-start gap-4 p-4 rounded-2xl transition-all cursor-pointer active:scale-[0.98]",
                notification.isRead ? "bg-surface-container-low" : "bg-surface-container-high border border-primary/20 shadow-lg shadow-primary/5"
              )}
            >
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-outline-variant/20">
                  <img src={notification.sender?.avatarUrl || undefined} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-background flex items-center justify-center shadow-sm">
                  {getIcon(notification.type)}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm text-on-surface leading-snug">
                  {getMessage(notification)}
                </p>
                <p className="text-[10px] font-label text-on-surface-variant mt-1 uppercase tracking-widest">
                  {formatDistanceToNow(notification.createdAt)} ago
                </p>
              </div>

              {notification.creation && (
                <div className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-outline-variant/10">
                  <img src={notification.creation.thumbnailUrl || undefined} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              
              {!notification.isRead && (
                <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
