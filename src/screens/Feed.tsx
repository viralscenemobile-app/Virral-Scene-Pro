import { Heart, MessageCircle, Bookmark, Wand2, CircleDollarSign, Share2, Plus, Sparkles, ChevronDown, Send, X, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "../App";
import { useNavigate } from "react-router-dom";
import { cn } from "@/src/lib/utils";
import { getViewUrl } from "@/src/lib/r2";

export function Feed() {
  const { userId } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState<"foryou" | "following">("foryou");
  const [videoUrl, setVideoUrl] = useState<string>("");
  
  const creations = useQuery(
    activeTab === "foryou" ? api.creations.list : api.creations.listFollowing,
    activeTab === "following" ? (userId ? { userId } : "skip" as any) : { limit: 10 }
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isPromptExpanded, setIsPromptExpanded] = useState(false);
  const navigate = useNavigate();

  const toggleLike = useMutation(api.interactions.toggleLike);
  const toggleBookmark = useMutation(api.interactions.toggleBookmark);
  const toggleFollow = useMutation(api.interactions.toggleFollow);
  const addComment = useMutation(api.interactions.addComment);
  const tipCreator = useMutation(api.users.tipCreator);

  useEffect(() => {
    setCurrentIndex(0);
  }, [activeTab]);

  const currentVideo = creations?.[currentIndex];

  useEffect(() => {
    if (currentVideo?.videoUrl) {
      if (currentVideo.videoUrl.startsWith("http")) {
        setVideoUrl(currentVideo.videoUrl);
        return;
      }
      const fetchUrl = async () => {
        try {
          const url = await getViewUrl(currentVideo.videoUrl);
          setVideoUrl(url);
        } catch (e) {
          console.error("Failed to get view URL:", e);
          setVideoUrl(currentVideo.videoUrl);
        }
      };
      fetchUrl();
    }
  }, [currentVideo]);

  if (!creations) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black text-white">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent" 
            />
          </div>
          <p className="font-mono text-sm tracking-widest opacity-50 uppercase animate-pulse">Loading Feed...</p>
        </motion.div>
      </div>
    );
  }

  if (creations.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black text-white relative">
        {/* Top Tabs */}
        <div className="absolute top-12 left-0 right-0 z-50 flex justify-center gap-6">
          <button 
            onClick={() => setActiveTab("following")}
            className={cn(
              "text-sm font-headline font-bold transition-all",
              activeTab === "following" ? "text-white scale-110" : "text-white/40"
            )}
          >
            Following
          </button>
          <button 
            onClick={() => setActiveTab("foryou")}
            className={cn(
              "text-sm font-headline font-bold transition-all",
              activeTab === "foryou" ? "text-white scale-110" : "text-white/40"
            )}
          >
            For You
          </button>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center gap-6 text-center px-8 h-full"
        >
          <div className="p-4 rounded-full bg-primary/10">
            <Sparkles className="h-12 w-12 text-primary" />
          </div>
          <p className="font-headline text-xl font-bold tracking-tight">
            {activeTab === "following" ? "No creations from people you follow." : "No viral scenes yet. Be the first!"}
          </p>
        </motion.div>
      </div>
    );
  }

  const interactions = useQuery(api.interactions.checkInteractions, userId && currentVideo ? { userId, creationId: currentVideo._id } : "skip" as any);
  const isFollowing = useQuery(api.interactions.checkFollow, userId && currentVideo?.user ? { followerId: userId, followingId: currentVideo.user._id } : "skip" as any);
  const comments = useQuery(api.interactions.getComments, currentVideo ? { creationId: currentVideo._id } : "skip" as any);

  const handleLike = async () => {
    if (!userId || !currentVideo) return;
    await toggleLike({ userId, creationId: currentVideo._id });
  };

  const handleBookmark = async () => {
    if (!userId || !currentVideo) return;
    await toggleBookmark({ userId, creationId: currentVideo._id });
  };

  const handleFollow = async () => {
    if (!userId || !currentVideo?.user) return;
    await toggleFollow({ followerId: userId, followingId: currentVideo.user._id });
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !currentVideo || !commentText.trim()) return;
    await addComment({ userId, creationId: currentVideo._id, text: commentText });
    setCommentText("");
  };

  const handleRemix = () => {
    if (!currentVideo) return;
    navigate(`/studio?prompt=${encodeURIComponent(currentVideo.prompt)}&style=${currentVideo.style}`);
  };

  const handleReward = async () => {
    if (!userId || !currentVideo?.user) return;
    if (userId === currentVideo.userId) {
      alert("You can't reward yourself!");
      return;
    }
    
    const amount = 10; // Standard tip
    try {
      await tipCreator({ tipperId: userId, creatorId: currentVideo.userId, amount });
      alert(`Successfully tipped 10 coins to @${currentVideo.user.username}!`);
    } catch (e: any) {
      alert(e.message || "Failed to reward creator");
    }
  };

  const handleShare = async () => {
    if (!currentVideo) return;
    
    const shareUrl = `${window.location.origin}/?videoId=${currentVideo._id}`;
    const shareData = {
      title: `Check out this creation by @${currentVideo.user?.username || "creator"}`,
      text: currentVideo.prompt,
      url: shareUrl,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  return (
    <main className="relative h-screen w-full bg-surface-container-lowest overflow-hidden">
      {/* Top Tabs */}
      <div className="absolute top-12 left-0 right-0 z-50 flex justify-center gap-6">
        <button 
          onClick={() => setActiveTab("following")}
          className={cn(
            "text-sm font-headline font-bold transition-all",
            activeTab === "following" ? "text-white scale-110" : "text-white/40"
          )}
        >
          Following
        </button>
        <button 
          onClick={() => setActiveTab("foryou")}
          className={cn(
            "text-sm font-headline font-bold transition-all",
            activeTab === "foryou" ? "text-white scale-110" : "text-white/40"
          )}
        >
          For You
        </button>
      </div>

      {/* Video Background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentVideo._id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <video
            src={videoUrl}
            className="h-full w-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            poster={currentVideo.thumbnailUrl}
          />
          <div className="video-gradient-overlay absolute inset-0" />
        </motion.div>
      </AnimatePresence>

      {/* Right Side Interactive Cluster */}
      <aside className="absolute right-4 bottom-32 flex flex-col items-center gap-6 z-40">
        {/* Creator Avatar */}
        <div className="relative mb-2">
          <div className="w-12 h-12 rounded-full border-2 border-secondary overflow-hidden shadow-lg bg-surface-container-high flex items-center justify-center">
             {currentVideo.user?.avatarUrl ? (
               <img src={currentVideo.user.avatarUrl} alt={currentVideo.user.username} className="w-full h-full object-cover" />
             ) : (
               <span className="text-secondary font-bold">{currentVideo.user?.username?.[0]?.toUpperCase() || "V"}</span>
             )}
          </div>
          <button 
            onClick={handleFollow}
            className={cn(
              "absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full w-5 h-5 flex items-center justify-center hover:scale-110 active:scale-90 transition-all",
              isFollowing ? "bg-secondary text-on-secondary" : "bg-primary text-on-primary"
            )}
          >
            {isFollowing ? (
              <CheckCircle2 className="w-3 h-3 font-bold" />
            ) : (
              <Plus className="w-3 h-3 font-bold" />
            )}
          </button>
        </div>

        <div onClick={handleLike} className="flex flex-col items-center gap-1 group cursor-pointer">
          <div className={cn("w-12 h-12 glass-panel rounded-full flex items-center justify-center active:scale-90 transition-transform", interactions?.liked && "text-primary")}>
            <Heart className={cn("w-7 h-7", interactions?.liked && "fill-current")} />
          </div>
          <span className="text-[12px] font-label font-medium drop-shadow-lg">{currentVideo.likes}</span>
        </div>

        <div onClick={() => setShowComments(true)} className="flex flex-col items-center gap-1 group cursor-pointer">
          <div className="w-12 h-12 glass-panel rounded-full flex items-center justify-center active:scale-90 transition-transform">
            <MessageCircle className="text-on-surface w-7 h-7 fill-current" />
          </div>
          <span className="text-[12px] font-label font-medium drop-shadow-lg">{currentVideo.comments}</span>
        </div>

        <div onClick={handleBookmark} className="flex flex-col items-center gap-1 group cursor-pointer">
          <div className={cn("w-12 h-12 glass-panel rounded-full flex items-center justify-center active:scale-90 transition-transform", interactions?.bookmarked && "text-secondary")}>
            <Bookmark className={cn("w-7 h-7", interactions?.bookmarked && "fill-current")} />
          </div>
          <span className="text-[12px] font-label font-medium drop-shadow-lg">{interactions?.bookmarked ? "Saved" : "Save"}</span>
        </div>

        <div onClick={handleRemix} className="flex flex-col items-center gap-1 group cursor-pointer">
          <div className="w-12 h-12 glass-panel rounded-full flex items-center justify-center active:scale-90 transition-transform">
            <Wand2 className="text-on-surface w-7 h-7" />
          </div>
          <span className="text-[12px] font-label font-medium drop-shadow-lg">Remix</span>
        </div>

        <div onClick={handleReward} className="flex flex-col items-center gap-1 group cursor-pointer">
          <div className="w-12 h-12 glass-panel rounded-full flex items-center justify-center active:scale-90 transition-transform">
            <CircleDollarSign className="text-secondary w-7 h-7" />
          </div>
          <span className="text-[12px] font-label font-medium drop-shadow-lg">Reward</span>
        </div>

        <div onClick={handleShare} className="flex flex-col items-center gap-1 group cursor-pointer">
          <div className="w-12 h-12 glass-panel rounded-full flex items-center justify-center active:scale-90 transition-transform">
            <Share2 className="text-on-surface w-7 h-7" />
          </div>
          <span className="text-[12px] font-label font-medium drop-shadow-lg">Share</span>
        </div>
      </aside>

      {/* Bottom Content Overlay */}
      <section className="absolute bottom-24 left-0 w-full px-6 flex flex-col gap-4 z-40">
        <div className="max-w-[80%]">
          <h2 
            onClick={() => navigate(`/profile?username=${currentVideo.user?.username}`)}
            className="font-headline font-bold text-xl text-on-surface mb-1 flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
          >
            @{currentVideo.user?.username || "creator"}
            {currentVideo.user?.verified && (
              <div className="bg-secondary text-background rounded-full p-0.5">
                <Plus className="w-3 h-3 fill-current rotate-45" />
              </div>
            )}
          </h2>
          <div className="glass-panel p-3 rounded-xl mb-4 border border-on-surface-variant/10">
            <p className={cn(
              "font-body text-sm text-on-surface-variant leading-relaxed transition-all",
              !isPromptExpanded && "line-clamp-2"
            )}>
              {currentVideo.prompt}
            </p>
            <button 
              onClick={() => setIsPromptExpanded(!isPromptExpanded)}
              className="text-secondary text-[12px] font-semibold mt-1"
            >
              {isPromptExpanded ? "Show less" : "Read more"}
            </button>
          </div>
        </div>

        {/* CTA Button */}
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={handleRemix}
          className="w-full bg-gradient-to-r from-primary to-primary-dim h-14 rounded-xl flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(182,160,255,0.3)]"
        >
          <Wand2 className="text-on-primary w-5 h-5" />
          <span className="font-headline font-extrabold text-on-primary tracking-tight">USE TEMPLATE</span>
        </motion.button>
      </section>

      {/* Comments Drawer */}
      <AnimatePresence>
        {showComments && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowComments(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 h-[70vh] bg-surface-container-low rounded-t-[2.5rem] z-[70] flex flex-col"
            >
              <div className="p-6 flex items-center justify-between border-b border-outline-variant/10">
                <h3 className="font-headline font-bold text-lg">Comments ({currentVideo.comments})</h3>
                <button onClick={() => setShowComments(false)} className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                {comments?.map((comment) => (
                  <div key={comment._id} className="flex gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-high flex-shrink-0">
                      {comment.user?.avatarUrl ? (
                        <img src={comment.user.avatarUrl} alt={comment.user.username} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-secondary font-bold">
                          {comment.user?.username?.[0]?.toUpperCase() || "U"}
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">@{comment.user?.username || "user"}</span>
                        <span className="text-[10px] text-on-surface-variant font-label uppercase tracking-widest">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-on-surface-variant leading-relaxed">{comment.text}</p>
                    </div>
                  </div>
                ))}
                {comments?.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-on-surface-variant gap-4 opacity-50">
                    <MessageCircle className="w-12 h-12" />
                    <p className="font-label uppercase tracking-widest text-xs">No comments yet. Start the conversation!</p>
                  </div>
                )}
              </div>

              <form onSubmit={handleAddComment} className="p-6 border-t border-outline-variant/10 bg-surface-container-low">
                <div className="relative">
                  <input 
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full bg-surface-container-high border-none rounded-2xl py-4 pl-4 pr-12 text-sm focus:ring-2 focus:ring-primary transition-all"
                  />
                  <button 
                    type="submit"
                    disabled={!commentText.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:bg-primary/10 rounded-xl transition-all disabled:opacity-30"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="absolute inset-y-0 left-0 w-12 flex flex-col items-center justify-center gap-4 z-50 opacity-0 hover:opacity-100 transition-opacity">
        <button 
          onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
          className="p-2 rounded-full bg-black/50 text-white/50 hover:text-white"
        >
          <ChevronDown className="h-6 w-6 rotate-180" />
        </button>
        <button 
          onClick={() => setCurrentIndex(prev => Math.min(creations.length - 1, prev + 1))}
          className="p-2 rounded-full bg-black/50 text-white/50 hover:text-white"
        >
          <ChevronDown className="h-6 w-6" />
        </button>
      </div>
    </main>
  );
}
